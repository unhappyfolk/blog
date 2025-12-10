// Service Worker for The Unhappy Folk's Literature Blog
// Provides offline support with tiered caching strategies

const CACHE_VERSION = 'v1';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const PAGES_CACHE = `pages-${CACHE_VERSION}`;
const IMAGES_CACHE = `images-${CACHE_VERSION}`;

// Assets to pre-cache on install (app shell)
const PRECACHE_ASSETS = [
  '/',
  '/en/',
  '/ar/',
  '/offline.html',
  '/assets/style.css',
  '/assets/main.js',
  '/assets/prism.js',
  '/manifest.json'
];

// Install event - pre-cache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Pre-caching app shell');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              // Delete old versioned caches
              return cacheName.startsWith('static-') && cacheName !== STATIC_CACHE ||
                     cacheName.startsWith('pages-') && cacheName !== PAGES_CACHE ||
                     cacheName.startsWith('images-') && cacheName !== IMAGES_CACHE;
            })
            .map((cacheName) => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - apply caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Determine caching strategy based on request type
  if (isStaticAsset(url.pathname)) {
    // Cache-first for static assets (CSS, JS, fonts)
    event.respondWith(cacheFirst(request, STATIC_CACHE));
  } else if (isImage(url.pathname)) {
    // Cache-first for images
    event.respondWith(cacheFirst(request, IMAGES_CACHE));
  } else if (isHTMLPage(request)) {
    // Network-first for HTML pages, with offline fallback
    event.respondWith(networkFirstWithOfflineFallback(request));
  }
});

// Check if request is for a static asset
function isStaticAsset(pathname) {
  return pathname.match(/\.(css|js|woff|woff2|ttf|eot)$/) ||
         pathname.startsWith('/assets/');
}

// Check if request is for an image
function isImage(pathname) {
  return pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)$/) ||
         pathname.startsWith('/img/');
}

// Check if request is for an HTML page
function isHTMLPage(request) {
  return request.mode === 'navigate' ||
         request.headers.get('accept')?.includes('text/html');
}

// Cache-first strategy
async function cacheFirst(request, cacheName) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Cache-first fetch failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

// Network-first with offline fallback for HTML pages
async function networkFirstWithOfflineFallback(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Cache successful HTML responses
      const cache = await caches.open(PAGES_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);

    // Try to get from cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page as last resort
    const offlinePage = await caches.match('/offline.html');
    if (offlinePage) {
      return offlinePage;
    }

    return new Response('Offline - Page not available', {
      status: 503,
      headers: { 'Content-Type': 'text/html' }
    });
  }
}
