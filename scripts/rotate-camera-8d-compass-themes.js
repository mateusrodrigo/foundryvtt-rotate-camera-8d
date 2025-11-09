// ===========================
// File: scripts/rotate-camera-8d-compass-themes.js
// Theme registry + shared helpers for Rotate Camera 8D compass
// ===========================

// Ensure we don't accidentally overwrite an existing registry
window.RC8DCompassTheme = window.RC8DCompassTheme || {};

Object.assign(window.RC8DCompassTheme, {
  /**
   * List of available themes (id + i18n key for settings label).
   * This array is populated by individual theme files via registerTheme().
   */
  THEMES: [],

  /**
   * Internal map: themeId -> render(container, labels)
   */
  _renderers: {},

  /**
   * Default theme id used when no setting exists.
   */
  getDefaultId() {
    // Your original “classic” compass visual
    return "classic-simple";
  },

  /**
   * Register a theme from a separate file.
   * @param {Object} def
   * @param {string} def.id       Unique theme id.
   * @param {string} def.i18nKey  I18n key for the theme name in settings.
   * @param {Function} def.render Render function (container, labels) => void.
   */
  registerTheme(def) {
    if (!def || !def.id || typeof def.render !== "function") return;

    this.THEMES.push({ id: def.id, i18nKey: def.i18nKey });
    this._renderers[def.id] = def.render;
  },

  /**
   * Render a compass theme into the given container.
   * Called by the core module.
   * @param {HTMLElement} container
   * @param {Object} labels      Localized labels N, NE, E, SE, S, SW, W, NW.
   * @param {string} themeId     Theme id from settings.
   */
  render(container, labels, themeId) {
    const fallbackId = this.getDefaultId();
    const id = themeId || fallbackId;

    const fn =
      this._renderers[id] ||
      this._renderers[fallbackId] ||
      Object.values(this._renderers)[0];

    if (typeof fn === "function") {
      fn(container, labels);
    } else {
      // Minimal fallback if no renderer is registered
      container.innerHTML = `
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
          RC8D compass themes not loaded
        </div>
      `;
    }
  },

  // -------------------------------------------------------------------------
  // Shared helpers for all themes
  // -------------------------------------------------------------------------

  helpers: {
    /**
     * Utility to build <text> elements for labels with consistent sizes/colors
     * and positions em um círculo.
     *
     * Extra cfg suportado:
     *  - centerX, centerY: centro do círculo (default 50, 50)
     *  - radiusCardinal: raio para N/E/S/W (default 32)
     *  - radiusDiagonal: raio para NE/SE/SW/NW (default radiusCardinal)
     *  - offsets: { N:{dx,dy}, NE:{dx,dy}, ... } ajustes finos por tema
     */
    buildLabels(labels, cfg) {
      const main = cfg.mainColor || "#ffffff";
      const minor = cfg.minorColor || main;
      const largeSize = cfg.largeSize || 11;
      const smallSize = cfg.smallSize || 9;
      const extra = cfg.extraStyle || "";

      const centerX = cfg.centerX ?? 50;
      const centerY = cfg.centerY ?? 50;
      const radiusCardinal = cfg.radiusCardinal ?? 32;
      const radiusDiagonal = cfg.radiusDiagonal ?? radiusCardinal;
      const offsets = cfg.offsets || {}; // ex: { S:{dx:0, dy:2} }

      const isCardinal = key => ["N", "E", "S", "W"].includes(key);
      const order = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];

      // Ângulos em graus (0° na direita, crescente anti-horário)
      const layout = {
        N:  { angle: -90,  radius: radiusCardinal },
        NE: { angle: -45,  radius: radiusDiagonal },
        E:  { angle:   0,  radius: radiusCardinal },
        SE: { angle:  45,  radius: radiusDiagonal },
        S:  { angle:  90,  radius: radiusCardinal },
        SW: { angle: 135,  radius: radiusDiagonal },
        W:  { angle: 180,  radius: radiusCardinal },
        NW: { angle: -135, radius: radiusDiagonal }
      };

      const parts = [];

      for (const key of order) {
        const def = layout[key];
        const angleRad = (def.angle * Math.PI) / 180;
        let x = centerX + def.radius * Math.cos(angleRad);
        let y = centerY + def.radius * Math.sin(angleRad);

        const off = offsets[key] || {};
        x += off.dx || 0;
        y += off.dy || 0;

        const cardinal = isCardinal(key);
        const color = cardinal ? main : minor;
        const size = cardinal ? largeSize : smallSize;
        const weight = cardinal ? "bold" : "normal";

        parts.push(`
          <text x="${x.toFixed(2)}" y="${y.toFixed(2)}"
                text-anchor="middle" dominant-baseline="middle"
                fill="${color}" font-size="${size}" font-weight="${weight}"
                class="rc8d-label"
                style="${extra}">
            ${labels[key]}
          </text>
        `);
      }

      return parts.join("\n");
    }
  }
});
