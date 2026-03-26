const CACHE = "devfluent-v1"
const OFFLINE_URL = "/offline"

// Assets to pre-cache on install
const PRECACHE = [OFFLINE_URL]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE))
  )
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener("fetch", (event) => {
  // Only handle GET requests for same-origin navigation
  if (event.request.method !== "GET") return
  if (!event.request.url.startsWith(self.location.origin)) return

  const isNavigation = event.request.mode === "navigate"

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful navigation responses
        if (isNavigation && response.ok) {
          const clone = response.clone()
          caches.open(CACHE).then((cache) => cache.put(event.request, clone))
        }
        return response
      })
      .catch(() => {
        // Network failed — serve cached version or offline page
        return caches.match(event.request).then(
          (cached) => cached ?? caches.match(OFFLINE_URL)
        )
      })
  )
})
