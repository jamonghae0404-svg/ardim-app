// v4: 모든 경로 Network-First — 브라우저가 항상 최신 코드를 읽음
const CACHE_NAME = 'ardim-attendance-v4';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      clients.claim(),
      // 이전 버전 캐시(v1~v3) 전부 삭제
      caches.keys().then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        )
      ),
    ])
  );
});

// 모든 fetch: Network-First
// 네트워크 성공 → 응답 반환 (캐시 저장 안 함)
// 네트워크 실패 → 캐시에서 폴백 시도
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
