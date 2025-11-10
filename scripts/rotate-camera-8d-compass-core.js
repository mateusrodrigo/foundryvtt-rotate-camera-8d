// ===========================
// File: scripts/rotate-camera-8d-compass-core.js
// Core logic for Rotate Camera 8D compass
// ===========================

const RC8D_MODULE_ID = "rotate-camera-8d";

class RC8DCompassPlugin {
  constructor() {
    // DOM element holding the compass overlay
    this.compassElement = null;

    // Vertical offset from the top of the viewport (in px)
    this.COMPASS_TOP_OFFSET = 50;

    // Last known angle in degrees (0–360), used for redrawing
    this.lastAngleDeg = 0;
  }

  /**
   * Ensure the compass root element exists and return it.
   */
  createCompassElement() {
    if (this.compassElement) return this.compassElement;

    const el = document.createElement("div");
    el.id = "rc8d-compass";
    el.style.position = "fixed";
    el.style.zIndex = "100";
    el.style.pointerEvents = "none";
    el.style.top = `${this.COMPASS_TOP_OFFSET}px`;
    el.style.left = "50%";
    el.style.transform = "translateX(-50%)";
    document.body.appendChild(el);
    this.compassElement = el;
    return el;
  }

  /**
   * Remove the compass element from the DOM and reset reference.
   */
  destroyCompass() {
    if (this.compassElement) {
      this.compassElement.remove();
      this.compassElement = null;
    }
  }

  /**
   * Resolve the current theme id from settings.
   */
  getThemeId() {
    const fallback =
      window.RC8DCompassTheme?.getDefaultId?.() || "classic-simple";
    if (!game?.settings) return fallback;

    const value = game.settings.get(RC8D_MODULE_ID, "compassTheme");
    return value || fallback;
  }

  /**
   * Update the compass for the given angle (in degrees).
   * If angleDeg is undefined/null, reuse the last known angle.
   * Also respects the per-scene rotation disable flag.
   */
  update(angleDeg) {
    if (!game?.settings) return;

    this.lastAngleDeg = angleDeg ?? this.lastAngleDeg ?? 0;

    let enabled = false;
    try {
      // Client-side setting: global "show compass" toggle
      enabled = game.settings.get(RC8D_MODULE_ID, "showCompass");

      // Per-scene flag: if rotation is disabled, also disable the compass
      const scene = game.scenes?.current;
      const sceneBlocked =
        scene?.getFlag && scene.getFlag(RC8D_MODULE_ID, "disableRotation");
      if (sceneBlocked) enabled = false;
    } catch {
      enabled = false;
    }

    // If disabled (by setting or by scene flag), remove compass and bail out
    if (!enabled) {
      this.destroyCompass();
      return;
    }

    const compassSize =
      game.settings.get(RC8D_MODULE_ID, "compassSize") || 80;
    const showLabels =
      game.settings.get(RC8D_MODULE_ID, "showCompassLabels") !== false;
    const themeId = this.getThemeId();

    const el = this.createCompassElement();
    el.style.width = `${compassSize}px`;
    el.style.height = `${compassSize}px`;

    const labels = {
      N: game.i18n.localize("RC8D.Compass.N"),
      NE: game.i18n.localize("RC8D.Compass.NE"),
      E: game.i18n.localize("RC8D.Compass.E"),
      SE: game.i18n.localize("RC8D.Compass.SE"),
      S: game.i18n.localize("RC8D.Compass.S"),
      SW: game.i18n.localize("RC8D.Compass.SW"),
      W: game.i18n.localize("RC8D.Compass.W"),
      NW: game.i18n.localize("RC8D.Compass.NW")
    };

    // Lazy-create SVG structure only once, delegated to theme renderer
    if (!el.querySelector("svg")) {
      if (
        window.RC8DCompassTheme &&
        typeof window.RC8DCompassTheme.render === "function"
      ) {
        window.RC8DCompassTheme.render(el, labels, themeId);
      } else {
        // Fallback minimal visual if theme file is missing
        el.innerHTML = `
          <div style="
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.75);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
          ">
            RC8D Compass theme not loaded
          </div>
        `;
      }
    }

    // Toggle label visibility
    const labelNodes = el.querySelectorAll(".rc8d-label");
    labelNodes.forEach(l => {
      l.style.display = showLabels ? "block" : "none";
    });

    // Toggle main ticks visibility (optional behavior)
    const tickGroups = el.querySelectorAll(".rc8d-ticks-main");
    tickGroups.forEach(g => {
      g.style.display = showLabels ? "none" : "block";
    });

    // Normalize angle and rotate the needle
    const norm = ((this.lastAngleDeg % 360) + 360) % 360;
    const needle = el.querySelector(".rc8d-compass-needle");
    if (needle) {
      needle.style.transformOrigin = "50% 50%";
      needle.style.transform = `rotate(${norm}deg)`;
    }
  }
}

const RC8DCompass = new RC8DCompassPlugin();

// Compass settings live here, not in the core module
Hooks.once("init", () => {
  game.settings.register(RC8D_MODULE_ID, "showCompass", {
    name: game.i18n.localize("RC8D.ShowCompass.name"),
    hint: game.i18n.localize("RC8D.ShowCompass.hint"),
    scope: "client",
    config: true,
    type: Boolean,
    default: false,
    onChange: () => {
      RC8DCompass.update(RC8DCompass.lastAngleDeg);
    }
  });

  game.settings.register(RC8D_MODULE_ID, "compassSize", {
    name: game.i18n.localize("RC8D.CompassSize.name"),
    hint: game.i18n.localize("RC8D.CompassSize.hint"),
    scope: "client",
    config: true,
    type: Number,
    default: 80,
    range: { min: 48, max: 128, step: 8 },
    onChange: () => {
      RC8DCompass.update(RC8DCompass.lastAngleDeg);
    }
  });

  game.settings.register(RC8D_MODULE_ID, "showCompassLabels", {
    name: game.i18n.localize("RC8D.ShowCompassLabels.name"),
    hint: game.i18n.localize("RC8D.ShowCompassLabels.hint"),
    scope: "client",
    config: true,
    type: Boolean,
    default: true,
    onChange: () => {
      RC8DCompass.update(RC8DCompass.lastAngleDeg);
    }
  });

  const themeList = window.RC8DCompassTheme?.THEMES || [];
  const themeChoices = {};
  for (const t of themeList) {
    themeChoices[t.id] = game.i18n.localize(t.i18nKey);
  }

  game.settings.register(RC8D_MODULE_ID, "compassTheme", {
    name: game.i18n.localize("RC8D.CompassTheme.name"),
    hint: game.i18n.localize("RC8D.CompassTheme.hint"),
    scope: "client",
    config: true,
    type: String,
    choices: themeChoices,
    default: window.RC8DCompassTheme?.getDefaultId?.() || "classic-simple",
    onChange: () => {
      RC8DCompass.destroyCompass();
      RC8DCompass.update(RC8DCompass.lastAngleDeg);
    }
  });
});

// Sync with the current camera angle when the world finishes loading
Hooks.on("ready", () => {
  const mod = game.modules.get(RC8D_MODULE_ID);
  const angleDeg = mod?.api?.getAngleDeg?.() ?? 0;
  RC8DCompass.update(angleDeg);
});

// Also re-sync when the canvas is ready for a new scene
Hooks.on("canvasReady", () => {
  const mod = game.modules.get(RC8D_MODULE_ID);
  const angleDeg = mod?.api?.getAngleDeg?.() ?? 0;
  RC8DCompass.update(angleDeg);
});

// Update during rotation animation for real-time feedback
Hooks.on("rotateCamera8dAnimating", (payload) => {
  if (!payload) return;
  RC8DCompass.update(payload.angleDeg);
});

// Update once at the end of a rotation to guarantee final state
Hooks.on("rotateCamera8dRotated", (payload) => {
  if (!payload) return;
  RC8DCompass.update(payload.angleDeg);
});

// Re-evaluate the compass whenever the active scene is updated,
// so changes to the per-scene rotation flag take effect immediately.
Hooks.on("updateScene", (scene, data, options, userId) => {
  if (!scene.active) return;
  RC8DCompass.update(RC8DCompass.lastAngleDeg);
});

// Optional global API for debugging or external usage
window.RC8DCompass = RC8DCompass;
