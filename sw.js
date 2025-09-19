const CACHE_NAME = 'fhe-cache-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/Cellphone/Cellphone.html',
  '/style.css',
  '/script.js',
  '/src/OtherMinigames/PetExploration.html',
  '/src/OtherMinigames/ChiefSurvival.html',
  '/src/OtherMinigames/SilenceTemple.html',
  '/src/OtherMinigames/Projects.html',
  '/src/OtherMinigames/FightIntruders.html',
  '/src/arrow.mp3',
  '/src/sword.mp3',
  '/src/fireball.mp3',
  '/lib/howler.min.js',
  '/lib/stats.min.js'
];
self.addEventListener('install', event => {
  if (location.protocol.startsWith('http')) {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then(cache => cache.addAll(ASSETS))
        .catch(err => console.warn('Cache addAll failed', err))
    );
  }
});
self.addEventListener('fetch', event => {
  if (self.location.protocol.startsWith('http')) {
    event.respondWith(
      caches.match(event.request).then(resp => resp || fetch(event.request))
    );
  }
});
