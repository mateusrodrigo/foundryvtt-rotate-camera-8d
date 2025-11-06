// ===========================
// File: scripts/rotate-camera-8d.js  (Foundry v13+)
// Version: 1.0.0
// Module ID: rotate-camera-8d
// ===========================
//
// Rotating Camera 8D
//
// WHAT THIS MODULE DOES
// ---------------------
// • Rotates the entire canvas in 45° steps using Q/E (or any custom keybinding).
// • Remaps token movement (dx, dy) so that "forward" always means "toward the top
//   of the screen" relative to the current camera angle.
// • If you rotate the camera while holding movement keys, controlled tokens keep
//   moving smoothly, but now aligned to the new orientation.
// • Respects all custom movement bindings by relying on game.keybindings.moveKeys
//   and Foundry's logical movement directions (UP/DOWN/LEFT/RIGHT).
//
// DESIGN NOTES
// ------------
// • The module never edits token data directly; it only rotates the PIXI stage and
//   patches TokenLayer.moveMany to reinterpret small step movements (|dx|,|dy|<=1).
// • Normal movement is still driven by the OS/browser keyboard repeat and Foundry's
//   own keyboard handling. The module only adds a short helper loop after a rotation
//   if movement keys are still held.
// • The patch is narrow: larger or non-unit dx/dy calls to moveMany are left untouched,
//   minimizing conflicts with other modules and macros.
// • Note: Foundry's grid layer itself does not rotate. When the camera is rotated,
//   the grid may appear misaligned or invisible in some orientations. This is a core
//   engine behavior, not a bug in this module.
//
// ===========================

const MODULE_ID = "rotate-camera-8d";

class RotatingCamera8D {
  constructor() {
    // Logical camera state
    this.cameraStep = 0;          // 0..7 (multiple of 45°)
    this.displayAngleDeg = 0;     // accumulated angle in degrees
    this.isInit = false;

    // Q/E rotation debounce
    this.rotateGuard = new Set();
    this.ROTATE_DEBOUNCE_MS = 140;
    this._lastRotateAt = 0;

    // Held movement tracking
    this._heldLoopRunning = false;       // continuous loop after rotation
    this.HELD_STEP_MS = 110;             // interval between loop steps

    // Simple flag: was there movement when the camera rotated?
    this._hadMovementOnRotate = false;

    // Discrete directions, clockwise, starting at "N"
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

    this._vectorIndex = {};
    for (let i = 0; i < this.DIRECTIONS.length; i++) {
      const v = this.DIRECTIONS[i];
      this._vectorIndex[`${v.dx},${v.dy}`] = i;
    }

    // moveMany patch state
    this._moveManyPatched = false;
    this._origMoveMany = null;
  }

  // ---------- basic helpers ----------

  isCanvasReady() {
    return (typeof canvas !== "undefined") && canvas.ready && canvas.scene;
  }

  currentCenterWorld() {
    const view = canvas?.app?.renderer?.screen;
    const interaction = canvas?.app?.renderer?.plugins?.interaction || canvas?.app?.renderer?.plugins?.eventSystem;
    const stage = canvas?.stage;

    if (!view || !stage) return canvas.scene?.dimensions?.center || { x: 0, y: 0 };

    // Preferred: interaction.mapPositionToPoint + stage.toLocal (handles rotation)
    try {
      if (interaction && typeof interaction.mapPositionToPoint === "function" && typeof stage.toLocal === "function") {
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

    // Fallback: manual inverse transform
    try {
      const wt = stage.worldTransform;
      const sx = view.width / 2;
      const sy = view.height / 2;
      const dx = sx - wt.tx;
      const dy = sy - wt.ty;
      const a = wt.a, b = wt.b, c = wt.c, d = wt.d;
      const det = a * d - b * c;
      if (Math.abs(det) < 1e-8) return canvas.scene?.dimensions?.center || { x: 0, y: 0 };
      const lx = (d * dx - c * dy) / det;
      const ly = (-b * dx + a * dy) / det;
      return { x: lx, y: ly };
    } catch (err) {
      console.warn("[RotCam8D] center fallback failed:", err);
      return canvas.scene?.dimensions?.center || { x: 0, y: 0 };
    }
  }

  // ---------- visual rotation of the PIXI stage ----------

  applyRotationVisual(deltaSteps, { duration = 160, immediate = false } = {}) {
    if (!this.isCanvasReady()) return;
    const stage = canvas.stage;
    const startRad = stage.rotation;

    // Capture movement state BEFORE rotating
    this._captureHeldKeys();

    this.cameraStep = (this.cameraStep + deltaSteps + 8) % 8;
    this.displayAngleDeg += deltaSteps * 45;
    const endRad = (this.displayAngleDeg * Math.PI) / 180;

    const notifyCenterAndRestoreMovement = () => {
      const centerWorld = this.currentCenterWorld();
      Hooks.call("rotatingCamera.rotated", centerWorld);
      this._restoreHeldKeyMovement();
    };

    if (immediate || duration <= 0) {
      stage.rotation = endRad;
      notifyCenterAndRestoreMovement();
      return;
    }

    const t0 = Date.now();
    const anim = () => {
      const t = Math.min(1, (Date.now() - t0) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      stage.rotation = startRad + (endRad - startRad) * eased;
      if (t < 1) {
        requestAnimationFrame(anim);
      } else {
        notifyCenterAndRestoreMovement();
      }
    };
    requestAnimationFrame(anim);
  }

  rotate(deltaSteps, sourceKey = null) {
    const now = Date.now();
    if (sourceKey) {
      if (this.rotateGuard.has(sourceKey)) return;
      this.rotateGuard.add(sourceKey);
    }
    if (now - this._lastRotateAt < this.ROTATE_DEBOUNCE_MS) return;
    this._lastRotateAt = now;

    this.applyRotationVisual(deltaSteps, { duration: 160, immediate: false });
  }

  releaseGuard(sourceKey) {
    if (sourceKey) this.rotateGuard.delete(sourceKey);
  }

  // ---------- movement capture & restoration ----------

  /**
   * Instead of watching raw codes like "KeyW" or "ArrowUp",
   * we use Foundry's own movement state:
   * game.keybindings.moveKeys = a Set of logical directions (UP/DOWN/LEFT/RIGHT).
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

  async _restoreHeldKeyMovement() {
    if (!this._hadMovementOnRotate) return;
    if (!this.isCanvasReady()) return;
    if (!canvas.tokens?.controlled?.length) return;

    // First: immediate "nudge" in the new direction
    await this.nudgeKeyboardMovement();

    // Then: continuous loop while movement is still active
    this._heldMoveLoop();
  }

  /**
   * Uses game.keybindings.moveKeys + ClientKeybindings.MOVEMENT_DIRECTIONS
   * to figure out which logical directions (UP/DOWN/LEFT/RIGHT) are active,
   * regardless of which physical keys the user bound.
   */
  getBaseVectorFromMoveKeys() {
    const kb = game.keybindings;
    if (!kb) return { dx: 0, dy: 0 };

    const moveKeys = kb.moveKeys;
    if (!(moveKeys instanceof Set) || !moveKeys.size) return { dx: 0, dy: 0 };

    const MOVE = kb.constructor?.MOVEMENT_DIRECTIONS;
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

  // ---------- dx,dy remapping based on camera angle ----------

  reorientVector(dx, dy) {
    if (!this.isCanvasReady()) return { dx, dy };
    if (this.cameraStep === 0) return { dx, dy };

    const key = `${dx},${dy}`;
    const baseIdx = this._vectorIndex[key];
    if (baseIdx === undefined) return { dx, dy };

    const rotatedIdx = (baseIdx - this.cameraStep + 8) % 8;
    const dir = this.DIRECTIONS[rotatedIdx];
    if (!dir) return { dx, dy };

    return { dx: dir.dx, dy: dir.dy };
  }

  // ---------- TokenLayer.moveMany patch ----------

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

        if ((dx || dy) && Number.isInteger(dx) && Number.isInteger(dy) &&
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
    console.info("[RotCam8D] TokenLayer.moveMany patched for camera based movement.");
  }

  // ---------- initialization ----------

  initialize() {
    if (this.isInit) return;
    this.isInit = true;

    this.cameraStep = 0;
    this.displayAngleDeg = 0;

    if (this.isCanvasReady()) {
      this.applyRotationVisual(0, { immediate: true });
      this.installMoveManyPatch();
    }
  }

  onCanvasReady() {
    this.installMoveManyPatch();
  }
}

const RotCam8D = new RotatingCamera8D();

// ---------- Q/E (or custom) rotation keybindings ----------

Hooks.once("init", () => {
  game.keybindings.register(MODULE_ID, "rotateLeft", {
    name: game.i18n.localize("RC8D.RotateLeft.name"),
    hint: game.i18n.localize("RC8D.RotateLeft.hint"),
    editable: [{ key: "KeyE" }], // default: E, user can change
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
    editable: [{ key: "KeyQ" }], // default: Q, user can change
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

Hooks.on("ready", () => RotCam8D.initialize());
Hooks.on("canvasReady", () => RotCam8D.onCanvasReady());

window.RotatingCamera8D = RotCam8D;
