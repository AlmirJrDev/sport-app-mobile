import { useCallback, useState } from "react";
import { Redirect, useFocusEffect, useRouter } from "expo-router";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { useLocationTracking } from "@/hooks/use-location-tracking";
import { useSession } from "../../src/auth/useSession";
import { colors, radius, spacing, type } from "../../src/design/tokens";
import { FALLBACK_CENTER } from "../../src/games/mock";
import { distanceFor, listNearbyGames } from "../../src/games/service";
import { currentStatus, type Coordinates, type Game } from "../../src/games/types";
import { groupIntoPlaces, type Place } from "../../src/places/group";

const RADIUS_KM = 10;

const horaFormatter = new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
});

export default function LocaisScreen() {
    const router = useRouter();
    const { account, loading } = useSession();
    const { coordinate, status } = useLocationTracking({
        autoStart: true,
        accuracy: "balanced",
    });

    const [places, setPlaces] = useState<Place[]>([]);

    const center: Coordinates = coordinate
        ? { longitude: coordinate[0], latitude: coordinate[1] }
        : FALLBACK_CENTER;

    const isLocating =
        status === "idle" ||
        status === "requesting-permission" ||
        status === "starting";

    const refresh = useCallback(() => {
        listNearbyGames(center, RADIUS_KM).then((resultado) => {
            setPlaces(groupIntoPlaces(resultado.games));
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

    if (places.length === 0) {
        return (
            <View style={styles.centro}>
                <Text style={[type.headlineSm, styles.vazioTitulo]}>
                    Nenhuma quadra com movimento
                </Text>
                <Text style={[type.bodySm, styles.vazioTexto]}>
                    Os locais aparecem aqui quando alguém marca um jogo por
                    perto. Marque o primeiro e chame o pessoal.
                </Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.conteudo}>
            {places.map((place) => (
                <View key={place.id} style={styles.card}>
                    <View style={styles.topo}>
                        <Text style={[type.headlineSm, styles.nome]}>
                            {place.name}
                        </Text>

                        <View style={styles.distancia}>
                            <Text style={[type.statMd, styles.distanciaNumero]}>
                                {distanceFor(place.games[0], center)
                                    .toFixed(1)
                                    .replace(".", ",")}
                            </Text>
                            <Text style={[type.label, styles.distanciaUnidade]}>
                                km
                            </Text>
                        </View>
                    </View>

                    {place.liveGames > 0 ? (
                        <View style={styles.agora}>
                            <Text style={[type.label, styles.agoraTexto]}>
                                {place.liveGames === 1
                                    ? "1 jogo rolando agora"
                                    : `${place.liveGames} jogos rolando agora`}
                                {place.onCourt > 0
                                    ? ` · ${place.onCourt} na quadra`
                                    : ""}
                            </Text>
                        </View>
                    ) : null}

                    <Text style={[type.caption, styles.resumo]}>
                        {place.games.length === 1
                            ? "1 jogo marcado"
                            : `${place.games.length} jogos marcados`}{" "}
                        · {place.confirmed} confirmados
                    </Text>

                    <View style={styles.jogos}>
                        {place.games.map((game) => (
                            <LinhaJogo
                                key={game.id}
                                game={game}
                                onPress={() => router.push(`/jogo/${game.id}`)}
                            />
                        ))}
                    </View>
                </View>
            ))}

            <Text style={[type.caption, styles.rodape]}>
                Locais são agrupados por proximidade — jogos a menos de 80 m
                contam como a mesma quadra.
            </Text>
        </ScrollView>
    );
}

function LinhaJogo({ game, onPress }: { game: Game; onPress: () => void }) {
    const vivo = currentStatus(game) === "em-andamento";

    return (
        <Pressable style={styles.linha} onPress={onPress}>
            <View style={styles.linhaTexto}>
                <Text style={[type.bodySmStrong, styles.linhaTitulo]}>
                    {game.sport} {game.modality}
                </Text>
                <Text style={[type.caption, styles.linhaDetalhe]}>
                    {horaFormatter.format(new Date(game.startsAt))} ·{" "}
                    {game.attendees.length}/{game.spots}
                </Text>
            </View>

            {vivo ? (
                <Text style={[type.label, styles.linhaVivo]}>
                    {game.score.home}x{game.score.away}
                </Text>
            ) : null}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    conteudo: {
        padding: spacing.lg,
        paddingBottom: 96,
        gap: spacing.md,
    },
    centro: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: spacing.xl,
        gap: spacing.sm,
    },
    vazioTitulo: {
        color: colors.ink,
    },
    vazioTexto: {
        color: colors.body,
        textAlign: "center",
    },
    card: {
        gap: spacing.sm,
        padding: spacing.lg,
        borderRadius: radius.md,
        backgroundColor: colors.canvasSoft,
    },
    topo: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: spacing.md,
    },
    nome: {
        flex: 1,
        color: colors.ink,
    },
    distancia: {
        alignItems: "flex-end",
    },
    distanciaNumero: {
        color: colors.ink,
    },
    distanciaUnidade: {
        color: colors.bodyMid,
    },
    agora: {
        alignSelf: "flex-start",
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.md,
        borderRadius: radius.pill,
        backgroundColor: colors.ink,
    },
    agoraTexto: {
        color: colors.primary,
    },
    resumo: {
        color: colors.body,
    },
    jogos: {
        gap: spacing.xs,
        marginTop: spacing.xs,
    },
    linha: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: spacing.md,
        padding: spacing.md,
        borderRadius: radius.sm,
        backgroundColor: colors.canvas,
    },
    linhaTexto: {
        flex: 1,
        gap: spacing.xxs,
    },
    linhaTitulo: {
        color: colors.ink,
    },
    linhaDetalhe: {
        color: colors.body,
    },
    linhaVivo: {
        color: colors.primary,
    },
    rodape: {
        color: colors.bodyMid,
        marginTop: spacing.sm,
    },
});
