// Service Worker for Android Dropdown System Notifications
// Zain Dental Clinic

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Receive notification trigger from app
self.addEventListener('message', (event) => {
  if (event.data && (event.data.type === 'SHOW_NOTIFICATION' || event.data.type === 'DISPATCH_NOTIF')) {
    const title = event.data.title || 'عيادة زين للأسنان';
    const options = event.data.options || {};
    event.waitUntil(
      self.registration.showNotification(title, {
        body: options.body || '',
        icon: options.icon || '/assets/icon.png',
        badge: options.badge || '/assets/icon.png',
        vibrate: [300, 150, 300, 150, 400],
        tag: options.tag || ('zd-notif-' + Date.now()),
        renotify: true,
        requireInteraction: true,
        data: options.data || {}
      })
    );
  }
});

// Handle clicking notification in Android Notification Drop-down
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetDate = event.notification.data?.targetDate || '';
  const notifType = event.notification.data?.notifType || '';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          client.postMessage({
            type: 'NOTIFICATION_CLICKED',
            targetDate,
            notifType
          });
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});
