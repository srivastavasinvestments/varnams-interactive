const CACHE_NAME = 'royal-smash-varnams-v11.7';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './assets/icon.svg?v=11.6',
  './assets/varnams-logo-512.png',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './css/styles.css?v=11.6',
  './js/main.js?v=11.6',
  './js/livebg.js',
  './js/economy.js',
  './js/levels.js',
  './js/structures.js',
  './js/custom_target.js',
  './js/engine.js',
  './js/physics.js',
  './js/cannon_gun.js',
  './js/particles.js',
  './js/audio.js',
  './js/textures.js'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS).catch(() => {}))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
