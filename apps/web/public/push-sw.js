// Web Push handlers, pulled into the Workbox-generated service worker via
// vite-plugin-pwa's `workbox.importScripts`. The generated SW only handles
// caching — these listeners add notification display and click routing.

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "Tokō", body: event.data.text() };
  }

  const title = payload.title || "Tokō";
  event.waitUntil(
    self.registration.showNotification(title, {
      body: payload.body || "",
      icon: "/icon.svg",
      badge: "/icon.svg",
      // Same tag collapses rapid events on one child into the latest entry.
      tag: payload.tag,
      data: { url: payload.url || "/" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Reuse an open tab when there is one, otherwise open a new window.
        const existing = clientList.find((client) => "focus" in client);
        if (existing) {
          existing.focus();
          if ("navigate" in existing) {
            existing.navigate(url).catch(() => {});
          }
          return undefined;
        }
        return self.clients.openWindow(url);
      }),
  );
});
