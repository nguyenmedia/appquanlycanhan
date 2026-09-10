// LifeOS Progressive Web App - Service Worker
const CACHE_NAME = "lifeos-cache-v1";
const STATIC_ASSETS = [
  "/",
  "/dashboard",
  "/tasks",
  "/finance",
  "/habits",
  "/goals",
  "/ai",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/manifest.json",
];

// Install Event - Precache static shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn("[PWA SW] Precache warning:", err);
      });
    })
  );
  self.skipWaiting();
});

// Activate Event - Clean up stale caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - Network First with Cache Fallback for dynamic routes
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests and API requests from strict caching
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // For API endpoints, prefer fresh network
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  // Cache-First for static assets (images, fonts, scripts)
  if (
    url.pathname.startsWith("/icons/") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".ico") ||
    url.pathname.includes("/_next/static/")
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // Network-First for HTML pages with fallback to cache
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          return caches.match("/dashboard");
        });
      })
  );
});

// Web Push Notification Event Listener (Ready for native notifications)
self.addEventListener("push", (event) => {
  if (!event.data) return;
  try {
    const data = event.data.json();
    const options = {
      body: data.body || "Bạn có thông báo mới từ LifeOS",
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-192x192.png",
      vibrate: [100, 50, 100],
      data: { url: data.url || "/dashboard" },
    };
    event.waitUntil(self.registration.showNotification(data.title || "LifeOS", options));
  } catch (e) {
    console.error("[PWA SW] Push notification error:", e);
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || "/dashboard";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(urlToOpen) && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
