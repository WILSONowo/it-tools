// Self-destroying service worker.
// The site used to ship a caching PWA service worker at /sw.js. Browsers that still have it
// installed check this URL for updates; this version clears every cache, unregisters itself and
// reloads open tabs so visitors always get the latest deployment.
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      await self.registration.unregister();
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach((client) => client.navigate(client.url));
    })(),
  );
});
