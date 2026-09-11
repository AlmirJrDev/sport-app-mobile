import { useCallback, useState } from "react";
import { Redirect, useFocusEffect, useRouter } from "expo-router";
import {
    ActivityIndicator,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useLocationTracking } from "@/hooks/use-location-tracking";
import { useSession } from "../../src/auth/useSession";
import GameList from "../../src/components/GameList";
import GameMap from "../../src/components/GameMap";
import GameSheet from "../../src/components/GameSheet";
import { Icon } from "../../src/design/icons";
import { Avatar } from "../../src/design/pieces";
import { useTheme, useThemedStyles } from "../../src/design/theme";
import {
    radius,
    shadow,
    size,
    spacing,
    type,
    type Palette,
} from "../../src/design/tokens";
import { FALLBACK_CENTER } from "../../src/games/mock";
import {
    distanceFor,
    listNearbyGames,
    toggleAttendance,
} from "../../src/games/service";
import type { Coordinates, Game } from "../../src/games/types";

const RADIUS_KM = 10;

export default function MapScreen() {
    const { colors } = useTheme();
    const styles = useThemedStyles(criarEstilos);
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { account, loading } = useSession();
    const { coordinate, status, permission, start } = useLocationTracking({
        autoStart: true,
        accuracy: "balanced",
    });

    const [games, setGames] = useState<Game[]>([]);
    const [erroApi, setErroApi] = useState<string | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [mapCenter, setMapCenter] = useState<Coordinates | null>(null);
    const [vista, setVista] = useState<"mapa" | "lista">("mapa");
    const [avisoAcao, setAvisoAcao] = useState<string | null>(null);
    const [ocupado, setOcupado] = useState(false);

    const center: Coordinates = coordinate
        ? { longitude: coordinate[0], latitude: coordinate[1] }
        : FALLBACK_CENTER;

    const isLocating =
        status === "idle" ||
        status === "requesting-permission" ||
        status === "starting";

    /** Estáveis de propósito: o mapa refaz todos os pinos se elas mudarem. */
    const selecionarJogo = useCallback((game: Game) => {
        setSelectedId(game.id);
        setAvisoAcao(null);
    }, []);

    const limparSelecao = useCallback(() => setSelectedId(null), []);

    const refresh = useCallback(() => {
        listNearbyGames(center, RADIUS_KM).then((resultado) => {
            setGames(resultado.games);
            setErroApi(resultado.remoteError);
        });
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
            <View style={styles.centro}>
                <ActivityIndicator color={colors.ink} />
            </View>
        );
    }

    if (!account) {
        return <Redirect href="/entrar" />;
    }

    if (isLocating) {
        return (
            <View style={styles.centro}>
                <ActivityIndicator color={colors.ink} />
                <Text style={[type.corpo, styles.centroTexto]}>
                    Procurando você no mapa…
                </Text>
            </View>
        );
    }

    const semLocalizacao = permission === "denied" || status === "error";
    const selectedGame = games.find((game) => game.id === selectedId) ?? null;
    const jaConfirmado = Boolean(
        selectedGame?.attendees.some((one) => one.playerId === account.id),
    );

    const handleToggleJoin = async () => {
        if (!selectedGame) {
            return;
        }

        setAvisoAcao(null);
        setOcupado(true);

        try {
            const atualizado = await toggleAttendance(
                selectedGame.id,
                jaConfirmado,
            );

            if (atualizado) {
                setGames((atual) =>
                    atual.map((game) =>
                        game.id === atualizado.id ? atualizado : game,
                    ),
                );
            } else {
                refresh();
            }
        } catch (raw) {
            setAvisoAcao(
                raw instanceof Error
                    ? raw.message
                    : "Não deu para confirmar sua presença agora.",
            );
        } finally {
            setOcupado(false);
        }
    };

    const handleCreate = () => {
        const point = mapCenter ?? center;

        router.push(
            `/novo?lat=${point.latitude.toFixed(6)}&lng=${point.longitude.toFixed(6)}`,
        );
    };

    return (
        <View style={styles.container}>
            {vista === "mapa" ? (
                <GameMap
                    center={center}
                    games={games}
                    selectedGameId={selectedId}
                    onSelectGame={selecionarJogo}
                    onClearSelection={limparSelecao}
                    onCenterChange={setMapCenter}
                />
            ) : (
                <GameList
                    games={games}
                    center={center}
                    onOpen={(game) => router.push(`/jogo/${game.id}`)}
                />
            )}

            <View
                style={[styles.topo, { paddingTop: insets.top + 10 }]}
                pointerEvents="box-none"
            >
                <View style={styles.linhaTopo}>
                    <View style={styles.pill}>
                        <Image
                            source={require("../../assets/logo.png")}
                            style={styles.logo}
                        />

                        <View style={styles.pillTexto}>
                            <Text style={[type.eyebrow, styles.pillRotulo]}>
                                Jogos perto de
                            </Text>
                            <Text style={[type.nomeLista, styles.pillLugar]}>
                                {semLocalizacao ? "Campinas, SP" : "Você"} ·{" "}
                                {RADIUS_KM} km
                            </Text>
                        </View>
                    </View>

                    <Pressable onPress={() => router.push("/perfil")}>
                        <Avatar name={account.name} size={46} />
                    </Pressable>
                </View>

                <View style={styles.chips}>
                    {(["mapa", "lista"] as const).map((opcao) => (
                        <Pressable
                            key={opcao}
                            style={[
                                styles.chip,
                                vista === opcao && styles.chipAtivo,
                            ]}
                            hitSlop={8}
                            onPress={() => {
                                setVista(opcao);
                                setSelectedId(null);
                            }}
                        >
                            <Text
                                style={[
                                    type.labelCampo,
                                    vista === opcao
                                        ? styles.chipTextoAtivo
                                        : styles.chipTexto,
                                ]}
                            >
                                {opcao === "mapa" ? "Mapa" : "Lista"}
                            </Text>
                        </Pressable>
                    ))}

                    {semLocalizacao ? (
                        <Pressable
                            style={styles.chip}
                            hitSlop={8}
                            onPress={start}
                        >
                            <Text
                                style={[type.labelCampo, styles.chipTextoAcao]}
                            >
                                Usar minha localização
                            </Text>
                        </Pressable>
                    ) : null}
                </View>

                {erroApi ? (
                    <View style={styles.falha}>
                        <Text style={[type.eyebrow, styles.falhaRotulo]}>
                            Só demonstração
                        </Text>
                        <Text style={[type.metadado, styles.falhaTexto]}>
                            {erroApi}
                        </Text>
                    </View>
                ) : null}
            </View>

            {selectedGame ? (
                <GameSheet
                    game={selectedGame}
                    distanceKm={distanceFor(selectedGame, center)}
                    isJoined={jaConfirmado}
                    ocupado={ocupado}
                    aviso={avisoAcao}
                    onToggleJoin={handleToggleJoin}
                    onOpen={() => router.push(`/jogo/${selectedGame.id}`)}
                    onClose={() => {
                        setSelectedId(null);
                        setAvisoAcao(null);
                    }}
                />
            ) : (
                <View style={styles.rodape} pointerEvents="box-none">
                    <View style={styles.contador}>
                        <Text style={[type.eyebrow, styles.contadorTexto]}>
                            {games.length} jogos · {RADIUS_KM} km
                        </Text>
                    </View>

                    <Pressable style={styles.fab} onPress={handleCreate}>
                        <Icon name="mais" size={26} color={colors.onPrimary} />
                    </Pressable>
                </View>
            )}
        </View>
    );
}

const criarEstilos = (c: Palette) =>
    StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: c.canvas,
    },
    centro: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: spacing.xl,
        gap: spacing.md,
        backgroundColor: c.canvas,
    },
    centroTexto: {
        color: c.body,
        textAlign: "center",
    },
    topo: {
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        paddingTop: 10,
        paddingHorizontal: spacing.lg,
        gap: spacing.md,
    },
    linhaTopo: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
    },
    pill: {
        flex: 1,
        height: 46,
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        paddingHorizontal: spacing.md,
        borderRadius: radius.chip,
        backgroundColor: c.canvas,
        ...shadow.pill,
    },
    logo: {
        width: 34,
        height: 34,
    },
    pillTexto: {
        flex: 1,
    },
    pillRotulo: {
        color: c.mute,
    },
    pillLugar: {
        color: c.ink,
    },
    chips: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.sm,
    },
    chip: {
        height: size.filterChip,
        justifyContent: "center",
        paddingHorizontal: spacing.lg,
        borderRadius: 17,
        borderWidth: 1,
        borderColor: c.line,
        backgroundColor: c.canvas,
    },
    chipAtivo: {
        borderColor: "transparent",
        backgroundColor: c.ink,
    },
    chipTexto: {
        color: c.body,
    },
    chipTextoAtivo: {
        color: c.canvas,
    },
    chipTextoAcao: {
        color: c.primary,
    },
    falha: {
        gap: spacing.xxs,
        padding: spacing.md,
        borderRadius: radius.sm,
        backgroundColor: c.ink,
    },
    falhaRotulo: {
        color: c.primary,
    },
    falhaTexto: {
        color: c.canvas,
    },
    rodape: {
        position: "absolute",
        left: spacing.lg,
        right: spacing.lg,
        bottom: spacing.lg,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: spacing.md,
    },
    contador: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
        borderRadius: radius.pill,
        backgroundColor: c.canvas,
        ...shadow.pill,
    },
    contadorTexto: {
        color: c.body,
    },
    fab: {
        width: size.fab,
        height: size.fab,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: size.fab / 2,
        backgroundColor: c.primary,
        ...shadow.fab,
    },
});
