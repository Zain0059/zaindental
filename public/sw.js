// Service Worker for Zain Dental Clinic (Clean Slate)
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    self.registration.getNotifications().then((notifications) => {
      notifications.forEach((n) => n.close());
    }).catch(() => {}).then(() => self.clients.claim())
  );
});
