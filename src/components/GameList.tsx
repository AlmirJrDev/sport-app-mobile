import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing, type } from "../design/tokens";
import { distanceFor } from "../games/service";
import {
    SKILL_LABEL,
    currentStatus,
    type Coordinates,
    type Game,
} from "../games/types";

const dayFormatter = new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
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
                <Text style={[type.headlineSm, styles.vazioTitulo]}>
                    Nenhum jogo por perto
                </Text>
                <Text style={[type.bodySm, styles.vazioTexto]}>
                    Marque o primeiro e ele aparece aqui para quem estiver na
                    região.
                </Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.lista}>
            <Text style={[type.headlineSm, styles.secao]}>Próximos a você</Text>

            {games.map((game) => {
                const distancia = distanceFor(game, center);
                const emAndamento = currentStatus(game) === "em-andamento";

                return (
                    <Pressable
                        key={game.id}
                        style={styles.item}
                        onPress={() => onOpen(game)}
                    >
                        <View style={styles.selo}>
                            <Text style={[type.statMd, styles.seloLetra]}>
                                {game.sport.slice(0, 1)}
                            </Text>
                        </View>

                        <View style={styles.miolo}>
                            <Text style={[type.headlineSm, styles.titulo]}>
                                {game.sport} {game.modality}
                            </Text>

                            <Text style={[type.caption, styles.detalhe]}>
                                {dayFormatter.format(new Date(game.startsAt))} ·{" "}
                                {SKILL_LABEL[game.level]} ·{" "}
                                {game.attendees.length}/{game.spots}
                            </Text>

                            {emAndamento || game.source === "local" ? (
                                <View style={styles.etiquetas}>
                                    {emAndamento ? (
                                        <Text
                                            style={[type.label, styles.aoVivo]}
                                        >
                                            Ao vivo {game.score.home}x
                                            {game.score.away}
                                        </Text>
                                    ) : null}

                                    {game.source === "local" ? (
                                        <Text
                                            style={[type.label, styles.demo]}
                                        >
                                            Demonstração
                                        </Text>
                                    ) : null}
                                </View>
                            ) : null}
                        </View>

                        <View style={styles.distancia}>
                            <Text style={[type.statMd, styles.distanciaNumero]}>
                                {distancia.toFixed(1).replace(".", ",")}
                            </Text>
                            <Text style={[type.label, styles.distanciaUnidade]}>
                                km
                            </Text>
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
        paddingBottom: spacing.xxxl,
        gap: spacing.sm,
    },
    secao: {
        color: colors.ink,
        marginBottom: spacing.xs,
    },
    item: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        padding: spacing.md,
        borderRadius: radius.md,
        backgroundColor: colors.canvasSoft,
    },
    selo: {
        width: 48,
        height: 48,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: radius.sm,
        backgroundColor: colors.canvas,
    },
    seloLetra: {
        color: colors.primary,
    },
    miolo: {
        flex: 1,
        gap: spacing.xxs,
    },
    titulo: {
        color: colors.ink,
    },
    detalhe: {
        color: colors.body,
    },
    etiquetas: {
        flexDirection: "row",
        gap: spacing.md,
        marginTop: spacing.xxs,
    },
    aoVivo: {
        color: colors.primary,
    },
    demo: {
        color: colors.bodyMid,
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
