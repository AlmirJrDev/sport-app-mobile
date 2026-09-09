export const OSM_ATTRIBUTION = "© OpenStreetMap contributors";

/**
 * Base vetorial minimalista do CARTO: positron no claro, dark matter no escuro.
 * São estilos abertos, sem chave, e por serem vetoriais acompanham o tema.
 */
export const CARTO_LIGHT =
    "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

export const CARTO_DARK =
    "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

export function baseMapStyle(isDark: boolean): string {
    return isDark ? CARTO_DARK : CARTO_LIGHT;
}

/** Reserva em raster, caso o estilo vetorial não carregue. */
export const OSM_STYLE = {
    version: 8 as const,
    sources: {
        osm: {
            type: "raster" as const,
            tiles: [
                "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
                "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
                "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
            ],
            tileSize: 256,
            maxzoom: 19,
            attribution: OSM_ATTRIBUTION,
        },
    },
    layers: [{ id: "osm", type: "raster" as const, source: "osm" }],
};
