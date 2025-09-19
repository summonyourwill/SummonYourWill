let activeGame = null;
let activeLabel = null;
let progressCallback = () => {};

export function setProgressCallback(cb) {
  progressCallback = cb;
}

export function startGame(game, container, label = "") {
  if (activeGame && activeGame.cleanup) {
    activeGame.cleanup();
  }
  activeGame = game;
  activeLabel = label;
  if (game.init) {
    game.init(container, endGame);
  }
}

export function pauseGame() {
  if (activeGame && activeGame.pause) {
    activeGame.pause();
  }
}

export function resumeGame() {
  if (activeGame && activeGame.resume) {
    activeGame.resume();
  }
}

export function endGame(score = 0) {
  if (activeGame && activeGame.cleanup) {
    const game = activeGame;
    activeGame = null;
    game.cleanup();
  } else {
    activeGame = null;
  }
  if (activeLabel) progressCallback({ game: activeLabel, score });
  activeLabel = null;
}
