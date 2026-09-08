import { useEffect, useRef } from "react";
import {
    Map as MapLibreMap,
    Marker,
    setWorkerUrl,
} from "maplibre-gl";

import "maplibre-gl/dist/maplibre-gl.css";

import type { Coordinates, Game } from "../games/types";
import { OSM_STYLE } from "../map/basemap";
import { colors } from "../design/tokens";

setWorkerUrl("/maplibre-gl-worker.mjs");

interface GameMapProps {
    center: Coordinates;
    games: Game[];
    selectedGameId: string | null;
    onSelectGame: (game: Game) => void;
    onClearSelection: () => void;
    onCenterChange?: (center: Coordinates) => void;
}

export default function GameMap({
    center,
    games,
    selectedGameId,
    onSelectGame,
    onClearSelection,
    onCenterChange,
}: GameMapProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<MapLibreMap | null>(null);
    const markersRef = useRef<Marker[]>([]);

    useEffect(() => {
        if (!containerRef.current || mapRef.current) {
            return;
        }

        const map = new MapLibreMap({
            container: containerRef.current,
            style: OSM_STYLE,
            center: [center.longitude, center.latitude],
            zoom: 12,
        });

        map.on("click", () => onClearSelection());
        map.on("moveend", () => {
            const next = map.getCenter();
            onCenterChange?.({ latitude: next.lat, longitude: next.lng });
        });

        mapRef.current = map;

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, []);

    useEffect(() => {
        const map = mapRef.current;

        if (!map) {
            return;
        }

        markersRef.current.forEach((marker) => marker.remove());
        markersRef.current = [];

        games.forEach((game) => {
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

    return <div ref={containerRef} style={{ position: "absolute", inset: 0 }} />;
}
