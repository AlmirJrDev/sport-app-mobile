const META = [
    { name: "mobile-web-app-capable", content: "yes" },
    { name: "apple-mobile-web-app-capable", content: "yes" },
    { name: "apple-mobile-web-app-status-bar-style", content: "default" },
    { name: "apple-mobile-web-app-title", content: "Panela" },
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

    redeDeSeguranca();
}

const ESPERA_TELA = 12000;

let ultimoErro = "";

function anotarErros(): void {
    window.addEventListener("error", (evento) => {
        ultimoErro = evento.message || String(evento.error ?? "");
    });

    window.addEventListener("unhandledrejection", (evento) => {
        const motivo = evento.reason;

        ultimoErro =
            motivo instanceof Error ? motivo.message : String(motivo ?? "");
    });
}

/**
 * Se nada foi desenhado, a pessoa fica olhando uma tela vazia sem saber o que
 * fazer. Aqui ela ganha um botão que limpa o cache do app e recarrega.
 */
function redeDeSeguranca(): void {
    anotarErros();

    setTimeout(() => {
        const raiz = document.getElementById("root");

        if (raiz && raiz.childElementCount > 0) {
            return;
        }

        const aviso = document.createElement("div");

        aviso.setAttribute(
            "style",
            "position:fixed;inset:0;display:flex;align-items:center;justify-content:center;padding:24px;text-align:center;background:#14100E;color:#F4F0EA;font-family:-apple-system,system-ui,sans-serif;z-index:9999",
        );

        const texto = document.createElement("p");
        texto.textContent = "O Panela não abriu. Limpe e tente de novo.";

        const botao = document.createElement("button");
        botao.textContent = "Limpar e recarregar";
        botao.setAttribute(
            "style",
            "margin-top:16px;padding:12px 20px;border:0;border-radius:12px;background:#DA680D;color:#fff;font-size:16px",
        );
        botao.onclick = () => limparTudo();

        const bloco = document.createElement("div");
        bloco.appendChild(texto);
        bloco.appendChild(botao);

        if (ultimoErro) {
            const detalhe = document.createElement("p");

            detalhe.textContent = ultimoErro.slice(0, 200);
            detalhe.setAttribute(
                "style",
                "margin-top:20px;font-size:12px;opacity:.55;word-break:break-word",
            );

            bloco.appendChild(detalhe);
        }
        aviso.appendChild(bloco);
        document.body.appendChild(aviso);
    }, ESPERA_TELA);
}

async function limparTudo(): Promise<void> {
    try {
        const registros =
            (await navigator.serviceWorker?.getRegistrations?.()) ?? [];

        await Promise.all(registros.map((registro) => registro.unregister()));

        const chaves = await caches.keys();

        await Promise.all(chaves.map((chave) => caches.delete(chave)));
    } catch {
        // sem service worker ou sem cache: recarregar já resolve
    }

    location.replace("/");
}
