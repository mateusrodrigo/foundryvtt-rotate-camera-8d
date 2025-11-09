// ===========================
// Arcane Blue theme (mystic, glowing, strong north highlight)
// ===========================
(function () {
  const Theme = window.RC8DCompassTheme;
  if (!Theme) return;

  const { helpers } = Theme;

  function renderArcaneBlue(container, labels) {
    const labelSvg = helpers.buildLabels(labels, {
      mainColor: "#e7f9ff",
      minorColor: "#c6ecff",
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
            <!-- Deep night sky background -->
            <radialGradient id="rc8d-arcane-bg" cx="50%" cy="35%" r="70%">
              <stop offset="0%"  stop-color="#253a72" />
              <stop offset="45%" stop-color="#0f1833" />
              <stop offset="100%" stop-color="#050713" />
            </radialGradient>

            <!-- Outer arcane rim -->
            <linearGradient id="rc8d-arcane-rim" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"  stop-color="#6de1ff" />
              <stop offset="40%" stop-color="#2f8cd4" />
              <stop offset="100%" stop-color="#134066" />
            </linearGradient>

            <!-- Inner energy ring -->
            <radialGradient id="rc8d-arcane-ring" cx="50%" cy="50%" r="55%">
              <stop offset="0%"  stop-color="rgba(111, 230, 255, 0.85)" />
              <stop offset="45%" stop-color="rgba(56, 208, 255, 0.35)" />
              <stop offset="100%" stop-color="rgba(56, 208, 255, 0.0)" />
            </radialGradient>

            <!-- Needle gradients: N = cyan, S = white/silver -->
            <linearGradient id="rc8d-arcane-needle-n" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%"  stop-color="#b9ffff" />
              <stop offset="35%" stop-color="#5ce7ff" />
              <stop offset="70%" stop-color="#1aa0ff" />
              <stop offset="100%" stop-color="#0a3c7f" />
            </linearGradient>

            <linearGradient id="rc8d-arcane-needle-s" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%"  stop-color="#ffffff" />
              <stop offset="40%" stop-color="#f1f5ff" />
              <stop offset="100%" stop-color="#b7c7e6" />
            </linearGradient>

            <!-- Hub glow -->
            <radialGradient id="rc8d-arcane-hub" cx="50%" cy="40%" r="60%">
              <stop offset="0%"  stop-color="#f2fdff" />
              <stop offset="100%" stop-color="#26426b" />
            </radialGradient>

            <!-- Soft cyan outer glow -->
            <filter id="rc8d-arcane-outer-glow" x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx="0" dy="0" stdDeviation="2.4"
                            flood-color="#3fe0ff" flood-opacity="0.45" />
            </filter>

            <!-- North needle magical glow -->
            <filter id="rc8d-arcane-needle-glow-n" x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx="0" dy="0" stdDeviation="2.1"
                            flood-color="#66e8ff" flood-opacity="0.9" />
            </filter>

            <!-- South needle soft white glow -->
            <filter id="rc8d-arcane-needle-glow-s" x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx="0" dy="0" stdDeviation="1.6"
                            flood-color="#ffffff" flood-opacity="0.55" />
            </filter>

            <!-- Needle shadow for depth -->
            <filter id="rc8d-arcane-needle-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1.2" stdDeviation="1.4"
                            flood-color="#000000" flood-opacity="0.55" />
            </filter>
          </defs>

          <!-- Outer disc + rim -->
          <g filter="url(#rc8d-arcane-outer-glow)">
            <circle cx="50" cy="50" r="46" fill="url(#rc8d-arcane-bg)" />
            <circle cx="50" cy="50" r="43"
                    fill="none" stroke="url(#rc8d-arcane-rim)" stroke-width="2.3" />
          </g>

          <!-- Energy ring -->
          <circle cx="50" cy="50" r="38"
                  fill="none" stroke="url(#rc8d-arcane-ring)" stroke-width="3" />

          <!-- Inner disc -->
          <circle cx="50" cy="50" r="35"
                  fill="#050813" stroke="#233a68" stroke-width="0.9" />

          <!-- Ticks (can be hidden with .rc8d-ticks-main) -->
          <g class="rc8d-ticks-main">
            <!-- Cardinal ticks -->
            <g stroke="#6fe5ff" stroke-width="1.8" stroke-linecap="round">
              <line x1="50" y1="7"  x2="50" y2="14" />
              <line x1="93" y1="50" x2="86" y2="50" />
              <line x1="50" y1="93" x2="50" y2="86" />
              <line x1="7"  y1="50" x2="14" y2="50" />
            </g>

            <!-- 16-segment minor ticks -->
            <g stroke="#2c8fe0" stroke-width="1.1" stroke-linecap="round">
              ${Array.from({ length: 16 }).map((_, i) => {
                const angle = i * 22.5;
                const inner = 33;
                const outer = i % 4 === 0 ? 36 : 34;
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

          <!-- Inner dashed magic circle -->
          <circle cx="50" cy="50" r="26"
                  fill="none" stroke="#274a8a" stroke-width="1"
                  stroke-dasharray="2 4" />

          <!-- Center base point -->
          <circle cx="50" cy="50" r="2.6" fill="#061021" />

          <!-- Labels -->
          ${labelSvg}

          <!-- Needle: magical glow on both, cyan stronger on north -->
          <g class="rc8d-compass-needle"
             style="transform-origin: 50% 50%;"
             filter="url(#rc8d-arcane-needle-shadow)">

            <!-- North tip with strong cyan glow -->
            <g filter="url(#rc8d-arcane-needle-glow-n)">
              <path d="M50 11 L47.5 50 L50 35 L52.5 50 Z"
                    fill="url(#rc8d-arcane-needle-n)"
                    stroke="#0f6fd0" stroke-width="0.7" />
            </g>

            <!-- South tip with softer white glow -->
            <g filter="url(#rc8d-arcane-needle-glow-s)">
              <path d="M50 89 L46.5 50 L50 65 L53.5 50 Z"
                    fill="url(#rc8d-arcane-needle-s)"
                    stroke="#b9d7ff" stroke-width="0.7" />
            </g>

            <!-- Hub -->
            <circle cx="50" cy="50" r="5"
                    fill="url(#rc8d-arcane-hub)"
                    stroke="#a8ebff" stroke-width="0.9" />
            <circle cx="50" cy="50" r="2.6" fill="#6de0ff" />
          </g>
        </svg>
      </div>
    `;
  }

  Theme.registerTheme({
    id: "arcane-blue",
    i18nKey: "RC8D.CompassTheme.arcaneBlue",
    render: renderArcaneBlue
  });
})();
