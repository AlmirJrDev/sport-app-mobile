import { useCallback, useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import {
    addPoints,
    deleteGame,
    finishGame,
    getGame,
    toggleArrival,
    toggleAttendance,
} from "../../src/games/service";
import { colors, font, radius, spacing, type } from "../../src/design/tokens";
import {
    SKILL_LABEL,
    currentStatus,
    endsAt,
    type Game,
} from "../../src/games/types";
import { addToCalendar } from "../../src/calendar/addToCalendar";
import { getPlayer } from "../../src/player/identity";

const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
});

const POINT_STEPS = [1, 2, 3];

export default function GameScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();

    const [game, setGame] = useState<Game | null>(null);
    const [playerId, setPlayerId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        const [found, player] = await Promise.all([getGame(id), getPlayer()]);

        setGame(found);
        setPlayerId(player.id);
        setLoading(false);
    }, [id]);

    useEffect(() => {
        load();
    }, [load]);

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator />
            </View>
        );
    }

    if (!game) {
        return (
            <View style={styles.centered}>
                <Text style={styles.message}>Jogo não encontrado.</Text>
            </View>
        );
    }

    const me = game.attendees.find((one) => one.playerId === playerId);
    const arrived = game.attendees.filter((one) => one.arrived);
    const isFull = game.attendees.length >= game.spots && !me;
    const isFinished = currentStatus(game) === "encerrado";
    const isOwner = game.ownerId === playerId;
    const travado = isFull;
    const chegadaTravada = game.source === "api" && Boolean(me?.arrived);

    const run = async (action: Promise<Game | null>) => {
        const updated = await action;

        if (updated) {
            setGame(updated);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.block}>
                <Text style={styles.title}>
                    {game.sport} {game.modality}
                </Text>
                <Text style={styles.subtitle}>{game.placeName}</Text>
                <Text style={styles.subtitle}>
                    {timeFormatter.format(new Date(game.startsAt))} ·{" "}
                    {SKILL_LABEL[game.level]}
                </Text>
                <Text style={styles.subtitle}>
                    Termina {timeFormatter.format(endsAt(game))} ·{" "}
                    {game.durationMinutes} min
                </Text>

                {game.creatorName ? (
                    <Text style={styles.subtitle}>
                        Marcado por {game.creatorName}
                    </Text>
                ) : null}

                {!isFinished ? (
                    <Pressable
                        style={styles.calendario}
                        onPress={() => addToCalendar(game)}
                    >
                        <Text style={styles.calendarioTexto}>
                            Adicionar ao calendário
                        </Text>
                    </Pressable>
                ) : null}
            </View>

            <View style={styles.block}>
                <Text style={styles.sectionTitle}>Placar</Text>

                <View style={styles.scoreboard}>
                    {(["home", "away"] as const).map((side) => (
                        <View style={styles.team} key={side}>
                            <Text style={styles.teamName}>
                                {side === "home" ? "Time A" : "Time B"}
                            </Text>

                            <Text style={styles.score}>{game.score[side]}</Text>

                            <View style={styles.pointButtons}>
                                {POINT_STEPS.map((points) => (
                                    <Pressable
                                        key={points}
                                        style={[
                                            styles.point,
                                            isFinished && styles.pointDisabled,
                                        ]}
                                        disabled={isFinished}
                                        onPress={() =>
                                            run(addPoints(game.id, side, points))
                                        }
                                    >
                                        <Text style={styles.pointLabel}>
                                            +{points}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>

                            <Pressable
                                style={styles.undo}
                                disabled={isFinished}
                                onPress={() => run(addPoints(game.id, side, -1))}
                            >
                                <Text style={styles.undoLabel}>−1</Text>
                            </Pressable>
                        </View>
                    ))}
                </View>

                {isFinished ? (
                    <Text style={styles.finished}>
                        Jogo encerrado — já saiu do mapa.
                    </Text>
                ) : game.source === "local" || isOwner ? (
                    <Pressable
                        style={styles.finish}
                        onPress={async () => {
                            const atualizado = await finishGame(game.id);

                            if (atualizado) {
                                setGame(atualizado);
                            } else {
                                router.back();
                            }
                        }}
                    >
                        <Text style={styles.finishLabel}>Encerrar jogo</Text>
                    </Pressable>
                ) : null}

                {isOwner && game.source === "local" ? (
                    <Pressable
                        style={styles.finishGhost}
                        onPress={async () => {
                            await deleteGame(game.id);
                            router.back();
                        }}
                    >
                        <Text style={styles.deleteLabel}>
                            Cancelar e apagar marcação
                        </Text>
                    </Pressable>
                ) : null}
            </View>

            <View style={styles.block}>
                <Text style={styles.sectionTitle}>
                    Quem vai · {game.attendees.length}/{game.spots}
                </Text>
                <Text style={styles.subtitle}>
                    {arrived.length} já chegaram na quadra
                </Text>

                <View style={styles.actions}>
                    <Pressable
                        style={[
                            styles.action,
                            styles.actionPrimary,
                            travado && styles.actionDisabled,
                        ]}
                        disabled={travado}
                        onPress={() => run(toggleAttendance(game.id))}
                    >
                        <Text
                            style={[
                                styles.actionPrimaryLabel,
                                travado && styles.actionTravadoLabel,
                            ]}
                        >
                            {isFull
                                ? "Sem vagas"
                                : me
                                  ? "Cancelar presença"
                                  : "Vou jogar"}
                        </Text>
                    </Pressable>

                    {me ? (
                        <Pressable
                            style={[
                                styles.action,
                                chegadaTravada && styles.actionDisabled,
                            ]}
                            disabled={chegadaTravada}
                            onPress={() => run(toggleArrival(game.id))}
                        >
                            <Text style={styles.actionLabel}>
                                {chegadaTravada
                                    ? "Você chegou"
                                    : me.arrived
                                      ? "Não cheguei"
                                      : "Cheguei"}
                            </Text>
                        </Pressable>
                    ) : null}
                </View>

                <View style={styles.list}>
                    {game.attendees.length === 0 ? (
                        <Text style={styles.subtitle}>
                            Ninguém confirmou ainda.
                        </Text>
                    ) : (
                        game.attendees.map((one) => (
                            <View style={styles.row} key={one.playerId}>
                                <Text style={styles.rowName}>
                                    {one.playerId === playerId
                                        ? `${one.name} · você`
                                        : one.name}
                                </Text>
                                <Text style={styles.rowStatus}>
                                    {one.arrived ? "chegou" : "vai"}
                                </Text>
                            </View>
                        ))
                    )}
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    content: {
        padding: 16,
        gap: 24,
    },
    centered: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
    },
    message: {
        ...type.bodySm,
        color: colors.ink,
    },
    block: {
        gap: 8,
    },
    title: {
        ...type.headlineMd,
        color: colors.ink,
    },
    subtitle: {
        ...type.caption,
        color: colors.body,
    },
    sectionTitle: {
        ...type.label,
        color: colors.bodyMid,
    },
    scoreboard: {
        flexDirection: "row",
        gap: 12,
    },
    team: {
        flex: 1,
        alignItems: "center",
        gap: 8,
        paddingVertical: 14,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.mute,
    },
    teamName: {
        ...type.label,
        color: colors.bodyMid,
    },
    score: {
        ...type.statLg,
        fontSize: 56,
        lineHeight: 56,
        color: colors.ink,
    },
    pointButtons: {
        flexDirection: "row",
        gap: 6,
    },
    point: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: radius.sm,
        backgroundColor: colors.ink,
    },
    pointDisabled: {
        backgroundColor: colors.mute,
    },
    pointLabel: {
        ...type.label,
        color: colors.onPrimary,
    },
    undo: {
        paddingVertical: 4,
        paddingHorizontal: 10,
    },
    undoLabel: {
        ...type.caption,
        color: colors.body,
    },
    finish: {
        alignItems: "center",
        paddingVertical: 14,
        borderRadius: radius.sm,
        backgroundColor: colors.primary,
    },
    finishGhost: {
        alignItems: "center",
        paddingVertical: 12,
        borderRadius: radius.sm,
    },
    finishLabel: {
        ...type.headlineSm,
        color: colors.onPrimary,
    },
    calendario: {
        alignSelf: "flex-start",
        marginTop: 6,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: colors.mute,
    },
    calendarioTexto: {
        ...type.caption,
        fontFamily: font.semibold,
        color: colors.ink,
    },
    finished: {
        ...type.caption,
        color: colors.body,
    },
    deleteLabel: {
        ...type.label,
        color: colors.primary,
    },
    actions: {
        flexDirection: "row",
        gap: 8,
    },
    action: {
        flex: 1,
        alignItems: "center",
        paddingVertical: 12,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.mute,
    },
    actionPrimary: {
        borderColor: "transparent",
        backgroundColor: colors.primary,
    },
    actionDisabled: {
        backgroundColor: colors.canvasSoft,
    },
    actionLabel: {
        ...type.bodySm,
        fontFamily: font.semibold,
        color: colors.ink,
    },
    actionPrimaryLabel: {
        ...type.bodySm,
        fontFamily: font.semibold,
        color: colors.onPrimary,
    },
    actionTravadoLabel: {
        color: colors.body,
    },
    list: {
        gap: 2,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.mute,
    },
    rowName: {
        ...type.caption,
        color: colors.ink,
    },
    rowStatus: {
        ...type.caption,
        color: colors.body,
    },
});
