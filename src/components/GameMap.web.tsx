import { useEffect, useRef, useState } from "react";
import {
    Map as MapLibreMap,
    Marker,
    setWorkerUrl,
    type GeoJSONSource,
} from "maplibre-gl";

import "maplibre-gl/dist/maplibre-gl.css";

import type { Coordinates, Game } from "../games/types";
import { OSM_STYLE, baseMapStyle } from "../map/basemap";
import { COR_VOCE, areaDeBusca, type AreaBusca } from "../map/raio";
import { useTheme } from "../design/theme";

setWorkerUrl("/maplibre-gl-worker.mjs");

type BaseAtual = "claro" | "escuro" | "raster";

const ESPERA_BASE = 10000;

interface GameMapProps {
    center: Coordinates;
    games: Game[];
    selectedGameId: string | null;
    onSelectGame: (game: Game) => void;
    onClearSelection: () => void;
    onCenterChange?: (center: Coordinates) => void;
    /** Com raio, o mapa desenha a área da busca em volta de `center`. */
    raioKm?: number;
    voce?: Coordinates | null;
}

function desenharArea(map: MapLibreMap, area: AreaBusca, cor: string) {
    const fonte = map.getSource("area") as GeoJSONSource | undefined;

    if (fonte) {
        fonte.setData(area.circulo);
        return;
    }

    map.addSource("area", { type: "geojson", data: area.circulo });
    map.addLayer({
        id: "area-fundo",
        type: "fill",
        source: "area",
        paint: { "fill-color": cor, "fill-opacity": 0.07 },
    });
    map.addLayer({
        id: "area-borda",
        type: "line",
        source: "area",
        paint: {
            "line-color": cor,
            "line-opacity": 0.55,
            "line-width": 2,
            "line-dasharray": [2, 2],
        },
    });
}

/** Coordenada quebrada derruba o MapLibre e leva a tela junto. */
function ehPonto(ponto?: Coordinates | null): ponto is Coordinates {
    return (
        !!ponto &&
        Number.isFinite(ponto.latitude) &&
        Number.isFinite(ponto.longitude)
    );
}

function temCoordenada(game: Game): boolean {
    return ehPonto(game.coordinates);
}

function pontoVoce(canvas: string): HTMLDivElement {
    const element = document.createElement("div");

    element.style.width = "20px";
    element.style.height = "20px";
    element.style.borderRadius = "50%";
    element.style.boxSizing = "border-box";
    element.style.backgroundColor = COR_VOCE;
    element.style.border = `3px solid ${canvas}`;
    element.style.boxShadow = `0 0 0 6px ${COR_VOCE}33, 0 6px 14px -4px rgba(10,8,6,.5)`;
    element.style.pointerEvents = "none";

    return element;
}

export default function GameMap({
    center,
    games,
    selectedGameId,
    onSelectGame,
    onClearSelection,
    onCenterChange,
    raioKm,
    voce,
}: GameMapProps) {
    const { colors, isDark } = useTheme();
    const containerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<MapLibreMap | null>(null);
    const markersRef = useRef<Marker[]>([]);
    const voceRef = useRef<Marker | null>(null);
    const enquadrouRef = useRef(false);
    const baseRef = useRef<BaseAtual>(isDark ? "escuro" : "claro");
    const [semMapa, setSemMapa] = useState(false);

    const area = raioKm && ehPonto(center) ? areaDeBusca(center, raioKm) : null;
    const areaRef = useRef(area);
    const corRef = useRef(colors.primary);

    areaRef.current = area;
    corRef.current = colors.primary;

    useEffect(() => {
        if (!containerRef.current || mapRef.current) {
            return;
        }

        const map = new MapLibreMap({
            container: containerRef.current,
            style: baseMapStyle(isDark),
            center: [center.longitude, center.latitude],
            zoom: 12,
        });

        let ultimaChance: ReturnType<typeof setTimeout> | null = null;

        const cairNoRaster = () => {
            if (baseRef.current === "raster") {
                return;
            }

            baseRef.current = "raster";
            map.setStyle(OSM_STYLE, { diff: false });

            ultimaChance = setTimeout(() => {
                if (!map.loaded()) {
                    setSemMapa(true);
                }
            }, ESPERA_BASE);
        };

        /** Erro enquanto o estilo nem existe: a base vetorial quebrou. */
        const aoErro = () => {
            if (!map.isStyleLoaded()) {
                cairNoRaster();
            }
        };

        /** Nada desenhado no prazo: a base vetorial não vai vir. */
        const prazo = setTimeout(() => {
            if (!map.loaded()) {
                cairNoRaster();
            }
        }, ESPERA_BASE);

        map.on("error", aoErro);
        map.on("idle", () => {
            clearTimeout(prazo);
            map.off("error", aoErro);
            setSemMapa(false);
        });

        /** Trocar o estilo apaga as camadas; a área volta a cada estilo novo. */
        map.on("style.load", () => {
            if (areaRef.current) {
                desenharArea(map, areaRef.current, corRef.current);
            }
        });

        map.on("click", () => onClearSelection());
        map.on("moveend", () => {
            const next = map.getCenter();
            onCenterChange?.({ latitude: next.lat, longitude: next.lng });
        });

        mapRef.current = map;

        return () => {
            clearTimeout(prazo);

            if (ultimaChance) {
                clearTimeout(ultimaChance);
            }

            map.remove();
            mapRef.current = null;
        };
    }, []);

    useEffect(() => {
        const map = mapRef.current;
        const alvo: BaseAtual = isDark ? "escuro" : "claro";

        if (!map || baseRef.current === "raster" || baseRef.current === alvo) {
            return;
        }

        baseRef.current = alvo;
        map.setStyle(baseMapStyle(isDark), { diff: false });
    }, [isDark]);

    useEffect(() => {
        const map = mapRef.current;

        if (!map || !area) {
            return;
        }

        if (map.isStyleLoaded()) {
            desenharArea(map, area, colors.primary);
        }

        if (!enquadrouRef.current) {
            enquadrouRef.current = true;
            map.fitBounds(area.limites, { padding: 32, duration: 0 });
        }
    }, [area?.centro[0], area?.centro[1], raioKm]);

    useEffect(() => {
        const map = mapRef.current;

        if (!map) {
            return;
        }

        if (!ehPonto(voce)) {
            voceRef.current?.remove();
            voceRef.current = null;
            return;
        }

        /** A posição vem antes de entrar no mapa: sem ela o marcador quebra. */
        if (!voceRef.current) {
            voceRef.current = new Marker({ element: pontoVoce(colors.canvas) })
                .setLngLat([voce.longitude, voce.latitude])
                .addTo(map);

            return;
        }

        voceRef.current.setLngLat([voce.longitude, voce.latitude]);
    }, [voce?.latitude, voce?.longitude]);

    useEffect(() => {
        const map = mapRef.current;

        if (!map) {
            return;
        }

        markersRef.current.forEach((marker) => marker.remove());
        markersRef.current = [];

        games.filter(temCoordenada).forEach((game) => {
            const element = document.createElement("div");
            const isSelected = game.id === selectedGameId;
            const size = isSelected ? 62 : 46;

            element.style.width = `${size}px`;
            element.style.height = `${size}px`;
            element.style.borderRadius = "50%";
            element.style.display = "flex";
            element.style.alignItems = "center";
            element.style.justifyContent = "center";
            element.style.cursor = "pointer";
            element.style.fontFamily = "BebasNeue_400Regular, sans-serif";
            element.style.letterSpacing = "1px";
            element.textContent = game.sport.slice(0, 1).toUpperCase();

            if (isSelected) {
                element.style.backgroundColor = colors.primary;
                element.style.border = `4px solid ${colors.canvas}`;
                element.style.color = colors.onPrimary;
                element.style.fontSize = "30px";
                element.style.boxShadow =
                    "0 12px 22px -8px rgba(10,8,6,.5)";
            } else {
                element.style.backgroundColor = colors.canvas;
                element.style.border = `3px solid ${colors.primary}`;
                element.style.color = colors.primary;
                element.style.fontSize = "22px";
                element.style.boxShadow =
                    "0 10px 24px -12px rgba(10,8,6,.45)";
            }

            element.addEventListener("click", (event) => {
                event.stopPropagation();
                onSelectGame(game);
            });

            const marker = new Marker({ element })
                .setLngLat([game.coordinates.longitude, game.coordinates.latitude])
                .addTo(map);

            markersRef.current.push(marker);
        });
    }, [games, selectedGameId, onSelectGame]);

    return (
        <>
            <div ref={containerRef} style={{ position: "absolute", inset: 0 }} />

            {semMapa ? (
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 24,
                        textAlign: "center",
                        pointerEvents: "none",
                        color: colors.body,
                        fontFamily: "Inter_400Regular, sans-serif",
                        fontSize: 14,
                    }}
                >
                    Não deu para carregar o mapa. Confira a conexão e abra de
                    novo.
                </div>
            ) : null}
        </>
    );
}
