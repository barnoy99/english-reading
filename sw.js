/* Service worker — lets the app open with no connection at all.
   Bump CACHE_VERSION on every deploy that changes a file. */
var CACHE_VERSION = 'v1';
var CACHE_NAME = 'abigail-english-' + CACHE_VERSION;

var SHELL = [
  './',
  'index.html',
  'style.css',
  'data.js',
  'audio.js',
  'engine.js',
  'app.js',
  'manifest.json',
  'icon-192.png',
  'icon-512.png'
];

var RUNTIME_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (c) { return c.addAll(SHELL); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== CACHE_NAME) return caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);

  /* Navigations: network first, so a deploy is picked up straight away and
     the cached copy is only used when there is genuinely no connection. */
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE_NAME).then(function (c) { c.put('index.html', copy); });
        return res;
      }).catch(function () {
        return caches.match('index.html');
      })
    );
    return;
  }

  /* Same-origin code and assets: serve the cached copy instantly, then refresh
     it in the background. She gets a fast start now and the new version next
     time she opens the app. */
  if (url.origin === self.location.origin) {
    e.respondWith(
      caches.match(req).then(function (hit) {
        var refresh = fetch(req).then(function (res) {
          var copy = res.clone();
          caches.open(CACHE_NAME).then(function (c) { c.put(req, copy); });
          return res;
        }).catch(function () { return hit; });
        return hit || refresh;
      })
    );
    return;
  }

  /* Google Fonts: same treatment, so the app looks right offline too. */
  if (RUNTIME_HOSTS.indexOf(url.hostname) !== -1) {
    e.respondWith(
      caches.match(req).then(function (hit) {
        var refresh = fetch(req).then(function (res) {
          var copy = res.clone();
          caches.open(CACHE_NAME).then(function (c) { c.put(req, copy); });
          return res;
        }).catch(function () { return hit; });
        return hit || refresh;
      })
    );
  }
});
