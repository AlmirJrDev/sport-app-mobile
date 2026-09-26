import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme, useThemedStyles } from "../design/theme";
import { radius, spacing, type, type Palette } from "../design/tokens";
import {
    addTeamPoints,
    createDefaultTeams,
    joinGameTeam,
    leaveGameTeam,
    listGameTeams,
    removeTeamPoints,
    type GameTeam,
} from "../games/teams";

const PONTOS = [1, 2, 3];
const INTERVALO = 10000;

interface PlacarProps {
    gameId: string;
    playerId: string | null;
    souParticipante: boolean;
    aoVivo: boolean;
    podeCriar: boolean;
}

export default function Placar({
    gameId,
    playerId,
    souParticipante,
    aoVivo,
    podeCriar,
}: PlacarProps) {
    const { colors } = useTheme();
    const styles = useThemedStyles(criarEstilos);

    const [times, setTimes] = useState<GameTeam[] | null>(null);
    const [erro, setErro] = useState<string | null>(null);
    const [ocupado, setOcupado] = useState(false);

    /** Enquanto alguém marca ponto, o servidor não manda por cima do toque. */
    const mexendo = useRef(false);

    const carregar = useCallback(async () => {
        try {
            const lista = await listGameTeams(gameId);

            if (!mexendo.current) {
                setTimes(lista);
            }
        } catch {
            setTimes((atual) => atual ?? []);
        }
    }, [gameId]);

    useEffect(() => {
        carregar();
    }, [carregar]);

    /** Ao vivo o placar muda na mão de todo mundo, então ele se atualiza sozinho. */
    useEffect(() => {
        if (!aoVivo) {
            return;
        }

        const relogio = setInterval(carregar, INTERVALO);

        return () => clearInterval(relogio);
    }, [aoVivo, carregar]);

    if (times === null) {
        return (
            <View style={styles.bloco}>
                <Text style={[type.labelCampo, styles.rotulo]}>Placar</Text>
                <ActivityIndicator color={colors.mute} />
            </View>
        );
    }

    const agir = async (acao: () => Promise<unknown>) => {
        setErro(null);
        setOcupado(true);
        mexendo.current = true;

        try {
            await acao();
        } catch (raw) {
            setErro(
                raw instanceof Error
                    ? raw.message
                    : "Não deu para atualizar o placar.",
            );
        } finally {
            setOcupado(false);
            mexendo.current = false;
            carregar();
        }
    };

    const pontuar = (time: GameTeam, valor: number) => {
        setTimes((atual) =>
            (atual ?? []).map((item) =>
                item.id === time.id
                    ? { ...item, score: Math.max(0, item.score + valor) }
                    : item,
            ),
        );

        agir(() =>
            valor > 0
                ? addTeamPoints(gameId, time.id, valor)
                : removeTeamPoints(gameId, time.id, Math.abs(valor)),
        );
    };

    if (times.length === 0) {
        return (
            <View style={styles.bloco}>
                <Text style={[type.labelCampo, styles.rotulo]}>Placar</Text>

                {podeCriar ? (
                    <>
                        <Text style={[type.metadado, styles.nota]}>
                            Crie os times para marcar os pontos. Todo mundo no
                            jogo vê o mesmo placar.
                        </Text>

                        <Pressable
                            style={styles.acao}
                            disabled={ocupado}
                            onPress={() =>
                                agir(() => createDefaultTeams(gameId))
                            }
                        >
                            <Text style={[type.labelCampo, styles.acaoTexto]}>
                                {ocupado ? "Criando…" : "Criar Time A e Time B"}
                            </Text>
                        </Pressable>
                    </>
                ) : (
                    <Text style={[type.metadado, styles.nota]}>
                        Quem marcou o jogo ainda não criou os times.
                    </Text>
                )}

                {erro ? (
                    <Text style={[type.metadado, styles.erro]}>{erro}</Text>
                ) : null}
            </View>
        );
    }

    return (
        <View style={styles.bloco}>
            <Text style={[type.labelCampo, styles.rotulo]}>Placar</Text>

            <View style={styles.times}>
                {times.map((time) => {
                    const meuTime = playerId
                        ? time.playerIds.includes(playerId)
                        : false;

                    return (
                        <View style={styles.time} key={time.id}>
                            <Text style={[type.labelTab, styles.timeNome]}>
                                {time.name}
                            </Text>

                            <Text style={[type.placar, styles.timePlacar]}>
                                {time.score}
                            </Text>

                            <Text style={[type.metadado, styles.timeGente]}>
                                {time.playerIds.length === 1
                                    ? "1 jogador"
                                    : `${time.playerIds.length} jogadores`}
                            </Text>

                            {souParticipante ? (
                                <Pressable
                                    style={[
                                        styles.entrar,
                                        meuTime && styles.entrarDentro,
                                    ]}
                                    disabled={ocupado}
                                    onPress={() =>
                                        agir(() =>
                                            meuTime
                                                ? leaveGameTeam(gameId, time.id)
                                                : joinGameTeam(gameId, time.id),
                                        )
                                    }
                                >
                                    <Text
                                        style={[
                                            type.labelTab,
                                            meuTime
                                                ? styles.entrarTextoDentro
                                                : styles.entrarTexto,
                                        ]}
                                    >
                                        {meuTime ? "Seu time" : "Entrar"}
                                    </Text>
                                </Pressable>
                            ) : null}

                            {aoVivo ? (
                                <>
                                    <View style={styles.pontos}>
                                        {PONTOS.map((valor) => (
                                            <Pressable
                                                key={valor}
                                                style={styles.ponto}
                                                onPress={() =>
                                                    pontuar(time, valor)
                                                }
                                            >
                                                <Text
                                                    style={[
                                                        type.labelTab,
                                                        styles.pontoTexto,
                                                    ]}
                                                >
                                                    +{valor}
                                                </Text>
                                            </Pressable>
                                        ))}
                                    </View>

                                    <Pressable
                                        onPress={() => pontuar(time, -1)}
                                        hitSlop={8}
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
                                </>
                            ) : null}
                        </View>
                    );
                })}
            </View>

            {!aoVivo ? (
                <Text style={[type.metadado, styles.nota]}>
                    Os pontos abrem quando o jogo começa.
                </Text>
            ) : null}

            {erro ? (
                <Text style={[type.metadado, styles.erro]}>{erro}</Text>
            ) : null}
        </View>
    );
}

const criarEstilos = (c: Palette) =>
    StyleSheet.create({
        bloco: {
            gap: spacing.md,
        },
        rotulo: {
            color: c.mute,
        },
        nota: {
            color: c.body,
        },
        erro: {
            color: c.primary,
        },
        times: {
            flexDirection: "row",
            gap: spacing.md,
        },
        time: {
            flex: 1,
            alignItems: "center",
            gap: spacing.sm,
            paddingVertical: spacing.lg,
            paddingHorizontal: spacing.sm,
            borderRadius: radius.md,
            backgroundColor: c.canvasSoft,
        },
        timeNome: {
            color: c.mute,
        },
        timePlacar: {
            color: c.ink,
        },
        timeGente: {
            color: c.mute,
        },
        entrar: {
            paddingVertical: spacing.xs,
            paddingHorizontal: spacing.md,
            borderRadius: radius.pill,
            borderWidth: 1,
            borderColor: c.chipBorder,
        },
        entrarDentro: {
            borderColor: "transparent",
            backgroundColor: c.primary,
        },
        entrarTexto: {
            color: c.ink,
        },
        entrarTextoDentro: {
            color: c.onPrimary,
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
        pontoTexto: {
            color: c.canvas,
        },
        desfazer: {
            color: c.mute,
        },
        acao: {
            alignSelf: "flex-start",
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.lg,
            borderRadius: radius.sm,
            borderWidth: 1,
            borderColor: c.chipBorder,
        },
        acaoTexto: {
            color: c.ink,
        },
    });
