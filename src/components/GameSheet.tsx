import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing, type } from "../design/tokens";
import {
    SKILL_LABEL,
    currentStatus,
    endsAt,
    type Game,
} from "../games/types";

const dayFormatter = new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
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
    const vagas = Math.max(0, game.spots - game.attendees.length);
    const isFull = vagas === 0 && !isJoined;
    const travado = isFull || (isJoined && game.source === "api");
    const start = new Date(game.startsAt);

    const rotulo = isFull
        ? "Sem vagas"
        : !isJoined
          ? "Vou jogar"
          : game.source === "api"
            ? "Confirmado"
            : "Cancelar presença";

    return (
        <View style={styles.card}>
            <View style={styles.topo}>
                <View style={styles.identidade}>
                    <Text style={[type.headlineMd, styles.titulo]}>
                        {game.sport} {game.modality}
                    </Text>
                    <Text style={[type.bodySm, styles.local]}>
                        {game.placeName}
                    </Text>
                </View>

                <View style={styles.vagas}>
                    <Text style={[type.statMd, styles.vagasNumero]}>
                        {vagas}
                    </Text>
                    <Text style={[type.label, styles.vagasRotulo]}>
                        {vagas === 1 ? "vaga" : "vagas"}
                    </Text>
                </View>
            </View>

            <View style={styles.chips}>
                <Chip texto={SKILL_LABEL[game.level]} />
                <Chip
                    texto={`${dayFormatter.format(start)} ${hourFormatter.format(start)}`}
                />
                <Chip texto={`${distanceKm.toFixed(1).replace(".", ",")} km`} />
                {game.source === "local" ? <Chip texto="Demonstração" /> : null}
            </View>

            {currentStatus(game) === "em-andamento" ? (
                <View style={styles.aoVivo}>
                    <Text style={[type.label, styles.aoVivoRotulo]}>
                        Ao vivo
                    </Text>
                    <Text style={[type.statMd, styles.aoVivoPlacar]}>
                        {game.score.home} x {game.score.away}
                    </Text>
                    <Text style={[type.caption, styles.aoVivoAte]}>
                        até {hourFormatter.format(endsAt(game))}
                    </Text>
                </View>
            ) : null}

            <Pressable
                style={[styles.cta, travado && styles.ctaTravado]}
                disabled={travado}
                onPress={onToggleJoin}
            >
                <Text
                    style={[
                        type.headlineSm,
                        travado ? styles.ctaRotuloTravado : styles.ctaRotulo,
                    ]}
                >
                    {rotulo}
                </Text>
            </Pressable>

            <View style={styles.rodape}>
                <Pressable onPress={onOpen} hitSlop={8}>
                    <Text style={[type.label, styles.link]}>Abrir jogo</Text>
                </Pressable>

                <Pressable onPress={onClose} hitSlop={8}>
                    <Text style={[type.label, styles.linkSuave]}>Fechar</Text>
                </Pressable>
            </View>
        </View>
    );
}

function Chip({ texto }: { texto: string }) {
    return (
        <View style={styles.chip}>
            <Text style={[type.label, styles.chipTexto]}>{texto}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        position: "absolute",
        left: spacing.lg,
        right: spacing.lg,
        bottom: spacing.lg,
        padding: spacing.xl,
        gap: spacing.md,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.mute,
        backgroundColor: colors.canvas,
    },
    topo: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: spacing.md,
    },
    identidade: {
        flex: 1,
        gap: spacing.xxs,
    },
    titulo: {
        color: colors.ink,
    },
    local: {
        color: colors.body,
    },
    vagas: {
        alignItems: "center",
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.md,
        borderRadius: radius.sm,
        backgroundColor: colors.canvasSoft,
    },
    vagasNumero: {
        color: colors.primary,
    },
    vagasRotulo: {
        color: colors.bodyMid,
    },
    chips: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.sm,
    },
    chip: {
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.md,
        borderRadius: radius.pill,
        backgroundColor: colors.canvasSoft,
    },
    chipTexto: {
        color: colors.body,
    },
    aoVivo: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: radius.sm,
        backgroundColor: colors.ink,
    },
    aoVivoRotulo: {
        color: colors.primary,
    },
    aoVivoPlacar: {
        color: colors.onPrimary,
    },
    aoVivoAte: {
        color: colors.mute,
    },
    cta: {
        alignItems: "center",
        paddingVertical: spacing.md,
        borderRadius: radius.sm,
        backgroundColor: colors.primary,
    },
    ctaTravado: {
        backgroundColor: colors.canvasSoft,
    },
    ctaRotulo: {
        color: colors.onPrimary,
    },
    ctaRotuloTravado: {
        color: colors.bodyMid,
    },
    rodape: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    link: {
        color: colors.ink,
    },
    linkSuave: {
        color: colors.bodyMid,
    },
});
