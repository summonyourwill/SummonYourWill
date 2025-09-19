export function openConfirm({ title = 'Confirm', message = '', onConfirm, onCancel, onReturn, container } = {}) {
  if (container) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay card-modal';
    overlay.setAttribute('aria-modal', 'true');
    overlay.tabIndex = -1;

    const modal = document.createElement('div');
    modal.className = 'modal';

    const titleEl = document.createElement('h3');
    titleEl.style.margin = '0 0 8px';
    titleEl.textContent = title;

    const msgEl = document.createElement('p');
    msgEl.style.margin = '0 0 16px';
    msgEl.textContent = message;

    const btnRow = document.createElement('div');
    btnRow.style.display = 'flex';
    btnRow.style.gap = '8px';
    btnRow.style.justifyContent = 'flex-end';

    let returnBtn = null;
    if (onReturn) {
      returnBtn = document.createElement('button');
      returnBtn.type = 'button';
      returnBtn.className = 'btn btn-green';
      returnBtn.textContent = 'Return';
      returnBtn.onclick = () => { onReturn(); overlay.remove(); };
      btnRow.appendChild(returnBtn);
    }

    const confirmBtn = document.createElement('button');
    confirmBtn.type = 'button';
    confirmBtn.className = 'btn btn-red';
    confirmBtn.textContent = 'Confirm';
    confirmBtn.onclick = () => { onConfirm?.(); overlay.remove(); };
    btnRow.appendChild(confirmBtn);

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'btn btn-lightyellow';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.onclick = () => { onCancel?.(); overlay.remove(); };
    btnRow.appendChild(cancelBtn);

    modal.appendChild(titleEl);
    modal.appendChild(msgEl);
    modal.appendChild(btnRow);
    overlay.appendChild(modal);

    if (getComputedStyle(container).position === 'static') {
      container.style.position = 'relative';
    }
    container.appendChild(overlay);

    const focusables = () => overlay.querySelectorAll('button');
    (returnBtn || confirmBtn).focus();
    overlay.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (returnBtn) returnBtn.click(); else cancelBtn.click();
      } else if (e.key === 'Tab') {
        const f = focusables();
        if (f.length === 0) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      }
    });
    return;
  }

  const root = document.getElementById('modal-root');
  if (!root) return;
  root.querySelectorAll('.fixed-modal').forEach(el => el.remove());

  const modal = document.createElement('div');
  modal.className = 'fixed-modal';

  const titleEl = document.createElement('h3');
  titleEl.style.margin = '0 0 8px';
  titleEl.textContent = title;

  const msgEl = document.createElement('p');
  msgEl.style.margin = '0 0 16px';
  msgEl.textContent = message;

  const btnRow = document.createElement('div');
  btnRow.style.display = 'flex';
  btnRow.style.gap = '8px';
  btnRow.style.justifyContent = 'flex-end';

  let returnBtn = null;
  if (onReturn) {
    returnBtn = document.createElement('button');
    returnBtn.type = 'button';
    returnBtn.className = 'btn btn-green';
    returnBtn.textContent = 'Return';
    returnBtn.onclick = () => { onReturn(); modal.remove(); };
    btnRow.appendChild(returnBtn);
  }

  const confirmBtn = document.createElement('button');
  confirmBtn.type = 'button';
  confirmBtn.className = 'btn btn-red';
  confirmBtn.textContent = 'Confirm';
  confirmBtn.onclick = () => { onConfirm?.(); modal.remove(); };
  btnRow.appendChild(confirmBtn);

  const cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.className = 'btn btn-lightyellow';
  cancelBtn.textContent = 'Cancel';
  cancelBtn.onclick = () => { onCancel?.(); modal.remove(); };
  btnRow.appendChild(cancelBtn);

  modal.appendChild(titleEl);
  modal.appendChild(msgEl);
  modal.appendChild(btnRow);
  root.appendChild(modal);

  (returnBtn || confirmBtn).focus();
  const onEsc = e => {
    if (e.key === 'Escape') {
      if (returnBtn) returnBtn.click(); else cancelBtn.click();
      window.removeEventListener('keydown', onEsc);
    }
  };
  window.addEventListener('keydown', onEsc);
}
