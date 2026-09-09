const META = [
    { name: "mobile-web-app-capable", content: "yes" },
    { name: "apple-mobile-web-app-capable", content: "yes" },
    { name: "apple-mobile-web-app-status-bar-style", content: "default" },
    { name: "apple-mobile-web-app-title", content: "Projeto H" },
];

const LINKS = [
    { rel: "manifest", href: "/manifest.json" },
    { rel: "apple-touch-icon", href: "/icon-192.png" },
];

export function registerPwa(): void {
    if (typeof document === "undefined") {
        return;
    }

    document.documentElement.lang = "pt-BR";

    const viewport = document.querySelector<HTMLMetaElement>(
        'meta[name="viewport"]',
    );

    if (viewport && !viewport.content.includes("viewport-fit")) {
        viewport.content = `${viewport.content}, viewport-fit=cover`;
    }

    for (const meta of META) {
        if (!document.querySelector(`meta[name="${meta.name}"]`)) {
            const element = document.createElement("meta");
            element.name = meta.name;
            element.content = meta.content;
            document.head.appendChild(element);
        }
    }

    for (const link of LINKS) {
        if (!document.querySelector(`link[rel="${link.rel}"]`)) {
            const element = document.createElement("link");
            element.rel = link.rel;
            element.href = link.href;
            document.head.appendChild(element);
        }
    }

    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
}
