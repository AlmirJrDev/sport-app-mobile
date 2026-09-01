const META = [
    { name: "theme-color", content: "#333333" },
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

    if (!document.getElementById("projetoh-base-style")) {
        const style = document.createElement("style");
        style.id = "projetoh-base-style";
        style.textContent =
            "html,body,#root{background-color:#fffefb;}" +
            "body{font-family:Inter_400Regular,Inter,system-ui,sans-serif;color:#201515;}";
        document.head.appendChild(style);
    }

    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
}
