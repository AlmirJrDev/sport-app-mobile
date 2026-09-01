import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

const registerServiceWorker = `
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("/sw.js").catch(function () {});
  });
}
`;

export default function Root({ children }: PropsWithChildren) {
    return (
        <html lang="pt-BR">
            <head>
                <meta charSet="utf-8" />
                <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
                />

                <title>Projeto H</title>
                <meta
                    name="description"
                    content="Ache jogos acontecendo perto de você, marque presença e acompanhe o placar."
                />

                <link rel="manifest" href="/manifest.json" />
                <meta name="theme-color" content="#333333" />

                <link rel="icon" href="/icon-192.png" />
                <link rel="apple-touch-icon" href="/icon-192.png" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta
                    name="apple-mobile-web-app-status-bar-style"
                    content="default"
                />
                <meta name="apple-mobile-web-app-title" content="Projeto H" />

                <ScrollViewStyleReset />

                <script
                    dangerouslySetInnerHTML={{ __html: registerServiceWorker }}
                />
            </head>

            <body>{children}</body>
        </html>
    );
}
