# Rotate Camera 8D (v1.1.0)

![Foundry Version](https://img.shields.io/badge/Foundry-v13.350%2B-blue)
![Version](https://img.shields.io/badge/Version-1.1.0-green)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow)

Adds smooth **45° camera rotation** to **Foundry VTT (v13.350+)**, with full **8-direction movement remap** that keeps WASD navigation consistent regardless of rotation.  
Now includes automatic **vision refresh** and **cinematic rotation sync** with [Follow The Token](https://github.com/mateusrodrigo/foundryvtt-follow-the-token), creating a complete, immersive camera control experience.

---

## Features

- **8-directional rotation**
  - Rotate the camera in 45° increments using configurable keys.
  - Movement keys automatically adapt to the current camera orientation.
- **Natural movement**
  - Maintain consistent token direction even after rotation.
  - Supports diagonal input (W+A, W+D, S+A, S+D).
- **Smooth rotation**
  - Animated transitions with easing.
  - No camera snapping or drift.
- **Automatic vision refresh**
  - Fixes cases where token vision or lighting appeared “stuck” or misaligned after rotation.
  - Forces Foundry to re-render perception cleanly without affecting performance.
- **Cinematic integration**
  - When combined with *Follow The Token (v1.2.0)*:
    - GM camera rotation is shared instantly across all players during Cinematic mode.
    - Player rotations are locked and synced with the GM’s camera to ensure 1:1 alignment.
- **Keybinding support**
  - Default keys:
    - **Q** → Rotate Right (clockwise)
    - **E** → Rotate Left (counterclockwise)
  - Fully rebindable via **Game Settings → Configure Controls → Keybinds**.
- **Independent camera layer**
  - Uses `canvas.stage.rotation` safely without altering token rotation or grid state.
- **Bilingual**
  - English and Portuguese (Brazil) translations included.

---

## Installation
**Manifest URLs:**  
- GitHub (Raw): https://raw.githubusercontent.com/mateusrodrigo/foundryvtt-rotate-camera-8d/v1.1.0/module.json  
- jsDelivr: https://cdn.jsdelivr.net/gh/mateusrodrigo/foundryvtt-rotate-camera-8d@v1.1.0/module.json  

1. In Foundry VTT, go to **Add-on Modules → Install Module**  
2. Paste one of the URLs above and click **Install**  
3. Enable the module in your World  
4. Configure keybindings in **Game Settings → Configure Controls → Rotate Camera 8D**

---

## Usage
- Use **Q** and **E** (default) to rotate the camera by 45° in either direction.  
- Token movement with **WASD** (or your preferred keys) automatically follows the rotated camera orientation.  
- Rotation affects only your view — not token facing, grid, or scene geometry.  
- When *Follow The Token* is active:
  - The rotation stays fully in sync during Cinematic mode.
  - GM rotation is propagated instantly to all clients.

---

## Compatibility
- Verified for **Foundry VTT v13.350**.  
- Fully compatible with *Follow The Token (v1.2.0)*.  
- May conflict with other modules that manipulate `canvas.stage.rotation` directly.  
- **Known limitation:** Foundry’s grid layer does not rotate.  
  When rotating beyond certain angles, the grid may appear misaligned or invisible — this is an engine-level behavior, not a module issue.

---

## Changelog
### v1.1.0
- Fixed rare issue where vision/shadows could remain misaligned after rotation.
- Added automatic vision refresh on each rotation step.
- Integrated with *Follow The Token* for perfect Cinematic rotation sync.
- Minor performance and compatibility improvements.

---

## Credits
Developed by [Mateus Rodrigo](https://github.com/mateusrodrigo)  
License: [MIT](LICENSE)
