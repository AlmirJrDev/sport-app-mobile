import { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

import { Icon } from "../design/icons";
import { Avatar } from "../design/pieces";
import { useTheme, useThemedStyles } from "../design/theme";
import {
    radius,
    shadow,
    size,
    spacing,
    type,
    type Palette,
} from "../design/tokens";
import {
    SKILL_LABEL,
    currentStatus,
    joinBlockReason,
    type Game,
} from "../games/types";
import { inviteText } from "../share/invite";
import { shareInvite } from "../share/share";

const horaFormatter = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
});

const diaFormatter = new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
});

interface GameSheetProps {
    game: Game;
    distanceKm: number;
    isJoined: boolean;
    ocupado?: boolean;
    aviso?: string | null;
    onToggleJoin: () => void;
    onOpen: () => void;
    onClose: () => void;
}

/** Ponto do "ao vivo": opacidade 1 → .3 → 1, 1,6s, infinito. */
function PontoVivo() {
    const styles = useThemedStyles(criarEstilos);
    const pulso = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const ciclo = Animated.loop(
            Animated.sequence([
                Animated.timing(pulso, {
                    toValue: 0.3,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(pulso, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ]),
        );

        ciclo.start();

        return () => ciclo.stop();
    }, [pulso]);

    return <Animated.View style={[styles.ponto, { opacity: pulso }]} />;
}

export default function GameSheet({
    game,
    distanceKm,
    isJoined,
    ocupado,
    aviso,
    onToggleJoin,
    onOpen,
    onClose,
}: GameSheetProps) {
    const { colors } = useTheme();
    const styles = useThemedStyles(criarEstilos);
    const inicio = new Date(game.startsAt);
    const situacao = currentStatus(game);
    const aoVivo = situacao === "em-andamento";
    const lotado = game.attendees.length >= game.spots && !isJoined;

    const visiveis = game.attendees.slice(0, 4);
    const extras = game.attendees.length - visiveis.length;

    const bloqueio = isJoined ? null : joinBlockReason(game);
    const travado = lotado || bloqueio !== null;

    const rotulo = ocupado
        ? "Um instante…"
        : bloqueio
          ? bloqueio
          : lotado
            ? "Sem vagas"
            : isJoined
              ? "Presença confirmada"
              : "Entrar no jogo";

    return (
        <View style={styles.sheet}>
            <View style={styles.topo}>
                <View style={styles.identidade}>
                    <View style={styles.status}>
                        {aoVivo ? <PontoVivo /> : null}
                        <Text style={[type.eyebrow, styles.statusTexto]}>
                            {aoVivo ? "Ao vivo" : "Aberto"} · {game.sport}
                        </Text>
                    </View>

                    <Text style={[type.nomeSheet, styles.nome]}>
                        {game.placeName}
                    </Text>

                    <Text style={[type.corpoSm, styles.meta]}>
                        {aoVivo
                            ? `começou ${horaFormatter.format(inicio)}`
                            : `${diaFormatter.format(inicio)} ${horaFormatter.format(inicio)}`}{" "}
                        · {game.durationMinutes} min ·{" "}
                        {distanceKm.toFixed(1).replace(".", ",")} km
                    </Text>
                </View>

                <View style={styles.placarBloco}>
                    <Text style={[type.placar, styles.placar]}>
                        {aoVivo
                            ? `${game.score.home}–${game.score.away}`
                            : horaFormatter.format(inicio)}
                    </Text>
                    <Text style={[type.labelTab, styles.placarRotulo]}>
                        {aoVivo ? "placar" : "início"}
                    </Text>
                </View>
            </View>

            <View style={styles.presenca}>
                <View style={styles.pilha}>
                    {visiveis.map((pessoa, indice) => (
                        <Avatar
                            key={pessoa.playerId}
                            name={pessoa.name}
                            size={30}
                            style={{
                                marginLeft: indice === 0 ? 0 : -10,
                                borderWidth: 2,
                                borderColor: colors.canvas,
                            }}
                        />
                    ))}

                    {extras > 0 ? (
                        <View style={styles.extras}>
                            <Text style={[type.labelTab, styles.extrasTexto]}>
                                +{extras}
                            </Text>
                        </View>
                    ) : null}
                </View>

                <Text style={[type.corpoSm, styles.meta]}>
                    {game.attendees.length} de {game.spots} confirmados ·{" "}
                    {SKILL_LABEL[game.level]}
                </Text>
            </View>

            {aviso ? (
                <Text style={[type.corpoSm, styles.aviso]}>{aviso}</Text>
            ) : null}

            <View style={styles.acoes}>
                <Pressable
                    style={[
                        styles.cta,
                        (travado || isJoined) && styles.ctaNeutro,
                    ]}
                    disabled={travado || ocupado}
                    onPress={onToggleJoin}
                >
                    <Text
                        style={[
                            type.botaoSheet,
                            travado || isJoined
                                ? styles.ctaNeutroTexto
                                : styles.ctaTexto,
                        ]}
                    >
                        {rotulo}
                    </Text>
                </Pressable>

                <Pressable
                    style={styles.quadrado}
                    onPress={() => shareInvite(inviteText(game))}
                >
                    <Icon name="compartilhar" size={20} color={colors.ink} />
                </Pressable>

                <Pressable style={styles.quadrado} onPress={onOpen}>
                    <View style={styles.chevron}>
                        <Icon name="chevron" size={20} color={colors.ink} />
                    </View>
                </Pressable>
            </View>

            <Pressable style={styles.fechar} onPress={onClose} hitSlop={8}>
                <Text style={[type.labelTab, styles.fecharTexto]}>Fechar</Text>
            </Pressable>
        </View>
    );
}

const criarEstilos = (c: Palette) =>
    StyleSheet.create({
    sheet: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        padding: spacing.xl,
        paddingBottom: spacing.md,
        gap: spacing.lg,
        borderTopLeftRadius: radius.sheet,
        borderTopRightRadius: radius.sheet,
        backgroundColor: c.canvas,
        ...shadow.sheet,
    },
    topo: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: spacing.lg,
    },
    identidade: {
        flex: 1,
        gap: spacing.xs,
    },
    status: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
    },
    ponto: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: c.primary,
    },
    statusTexto: {
        color: c.primary,
    },
    nome: {
        color: c.ink,
    },
    meta: {
        color: c.body,
    },
    placarBloco: {
        alignItems: "flex-end",
    },
    placar: {
        color: c.ink,
    },
    placarRotulo: {
        color: c.mute,
    },
    presenca: {
        gap: spacing.sm,
    },
    pilha: {
        flexDirection: "row",
        alignItems: "center",
    },
    extras: {
        width: 30,
        height: 30,
        marginLeft: -10,
        borderRadius: 15,
        borderWidth: 2,
        borderColor: c.canvas,
        backgroundColor: c.ink,
        alignItems: "center",
        justifyContent: "center",
    },
    extrasTexto: {
        color: c.canvas,
    },
    acoes: {
        flexDirection: "row",
        gap: spacing.sm,
    },
    cta: {
        flex: 1,
        height: size.sheetButton,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: radius.sm,
        backgroundColor: c.primary,
    },
    ctaNeutro: {
        backgroundColor: c.canvasSoft,
    },
    ctaTexto: {
        color: c.onPrimary,
    },
    ctaNeutroTexto: {
        color: c.ink,
    },
    aviso: {
        color: c.primary,
        marginTop: spacing.sm,
    },
    quadrado: {
        width: size.sheetButton,
        height: size.sheetButton,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: radius.sm,
        borderWidth: 1,
        borderColor: c.chipBorder,
    },
    chevron: {
        transform: [{ rotate: "180deg" }],
    },
    fechar: {
        alignSelf: "center",
        paddingVertical: spacing.xs,
    },
    fecharTexto: {
        color: c.mute,
    },
});
