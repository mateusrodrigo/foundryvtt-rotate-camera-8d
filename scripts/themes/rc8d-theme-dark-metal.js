// ===========================
// Dark Metal theme (techy, glowy, tapered needle)
// ===========================
(function () {
  const Theme = window.RC8DCompassTheme;
  if (!Theme) return;

  const { helpers } = Theme;

  function renderDarkMetal(container, labels) {
    const labelSvg = helpers.buildLabels(labels, {
      mainColor: "#f5f5f5",
      minorColor: "#c7ccd8",
      largeSize: 12,
      smallSize: 9,
      extraStyle: "letter-spacing: 0.4px;",
      centerX: 50,
      centerY: 50,
      radiusCardinal: 32,
      radiusDiagonal: 32.5,
      offsets: {
        N: { dy: -1 },
        S: { dy:  1 }
      }
    });

    container.innerHTML = `
      <div class="rc8d-compass-container" style="position: relative; width: 100%; height: 100%;">
        <svg viewBox="0 0 100 100" class="rc8d-compass-svg" style="width: 100%; height: 100%;">
          <defs>
            <!-- Dark metal body -->
            <radialGradient id="rc8d-darkmetal-bg" cx="50%" cy="30%" r="70%">
              <stop offset="0%"  stop-color="#3c3f45" />
              <stop offset="45%" stop-color="#20232a" />
              <stop offset="100%" stop-color="#050608" />
            </radialGradient>

            <!-- Outer rim with cold steel look -->
            <linearGradient id="rc8d-darkmetal-rim" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"  stop-color="#cfd5e2" />
              <stop offset="40%" stop-color="#7b8291" />
              <stop offset="100%" stop-color="#3b3f49" />
            </linearGradient>

            <!-- Inner cyan glow ring -->
            <radialGradient id="rc8d-darkmetal-glow" cx="50%" cy="50%" r="55%">
              <stop offset="0%"  stop-color="rgba(0, 255, 255, 0.14)" />
              <stop offset="60%" stop-color="rgba(0, 255, 255, 0.0)" />
              <stop offset="100%" stop-color="rgba(0, 0, 0, 0.0)" />
            </radialGradient>

            <!-- Needle gradients -->
            <linearGradient id="rc8d-darkmetal-needle-n" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%"  stop-color="#ffe0dd" />
              <stop offset="40%" stop-color="#ff5b4d" />
              <stop offset="100%" stop-color="#8b171d" />
            </linearGradient>

            <linearGradient id="rc8d-darkmetal-needle-s" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%"  stop-color="#f8fbff" />
              <stop offset="100%" stop-color="#c4ccd6" />
            </linearGradient>

            <!-- Hub -->
            <radialGradient id="rc8d-darkmetal-hub" cx="50%" cy="40%" r="60%">
              <stop offset="0%"  stop-color="#f0f2ff" />
              <stop offset="100%" stop-color="#555a64" />
            </radialGradient>

            <!-- Cyan tick glow -->
            <filter id="rc8d-darkmetal-tick-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="0.8"
                            flood-color="#28e0ff" flood-opacity="0.35" />
            </filter>

            <!-- Needle shadow -->
            <filter id="rc8d-darkmetal-needle-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1.4" stdDeviation="1.6"
                            flood-color="#000000" flood-opacity="0.55" />
            </filter>
          </defs>

          <!-- Outer rim -->
          <circle cx="50" cy="50" r="46"
                  fill="url(#rc8d-darkmetal-bg)" />
          <circle cx="50" cy="50" r="43"
                  fill="none" stroke="url(#rc8d-darkmetal-rim)" stroke-width="2.4" />

          <!-- Subtle inner glow -->
          <circle cx="50" cy="50" r="40"
                  fill="url(#rc8d-darkmetal-glow)" />

          <!-- Inner disc -->
          <circle cx="50" cy="50" r="37"
                  fill="#111319" stroke="#3c414c" stroke-width="0.9" />

          <!-- Ticks (can be hidden with .rc8d-ticks-main) -->
          <g class="rc8d-ticks-main" filter="url(#rc8d-darkmetal-tick-glow)">
            <!-- Cardinal ticks -->
            <g stroke="#c7d3ff" stroke-width="1.8" stroke-linecap="round">
              <line x1="50" y1="8"  x2="50" y2="15" />
              <line x1="92" y1="50" x2="85" y2="50" />
              <line x1="50" y1="92" x2="50" y2="85" />
              <line x1="8"  y1="50" x2="15" y2="50" />
            </g>

            <!-- 16-segment minor ticks -->
            <g stroke="#505665" stroke-width="1" stroke-linecap="round">
              ${Array.from({ length: 16 }).map((_, i) => {
                const angle = i * 22.5;
                const inner = 35;
                const outer = i % 4 === 0 ? 38 : 36;
                const rad = (angle - 90) * Math.PI / 180;
                const x1 = 50 + inner * Math.cos(rad);
                const y1 = 50 + inner * Math.sin(rad);
                const x2 = 50 + outer * Math.cos(rad);
                const y2 = 50 + outer * Math.sin(rad);
                return `<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}"
                             x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" />`;
              }).join("")}
            </g>
          </g>

          <!-- Inner dashed guide ring -->
          <circle cx="50" cy="50" r="28"
                  fill="none" stroke="#555d6b" stroke-width="1"
                  stroke-dasharray="3 4" />

          <!-- Center base point (under hub) -->
          <circle cx="50" cy="50" r="2.6" fill="#101118" />

          <!-- Labels -->
          ${labelSvg}

          <!-- Tapered tech needle -->
          <g class="rc8d-compass-needle"
             style="transform-origin: 50% 50%;"
             filter="url(#rc8d-darkmetal-needle-shadow)">
            <!-- North tip: long, thin, sharp -->
            <path d="M50 11 L47.5 50 L50 35 L52.5 50 Z"
                  fill="url(#rc8d-darkmetal-needle-n)"
                  stroke="#7d1b1e" stroke-width="0.7" />

            <!-- South tip: shorter, slightly wider -->
            <path d="M50 89 L46.5 50 L50 65 L53.5 50 Z"
                  fill="url(#rc8d-darkmetal-needle-s)"
                  stroke="#b4bac5" stroke-width="0.7" />

            <!-- Center hub -->
            <circle cx="50" cy="50" r="5"
                    fill="url(#rc8d-darkmetal-hub)"
                    stroke="#dde4ff" stroke-width="0.9" />
            <circle cx="50" cy="50" r="2.6" fill="#ff5252" />
          </g>
        </svg>
      </div>
    `;
  }

  Theme.registerTheme({
    id: "dark-metal",
    i18nKey: "RC8D.CompassTheme.darkMetal",
    render: renderDarkMetal
  });
})();
