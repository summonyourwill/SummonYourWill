// Versión modificada de enemySetup con botón de refresh
// Reemplazar la función original en script.js

function enemySetup(card, container = card, showVillains = true) {
  pauseTimersFor(3000);

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay card-modal";

  const modal = document.createElement("div");
  modal.className = "modal";

  if (container) container.style.position = 'relative';
  const title = container.querySelector('h1');
  if (title) {
    overlay.style.alignItems = 'start';
    overlay.style.justifyItems = 'center';
    overlay.style.paddingTop = `${title.offsetTop}px`;
  }

  if (showVillains) setVillainSectionVisible(true);

  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.placeholder = "Enemy Name";

  const originInput = document.createElement("input");
  originInput.type = "text";
  originInput.placeholder = "Origin";
  const originList = document.createElement('datalist');
  const originListId = `villain-origin-${Date.now()}`;
  originList.id = originListId;
  getVillainOrigins().forEach(o => {
    const opt = document.createElement('option');
    opt.value = o;
    originList.appendChild(opt);
  });
  originInput.setAttribute('list', originListId);

  const heroSelect = document.createElement("select");
  heroSelect.id = "villain-origin-selector";

  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.style.display = "none";
  const fileLabel = document.createElement("button");
  fileLabel.textContent = "Enemy Avatar";
  fileLabel.className = "btn btn-green white-text";
  const fileNameSpan = document.createElement("span");
  fileNameSpan.textContent = "None Selected";
  const avatarPreview = document.createElement("img");
  avatarPreview.className = "avatar modal-avatar";
  avatarPreview.style.display = "none";
  avatarPreview.onclick = () => fileInput.click();
  let avatarData = "";

  fileLabel.onclick = () => fileInput.click();
  fileInput.onchange = () => {
    const file = fileInput.files && fileInput.files[0];
    if (file) {
      resizeImageToBase64(file, 160, 200, resized => {
        avatarData = resized;
        avatarPreview.src = resized;
        avatarPreview.style.display = "block";
        fileNameSpan.style.display = "none";
      });
    } else {
      avatarData = "";
      avatarPreview.style.display = "none";
      fileNameSpan.textContent = "None Selected";
      fileNameSpan.style.display = "inline";
    }
  };

  const buttons = document.createElement("div");
  buttons.style.display = "flex";
  buttons.style.gap = "6px";

  const ok = document.createElement("button");
  ok.textContent = "Start";
  ok.className = "btn btn-blue white-text";
  ok.style.flex = "1";
  ok.onclick = () => {
    const heroId = parseInt(heroSelect.value);
    if (!heroId) return;
    const hero = state.heroMap.get(heroId);
    let name = nameInput.value.trim();
    if (!name) name = getNextVillainName();
    name = ensureUniqueVillainName(name);
    const origin = originInput.value.trim() || "No origin";
    const avatar = avatarData;
    removeOverlay(overlay);
    startEnemyGame(card, hero, createVillain(name, origin, avatar));
  };

  const cancel = document.createElement("button");
  cancel.textContent = "Cancel";
  cancel.className = "btn btn-green white-text";
  cancel.style.flex = "1";
  cancel.onclick = () => {
    removeOverlay(overlay);
    card.innerHTML = "";
    state.buildSelectionOpen = false;
    showView(currentView);
    if (showVillains) setVillainSectionVisible(true);
    renderGames();
  };

  // BOTÓN DE REFRESH AGREGADO
  const refreshBtn = document.createElement("button");
  refreshBtn.textContent = "Refresh Heroes";
  refreshBtn.className = "btn btn-yellow white-text";
  refreshBtn.style.flex = "1";
  refreshBtn.onclick = () => {
    console.log('enemySetup: Refrescando selector de héroes...');
    populateHeroSelector();
  };

  buttons.appendChild(refreshBtn);
  buttons.appendChild(ok);
  buttons.appendChild(cancel);

  modal.appendChild(nameInput);
  modal.appendChild(originInput);
  modal.appendChild(originList);
  const avatarRow = document.createElement("div");
  avatarRow.style.display = "flex";
  avatarRow.style.gap = "6px";
  avatarRow.style.alignItems = "center";
  avatarRow.appendChild(fileLabel);
  avatarRow.appendChild(fileNameSpan);
  avatarRow.appendChild(avatarPreview);
  modal.appendChild(avatarRow);
  modal.appendChild(heroSelect);
  modal.appendChild(fileInput);
  modal.appendChild(buttons);
  overlay.appendChild(modal);
  appendOverlay(overlay, container);

  // Poblar el selector de héroes directamente (como hace GiantBoss)
  const populateHeroSelector = () => {
    heroSelect.innerHTML = "";
    
    // Opción por defecto
    const defaultOpt = document.createElement("option");
    defaultOpt.textContent = "Choose Hero";
    defaultOpt.value = "";
    heroSelect.appendChild(defaultOpt);
    
    // Poblar con héroes disponibles
    if (state.heroes && Array.isArray(state.heroes)) {
      const availableHeroes = state.heroes.filter(h => !isBusy(h) && h.energia >= 50);
      
      availableHeroes.forEach(h => {
        const opt = document.createElement("option");
        opt.value = h.id;
        opt.textContent = h.name;
        heroSelect.appendChild(opt);
      });
      
      console.log('enemySetup: Selector poblado con', availableHeroes.length, 'héroes disponibles');
      
      // Habilitar/deshabilitar botón según disponibilidad
      if (availableHeroes.length > 0) {
        ok.disabled = false;
        heroSelect.selectedIndex = 1; // Seleccionar primer héroe
      } else {
        ok.disabled = true;
        console.log('enemySetup: No hay héroes disponibles');
      }
    } else {
      ok.disabled = true;
      console.log('enemySetup: state.heroes no disponible');
    }
  };
  
  // Poblar el selector inmediatamente
  populateHeroSelector();

  updateSummonInputs();
  focusNoScroll(nameInput);
}
