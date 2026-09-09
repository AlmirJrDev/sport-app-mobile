import type { Palette } from "./tokens";

const ID = "projetoh-base-style";

/**
 * A barra de status do celular segue a cor da página: no iOS ela copia o fundo
 * do documento, no Android o Chrome usa a meta theme-color.
 */
export function applyBrowserChrome(colors: Palette, isDark: boolean): void {
    if (typeof document === "undefined") {
        return;
    }

    let meta = document.querySelector<HTMLMetaElement>(
        'meta[name="theme-color"]',
    );

    if (!meta) {
        meta = document.createElement("meta");
        meta.name = "theme-color";
        document.head.appendChild(meta);
    }

    meta.content = colors.canvas;

    let estilo = document.getElementById(ID);

    if (!estilo) {
        estilo = document.createElement("style");
        estilo.id = ID;
        document.head.appendChild(estilo);
    }

    estilo.textContent =
        `html,body,#root{background-color:${colors.canvas};}` +
        `body{font-family:Inter_400Regular,Inter,system-ui,sans-serif;color:${colors.ink};}`;

    document.documentElement.style.colorScheme = isDark ? "dark" : "light";
}
