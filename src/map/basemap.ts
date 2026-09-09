export const OSM_ATTRIBUTION = "© OpenStreetMap contributors";

/**
 * Estilos vetoriais do CARTO, usados no app nativo, onde o MapLibre roda sem
 * aperto de memória.
 */
export const CARTO_LIGHT =
    "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

export const CARTO_DARK =
    "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

const OSM_SOURCE = {
    type: "raster" as const,
    tiles: [
        "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
    ],
    tileSize: 256,
    maxzoom: 19,
    attribution: OSM_ATTRIBUTION,
};

/**
 * No navegador ficamos no ladrilho do OpenStreetMap, que é o único que carrega
 * em qualquer celular. O visual limpo vem do próprio MapLibre, tirando a cor e
 * ajustando o brilho na hora de desenhar.
 */
export function baseMapStyle(isDark: boolean) {
    return {
        version: 8 as const,
        sources: { osm: OSM_SOURCE },
        layers: [
            {
                id: "fundo",
                type: "background" as const,
                paint: { "background-color": isDark ? "#14100E" : "#F4F0EA" },
            },
            {
                id: "osm",
                type: "raster" as const,
                source: "osm",
                paint: isDark
                    ? {
                          "raster-saturation": -1,
                          "raster-brightness-min": 0.72,
                          "raster-brightness-max": 0.04,
                          "raster-contrast": 0.2,
                      }
                    : {
                          "raster-saturation": -1,
                          "raster-brightness-min": 0.3,
                          "raster-brightness-max": 1,
                          "raster-contrast": -0.25,
                      },
            },
        ],
    };
}

/** Reserva sem tratamento, caso o estilo com ajuste seja recusado. */
export const OSM_STYLE = {
    version: 8 as const,
    sources: { osm: OSM_SOURCE },
    layers: [{ id: "osm", type: "raster" as const, source: "osm" }],
};
