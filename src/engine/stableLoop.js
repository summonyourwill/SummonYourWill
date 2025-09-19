"use strict";

let rafId = 0;
let running = false;
let last = 0;
let acc = 0;
const STEP = 1000 / 60; // ms per update (60 Hz)
const MAX_STEPS = 4;    // avoid spiral of death on lag
let _update = null;
let _draw = null;

function frame(now){
  if(!running) return;
  rafId = requestAnimationFrame(frame);
  if(!last) last = now;
  let dt = now - last;
  if(dt > 1000) dt = STEP; // inactive tab; avoid huge jump
  acc += dt; last = now;
  let steps = 0;
  while(acc >= STEP && steps < MAX_STEPS){
    _update(STEP / 1000); // dt in seconds
    acc -= STEP;
    steps++;
  }
  const alpha = acc / STEP; // 0..1 interpolation factor
  _draw(alpha);
}

/**
 * Start the fixed timestep loop. The provided callbacks will be invoked on
 * each update and draw phase.
 *
 * @param {(dt:number)=>void} update Physics/update step called at 60 Hz.
 * @param {(alpha:number)=>void} draw Render callback interpolated with alpha.
 * @returns {void}
 */
export function startLoop(update, draw){
  stopLoop();
  _update = update;
  _draw = draw;
  running = true;
  last = 0; acc = 0;
  rafId = requestAnimationFrame(frame);
}

/**
 * Stop the running loop if active.
 *
 * @returns {void}
 */
export function stopLoop(){
  running = false;
  if(rafId) cancelAnimationFrame(rafId);
  rafId = 0;
}

/**
 * Fixed timestep in seconds used by the loop.
 */
export const FIXED_DT = STEP / 1000;
