// ===========================
// Parchment RPG theme (wood rim, parchment center, fantasy look)
// ===========================
(function () {
  const Theme = window.RC8DCompassTheme;
  if (!Theme) return;

  const { helpers } = Theme;

  function renderParchmentRpg(container, labels) {
    const labelSvg = helpers.buildLabels(labels, {
      mainColor: "#2b1208",
      minorColor: "#4a2210",
      largeSize: 11,
      smallSize: 9,
      extraStyle: "letter-spacing: 0.25px;",
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
            <!-- Parchment center -->
            <radialGradient id="rc8d-rpg-parchment" cx="50%" cy="40%" r="60%">
              <stop offset="0%"  stop-color="#fbf4df" />
              <stop offset="40%" stop-color="#ecd6a8" />
              <stop offset="100%" stop-color="#c89460" />
            </radialGradient>

            <!-- Wood rim -->
            <radialGradient id="rc8d-rpg-wood" cx="50%" cy="50%" r="70%">
              <stop offset="0%"  stop-color="#7a4623" />
              <stop offset="55%" stop-color="#4d2911" />
              <stop offset="100%" stop-color="#2b1407" />
            </radialGradient>

            <!-- Gold edge -->
            <linearGradient id="rc8d-rpg-gold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"  stop-color="#ffe9b8" />
              <stop offset="40%" stop-color="#dfb15d" />
              <stop offset="100%" stop-color="#96631f" />
            </linearGradient>

            <!-- Needle gradients -->
            <linearGradient id="rc8d-rpg-needle-n" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%"  stop-color="#ffe4d7" />
              <stop offset="35%" stop-color="#ff7b61" />
              <stop offset="100%" stop-color="#851816" />
            </linearGradient>

            <linearGradient id="rc8d-rpg-needle-s" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%"  stop-color="#ffffff" />
              <stop offset="100%" stop-color="#d2cbc0" />
            </linearGradient>

            <!-- Hub -->
            <radialGradient id="rc8d-rpg-hub" cx="50%" cy="40%" r="60%">
              <stop offset="0%"  stop-color="#fbe6ba" />
              <stop offset="100%" stop-color="#7b552e" />
            </radialGradient>

            <!-- Needle shadow -->
            <filter id="rc8d-rpg-needle-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1.2" stdDeviation="1.5"
                            flood-color="#000000" flood-opacity="0.45" />
            </filter>
          </defs>

          <!-- Wood and gold rim -->
          <circle cx="50" cy="50" r="46" fill="url(#rc8d-rpg-wood)" />
          <circle cx="50" cy="50" r="43"
                  fill="none" stroke="url(#rc8d-rpg-gold)" stroke-width="2.4" />

          <!-- Inner highlight ring -->
          <circle cx="50" cy="50" r="41"
                  fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="0.8" />

          <!-- Parchment disc -->
          <circle cx="50" cy="50" r="39"
                  fill="url(#rc8d-rpg-parchment)" stroke="#8b6a34" stroke-width="0.9" />

          <!-- Major + minor ticks -->
          <g class="rc8d-ticks-main">
            <!-- Cardinal ticks -->
            <g stroke="#3a2a16" stroke-width="2.0" stroke-linecap="round">
              <line x1="50" y1="8"  x2="50" y2="15" />
              <line x1="92" y1="50" x2="85" y2="50" />
              <line x1="50" y1="92" x2="50" y2="85" />
              <line x1="8"  y1="50" x2="15" y2="50" />
            </g>

            <!-- 16-segment minor ticks -->
            <g stroke="#5b4223" stroke-width="1.4" stroke-linecap="round">
              ${Array.from({ length: 16 }).map((_, i) => {
                const angle = i * 22.5;
                const inner = 36;
                const outer = i % 4 === 0 ? 39 : 37;
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

          <!-- Inner dashed guide -->
          <circle cx="50" cy="50" r="30"
                  fill="none" stroke="#bfa06b" stroke-width="0.9"
                  stroke-dasharray="2 4" />

          <!-- Center dot -->
          <circle cx="50" cy="50" r="2.6" fill="#3e2a1a" />

          <!-- Labels -->
          ${labelSvg}

          <!-- Stylized needle -->
          <g class="rc8d-compass-needle"
             style="transform-origin: 50% 50%;"
             filter="url(#rc8d-rpg-needle-shadow)">
            <!-- North tip -->
            <path d="M50 12 L45 50 L50 37 L55 50 Z"
                  fill="url(#rc8d-rpg-needle-n)"
                  stroke="#6d1614" stroke-width="0.8" />
            <!-- South tip -->
            <path d="M50 88 L45 50 L50 63 L55 50 Z"
                  fill="url(#rc8d-rpg-needle-s)"
                  stroke="#8f877c" stroke-width="0.8" />
            <!-- Hub -->
            <circle cx="50" cy="50" r="5"
                    fill="url(#rc8d-rpg-hub)"
                    stroke="#f5d9a1" stroke-width="1" />
            <circle cx="50" cy="50" r="2.6" fill="#e94d3c" />
          </g>
        </svg>
      </div>
    `;
  }

  Theme.registerTheme({
    id: "parchment-rpg",
    i18nKey: "RC8D.CompassTheme.parchmentRpg",
    render: renderParchmentRpg
  });
})();
