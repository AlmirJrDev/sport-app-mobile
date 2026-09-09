import { StyleSheet, View } from "react-native";

import { Map, MapLocationPuck, MapMarker } from "@/components/ui/mapcn";
import type { Coordinates, Game } from "../games/types";
import { useTheme } from "../design/theme";
import { CARTO_DARK, CARTO_LIGHT } from "../map/basemap";
import { colors } from "../design/tokens";

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
    const { isDark } = useTheme();

    return (
        <Map
            style={{ light: CARTO_LIGHT, dark: CARTO_DARK }}
            colorScheme={isDark ? "dark" : "light"}
            defaultViewport={{
                center: [center.longitude, center.latitude],
                zoom: 12,
            }}
            onPress={onClearSelection}
            onViewportChangeEnd={(viewport) =>
                onCenterChange?.({
                    longitude: viewport.center[0],
                    latitude: viewport.center[1],
                })
            }
            attribution
        >
            <MapLocationPuck />

            {games.map((game) => (
                <MapMarker
                    key={game.id}
                    coordinate={[
                        game.coordinates.longitude,
                        game.coordinates.latitude,
                    ]}
                    onPress={() => onSelectGame(game)}
                >
                    <View
                        style={[
                            styles.pin,
                            game.source === "local" && styles.pinDemo,
                            selectedGameId === game.id && styles.pinSelected,
                        ]}
                    />
                </MapMarker>
            ))}
        </Map>
    );
}

const styles = StyleSheet.create({
    pin: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 2,
        borderColor: colors.canvas,
        backgroundColor: colors.ink,
        elevation: 4,
    },
    pinDemo: {
        backgroundColor: colors.canvas,
        borderColor: colors.ink,
    },
    pinSelected: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: colors.primary,
        borderColor: colors.canvas,
    },
});
