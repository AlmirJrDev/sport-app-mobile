import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing, type } from "../design/tokens";
import { distanceFor } from "../games/service";
import {
    SKILL_LABEL,
    currentStatus,
    type Coordinates,
    type Game,
} from "../games/types";

const horaFormatter = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
});

const diaFormatter = new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
});

interface GameListProps {
    games: Game[];
    center: Coordinates;
    onOpen: (game: Game) => void;
}

export default function GameList({ games, center, onOpen }: GameListProps) {
    if (games.length === 0) {
        return (
            <View style={styles.vazio}>
                <Text style={[type.nomeCard, styles.vazioTitulo]}>
                    Nenhum jogo por perto
                </Text>
                <Text style={[type.corpo, styles.vazioTexto]}>
                    Marque o primeiro e ele aparece aqui para quem estiver na
                    região.
                </Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.lista}>
            {games.map((game) => {
                const inicio = new Date(game.startsAt);
                const aoVivo = currentStatus(game) === "em-andamento";
                const livres = Math.max(0, game.spots - game.attendees.length);

                return (
                    <Pressable
                        key={game.id}
                        style={styles.card}
                        onPress={() => onOpen(game)}
                    >
                        <View style={styles.linhaTopo}>
                            <Text style={[type.eyebrow, styles.status]}>
                                {aoVivo ? "Ao vivo" : "Aberto"}
                            </Text>
                            <Text style={[type.metadado, styles.distancia]}>
                                {distanceFor(game, center)
                                    .toFixed(1)
                                    .replace(".", ",")}{" "}
                                km
                            </Text>
                        </View>

                        <Text style={[type.nomeCard, styles.nome]}>
                            {game.placeName}
                        </Text>

                        <Text style={[type.corpoSm, styles.meta]}>
                            {game.sport} {game.modality} ·{" "}
                            {diaFormatter.format(inicio)}{" "}
                            {horaFormatter.format(inicio)} ·{" "}
                            {SKILL_LABEL[game.level]}
                        </Text>

                        <View style={styles.rodape}>
                            <Text
                                style={[
                                    type.pontos,
                                    livres === 0
                                        ? styles.vagasEsgotadas
                                        : styles.vagas,
                                ]}
                            >
                                {game.attendees.length} / {game.spots}
                            </Text>

                            <Text style={[type.metadado, styles.meta]}>
                                {livres === 0
                                    ? "quadra cheia"
                                    : livres === 1
                                      ? "1 vaga livre"
                                      : `${livres} vagas livres`}
                            </Text>

                            {game.source === "local" ? (
                                <Text style={[type.labelTab, styles.demo]}>
                                    demonstração
                                </Text>
                            ) : null}
                        </View>
                    </Pressable>
                );
            })}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    lista: {
        padding: spacing.lg,
        paddingTop: 104,
        paddingBottom: 96,
        gap: spacing.md,
    },
    card: {
        gap: spacing.xs,
        padding: spacing.lg,
        borderRadius: 18,
        backgroundColor: colors.canvasSoft,
    },
    linhaTopo: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    status: {
        color: colors.primary,
    },
    distancia: {
        color: colors.mute,
    },
    nome: {
        color: colors.ink,
    },
    meta: {
        color: colors.body,
    },
    rodape: {
        flexDirection: "row",
        alignItems: "baseline",
        gap: spacing.sm,
        marginTop: spacing.xs,
    },
    vagas: {
        color: colors.ink,
    },
    vagasEsgotadas: {
        color: colors.mute,
    },
    demo: {
        marginLeft: "auto",
        color: colors.mute,
    },
    vazio: {
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
});
