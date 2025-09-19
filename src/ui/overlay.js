import { pauseTimers, updateTimerPause } from '../../script.js';

export function appendOverlay(overlay, container) {
  const root = container || document.getElementById('modal-root') || document.body;
  root.appendChild(overlay);
  document.body.classList.add('body--lock-scroll');
  pauseTimers();
}

export function removeOverlay(overlay) {
  overlay.remove();
  if (!document.querySelector('.modal-overlay, .sy-modal-overlay')) {
    document.body.classList.remove('body--lock-scroll');
    updateTimerPause();
  }
}
