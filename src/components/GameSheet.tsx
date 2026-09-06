import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing, type } from "../design/tokens";
import { Button } from "../design/ui";
import {
    SKILL_LABEL,
    currentStatus,
    endsAt,
    type Game,
} from "../games/types";

const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
});

const hourFormatter = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
});

interface GameSheetProps {
    game: Game;
    distanceKm: number;
    isJoined: boolean;
    onToggleJoin: () => void;
    onOpen: () => void;
    onClose: () => void;
}

export default function GameSheet({
    game,
    distanceKm,
    isJoined,
    onToggleJoin,
    onOpen,
    onClose,
}: GameSheetProps) {
    const arrived = game.attendees.filter((one) => one.arrived).length;
    const isFull = game.attendees.length >= game.spots && !isJoined;

    return (
        <View style={styles.sheet}>
            <View style={styles.header}>
                <View style={styles.headerText}>
                    <Text style={[type.displaySubSm, styles.title]}>
                        {game.sport} {game.modality}
                    </Text>
                    <Text style={[type.bodySm, styles.place]}>
                        {game.placeName}
                    </Text>
                </View>

                <Pressable onPress={onClose} hitSlop={12}>
                    <Text style={[type.buttonSm, styles.close]}>Fechar</Text>
                </Pressable>
            </View>

            {game.source === "local" ? (
                <View style={styles.demo}>
                    <Text style={[type.caption, styles.demoLabel]}>
                        Demonstração · só neste aparelho
                    </Text>
                </View>
            ) : null}

            <View style={styles.facts}>
                <Text style={[type.bodySm, styles.fact]}>
                    {timeFormatter.format(new Date(game.startsAt))}
                </Text>
                <Text style={[type.bodySm, styles.fact]}>
                    {distanceKm.toFixed(1).replace(".", ",")} km
                </Text>
                <Text style={[type.bodySm, styles.fact]}>
                    {SKILL_LABEL[game.level]}
                </Text>
                <Text style={[type.bodySm, styles.fact]}>
                    {game.attendees.length}/{game.spots} confirmados
                </Text>
                <Text style={[type.bodySm, styles.fact]}>
                    {arrived} já chegaram
                </Text>
            </View>

            {currentStatus(game) === "em-andamento" ? (
                <View style={styles.live}>
                    <Text style={[type.bodySmStrong, styles.liveLabel]}>
                        Em andamento · {game.score.home} x {game.score.away} ·
                        vai até {hourFormatter.format(endsAt(game))}
                    </Text>
                </View>
            ) : null}

            <View style={styles.actions}>
                <Button
                    label={
                        isFull
                            ? "Sem vagas"
                            : !isJoined
                              ? "Vou jogar"
                              : game.source === "api"
                                ? "Confirmado"
                                : "Cancelar presença"
                    }
                    variant={isJoined ? "secondary" : "primary"}
                    disabled={isFull || (isJoined && game.source === "api")}
                    onPress={onToggleJoin}
                    style={styles.action}
                />

                <Button
                    label="Abrir jogo"
                    variant="tertiary"
                    onPress={onOpen}
                    style={styles.action}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    sheet: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        padding: spacing.xl,
        gap: spacing.md,
        backgroundColor: colors.canvas,
        borderTopLeftRadius: radius.md,
        borderTopRightRadius: radius.md,
    },
    header: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: spacing.md,
    },
    headerText: {
        flex: 1,
    },
    title: {
        color: colors.ink,
    },
    place: {
        color: colors.body,
    },
    close: {
        color: colors.body,
    },
    facts: {
        flexDirection: "row",
        flexWrap: "wrap",
        columnGap: spacing.lg,
        rowGap: spacing.xs,
    },
    fact: {
        color: colors.bodyMid,
    },
    demo: {
        alignSelf: "flex-start",
        paddingVertical: spacing.xxs,
        paddingHorizontal: spacing.sm,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: colors.mute,
    },
    demoLabel: {
        color: colors.bodyMid,
    },
    live: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: radius.pill,
        backgroundColor: colors.canvasSoft,
        alignSelf: "flex-start",
    },
    liveLabel: {
        color: colors.ink,
    },
    actions: {
        flexDirection: "row",
        gap: spacing.sm,
    },
    action: {
        flex: 1,
    },
});
