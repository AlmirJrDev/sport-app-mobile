/* Service worker do Firebase Messaging.
   A configuração chega pela query string do registro, para o projeto ficar
   declarado num lugar só: src/push/config.ts */

importScripts(
    "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js",
);
importScripts(
    "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js",
);

const params = new URL(self.location).searchParams;

const config = {
    apiKey: params.get("apiKey"),
    authDomain: params.get("authDomain"),
    projectId: params.get("projectId"),
    messagingSenderId: params.get("messagingSenderId"),
    appId: params.get("appId"),
};

if (config.apiKey && config.messagingSenderId && config.appId) {
    firebase.initializeApp(config);

    const messaging = firebase.messaging();

    messaging.onBackgroundMessage((payload) => {
        const titulo = payload.notification?.title ?? "Panela";

        self.registration.showNotification(titulo, {
            body: payload.notification?.body ?? "",
            icon: "/icon-192.png",
            badge: "/icon-192.png",
            data: payload.data ?? {},
        });
    });
}

self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    const gameId = event.notification.data?.game_id;
    const destino = gameId ? `/jogo/${gameId}` : "/";

    event.waitUntil(
        clients
            .matchAll({ type: "window", includeUncontrolled: true })
            .then((janelas) => {
                for (const janela of janelas) {
                    if ("focus" in janela) {
                        janela.navigate(destino);

                        return janela.focus();
                    }
                }

                return clients.openWindow(destino);
            }),
    );
});
