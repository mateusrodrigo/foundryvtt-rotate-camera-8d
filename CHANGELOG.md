## Rotate Camera 8D — Changelog

### 1.1.0 – Modular Compass System, Theme Architecture & API Hooks

**New**

- **Major refactor and modularization:**
  - The module is now divided into independent components for better maintainability and plugin support.
  - `rotate-camera-8d.js`: core rotation logic and 8-direction movement remapping.
  - `rotate-camera-8d-compass-core.js`: base compass rendering and shared API for external plugins.
  - `rotate-camera-8d-compass-themes.js`: manages theme registration and runtime switching.
  - New `/themes` directory with standalone visual theme modules:
    - `rc8d-theme-classic-simple.js`
    - `rc8d-theme-arcane-blue.js`
    - `rc8d-theme-dark-metal.js`
    - `rc8d-theme-parchment-rpg.js`
    - `rc8d-theme-steampunk-brass.js`

- **Compass overlay system:**
  - Introduces a real-time **on-screen compass** synchronized with camera rotation.
  - Compass appearance can be configured in module settings:
    - Enable or disable the overlay at any time.
    - Switch between visual themes instantly without reloading Foundry.
  - Each theme defines its own SVG layout, typography, and color palette.
  - The compass updates dynamically as the camera rotates or recenters.

- **New hooks and public API:**
  - `rotateCamera8dAnimating` — emitted continuously during rotation; provides `angleDeg`, `angleRad`, and `cameraStep`.
  - `rotateCamera8dRotated` — emitted once after rotation completes, providing the final rotation state.
  - Public API (`module.api`) now includes:
    - `getAngleDeg()`
    - `getAngleRad()`
    - `getCameraStep()`
  - These allow external modules (e.g. custom HUDs or cinematic overlays) to integrate seamlessly with rotation data.

- **Improved performance and visual smoothness:**
  - Optimized calls to `canvas.perception.update()` to minimize redundant vision/lighting refreshes.
  - Smoother transitions with less flickering under heavy movement.
  - Lightweight perception refresh during `canvasPan` ensures fog and light stay synchronized while rotating.

- **Integration with Follow The Token:**
  - Automatically detects *Cinematic Mode* and limits rotation input to the GM when active.
  - Ensures camera angle consistency across all clients during synchronized cinematic playback.

**Changes**

- Rewrote documentation headers for all source files in clear English.
- Improved naming conventions and method consistency across compass and theme modules.
- Moved compass rendering logic to an independent plugin system, isolating UI concerns from rotation logic.
- Consolidated perception refresh routines for better frame pacing.

**Fixes**

- Fixed rare desynchronization between rotation and token movement.
- Corrected compass redraw timing when rotating rapidly.
- Ensured persistence of compass state, rotation angle, and selected theme between scene reloads.
- Improved initial alignment when enabling the compass mid-session.

---

### 1.0.1 – Vision Refresh and Stability Improvements

**Fixed**

- Corrected a vision and lighting refresh issue that occurred when rotating the camera without *Follow The Token* enabled.
- Implemented a lightweight refresh method to maintain proper fog of war and shadow updates.
- Improved rotation stability and performance during movement.
- Minor internal refactoring and cleanup.

**Known Limitation**

- Foundry’s grid layer still does not rotate with the canvas.  
  When rotating the camera, the grid may appear misaligned or invisible.  
  This is a Foundry engine limitation, not a module issue.

**Compatibility**

- Tested on Foundry VTT v13.350+  
- Fully client-side; no database or system modifications.  
- Compatible with *Follow The Token* v1.0.1 and later.

---

### 1.0.0 – Initial Release (Foundry v13)

**Added**

- Initial public release of Rotate Camera 8D for Foundry VTT v13+.  
- Adds smooth 45° camera rotation using Q/E (configurable).  
- Fully remaps WASD movement to match the rotated camera angle.  
- Designed to work seamlessly alongside *Follow The Token*.  
- Maintains continuous movement when rotating mid-motion.  
- Non-intrusive: rotation affects only the client view, not the scene or tokens.

**Known Limitation**

- Foundry’s grid layer does not rotate with the canvas.  
  When rotating the camera, the grid may appear misaligned or invisible.  
  This is a Foundry engine limitation, not a module issue.
