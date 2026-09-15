const CACHE = "panela-v3";
const CASCA = "/";
const ESPERA_REDE = 6000;

/** Guardamos a casca do app na instalação: sem ela o app abre preto. */
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll([CASCA, "/manifest.json"]))
      .catch(() => {})
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

function guardar(request, response) {
  if (!response || !response.ok || response.type === "opaque") {
    return response;
  }

  const copia = response.clone();
  caches.open(CACHE).then((cache) => cache.put(request, copia));

  return response;
}

function comPrazo(promessa, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("demorou")), ms);

    promessa.then(
      (valor) => {
        clearTimeout(timer);
        resolve(valor);
      },
      (erro) => {
        clearTimeout(timer);
        reject(erro);
      }
    );
  });
}

const PAGINA_OFFLINE = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Panela</title>
<style>body{margin:0;display:flex;min-height:100vh;align-items:center;justify-content:center;
background:#14100E;color:#F4F0EA;font-family:-apple-system,system-ui,sans-serif;text-align:center}
div{padding:24px;max-width:320px}button{margin-top:16px;padding:12px 20px;border:0;border-radius:12px;
background:#DA680D;color:#fff;font-size:16px}</style></head>
<body><div><p>Não deu para abrir o Panela agora. Confira a internet.</p>
<button onclick="location.reload()">Tentar de novo</button></div></body></html>`;

function respostaOffline() {
  return new Response(PAGINA_OFFLINE, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

/** Página: rede primeiro, depois a casca guardada, e por último o aviso offline. */
async function abrirPagina(request) {
  try {
    return guardar(request, await comPrazo(fetch(request), ESPERA_REDE));
  } catch {
    return (
      (await caches.match(request)) ??
      (await caches.match(CASCA)) ??
      respostaOffline()
    );
  }
}

/** Arquivo do app: cache primeiro, porque o nome já muda a cada versão. */
async function abrirArquivo(request) {
  const guardado = await caches.match(request);

  if (guardado) {
    return guardado;
  }

  try {
    return guardar(request, await fetch(request));
  } catch {
    return new Response("", { status: 504, statusText: "sem rede" });
  }
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  /** A API nunca entra no cache: dado velho de jogo confunde mais que ajuda. */
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(abrirPagina(request));
    return;
  }

  event.respondWith(abrirArquivo(request));
});
