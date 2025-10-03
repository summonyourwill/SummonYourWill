# SummonYourWill

A desktop incremental RPG built with Electron. Manage heroes, gather resources and send them on missions. Game data is persisted using `electron-store` with a fallback to `localStorage` when running in a regular browser. When running inside Electron, `preload.cjs` exposes these methods on `window.electronStore` so the renderer can call `get`, `set` and `delete` without importing Node modules. The interface uses a light color scheme by default. The main process also initializes `electron-store` so these calls work correctly.

## ⚠ Important Note
1. The game may show Windows security warnings because I don’t have a digital signature certificate yet. Windows flags any unsigned indie executable as “unknown.” It should be safe.
2. save.json is saved in User/.../Documents/SummonYourWillSaves.
3. You can put your own music inside the game and it copies them into User/.../Musics/SummonYourWillMusic
4. You can export all your images that you have imported , they will be inside User/.../Images/SummonYourWillImages.

## 🎮 About the Game
SummonYourWill is an idle, motivational experience designed to help you stay on track with your daily goals while enjoying a fantasy world full of heroes, pets, and exciting battles.

1. ✅ Habit Calendar: Complete your daily tasks, track your progress, and keep your motivation high.
2. ✅ Goal Checklist: Every milestone you reach strengthens your heroes and your village.
3. ✅ Quests & Rewards: Turn your real-life achievements into gold, food, wood, and stone to expand your settlement.
4. ✅ Fun Minigames: Challenge yourself with battles, defeat the Village Chief, and even meet their Partner in unique story events.
5. ✅ Customizable Heroes: Collect unique heroes and use personalized images to make them truly yours.
6. ✅ Resourceful Pets: They gather materials for you while you focus on your real-life goals.
7. ✅ Strategic Resource Management: Decide how to spend your gold and materials to unlock skills, summon new heroes, and improve your constructions.
8. ✅ Idle System: Even when you’re away, your heroes keep fighting and gathering resources for you.

## Save files and user music

The desktop app stores the latest game save in the user's documents folder at `Documents/SummonYourWillSaves/save.json`. Imported MP3 files and `music_index.json` reside in `Music/SummonYourWillMusic`. These folders are created automatically and existing saves are migrated from the legacy AppData location on first run.


## Running the app

1. Run `npm install` to install dependencies.
2. Start the desktop app with `npm start`.
3. Launch the mobile interface with `npm run start:cell`.
4. To run the lightweight web server in the background use `npm run start:pm2`. This launches the Fastify server through `pm2` in cluster mode when multiple CPU cores are available.
   
   **Important:** the web version uses ES modules. Opening `index.html`
   directly from your file system will not load them correctly. Launch a
   simple static server with `npm run serve` and then visit
   `http://localhost:8080` in your browser. When loaded inside Electron,
   `preload.cjs` exposes `window.electronStore`, allowing the app to run
   from the `file:` protocol without showing a warning. It also sets
   `window.isElectron` synchronously so runtime checks can safely
   detect the Electron environment.

## Building a distributable package

Run `npm run build` to generate a Windows installer using Electron Builder. The resulting `.exe` file appears in the `dist` folder and, after the build finishes, JavaScript, CSS and HTML are obfuscated so the code is not exposed.

To create a macOS `.dmg`, run `npm run build:mac` on a Mac. The resulting file will also appear in the `dist` folder.

The Fastify server attempts to use a local Redis instance to cache static files and reduce disk reads. If Redis is not running, the server continues without caching. WebSocket connections are exposed at `/ws` for tracking global minigame progress when available.

The `PixiSurvival` minigame demonstrates a lightweight PixiJS setup using Bitecs for an ECS-style architecture. GSAP's ticker drives the render loop and Matter.js is loaded only when physics are required.

## Mobile version

The simplified interface in `Cellphone/Cellphone.html` loads the same modules
from `script.js`. Launch it inside Electron with `npm run start:cell`, or serve
the web build via `npm run serve` to test on a phone. Fastify registers a
service worker so assets are cached and the game can run offline after the first
load.

Responsive rules in `style.css` reposition the sidebar and shrink buttons on
screens narrower than 600&nbsp;px. Cards in the pets and village chief sections
also reflow for small screens, while the main content area allows horizontal
scrolling if wide elements overflow. To package a native app you can wrap the
web version with tools like Capacitor or Cordova without modifying the desktop
build.

The `.app` container now stretches to fill the viewport height so there is no
extra blank space at the bottom of the mobile page.

## Creating minigames

Minigames live inside the `minigames/` folder. A small framework provides
helpers to start and end a game.

Create a module that exports an object with an `init(container, finish)`
method. The `finish` callback should be called when the game ends. Example:

```javascript
import { startGame } from "../minigames/framework.js";

export function myGameButton(container) {
  startGame({
    init(el, end) {
      // setup game DOM inside `el`
      const btn = document.createElement("button");
      btn.textContent = "Win";
      btn.onclick = () => end();
      el.appendChild(btn);
    },
    cleanup() {}
  }, container);
}
```

## Module overview

The project splits core functionality into small modules. Key ones include:

- `main.cjs` – Electron entry point that creates the window and bridges save/load messages.
- `src/core/saveManager.cjs` – Handles reading and writing save files to the user's profile.
- `src/audio/manager.js` – Centralized audio playback and visibility handling.
- `src/heroes/index.js` – Helper functions for creating and naming heroes.
- `src/missions.js` – Renders mission slots and manages mission timers.
- `src/pool.js` – Tiny object pool utility used by minigames.
- `src/storage.js` – Wrapper around `electron-store` with a `localStorage` fallback.
- `src/engine/stableLoop.js` – Fixed timestep game loop helper.
- `src/wrappers/howler.js` – Dynamically loads the Howler library on demand.
- `src/village.js` – Builds the village UI and upgrade controls.
