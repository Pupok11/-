const CACHE_NAME = 'technoprestige-v2';
const ASSETS = [
    '/',
    '/index.html',
    '/catalog.html',
    '/about.html',
    '/contacts.html',
    '/404.html',
    '/css/main.css',
    '/css/components.css',
    '/css/animations.css',
    '/css/responsive.css',
    '/css/extras.css',
    '/css/features.css',
    '/css/fixes.css',
    '/js/data.js',
    '/js/main.js',
    '/js/cursor.js',
    '/js/preloader.js',
    '/js/three-home.js',
    '/js/three-object.js',
    '/js/form.js',
    '/js/extras.js',
    '/js/features.js',
    '/js/libs/gsap.min.js',
    '/js/libs/lenis.min.js',
    '/js/libs/ScrollTrigger.min.js',
    '/manifest.json'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS).catch(() => {}))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
        ))
    );
    self.clients.claim();
});

self.addEventListener('fetch', (e) => {
    if (e.request.method !== 'GET') return;
    const url = new URL(e.request.url);

    if (url.origin !== self.location.origin) {
        e.respondWith(
            fetch(e.request).catch(() => caches.match(e.request))
        );
        return;
    }

    if (e.request.mode === 'navigate') {
        e.respondWith(
            fetch(e.request).then(res => {
                const clone = res.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
                return res;
            }).catch(() => caches.match(e.request).then(c => c || caches.match('/index.html')))
        );
        return;
    }

    e.respondWith(
        caches.match(e.request).then(cached => {
            if (cached) return cached;
            return fetch(e.request).then(res => {
                if (res.ok) {
                    const clone = res.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
                }
                return res;
            }).catch(() => caches.match('/index.html'));
        })
    );
});