export const OSM_ATTRIBUTION = "© OpenStreetMap contributors";

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
