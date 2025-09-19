import { useEffect } from 'react';
import '../style.css';

export default function App() {
  useEffect(() => {
    (async () => {
      if (location.protocol === 'file:' && !window.isElectron) {
        document.body.innerHTML = '<p style="font-family:sans-serif;padding:20px">This application must be served over HTTP. Run <code>npm run dev</code> and open <a href="http://localhost:5173">http://localhost:5173</a>.</p>';
      } else {
        try {
          const { default: api } = await import('../../../script.js');
          api.init();
          document.querySelectorAll('.sidebar button').forEach(btn => {
            btn.addEventListener('click', () => {
              api.showView(btn.dataset.view);
            });
          });
        } catch (err) {
          document.body.innerHTML = '<p style="font-family:sans-serif;padding:20px">Failed to load modules.</p>';
          console.error(err);
        }
      }
    })();
  }, []);

  return (
    <div className="app">
      <div className="sidebar">
        <button data-view="home">Home</button>
        <button data-view="village">Village</button>
        <button data-view="missions">Missions</button>
        <button data-view="villains">Villains</button>
        <button data-view="pets">Pets</button>
        <button data-view="heroes">Heroes</button>
      </div>
      <div className="content">
        <div className="header">
          <button className="btn btn-blue header-button white-bold" id="export-btn">Export</button>
          <button className="btn btn-blue header-button white-bold" id="import-btn">Import</button>
          <button className="btn btn-blue header-button white-bold" id="reset-btn">Reset</button>
          <div id="resources-grid" className="resources-grid">
            <div className="res res-gold">💰 <strong>Gold:</strong> <span id="gold-val">0</span></div>
            <div className="res res-food">🍖 <strong>Food:</strong> <span id="food-val">0/0</span></div>
            <div className="res res-wood">🪵 <strong>Wood:</strong> <span id="wood-val">0/0</span></div>
            <div className="res res-stone">🪨 <strong>Stone:</strong> <span id="stone-val">0/0</span></div>
          </div>
        </div>

        <section id="village-chief-section">
          <h1>Village Chief</h1>
          <div id="village-chief" className="village-chief card"></div>
        </section>

        <section id="terrain-section">
          <h1>My Terrains (1/30)</h1>
          <div id="terrain-card" className="chief-card"></div>
          <div id="terrain-card-2" className="chief-card"></div>
        </section>

        <section id="village-section">
          <h1>My Village</h1>
          <div id="village-overview-card" className="chief-card"></div>
          <div id="build-house-card" className="chief-card"></div>
          <div id="build-select-card" className="chief-card" style={{display:'none'}}></div>
        </section>

        <section id="missions-section">
          <div id="daily-missions-section" style={{display:'none'}}>
            <h2 id="daily-heading"></h2>
            <div id="daily-missions" className="missions"></div>
          </div>
          <h1>Missions</h1>
          <div id="missions" className="missions"></div>
        </section>

        <section id="pet-management-section" style={{display:'none'}}>
          <h1>Pets Management</h1>
          <div id="pet-management-card" className="chief-card"></div>
        </section>

        <section id="villain-section">
          <h1>My Villains (0/20)</h1>
          <div className="hero-controls" id="villain-controls">
            <label><input type="checkbox" id="villain-favorite-check" /> Favorites</label>
            <input type="text" id="villain-search" list="villain-search-list" placeholder="Search villain" />
            <datalist id="villain-search-list"></datalist>
            <button id="villain-sort-name-btn" className="btn btn-green">Order by Name</button>
            <button id="villain-sort-floor-btn" className="btn btn-green">Order by Floor</button>
            <select id="villain-origin-filter"></select>
            <button id="villain-remove-filter-btn" className="btn btn-green" style={{display:'none'}}>&rarr; RemoveFilter</button>
          </div>
          <div id="villains"></div>
          <div id="villain-pagination" className="pagination"></div>
        </section>

        <section id="pets-section" style={{display:'none'}}>
          <h1>My Pets (0/5)</h1>
          <div className="hero-controls" id="pet-controls">
            <label><input type="checkbox" id="pet-favorite-check" /> Favorites</label>
            <button id="pet-sort-name-btn" className="btn btn-green">Order by Name</button>
            <button id="pet-sort-level-btn" className="btn btn-green">Order by Level</button>
            <input type="text" id="pet-search" list="pet-search-list" placeholder="Search pet" />
            <datalist id="pet-search-list"></datalist>
            <select id="pet-origin-filter"></select>
            <button id="pet-remove-filter-btn" className="btn btn-green" style={{display:'none'}}>&rarr; RemoveFilter</button>
          </div>
          <div id="pets"></div>
          <div id="pet-pagination" className="pagination"></div>
        </section>

        <section id="heroes-section">
          <h1>My Heroes</h1>
          <div className="hero-controls">
            <label><input type="checkbox" id="favorite-check" /> Favorites</label>
            <label><input type="checkbox" id="ready-check" /> Ready</label>
            <button id="sort-name-btn" className="btn btn-green">Order by Name</button>
            <button id="sort-level-btn" className="btn btn-green">Order by Level</button>
            <input type="text" id="hero-search" list="hero-search-list" placeholder="Search hero" />
            <datalist id="hero-search-list"></datalist>
            <select id="sex-filter"></select>
            <select id="origin-filter"></select>
            <select id="profession-filter"></select>
            <button id="remove-filter-btn" className="btn btn-green" style={{display:'none'}}>&rarr; RemoveFilter</button>
          </div>
          <div id="heroes"></div>
          <div id="hero-pagination" className="pagination"></div>
        </section>
      </div>
    </div>
  );
}
