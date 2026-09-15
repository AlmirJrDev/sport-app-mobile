import type { Palette } from "../design/tokens";

const MAPLIBRE = "https://cdn.jsdelivr.net/npm/maplibre-gl@5.9.0/dist";

export interface PinoMapa {
    id: string;
    letra: string;
    lat: number;
    lng: number;
}

interface Inicio {
    center: { lat: number; lng: number };
    style: unknown;
    colors: Palette;
}

/** JSON dentro de <script>: sem "<" cru, para nenhum texto fechar a tag. */
function paraScript(valor: unknown): string {
    return JSON.stringify(valor).replace(/</g, "\u003c");
}

/**
 * Página do mapa que roda dentro da WebView. É o mesmo MapLibre da versão
 * web, só que carregado como página: assim o mapa funciona no Expo Go e no
 * app instalado sem componente nativo. O app conversa com ela por mensagens.
 */
export function buildMapHtml(inicio: Inicio): string {
    return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<link rel="stylesheet" href="${MAPLIBRE}/maplibre-gl.css">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap">
<style>
  html, body, #mapa { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: ${inicio.colors.canvas}; }
  .pino { display: flex; align-items: center; justify-content: center; box-sizing: border-box; border-radius: 50%; cursor: pointer; font-family: "Bebas Neue", sans-serif; letter-spacing: 1px; -webkit-tap-highlight-color: transparent; }
  .maplibregl-ctrl-attrib { font-size: 10px; }
</style>
</head>
<body>
<div id="mapa"></div>
<script src="${MAPLIBRE}/maplibre-gl.js"></script>
<script>
(function () {
  var inicio = ${paraScript(inicio)};
  var cores = inicio.colors;
  var pinos = [];
  var selecionado = null;
  var marcadores = [];

  function avisar(mensagem) {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify(mensagem));
    }
  }

  var map = new maplibregl.Map({
    container: "mapa",
    style: inicio.style,
    center: [inicio.center.lng, inicio.center.lat],
    zoom: 12,
    attributionControl: { compact: true }
  });

  function desenhar() {
    marcadores.forEach(function (m) { m.remove(); });
    marcadores = [];

    pinos.forEach(function (p) {
      var el = document.createElement("div");
      var ativo = p.id === selecionado;
      var tamanho = ativo ? 62 : 46;

      el.className = "pino";
      el.textContent = p.letra;
      el.style.width = tamanho + "px";
      el.style.height = tamanho + "px";

      if (ativo) {
        el.style.background = cores.primary;
        el.style.border = "4px solid " + cores.canvas;
        el.style.color = cores.onPrimary;
        el.style.fontSize = "30px";
        el.style.boxShadow = "0 12px 22px -8px rgba(10,8,6,.5)";
      } else {
        el.style.background = cores.canvas;
        el.style.border = "3px solid " + cores.primary;
        el.style.color = cores.primary;
        el.style.fontSize = "22px";
        el.style.boxShadow = "0 10px 24px -12px rgba(10,8,6,.45)";
      }

      el.addEventListener("click", function (evento) {
        evento.stopPropagation();
        avisar({ type: "select", id: p.id });
      });

      marcadores.push(
        new maplibregl.Marker({ element: el }).setLngLat([p.lng, p.lat]).addTo(map)
      );
    });
  }

  window.panela = {
    setGames: function (lista) { pinos = lista || []; desenhar(); },
    setSelected: function (id) { selecionado = id; desenhar(); },
    setTheme: function (estilo, novasCores) {
      cores = novasCores;
      document.body.style.background = cores.canvas;
      map.setStyle(estilo);
      desenhar();
    }
  };

  map.on("click", function () { avisar({ type: "clear" }); });
  map.on("moveend", function () {
    var c = map.getCenter();
    avisar({ type: "move", lat: c.lat, lng: c.lng });
  });

  avisar({ type: "ready" });
})();
</script>
</body>
</html>`;
}
