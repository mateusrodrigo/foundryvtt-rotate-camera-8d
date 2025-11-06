# Rotate Camera 8D (v1.0.0)

![Foundry Version](https://img.shields.io/badge/Foundry-v13.350%2B-blue)
![Version](https://img.shields.io/badge/Version-1.0.0-green)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow)

Adds smooth **45° camera rotation** to **Foundry VTT (v13.350+)**, with full **8-direction movement remap** that keeps WASD navigation consistent regardless of rotation.  
Designed to be **non-intrusive**, lightweight, and fully compatible with **[Follow The Token](https://github.com/mateusrodrigo/foundryvtt-follow-the-token)** for a complete dynamic camera experience.

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
- **Keybinding support**
  - Default keys:
    - **Q** → Rotate Right (clockwise)
    - **E** → Rotate Left (counterclockwise)
  - Fully rebindable via **Game Settings → Configure Controls → Keybinds**.
- **Independent camera layer**
  - Uses `canvas.stage.rotation` safely without altering token rotation.
- **Bilingual**
  - English and Portuguese (Brazil) translations included.

---

## Installation
**Manifest URLs:**  
- GitHub (Raw): https://raw.githubusercontent.com/mateusrodrigo/foundryvtt-rotate-camera-8d/v1.0.0/module.json  
- jsDelivr: https://cdn.jsdelivr.net/gh/mateusrodrigo/foundryvtt-rotate-camera-8d@v1.0.0/module.json  

1. In Foundry VTT, go to **Add-on Modules → Install Module**  
2. Paste one of the URLs above and click **Install**  
3. Enable the module in your World  
4. Configure keybindings in **Game Settings → Configure Controls → Rotate Camera 8D**

---

## Usage
- Use **Q** and **E** (default) to rotate the camera by 45° in either direction.  
- Token movement with **WASD** (or your preferred keys) will automatically follow the rotated camera orientation.  
- Rotation affects only your view, not token facing or grid alignment.  
- Works seamlessly with *Follow The Token* for combined follow-and-rotate camera control.

---

## Compatibility
- Tested on **Foundry VTT v13.350**.  
- Fully compatible with *Follow The Token (v1.1.0)*.  
- May conflict with other modules that manipulate the `canvas.stage` rotation directly.  
- **Known limitation:** Foundry’s grid is rendered in a fixed, non-rotating layer (`GridLayer`).  
  When the camera is rotated beyond certain angles, the grid may appear misaligned or invisible.  
  This is a core engine behavior, not a module bug.

---

## Credits
Developed by [Rodrigo](https://github.com/mateusrodrigo)  
License: [MIT](LICENSE)
