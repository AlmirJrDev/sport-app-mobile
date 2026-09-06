import { useCallback, useState } from "react";
import { Redirect, Stack, useFocusEffect, useRouter } from "expo-router";
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { useLocationTracking } from "@/hooks/use-location-tracking";
import { signOut } from "../src/auth/account";
import { useSession } from "../src/auth/useSession";
import GameList from "../src/components/GameList";
import GameMap from "../src/components/GameMap";
import GameSheet from "../src/components/GameSheet";
import { colors, radius, spacing, type } from "../src/design/tokens";
import { Button } from "../src/design/ui";
import { FALLBACK_CENTER } from "../src/games/mock";
import {
    distanceFor,
    listNearbyGames,
    toggleAttendance,
} from "../src/games/service";
import type { Coordinates, Game } from "../src/games/types";

const RADIUS_KM = 10;

export default function MapScreen() {
    const router = useRouter();
    const { account, loading, reload } = useSession();
    const { coordinate, status, permission, start } = useLocationTracking({
        autoStart: true,
        accuracy: "balanced",
    });

    const [games, setGames] = useState<Game[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [mapCenter, setMapCenter] = useState<Coordinates | null>(null);
    const [vista, setVista] = useState<"mapa" | "lista">("mapa");

    const center: Coordinates = coordinate
        ? { longitude: coordinate[0], latitude: coordinate[1] }
        : FALLBACK_CENTER;

    const isLocating =
        status === "idle" ||
        status === "requesting-permission" ||
        status === "starting";

    const refresh = useCallback(() => {
        listNearbyGames(center, RADIUS_KM).then(setGames);
    }, [center.latitude, center.longitude]);

    useFocusEffect(
        useCallback(() => {
            if (!isLocating && account) {
                refresh();
            }
        }, [isLocating, refresh, account]),
    );

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator color={colors.ink} />
            </View>
        );
    }

    if (!account) {
        return <Redirect href="/entrar" />;
    }

    const handleSignOut = async () => {
        await signOut();
        reload();
        router.replace("/entrar");
    };

    const header = (
        <Stack.Screen
            options={{
                headerRight: () => (
                    <Pressable onPress={handleSignOut} hitSlop={12}>
                        <Text style={[type.buttonSm, styles.signOut]}>
                            Sair
                        </Text>
                    </Pressable>
                ),
            }}
        />
    );

    if (isLocating) {
        return (
            <View style={styles.centered}>
                {header}
                <ActivityIndicator color={colors.ink} />
                <Text style={[type.bodyMd, styles.message]}>
                    Procurando você no mapa…
                </Text>
            </View>
        );
    }

    const semLocalizacao = permission === "denied" || status === "error";
    const selectedGame = games.find((game) => game.id === selectedId) ?? null;

    const alternador = (
        <View style={styles.alternador}>
            {(["mapa", "lista"] as const).map((opcao) => (
                <Pressable
                    key={opcao}
                    style={[
                        styles.aba,
                        vista === opcao && styles.abaAtiva,
                    ]}
                    onPress={() => setVista(opcao)}
                >
                    <Text
                        style={[
                            type.buttonSm,
                            vista === opcao
                                ? styles.abaTextoAtivo
                                : styles.abaTexto,
                        ]}
                    >
                        {opcao === "mapa" ? "Mapa" : "Lista"}
                    </Text>
                </Pressable>
            ))}
        </View>
    );

    const handleToggleJoin = async () => {
        if (!selectedGame) {
            return;
        }

        await toggleAttendance(selectedGame.id);
        refresh();
    };

    const handleCreate = () => {
        const point = mapCenter ?? center;

        router.push(
            `/novo?lat=${point.latitude.toFixed(6)}&lng=${point.longitude.toFixed(6)}`,
        );
    };

    return (
        <View style={styles.container}>
            {header}

            {semLocalizacao ? (
                <View style={styles.aviso}>
                    <Text style={[type.bodySm, styles.avisoTexto]}>
                        Sem a sua localização, o mapa abre em Campinas.
                    </Text>

                    <Pressable onPress={start} hitSlop={8}>
                        <Text style={[type.buttonSm, styles.avisoAcao]}>
                            Usar minha localização
                        </Text>
                    </Pressable>
                </View>
            ) : null}

            {alternador}

            {vista === "mapa" ? (
                <GameMap
                    center={center}
                    games={games}
                    selectedGameId={selectedId}
                    onSelectGame={(game) => setSelectedId(game.id)}
                    onClearSelection={() => setSelectedId(null)}
                    onCenterChange={setMapCenter}
                />
            ) : (
                <GameList
                    games={games}
                    center={center}
                    onOpen={(game) => router.push(`/jogo/${game.id}`)}
                />
            )}

            {selectedGame ? (
                <GameSheet
                    game={selectedGame}
                    distanceKm={distanceFor(selectedGame, center)}
                    isJoined={selectedGame.attendees.some(
                        (one) => one.playerId === account.id,
                    )}
                    onToggleJoin={handleToggleJoin}
                    onOpen={() => router.push(`/jogo/${selectedGame.id}`)}
                    onClose={() => setSelectedId(null)}
                />
            ) : (
                <View style={styles.bottomBar}>
                    <Text style={[type.bodySm, styles.counterLabel]}>
                        {games.length} jogos num raio de {RADIUS_KM} km
                    </Text>

                    <Button label="Marcar jogo" onPress={handleCreate} />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.canvas,
    },
    centered: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: spacing.xl,
        gap: spacing.md,
        backgroundColor: colors.canvas,
    },
    message: {
        color: colors.body,
        textAlign: "center",
    },
    signOut: {
        color: colors.ink,
    },
    bottomBar: {
        position: "absolute",
        left: spacing.lg,
        right: spacing.lg,
        bottom: spacing.lg,
        padding: spacing.lg,
        gap: spacing.md,
        borderRadius: radius.md,
        backgroundColor: colors.canvas,
    },
    counterLabel: {
        color: colors.body,
    },
    aviso: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: spacing.md,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
        backgroundColor: colors.canvasSoft,
        borderBottomWidth: 1,
        borderBottomColor: colors.mute,
    },
    avisoTexto: {
        flex: 1,
        color: colors.body,
    },
    avisoAcao: {
        color: colors.primary,
    },
    alternador: {
        flexDirection: "row",
        gap: spacing.xs,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        paddingBottom: spacing.sm,
    },
    aba: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: colors.mute,
    },
    abaAtiva: {
        borderColor: "transparent",
        backgroundColor: colors.ink,
    },
    abaTexto: {
        color: colors.body,
    },
    abaTextoAtivo: {
        color: colors.onPrimary,
    },
});
