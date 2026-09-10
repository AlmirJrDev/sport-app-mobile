import { useCallback, useState } from "react";
import { Redirect, useFocusEffect, useRouter } from "expo-router";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { useLocationTracking } from "@/hooks/use-location-tracking";
import { useSession } from "../../src/auth/useSession";
import { DarkHeader } from "../../src/design/header";
import { Icon } from "../../src/design/icons";
import { useTheme, useThemedStyles } from "../../src/design/theme";
import {
    radius,
    spacing,
    type,
    type Palette,
} from "../../src/design/tokens";
import { FALLBACK_CENTER } from "../../src/games/mock";
import { distanceFor, listNearbyGames } from "../../src/games/service";
import {
    currentStatus,
    type Coordinates,
    type Game,
} from "../../src/games/types";
import { groupIntoPlaces, type Place } from "../../src/places/group";

const RADIUS_KM = 10;

const horaFormatter = new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
});

export default function LocaisScreen() {
    const { colors } = useTheme();
    const styles = useThemedStyles(criarEstilos);
    const router = useRouter();
    const { account, loading } = useSession();
    const { coordinate, status } = useLocationTracking({
        autoStart: true,
        accuracy: "balanced",
    });

    const [places, setPlaces] = useState<Place[]>([]);
    const [busca, setBusca] = useState("");
    const [carregado, setCarregado] = useState(false);

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
            setCarregado(true);
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

    const termo = busca.trim().toLowerCase();
    const visiveis = termo
        ? places.filter((place) => place.name.toLowerCase().includes(termo))
        : places;

    const campoBusca = (
        <View style={styles.busca}>
            <Icon name="busca" size={18} color={colors.onHeaderSoft} />
            <TextInput
                style={[type.corpoSm, styles.buscaInput]}
                placeholder="Buscar quadra ou praça"
                placeholderTextColor={colors.onHeaderSoft}
                value={busca}
                onChangeText={setBusca}
            />
        </View>
    );

    return (
        <View style={styles.tela}>
            <DarkHeader title="Locais">{campoBusca}</DarkHeader>

            {!carregado ? (
                <View style={styles.centro}>
                    <ActivityIndicator color={colors.ink} />
                </View>
            ) : visiveis.length === 0 ? (
                <View style={styles.centro}>
                    <Text style={[type.nomeCard, styles.vazioTitulo]}>
                        {termo ? "Nada com esse nome" : "Nenhuma quadra com movimento"}
                    </Text>
                    <Text style={[type.corpo, styles.vazioTexto]}>
                        {termo
                            ? "Tente outro pedaço do nome."
                            : "Os locais aparecem aqui quando alguém marca um jogo por perto."}
                    </Text>
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.conteudo}>
                    {visiveis.map((place) => (
                        <View key={place.id} style={styles.card}>
                            <View style={styles.topo}>
                                <View style={styles.identidade}>
                                    <Text style={[type.nomeCard, styles.nome]}>
                                        {place.name}
                                    </Text>
                                    <Text
                                        style={[type.metadado, styles.resumo]}
                                    >
                                        {place.games.length === 1
                                            ? "1 jogo marcado"
                                            : `${place.games.length} jogos marcados`}{" "}
                                        · {place.confirmed} confirmados
                                    </Text>
                                </View>

                                <View style={styles.distancia}>
                                    <Text
                                        style={[type.statCard, styles.distanciaNumero]}
                                    >
                                        {distanceFor(place.games[0], center)
                                            .toFixed(1)
                                            .replace(".", ",")}
                                    </Text>
                                    <Text
                                        style={[type.labelTab, styles.distanciaUnidade]}
                                    >
                                        km
                                    </Text>
                                </View>
                            </View>

                            {place.liveGames > 0 ? (
                                <View style={styles.aoVivo}>
                                    <View style={styles.ponto} />
                                    <Text
                                        style={[type.eyebrow, styles.aoVivoTexto]}
                                    >
                                        {place.liveGames === 1
                                            ? "1 jogo rolando"
                                            : `${place.liveGames} jogos rolando`}
                                        {place.onCourt > 0
                                            ? ` · ${place.onCourt} na quadra`
                                            : ""}
                                    </Text>
                                </View>
                            ) : null}

                            <View style={styles.jogos}>
                                {place.games.map((game) => (
                                    <LinhaJogo
                                        key={game.id}
                                        game={game}
                                        onPress={() =>
                                            router.push(`/jogo/${game.id}`)
                                        }
                                    />
                                ))}
                            </View>
                        </View>
                    ))}

                    <Text style={[type.metadado, styles.rodape]}>
                        Locais são agrupados por proximidade — jogos a menos de
                        80 m contam como a mesma quadra.
                    </Text>
                </ScrollView>
            )}
        </View>
    );
}

function LinhaJogo({ game, onPress }: { game: Game; onPress: () => void }) {
    const styles = useThemedStyles(criarEstilos);
    const vivo = currentStatus(game) === "em-andamento";

    return (
        <Pressable style={styles.linha} onPress={onPress}>
            <View style={styles.linhaTexto}>
                <Text style={[type.nomeLista, styles.linhaTitulo]}>
                    {game.sport} {game.modality}
                </Text>
                <Text style={[type.metadado, styles.linhaDetalhe]}>
                    {horaFormatter.format(new Date(game.startsAt))} ·{" "}
                    {game.attendees.length}/{game.spots}
                </Text>
            </View>

            {vivo ? (
                <Text style={[type.pontos, styles.linhaPlacar]}>
                    {game.score.home}–{game.score.away}
                </Text>
            ) : null}
        </Pressable>
    );
}

const criarEstilos = (c: Palette) =>
    StyleSheet.create({
    tela: {
        flex: 1,
        backgroundColor: c.canvas,
    },
    busca: {
        height: 44,
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: radius.sm,
        backgroundColor: "rgba(255,254,251,0.1)",
    },
    buscaInput: {
        flex: 1,
        color: c.onHeader,
    },
    conteudo: {
        padding: spacing.xl,
        paddingBottom: spacing.xxxl,
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
        color: c.ink,
    },
    vazioTexto: {
        color: c.body,
        textAlign: "center",
    },
    card: {
        gap: spacing.md,
        padding: 18,
        borderRadius: radius.lg,
        backgroundColor: c.canvasSoft,
    },
    topo: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: spacing.md,
    },
    identidade: {
        flex: 1,
        gap: spacing.xxs,
    },
    nome: {
        color: c.ink,
    },
    resumo: {
        color: c.body,
    },
    distancia: {
        alignItems: "flex-end",
    },
    distanciaNumero: {
        color: c.ink,
    },
    distanciaUnidade: {
        color: c.mute,
    },
    aoVivo: {
        alignSelf: "flex-start",
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.md,
        borderRadius: radius.pill,
        backgroundColor: c.header,
    },
    ponto: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: c.primary,
    },
    aoVivoTexto: {
        color: c.primary,
    },
    jogos: {
        gap: spacing.sm,
    },
    linha: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: spacing.md,
        padding: spacing.md,
        borderRadius: 12,
        backgroundColor: c.canvas,
    },
    linhaTexto: {
        flex: 1,
        gap: spacing.xxs,
    },
    linhaTitulo: {
        color: c.ink,
    },
    linhaDetalhe: {
        color: c.mute,
    },
    linhaPlacar: {
        color: c.primary,
    },
    rodape: {
        color: c.mute,
        marginTop: spacing.sm,
    },
});
