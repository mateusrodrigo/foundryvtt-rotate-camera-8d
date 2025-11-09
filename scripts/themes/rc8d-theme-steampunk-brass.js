// ===========================
// Steampunk Brass theme (brass, rivets, gear feel)
// ===========================
(function () {
  const Theme = window.RC8DCompassTheme;
  if (!Theme) return;

  const { helpers } = Theme;

  function renderSteampunkBrass(container, labels) {
    const labelSvg = helpers.buildLabels(labels, {
      mainColor: "#2b1809",
      minorColor: "#4a2a13",
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
            <!-- Outer brass body -->
            <radialGradient id="rc8d-brass-outer" cx="50%" cy="50%" r="70%">
              <stop offset="0%"  stop-color="#a06b2d" />
              <stop offset="50%" stop-color="#6b441c" />
              <stop offset="100%" stop-color="#3b2410" />
            </radialGradient>

            <!-- Brass rim -->
            <linearGradient id="rc8d-brass-rim" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"  stop-color="#f1d79a" />
              <stop offset="40%" stop-color="#d2a75d" />
              <stop offset="100%" stop-color="#8a5d25" />
            </linearGradient>

            <!-- Inner plate -->
            <radialGradient id="rc8d-brass-inner" cx="50%" cy="45%" r="55%">
              <stop offset="0%"  stop-color="#f3e1c3" />
              <stop offset="50%" stop-color="#cfb08a" />
              <stop offset="100%" stop-color="#a27a4a" />
            </radialGradient>

            <!-- Needle gradients -->
            <linearGradient id="rc8d-brass-needle-n" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%"  stop-color="#f7e6bc" />
              <stop offset="40%" stop-color="#e0b453" />
              <stop offset="100%" stop-color="#9a6626" />
            </linearGradient>

            <linearGradient id="rc8d-brass-needle-s" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%"  stop-color="#f9f5ed" />
              <stop offset="100%" stop-color="#cbb8a0" />
            </linearGradient>

            <!-- Needle shadow -->
            <filter id="rc8d-brass-needle-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1.2" stdDeviation="1.5"
                            flood-color="#000000" flood-opacity="0.5" />
            </filter>
          </defs>

          <!-- Outer brass body + rim -->
          <circle cx="50" cy="50" r="46" fill="url(#rc8d-brass-outer)" />
          <circle cx="50" cy="50" r="43"
                  fill="none" stroke="url(#rc8d-brass-rim)" stroke-width="3" />

          <!-- Inner plate -->
          <circle cx="50" cy="50" r="36"
                  fill="url(#rc8d-brass-inner)" stroke="#6a4824" stroke-width="0.8" />

          <!-- Rivets at cardinal positions -->
          <g fill="#3b2410">
            <circle cx="50" cy="8"  r="1.6" />
            <circle cx="92" cy="50" r="1.6" />
            <circle cx="50" cy="92" r="1.6" />
            <circle cx="8"  cy="50" r="1.6" />
          </g>

          <!-- Tick lines (group can be hidden by core) -->
          <g class="rc8d-ticks-main" stroke="#5f3b1a" stroke-width="1.4" stroke-linecap="round">
            <line x1="50" y1="12" x2="50" y2="18" />
            <line x1="50" y1="12" x2="50" y2="18" transform="rotate(45 50 50)" />
            <line x1="50" y1="12" x2="50" y2="18" transform="rotate(90 50 50)" />
            <line x1="50" y1="12" x2="50" y2="18" transform="rotate(135 50 50)" />
            <line x1="50" y1="12" x2="50" y2="18" transform="rotate(180 50 50)" />
            <line x1="50" y1="12" x2="50" y2="18" transform="rotate(225 50 50)" />
            <line x1="50" y1="12" x2="50" y2="18" transform="rotate(270 50 50)" />
            <line x1="50" y1="12" x2="50" y2="18" transform="rotate(315 50 50)" />
          </g>

          <!-- Inner gear-like dashed ring -->
          <circle cx="50" cy="50" r="27"
                  fill="none" stroke="#7b5832" stroke-width="1.2"
                  stroke-dasharray="3 4" />

          <!-- Labels -->
          ${labelSvg}

          <!-- Needle -->
          <g class="rc8d-compass-needle"
             style="transform-origin: 50% 50%;"
             filter="url(#rc8d-brass-needle-shadow)">
            <!-- North tip -->
            <path d="M50 13 L45 50 L50 41 L55 50 Z"
                  fill="url(#rc8d-brass-needle-n)"
                  stroke="#7f5422" stroke-width="0.8" />
            <!-- South tip -->
            <path d="M50 87 L45 50 L50 59 L55 50 Z"
                  fill="url(#rc8d-brass-needle-s)"
                  stroke="#b8a187" stroke-width="0.7" />
            <!-- Hub -->
            <circle cx="50" cy="50" r="4.4"
                    fill="#3a2413" stroke="#f4ddaf" stroke-width="1" />
            <circle cx="50" cy="50" r="2.1" fill="#e1c38d" />
          </g>
        </svg>
      </div>
    `;
  }

  Theme.registerTheme({
    id: "steampunk-brass",
    i18nKey: "RC8D.CompassTheme.steampunkBrass",
    render: renderSteampunkBrass
  });
})();
