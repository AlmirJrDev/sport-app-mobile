import type { Coordinates } from "../games/types";

const RAIO_TERRA_KM = 6371;
const PASSOS = 64;

export interface AreaBusca {
    centro: [number, number];
    circulo: {
        type: "Feature";
        properties: Record<string, never>;
        geometry: { type: "Polygon"; coordinates: [number, number][][] };
    };
    limites: [[number, number], [number, number]];
}

/** Círculo da busca em volta do ponto, como polígono que o MapLibre desenha. */
export function areaDeBusca(centro: Coordinates, raioKm: number): AreaBusca {
    const lat = (centro.latitude * Math.PI) / 180;
    const lng = (centro.longitude * Math.PI) / 180;
    const angulo = raioKm / RAIO_TERRA_KM;
    const anel: [number, number][] = [];

    for (let passo = 0; passo <= PASSOS; passo++) {
        const rumo = (passo / PASSOS) * 2 * Math.PI;
        const latPonto = Math.asin(
            Math.sin(lat) * Math.cos(angulo) +
                Math.cos(lat) * Math.sin(angulo) * Math.cos(rumo),
        );
        const lngPonto =
            lng +
            Math.atan2(
                Math.sin(rumo) * Math.sin(angulo) * Math.cos(lat),
                Math.cos(angulo) - Math.sin(lat) * Math.sin(latPonto),
            );

        anel.push([(lngPonto * 180) / Math.PI, (latPonto * 180) / Math.PI]);
    }

    const lngs = anel.map((ponto) => ponto[0]);
    const lats = anel.map((ponto) => ponto[1]);

    return {
        centro: [centro.longitude, centro.latitude],
        circulo: {
            type: "Feature",
            properties: {},
            geometry: { type: "Polygon", coordinates: [anel] },
        },
        limites: [
            [Math.min(...lngs), Math.min(...lats)],
            [Math.max(...lngs), Math.max(...lats)],
        ],
    };
}

export const COR_VOCE = "#2F7BF6";
