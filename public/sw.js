// 버전을 올리면 activate 시점에 구버전 캐시가 전부 삭제됩니다.
const CACHE_NAME = 'ardim-attendance-v3';
const STATIC_ASSETS = ['/', '/attendance', '/stats', '/admin'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      clients.claim(),
      // 현재 버전과 다른 캐시는 모두 삭제 → 구버전 JS 완전 제거
      caches.keys().then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        )
      ),
    ])
  );
});

self.addEventListener('fetch', (event) => {
  // 페이지 이동: 네트워크 우선, 실패 시 캐시
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/'))
    );
    return;
  }

  // ★ _next/static/ JS 번들: 네트워크 우선 (캐시 우선 → 구버전 서빙 문제 방지)
  if (event.request.url.includes('/_next/static/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // 그 외: 네트워크 직접 요청
  event.respondWith(fetch(event.request));
});
