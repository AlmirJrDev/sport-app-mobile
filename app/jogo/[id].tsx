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
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
    addPoints,
    cancelGame,
    deleteGame,
    finishGame,
    getGame,
    toggleArrival,
    toggleAttendance,
} from "../../src/games/service";
import { Icon } from "../../src/design/icons";
import { Avatar, Stripes } from "../../src/design/pieces";
import { useTheme, useThemedStyles } from "../../src/design/theme";
import {
    radius,
    size,
    spacing,
    type,
    type Palette,
} from "../../src/design/tokens";
import {
    SKILL_LABEL,
    currentStatus,
    endsAt,
    joinBlockReason,
    type Game,
} from "../../src/games/types";
import { addToCalendar } from "../../src/calendar/addToCalendar";
import { inviteText } from "../../src/share/invite";
import { shareInvite } from "../../src/share/share";
import { getPlayer } from "../../src/player/identity";

const diaHora = new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
});

const hora = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
});

const POINT_STEPS = [1, 2, 3];

export default function GameScreen() {
    const { colors } = useTheme();
    const styles = useThemedStyles(criarEstilos);
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const insets = useSafeAreaInsets();

    const [game, setGame] = useState<Game | null>(null);
    const [playerId, setPlayerId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [avisoAcao, setAvisoAcao] = useState<string | null>(null);

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
            <View style={styles.centro}>
                <ActivityIndicator color={colors.ink} />
            </View>
        );
    }

    if (!game) {
        return (
            <View style={styles.centro}>
                <Text style={[type.corpo, styles.centroTexto]}>
                    Jogo não encontrado.
                </Text>
            </View>
        );
    }

    const me = game.attendees.find((one) => one.playerId === playerId);
    const chegaram = game.attendees.filter((one) => one.arrived).length;
    const isFull = game.attendees.length >= game.spots && !me;
    const situacao = currentStatus(game);
    const isFinished = situacao === "encerrado";
    const isCancelled = situacao === "cancelado";
    const aoVivo = situacao === "em-andamento";
    const isOwner = game.ownerId === playerId;
    const bloqueio = me ? null : joinBlockReason(game);
    const travado = isFull || bloqueio !== null;
    const chegadaTravada = game.source === "api" && Boolean(me?.arrived);
    const livres = Math.max(0, game.spots - game.attendees.length);
    const preenchido = Math.min(
        1,
        game.spots > 0 ? game.attendees.length / game.spots : 0,
    );

    const run = async (action: Promise<Game | null>) => {
        setAvisoAcao(null);

        try {
            const updated = await action;

            if (updated) {
                setGame(updated);
            }
        } catch (raw) {
            setAvisoAcao(
                raw instanceof Error
                    ? raw.message
                    : "Não deu para fazer isso agora.",
            );
        }
    };

    return (
        <View style={styles.tela}>
            <ScrollView contentContainerStyle={styles.conteudo}>
                <View
                    style={[
                        styles.hero,
                        { paddingTop: insets.top + spacing.md },
                    ]}
                >
                    <Stripes caption="foto da quadra" rounded={0} style={StyleSheet.absoluteFill} />

                    <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
                        <Defs>
                            <LinearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
                                <Stop offset="0" stopColor="#0E0B09" stopOpacity="0.5" />
                                <Stop offset="0.4" stopColor="#0E0B09" stopOpacity="0" />
                                <Stop offset="1" stopColor="#0E0B09" stopOpacity="0.78" />
                            </LinearGradient>
                        </Defs>
                        <Rect width="100%" height="100%" fill="url(#fade)" />
                    </Svg>

                    <View style={styles.heroTopo}>
                        <Pressable
                            style={styles.voltar}
                            onPress={() => router.back()}
                        >
                            <Icon
                                name="chevron"
                                size={20}
                                color={colors.header}
                            />
                        </Pressable>

                        <Pressable
                            style={styles.convite}
                            onPress={() => shareInvite(inviteText(game))}
                        >
                            <Icon
                                name="compartilhar"
                                size={18}
                                color={colors.header}
                            />
                            <Text style={[type.labelCampo, styles.conviteTexto]}>
                                Convidar
                            </Text>
                        </Pressable>
                    </View>

                    <View style={styles.heroRodape}>
                        <View style={styles.heroChips}>
                            <View style={styles.chipStatus}>
                                <Text
                                    style={[type.eyebrow, styles.chipStatusTexto]}
                                >
                                    {isCancelled
                                        ? "Cancelado"
                                        : isFinished
                                          ? "Encerrado"
                                          : aoVivo
                                            ? "Ao vivo"
                                            : "Aberto"}
                                </Text>
                            </View>

                            <View style={styles.chipEsporte}>
                                <Text
                                    style={[
                                        type.eyebrow,
                                        styles.chipEsporteTexto,
                                    ]}
                                >
                                    {game.sport} {game.modality}
                                </Text>
                            </View>
                        </View>

                        <Text style={[type.tituloHero, styles.heroTitulo]}>
                            {game.placeName}
                        </Text>
                    </View>
                </View>

                <View style={styles.corpo}>
                    <View style={styles.grade}>
                        <View style={styles.cardGrade}>
                            <Text style={[type.labelCampo, styles.rotulo]}>
                                Começa
                            </Text>
                            <Text style={[type.statCard, styles.valor]}>
                                {diaHora.format(new Date(game.startsAt))}
                            </Text>
                            <Text style={[type.metadado, styles.nota]}>
                                até {hora.format(endsAt(game))} ·{" "}
                                {game.durationMinutes} min
                            </Text>
                        </View>

                        <View style={styles.cardGrade}>
                            <Text style={[type.labelCampo, styles.rotulo]}>
                                Nível
                            </Text>
                            <Text style={[type.statCard, styles.valor]}>
                                {SKILL_LABEL[game.level]}
                            </Text>
                            {game.creatorName ? (
                                <Text style={[type.metadado, styles.nota]}>
                                    por {game.creatorName}
                                </Text>
                            ) : null}
                        </View>
                    </View>

                    <View style={styles.bloco}>
                        <View style={styles.blocoTopo}>
                            <Text style={[type.labelCampo, styles.rotulo]}>
                                Vagas
                            </Text>
                            <Text style={[type.statMd, styles.valor]}>
                                {game.attendees.length} / {game.spots}
                            </Text>
                        </View>

                        <View style={styles.trilha}>
                            <View
                                style={[
                                    styles.trilhaFill,
                                    { width: `${preenchido * 100}%` },
                                ]}
                            />
                        </View>

                        <Text style={[type.metadado, styles.nota]}>
                            {livres === 0
                                ? "Quadra cheia — entre na fila de espera"
                                : `${livres} ${livres === 1 ? "vaga livre" : "vagas livres"} · ${chegaram} já na quadra`}
                        </Text>
                    </View>

                    <View style={styles.bloco}>
                        <Text style={[type.labelCampo, styles.rotulo]}>
                            Placar
                        </Text>

                        <View style={styles.placar}>
                            {(["home", "away"] as const).map((lado) => (
                                <View style={styles.time} key={lado}>
                                    <Text
                                        style={[type.labelTab, styles.timeNome]}
                                    >
                                        {lado === "home" ? "Time A" : "Time B"}
                                    </Text>

                                    <Text
                                        style={[type.placar, styles.timePlacar]}
                                    >
                                        {game.score[lado]}
                                    </Text>

                                    <View style={styles.pontos}>
                                        {POINT_STEPS.map((valor) => (
                                            <Pressable
                                                key={valor}
                                                style={[
                                                    styles.ponto,
                                                    !aoVivo &&
                                                        styles.pontoTravado,
                                                ]}
                                                disabled={!aoVivo}
                                                onPress={() =>
                                                    run(
                                                        addPoints(
                                                            game.id,
                                                            lado,
                                                            valor,
                                                        ),
                                                    )
                                                }
                                            >
                                                <Text
                                                    style={[
                                                        type.labelTab,
                                                        aoVivo
                                                            ? styles.pontoTexto
                                                            : styles.pontoTextoTravado,
                                                    ]}
                                                >
                                                    +{valor}
                                                </Text>
                                            </Pressable>
                                        ))}
                                    </View>

                                    <Pressable
                                        disabled={!aoVivo}
                                        onPress={() =>
                                            run(addPoints(game.id, lado, -1))
                                        }
                                    >
                                        <Text
                                            style={[
                                                type.metadado,
                                                styles.desfazer,
                                            ]}
                                        >
                                            −1
                                        </Text>
                                    </Pressable>
                                </View>
                            ))}
                        </View>

                        {!aoVivo && !isFinished && !isCancelled ? (
                            <Text style={[type.metadado, styles.nota]}>
                                O placar abre {hora.format(new Date(game.startsAt))},
                                quando o jogo começa.
                            </Text>
                        ) : null}

                        {isCancelled ? (
                            <Text style={[type.metadado, styles.nota]}>
                                Jogo cancelado por quem marcou.
                            </Text>
                        ) : isFinished ? (
                            <Text style={[type.metadado, styles.nota]}>
                                Jogo encerrado, já saiu do mapa.
                            </Text>
                        ) : game.source === "local" || isOwner ? (
                            <Pressable
                                style={styles.encerrar}
                                onPress={async () => {
                                    const atualizado = await finishGame(game.id);

                                    if (atualizado) {
                                        setGame(atualizado);
                                    } else {
                                        router.back();
                                    }
                                }}
                            >
                                <Text
                                    style={[type.labelCampo, styles.encerrarTexto]}
                                >
                                    Encerrar jogo
                                </Text>
                            </Pressable>
                        ) : null}

                        {isOwner && situacao === "aberto" ? (
                            <Pressable
                                style={styles.cancelar}
                                onPress={async () => {
                                    const atualizado = await cancelGame(game.id);

                                    if (atualizado) {
                                        setGame(atualizado);
                                    } else {
                                        router.back();
                                    }
                                }}
                            >
                                <Text
                                    style={[type.labelCampo, styles.cancelarTexto]}
                                >
                                    Cancelar jogo
                                </Text>
                            </Pressable>
                        ) : null}
                    </View>

                    <View style={styles.bloco}>
                        <Text style={[type.labelCampo, styles.rotulo]}>
                            Confirmados
                        </Text>

                        {game.attendees.length === 0 ? (
                            <Text style={[type.metadado, styles.nota]}>
                                Ninguém confirmou ainda.
                            </Text>
                        ) : (
                            game.attendees.map((pessoa) => (
                                <View style={styles.pessoa} key={pessoa.playerId}>
                                    <Avatar name={pessoa.name} size={40} />

                                    <View style={styles.pessoaTexto}>
                                        <Text
                                            style={[
                                                type.nomeLista,
                                                styles.valor,
                                            ]}
                                        >
                                            {pessoa.playerId === playerId
                                                ? `${pessoa.name} · você`
                                                : pessoa.name}
                                        </Text>
                                        <Text
                                            style={[type.metadado, styles.nota]}
                                        >
                                            {pessoa.arrived
                                                ? "está na quadra"
                                                : "confirmou presença"}
                                        </Text>
                                    </View>

                                    <Text
                                        style={[
                                            type.eyebrow,
                                            pessoa.arrived
                                                ? styles.chegou
                                                : styles.aCaminho,
                                        ]}
                                    >
                                        {pessoa.arrived ? "chegou" : "a caminho"}
                                    </Text>
                                </View>
                            ))
                        )}

                        {me ? (
                            <Pressable
                                style={[
                                    styles.chegada,
                                    chegadaTravada && styles.chegadaTravada,
                                ]}
                                disabled={chegadaTravada}
                                onPress={() => run(toggleArrival(game.id))}
                            >
                                <Text
                                    style={[type.labelCampo, styles.chegadaTexto]}
                                >
                                    {chegadaTravada
                                        ? "Você chegou"
                                        : me.arrived
                                          ? "Não cheguei"
                                          : "Cheguei na quadra"}
                                </Text>
                            </Pressable>
                        ) : null}
                    </View>

                    {isOwner && game.source === "local" ? (
                        <Pressable
                            style={styles.apagar}
                            onPress={async () => {
                                await deleteGame(game.id);
                                router.back();
                            }}
                        >
                            <Text style={[type.labelCampo, styles.apagarTexto]}>
                                Cancelar e apagar marcação
                            </Text>
                        </Pressable>
                    ) : null}
                </View>
            </ScrollView>

            <View style={styles.rodape}>
                {avisoAcao ? (
                    <Text style={[type.metadado, styles.rodapeAviso]}>
                        {avisoAcao}
                    </Text>
                ) : null}

                <View style={styles.rodapeLinha}>
                    <Pressable
                        style={[
                            styles.cta,
                            (travado || Boolean(me)) && styles.ctaNeutro,
                        ]}
                        disabled={travado}
                        onPress={() => run(toggleAttendance(game.id))}
                    >
                        <Text
                            style={[
                                type.botao,
                                travado || me
                                    ? styles.ctaNeutroTexto
                                    : styles.ctaTexto,
                            ]}
                        >
                            {bloqueio
                                ? bloqueio
                                : isFull
                                  ? "Sem vagas"
                                  : me
                                    ? "Cancelar presença"
                                    : "Confirmar presença"}
                        </Text>
                    </Pressable>

                    <Pressable
                        style={styles.calendario}
                        onPress={() => addToCalendar(game)}
                    >
                        <Icon name="calendario" size={22} color={colors.ink} />
                    </Pressable>
                </View>
            </View>
        </View>
    );
}

const criarEstilos = (c: Palette) =>
    StyleSheet.create({
    tela: {
        flex: 1,
        backgroundColor: c.canvas,
    },
    conteudo: {
        paddingBottom: spacing.xl,
    },
    centro: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: spacing.xl,
        backgroundColor: c.canvas,
    },
    centroTexto: {
        color: c.body,
    },
    hero: {
        height: 250,
        justifyContent: "space-between",
        padding: spacing.lg,
        overflow: "hidden",
    },
    heroTopo: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    voltar: {
        width: size.backButton,
        height: size.backButton,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: size.backButton / 2,
        backgroundColor: "rgba(255,254,251,0.92)",
    },
    convite: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
        height: size.backButton,
        paddingHorizontal: spacing.lg,
        borderRadius: size.backButton / 2,
        backgroundColor: "rgba(255,254,251,0.92)",
    },
    conviteTexto: {
        color: c.header,
    },
    heroRodape: {
        gap: spacing.sm,
    },
    heroChips: {
        flexDirection: "row",
        gap: spacing.sm,
    },
    chipStatus: {
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.md,
        borderRadius: radius.pill,
        backgroundColor: c.primary,
    },
    chipStatusTexto: {
        color: c.onPrimary,
    },
    chipEsporte: {
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.md,
        borderRadius: radius.pill,
        backgroundColor: "rgba(255,254,251,0.22)",
    },
    chipEsporteTexto: {
        color: c.onPrimary,
    },
    heroTitulo: {
        color: c.onPrimary,
    },
    corpo: {
        padding: spacing.xl,
        gap: spacing.xxl,
    },
    grade: {
        flexDirection: "row",
        gap: spacing.md,
    },
    cardGrade: {
        flex: 1,
        gap: spacing.xs,
        padding: spacing.lg,
        borderRadius: radius.md,
        backgroundColor: c.canvasSoft,
    },
    bloco: {
        gap: spacing.md,
    },
    blocoTopo: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    rotulo: {
        color: c.mute,
    },
    valor: {
        color: c.ink,
    },
    nota: {
        color: c.body,
    },
    trilha: {
        height: 8,
        borderRadius: 4,
        backgroundColor: c.line,
        overflow: "hidden",
    },
    trilhaFill: {
        height: 8,
        borderRadius: 4,
        backgroundColor: c.primary,
    },
    placar: {
        flexDirection: "row",
        gap: spacing.md,
    },
    time: {
        flex: 1,
        alignItems: "center",
        gap: spacing.sm,
        paddingVertical: spacing.lg,
        borderRadius: radius.md,
        backgroundColor: c.canvasSoft,
    },
    timeNome: {
        color: c.mute,
    },
    timePlacar: {
        color: c.ink,
    },
    pontos: {
        flexDirection: "row",
        gap: spacing.xs,
    },
    ponto: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: 10,
        backgroundColor: c.ink,
    },
    pontoTravado: {
        backgroundColor: c.canvasSoft,
    },
    pontoTexto: {
        color: c.canvas,
    },
    pontoTextoTravado: {
        color: c.mute,
    },
    desfazer: {
        color: c.mute,
    },
    encerrar: {
        alignItems: "center",
        paddingVertical: spacing.md,
        borderRadius: radius.sm,
        borderWidth: 1,
        borderColor: c.chipBorder,
    },
    encerrarTexto: {
        color: c.ink,
    },
    cancelar: {
        alignItems: "center",
        paddingVertical: spacing.md,
        borderRadius: radius.sm,
        borderWidth: 1,
        borderColor: "rgba(218,104,13,0.5)",
    },
    cancelarTexto: {
        color: c.primary,
    },
    pessoa: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        paddingVertical: spacing.sm,
    },
    pessoaTexto: {
        flex: 1,
    },
    chegou: {
        color: c.primary,
    },
    aCaminho: {
        color: c.mute,
    },
    chegada: {
        alignItems: "center",
        paddingVertical: spacing.md,
        borderRadius: radius.sm,
        borderWidth: 1,
        borderColor: c.ink,
    },
    chegadaTravada: {
        borderColor: c.chipBorder,
    },
    chegadaTexto: {
        color: c.ink,
    },
    apagar: {
        alignItems: "center",
        paddingVertical: spacing.md,
    },
    apagarTexto: {
        color: c.primary,
    },
    rodape: {
        gap: spacing.sm,
        padding: spacing.lg,
        paddingBottom: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: c.line,
        backgroundColor: c.canvas,
    },
    rodapeLinha: {
        flexDirection: "row",
        gap: spacing.md,
    },
    rodapeAviso: {
        color: c.primary,
    },
    cta: {
        flex: 1,
        height: size.cta,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: radius.sm,
        backgroundColor: c.primary,
    },
    ctaNeutro: {
        backgroundColor: c.canvasSoft,
        borderWidth: 1,
        borderColor: c.line,
    },
    ctaTexto: {
        color: c.onPrimary,
    },
    ctaNeutroTexto: {
        color: c.ink,
    },
    calendario: {
        width: size.cta,
        height: size.cta,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: radius.sm,
        borderWidth: 1,
        borderColor: c.chipBorder,
    },
});
