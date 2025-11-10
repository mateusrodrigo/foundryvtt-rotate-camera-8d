// ===========================
// File: scripts/rotate-camera-8d.js  (Foundry v13+)
// Version: 1.1.0
// Module ID: rotate-camera-8d
// ===========================
//
// Rotate Camera 8D - Core
// -----------------------
// • Rotates the camera in 45° steps using Q/E (or any custom keybinding).
// • Remaps 8-direction movement so that "forward" always means "toward the top
//   of the screen" relative to the current camera angle.
// • No UI here: compass and other overlays are handled by external plugins
//   listening to the provided hooks and using the exposed API.
// ===========================

const MODULE_ID = "rotate-camera-8d";

class RotatingCamera8D {
  constructor() {
    // Logical rotation state
    this.cameraStep = 0;          // 0..7 (multiples of 45°)
    this.displayAngleDeg = 0;     // accumulated angle in degrees
    this.isInit = false;

    // Keyboard rotation debounce
    this.rotateGuard = new Set();
    this.ROTATE_DEBOUNCE_MS = 140;
    this._lastRotateAt = 0;

    // Continuous movement while movement keys are held
    this._heldLoopRunning = false;
    this.HELD_STEP_MS = 110;
    this._hadMovementOnRotate = false;

    // Discrete directions (8-way, clockwise from "N")
    this.DIRECTIONS = [
      { dx: 0,  dy: -1 }, // N
      { dx: 1,  dy: -1 }, // NE
      { dx: 1,  dy: 0  }, // E
      { dx: 1,  dy: 1  }, // SE
      { dx: 0,  dy: 1  }, // S
      { dx: -1, dy: 1  }, // SW
      { dx: -1, dy: 0  }, // W
      { dx: -1, dy: -1 }  // NW
    ];

    // Lookup table to map base vectors to indices
    this._vectorIndex = {};
    for (let i = 0; i < this.DIRECTIONS.length; i++) {
      const v = this.DIRECTIONS[i];
      this._vectorIndex[`${v.dx},${v.dy}`] = i;
    }

    // TokenLayer.moveMany patch state
    this._moveManyPatched = false;
    this._origMoveMany = null;
  }

  // ----------------------------------------
  // Basic helpers
  // ----------------------------------------

  isCanvasReady() {
    return (typeof canvas !== "undefined") && canvas.ready && canvas.scene;
  }

  /**
   * Get the world coordinates of the current screen center,
   * robust to canvas rotation.
   */
  currentCenterWorld() {
    const view = canvas?.app?.renderer?.screen;
    const interaction = canvas?.app?.renderer?.plugins?.interaction
                     || canvas?.app?.renderer?.plugins?.eventSystem;
    const stage = canvas?.stage;

    if (!view || !stage) {
      return canvas.scene?.dimensions?.center || { x: 0, y: 0 };
    }

    // Preferred: interaction.mapPositionToPoint + stage.toLocal (handles rotation)
    try {
      if (interaction && typeof interaction.mapPositionToPoint === "function" &&
          typeof stage.toLocal === "function") {
        const px = view.width / 2;
        const py = view.height / 2;
        const p = new PIXI.Point();

        interaction.mapPositionToPoint(p, px, py);
        if (typeof stage.updateTransform === "function") stage.updateTransform();

        const worldPoint = stage.toLocal(p);
        return { x: worldPoint.x, y: worldPoint.y };
      }
    } catch (err) {
      console.warn("[RotCam8D] center mapping failed:", err);
    }

    // Fallback: manual inverse transform of stage.worldTransform
    try {
      const wt = stage.worldTransform;
      const sx = view.width / 2;
      const sy = view.height / 2;
      const dx = sx - wt.tx;
      const dy = sy - wt.ty;
      const a = wt.a, b = wt.b, c = wt.c, d = wt.d;
      const det = a * d - b * c;
      if (Math.abs(det) < 1e-8) {
        return canvas.scene?.dimensions?.center || { x: 0, y: 0 };
      }
      const lx = (d * dx - c * dy) / det;
      const ly = (-b * dx + a * dy) / det;
      return { x: lx, y: ly };
    } catch (err) {
      console.warn("[RotCam8D] center fallback failed:", err);
      return canvas.scene?.dimensions?.center || { x: 0, y: 0 };
    }
  }

  // ----------------------------------------
  // Visual rotation + perception updates
  // ----------------------------------------

  /**
   * Apply a visual rotation on the PIXI stage, optionally animated, and
   * emit hooks so plugins (compass, etc.) can react.
   */
  applyRotationVisual(deltaSteps, { duration = 160, immediate = false } = {}) {
    if (!this.isCanvasReady()) return;

    const stage = canvas.stage;
    const startRad = stage.rotation;

    // Capture movement state before rotating
    this._captureHeldKeys();

    // Update logical rotation state
    this.cameraStep = (this.cameraStep + deltaSteps + 8) % 8;
    this.displayAngleDeg += deltaSteps * 45;
    const endRad = (this.displayAngleDeg * Math.PI) / 180;

    const finalizeRotation = () => {
      const centerWorld = this.currentCenterWorld();
      const angleRad = (this.displayAngleDeg * Math.PI) / 180;

      // New dedicated hook: used by plugins (e.g. compass) to react to final angle
      Hooks.callAll("rotateCamera8dRotated", {
        angleDeg: this.displayAngleDeg,
        angleRad,
        cameraStep: this.cameraStep,
        center: centerWorld
      });

      // Force a full perception refresh so vision/lighting stay in sync
      try {
        canvas.perception?.update?.({
          initializeVision: true,
          refreshVision: true,
          initializeLighting: true,
          refreshLighting: true,
          refreshPrimary: true,
          refreshOcclusion: true,
        });
      } catch (e) {
        console.warn("[RotCam8D] perception final update failed:", e);
      }

      // Restore keyboard-based movement after the rotation
      this._restoreHeldKeyMovement();
    };

    // Instant rotation (no animation)
    if (immediate || duration <= 0) {
      stage.rotation = endRad;

      try {
        canvas.perception?.update?.({
          refreshVision: true,
          refreshLighting: true,
          refreshOcclusion: true,
        });
      } catch (e) {
        console.warn("[RotCam8D] perception instant update failed:", e);
      }

      finalizeRotation();
      return;
    }

    const t0 = Date.now();

    const anim = () => {
      const elapsed = Date.now() - t0;
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = startRad + (endRad - startRad) * eased;

      stage.rotation = current;

      // Animation hook for plugins that want real-time updates (e.g. compass)
      Hooks.callAll("rotateCamera8dAnimating", {
        angleDeg: (current * 180) / Math.PI,
        angleRad: current,
        cameraStep: this.cameraStep
      });

      // Lightweight perception refresh during the animation
      try {
        canvas.perception?.update?.({
          refreshVision: true,
          refreshLighting: true
        });
      } catch (e) {
        console.warn("[RotCam8D] perception update during rotation failed:", e);
      }

      if (t < 1) {
        requestAnimationFrame(anim);
      } else {
        finalizeRotation();
      }
    };

    requestAnimationFrame(anim);
  }

  /**
   * Public entry point for rotation (used by keybindings and external callers).
   */
  rotate(deltaSteps, sourceKey = null) {
    const now = Date.now();

    // Respect Follow The Token Cinematic mode (if present):
    // when Cinematic is active, only the GM can rotate the camera.
    try {
      const fttCinematicOn = game?.settings?.get("follow-the-token", "gmCinematic");
      if (fttCinematicOn && !game.user?.isGM) {
        return;
      }
    } catch (e) {
      console.warn("[RotCam8D] Failed to check Follow The Token Cinematic:", e);
    }

    // Per-scene flag: block rotation on specific scenes (e.g. landing page)
    try {
      const scene = game.scenes?.current;
      if (scene?.getFlag && scene.getFlag(MODULE_ID, "disableRotation")) {
        ui.notifications?.info(game.i18n.localize("RC8D.DisableRotation.notification"));
        return;
      }
    } catch (e) {
      console.warn("[RotCam8D] Scene flag check failed:", e);
    }

    // Simple guard so holding the key does not spam rotate calls
    if (sourceKey) {
      if (this.rotateGuard.has(sourceKey)) return;
      this.rotateGuard.add(sourceKey);
    }

    // Global debounce across all rotation sources
    if (now - this._lastRotateAt < this.ROTATE_DEBOUNCE_MS) return;
    this._lastRotateAt = now;

    this.applyRotationVisual(deltaSteps, { duration: 160, immediate: false });
  }

  releaseGuard(sourceKey) {
    if (sourceKey) this.rotateGuard.delete(sourceKey);
  }

  // ----------------------------------------
  // Keyboard movement support
  // ----------------------------------------

  /**
   * Capture whether there were movement keys active at the moment of rotation.
   */
  _captureHeldKeys() {
    const kb = game.keybindings;
    const moveKeys = kb?.moveKeys;
    this._hadMovementOnRotate = !!(moveKeys && moveKeys.size);
  }

  _checkIfKeysStillHeld() {
    const kb = game.keybindings;
    const moveKeys = kb?.moveKeys;
    return !!(moveKeys && moveKeys.size);
  }

  /**
   * After rotation, keep nudging tokens while movement keys remain held.
   */
  async _heldMoveLoop() {
    if (this._heldLoopRunning) return;
    this._heldLoopRunning = true;

    try {
      while (true) {
        if (!this.isCanvasReady()) break;
        if (!canvas.tokens?.controlled?.length) break;
        if (!this._checkIfKeysStillHeld()) break;

        await this.nudgeKeyboardMovement();
        await new Promise(r => setTimeout(r, this.HELD_STEP_MS));
      }
    } finally {
      this._heldLoopRunning = false;
    }
  }

  /**
   * Restore movement once the rotation is finished.
   */
  async _restoreHeldKeyMovement() {
    if (!this._hadMovementOnRotate) return;
    if (!this.isCanvasReady()) return;
    if (!canvas.tokens?.controlled?.length) return;

    // One immediate nudge in the new orientation
    await this.nudgeKeyboardMovement();

    // Then keep nudging while keys remain pressed
    this._heldMoveLoop();
  }

  /**
   * Compute a base dx,dy from Foundry's logical movement directions,
   * not from raw keyboard codes.
   */
  getBaseVectorFromMoveKeys() {
    const kb = game.keybindings;
    if (!kb) return { dx: 0, dy: 0 };

    const moveKeys = kb.moveKeys;
    if (!(moveKeys instanceof Set) || !moveKeys.size) return { dx: 0, dy: 0 };

    const MOVE = kb.constructor?.MOVEMENT_DIRECTIONS
              || game.keybindings?.constructor?.MOVEMENT_DIRECTIONS;
    if (!MOVE) return { dx: 0, dy: 0 };

    const hasUp = MOVE.UP && moveKeys.has(MOVE.UP);
    const hasDown = MOVE.DOWN && moveKeys.has(MOVE.DOWN);
    const hasLeft = MOVE.LEFT && moveKeys.has(MOVE.LEFT);
    const hasRight = MOVE.RIGHT && moveKeys.has(MOVE.RIGHT);

    let dx = 0;
    let dy = 0;

    if (hasUp && !hasDown) dy = -1;
    else if (hasDown && !hasUp) dy = 1;

    if (hasRight && !hasLeft) dx = 1;
    else if (hasLeft && !hasRight) dx = -1;

    return { dx, dy };
  }

  /**
   * Move controlled tokens one step based on current movement keys,
   * honoring the rotated camera orientation.
   */
  async nudgeKeyboardMovement() {
    if (!this.isCanvasReady()) return;
    if (!canvas.tokens?.controlled?.length) return;

    const { dx, dy } = this.getBaseVectorFromMoveKeys();
    if (!dx && !dy) return;

    try {
      await canvas.tokens.moveMany({ dx, dy });
    } catch (err) {
      console.warn("[RotCam8D] nudgeKeyboardMovement failed:", err);
    }
  }

  // ----------------------------------------
  // dx,dy remapping based on camera angle
  // ----------------------------------------

  /**
   * Reorient a dx,dy step according to the current cameraStep.
   * Only small unit steps are expected here.
   */
  reorientVector(dx, dy) {
    if (!this.isCanvasReady()) return { dx, dy };
    if (this.cameraStep === 0) return { dx, dy };

    const key = `${dx},${dy}`;
    const baseIdx = this._vectorIndex[key];
    if (baseIdx === undefined) return { dx, dy };

    // Rotate the base vector in the opposite direction of the cameraStep
    const rotatedIdx = (baseIdx - this.cameraStep + 8) % 8;
    const dir = this.DIRECTIONS[rotatedIdx];
    if (!dir) return { dx, dy };

    return { dx: dir.dx, dy: dir.dy };
  }

  // ----------------------------------------
  // TokenLayer.moveMany patch
  // ----------------------------------------

  /**
   * Patch TokenLayer.moveMany so that small unit steps are reinterpreted
   * as 8-direction steps aligned to the rotated camera.
   */
  installMoveManyPatch() {
    if (this._moveManyPatched) return;
    if (!this.isCanvasReady()) return;
    if (!canvas.tokens) return;

    const proto = Object.getPrototypeOf(canvas.tokens);
    const original = proto.moveMany;
    if (typeof original !== "function") return;

    this._origMoveMany = original;
    const self = this;

    proto.moveMany = async function (options = {}) {
      try {
        if (!options) options = {};
        let { dx = 0, dy = 0 } = options;

        // Only reorient unit steps (dx/dy in [-1, 0, 1])
        if ((dx || dy) &&
            Number.isInteger(dx) && Number.isInteger(dy) &&
            Math.abs(dx) <= 1 && Math.abs(dy) <= 1) {
          const vec = self.reorientVector(dx, dy);
          options = { ...options, dx: vec.dx, dy: vec.dy };
        }
      } catch (err) {
        console.warn("[RotCam8D] moveMany reorient failed:", err);
      }

      return await original.call(this, options);
    };

    this._moveManyPatched = true;
    console.info("[RotCam8D] TokenLayer.moveMany patched for camera-based movement.");
  }

  // ----------------------------------------
  // Initialization
  // ----------------------------------------

  /**
   * One-time initialization when Foundry is ready for this client.
   */
  initialize() {
    if (this.isInit) return;
    this.isInit = true;

    this.cameraStep = 0;
    this.displayAngleDeg = 0;

    if (this.isCanvasReady()) {
      // Force a consistent initial angle
      this.applyRotationVisual(0, { immediate: true, duration: 0 });
      this.installMoveManyPatch();
    }
  }

  onCanvasReady() {
    this.installMoveManyPatch();
  }
}

const RotCam8D = new RotatingCamera8D();

// ----------------------------------------
// Settings and keybindings
// ----------------------------------------

Hooks.once("init", () => {
  game.keybindings.register(MODULE_ID, "rotateLeft", {
    name: game.i18n.localize("RC8D.RotateLeft.name"),
    hint: game.i18n.localize("RC8D.RotateLeft.hint"),
    editable: [{ key: "KeyE" }],
    onDown: (ctx) => {
      RotCam8D.rotate(-1, ctx.key);
      return true;
    },
    onUp: (ctx) => {
      RotCam8D.releaseGuard(ctx.key);
      return true;
    },
    precedence: CONST.KEYBINDING_PRECEDENCE.PRIORITY
  });

  game.keybindings.register(MODULE_ID, "rotateRight", {
    name: game.i18n.localize("RC8D.RotateRight.name"),
    hint: game.i18n.localize("RC8D.RotateRight.hint"),
    editable: [{ key: "KeyQ" }],
    onDown: (ctx) => {
      RotCam8D.rotate(+1, ctx.key);
      return true;
    },
    onUp: (ctx) => {
      RotCam8D.releaseGuard(ctx.key);
      return true;
    },
    precedence: CONST.KEYBINDING_PRECEDENCE.PRIORITY
  });
});

// ----------------------------------------
// Canvas hooks and public API
// ----------------------------------------

Hooks.once("ready", () => {
  RotCam8D.initialize();

  const mod = game.modules.get(MODULE_ID);
  if (mod) {
    mod.api = {
      getAngleDeg: () => RotCam8D.displayAngleDeg,
      getAngleRad: () => (RotCam8D.displayAngleDeg * Math.PI) / 180,
      getCameraStep: () => RotCam8D.cameraStep
    };
  }
});

Hooks.on("canvasReady", () => RotCam8D.onCanvasReady());

/**
 * Light-weight perception update when the canvas is panned.
 * Keeps lighting/vision in sync while the stage is rotated.
 */
Hooks.on("canvasPan", () => {
  if (!RotCam8D.isCanvasReady()) return;
  try {
    canvas.perception?.update?.({
      refreshVision: true,
      refreshLighting: true
    });
  } catch (e) {
    console.warn("[RotCam8D] perception update on pan failed:", e);
  }
});

/**
 * Scene config option: per-scene disable rotation (v13.350+)
 */
Hooks.on("renderSceneConfig", (app, html, context, options) => {
  /** @type {Scene} */
  const scene = app.document;
  if (!scene) return;

  const value = scene.getFlag(MODULE_ID, "disableRotation") ?? false;
  const name  = `flags.${MODULE_ID}.disableRotation`;

  const input = foundry.applications.fields.createCheckboxInput({ name, value });

  const group = foundry.applications.fields.createFormGroup({
    input,
    label: "RC8D.DisableRotation.label",
    hint:  "RC8D.DisableRotation.hint",
    localize: true,
    //classes: ["stacked"]
  });

  const basicOptions =
    html.querySelector('.tab[data-tab="basics"]');

  if (!basicOptions) return;

  basicOptions.append(group);
  app.setPosition();
});

// Simple global reference for debugging / macros
window.RotatingCamera8D = RotCam8D;
