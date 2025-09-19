export function createPlaceholderGame(name, points = 10) {
  let el = null;
  return {
    init(container, finish) {
      container.innerHTML = "";
      el = container;
      const title = document.createElement("div");
      title.textContent = `Playing ${name}`;
      title.style.marginBottom = "10px";
      const btn = document.createElement("button");
      btn.textContent = "Finish";
      btn.className = "btn btn-blue";
      btn.onclick = () => finish(points);
      container.appendChild(title);
      container.appendChild(btn);
    },
    cleanup() {
      if (el) el.innerHTML = "";
    }
  };
}
