// ===========================
// Classic Simple theme (clean, classic, sharp needle)
// ===========================
(function () {
  const Theme = window.RC8DCompassTheme;
  if (!Theme) return;

  const { helpers } = Theme;

  function renderClassicSimple(container, labels) {
    const labelSvg = helpers.buildLabels(labels, {
      mainColor: "#ffffff",
      minorColor: "#f0f0f0",
      largeSize: 12,
      smallSize: 9,
      extraStyle: "letter-spacing: 0.3px;",
      centerX: 50,
      centerY: 50,
      radiusCardinal: 32,
      radiusDiagonal: 32.5,
      offsets: {
        N: { dx: 0, dy: -1 },
        S: { dx: 0, dy: 1 }
      }
    });

    container.innerHTML = `
      <div class="rc8d-compass-container" style="position: relative; width: 100%; height: 100%;">
        <svg viewBox="0 0 100 100" class="rc8d-compass-svg" style="width: 100%; height: 100%;">
          <defs>
            <!-- Dark metal body -->
            <radialGradient id="rc8d-classic-metal" cx="50%" cy="30%" r="70%">
              <stop offset="0%"  stop-color="#3a3a3a" />
              <stop offset="45%" stop-color="#1f1f1f" />
              <stop offset="100%" stop-color="#070707" />
            </radialGradient>

            <!-- Subtle silver rim -->
            <linearGradient id="rc8d-classic-rim" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"  stop-color="#f0f0f0" />
              <stop offset="40%" stop-color="#9c9c9c" />
              <stop offset="100%" stop-color="#4a4a4a" />
            </linearGradient>

            <!-- Needle gradients -->
            <linearGradient id="rc8d-classic-needle-n" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%"  stop-color="#ffd4cd" />
              <stop offset="40%" stop-color="#ff5140" />
              <stop offset="100%" stop-color="#801616" />
            </linearGradient>

            <linearGradient id="rc8d-classic-needle-s" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%"  stop-color="#ffffff" />
              <stop offset="100%" stop-color="#d6d6d6" />
            </linearGradient>

            <!-- Hub glow -->
            <radialGradient id="rc8d-classic-hub" cx="50%" cy="40%" r="60%">
              <stop offset="0%"  stop-color="#f5f5f5" />
              <stop offset="100%" stop-color="#5a5a5a" />
            </radialGradient>

            <!-- Needle shadow -->
            <filter id="rc8d-classic-needle-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1.2" stdDeviation="1.4"
                            flood-color="#000000" flood-opacity="0.45" />
            </filter>
          </defs>

          <!-- Outer rim -->
          <circle cx="50" cy="50" r="46"
                  fill="url(#rc8d-classic-metal)" />
          <circle cx="50" cy="50" r="43"
                  fill="none" stroke="url(#rc8d-classic-rim)" stroke-width="2.4" />

          <!-- Thin inner highlight -->
          <circle cx="50" cy="50" r="40"
                  fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="0.8" />

          <!-- Inner disc -->
          <circle cx="50" cy="50" r="37"
                  fill="#121212" stroke="#404040" stroke-width="0.8" />

          <!-- Ticks (group can be hidden by core when labels are visible) -->
          <g class="rc8d-ticks-main">
            <!-- Cardinal ticks -->
            <g stroke="#e0e0e0" stroke-width="1.8" stroke-linecap="round">
              <line x1="50" y1="8"  x2="50" y2="15" />
              <line x1="92" y1="50" x2="85" y2="50" />
              <line x1="50" y1="92" x2="50" y2="85" />
              <line x1="8"  y1="50" x2="15" y2="50" />
            </g>

            <!-- Minor ticks every 22.5° -->
            <g stroke="#777777" stroke-width="1" stroke-linecap="round">
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

          <!-- Center base dot -->
          <circle cx="50" cy="50" r="2.6" fill="#202020" />

          <!-- Labels -->
          ${labelSvg}

          <!-- Needle -->
          <g class="rc8d-compass-needle"
             style="transform-origin: 50% 50%;"
             filter="url(#rc8d-classic-needle-shadow)">
            <!-- North: long and thin -->
            <path d="M50 12 L47.5 50 L50 36 L52.5 50 Z"
                  fill="url(#rc8d-classic-needle-n)"
                  stroke="#6f1816" stroke-width="0.7" />
            <!-- South: shorter and slightly wider -->
            <path d="M50 88 L46.5 50 L50 64 L53.5 50 Z"
                  fill="url(#rc8d-classic-needle-s)"
                  stroke="#b0b0b0" stroke-width="0.7" />

            <!-- Hub -->
            <circle cx="50" cy="50" r="5"
                    fill="url(#rc8d-classic-hub)"
                    stroke="#f0f0f0" stroke-width="0.9" />
            <circle cx="50" cy="50" r="2.6" fill="#ff4a3f" />
          </g>
        </svg>
      </div>
    `;
  }

  Theme.registerTheme({
    id: "classic-simple",
    i18nKey: "RC8D.CompassTheme.classicSimple",
    render: renderClassicSimple
  });
})();
