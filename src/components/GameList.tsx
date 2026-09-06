import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing, type } from "../design/tokens";
import { distanceFor } from "../games/service";
import { SKILL_LABEL, currentStatus, type Coordinates, type Game } from "../games/types";

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
                <Text style={[type.bodyMd, styles.vazioTitulo]}>
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
            {games.map((game) => {
                const distancia = distanceFor(game, center);
                const chegaram = game.attendees.filter(
                    (one) => one.arrived,
                ).length;
                const emAndamento = currentStatus(game) === "em-andamento";

                return (
                    <Pressable
                        key={game.id}
                        style={styles.item}
                        onPress={() => onOpen(game)}
                    >
                        <View style={styles.linhaTopo}>
                            <Text style={[type.bodyMdStrong, styles.titulo]}>
                                {game.sport} {game.modality}
                            </Text>

                            <Text style={[type.bodySm, styles.hora]}>
                                {dayFormatter.format(new Date(game.startsAt))}
                            </Text>
                        </View>

                        <Text style={[type.bodySm, styles.local]}>
                            {game.placeName}
                        </Text>

                        <View style={styles.linhaFatos}>
                            <Text style={[type.caption, styles.fato]}>
                                {distancia.toFixed(1).replace(".", ",")} km
                            </Text>
                            <Text style={[type.caption, styles.fato]}>
                                {SKILL_LABEL[game.level]}
                            </Text>
                            <Text style={[type.caption, styles.fato]}>
                                {game.attendees.length}/{game.spots} confirmados
                            </Text>
                            {chegaram > 0 ? (
                                <Text style={[type.caption, styles.fato]}>
                                    {chegaram} na quadra
                                </Text>
                            ) : null}
                        </View>

                        <View style={styles.etiquetas}>
                            {emAndamento ? (
                                <View
                                    style={[styles.etiqueta, styles.etiquetaViva]}
                                >
                                    <Text
                                        style={[
                                            type.caption,
                                            styles.etiquetaVivaTexto,
                                        ]}
                                    >
                                        Em andamento · {game.score.home} x{" "}
                                        {game.score.away}
                                    </Text>
                                </View>
                            ) : null}

                            {game.source === "local" ? (
                                <View style={styles.etiqueta}>
                                    <Text
                                        style={[type.caption, styles.etiquetaTexto]}
                                    >
                                        Demonstração
                                    </Text>
                                </View>
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
        gap: spacing.md,
    },
    item: {
        gap: spacing.xs,
        padding: spacing.lg,
        borderRadius: radius.md,
        backgroundColor: colors.canvasSoft,
    },
    linhaTopo: {
        flexDirection: "row",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: spacing.md,
    },
    titulo: {
        color: colors.ink,
        flex: 1,
    },
    hora: {
        color: colors.ink,
    },
    local: {
        color: colors.body,
    },
    linhaFatos: {
        flexDirection: "row",
        flexWrap: "wrap",
        columnGap: spacing.md,
        rowGap: spacing.xxs,
        marginTop: spacing.xxs,
    },
    fato: {
        color: colors.bodyMid,
    },
    etiquetas: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.sm,
        marginTop: spacing.xs,
    },
    etiqueta: {
        paddingVertical: spacing.xxs,
        paddingHorizontal: spacing.sm,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: colors.mute,
    },
    etiquetaTexto: {
        color: colors.bodyMid,
    },
    etiquetaViva: {
        borderColor: "transparent",
        backgroundColor: colors.ink,
    },
    etiquetaVivaTexto: {
        color: colors.onPrimary,
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
