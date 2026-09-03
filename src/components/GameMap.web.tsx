import { useEffect, useRef } from "react";
import {
    Map as MapLibreMap,
    Marker,
    NavigationControl,
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

        map.addControl(new NavigationControl(), "top-right");
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
            const size = isSelected ? 26 : 18;

            element.style.width = `${size}px`;
            element.style.height = `${size}px`;
            element.style.borderRadius = "50%";
            element.style.border = `2px solid ${colors.canvas}`;
            const isDemo = game.source === "local";

            element.style.backgroundColor = isSelected
                ? colors.primary
                : isDemo
                  ? colors.canvas
                  : colors.ink;
            element.style.borderColor =
                isSelected || !isDemo ? colors.canvas : colors.ink;
            element.style.boxShadow = "0 1px 4px rgba(0,0,0,0.4)";
            element.style.cursor = "pointer";

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
