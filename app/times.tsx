import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { mostrarToast } from "../src/components/Toast";
import { useTheme, useThemedStyles } from "../src/design/theme";
import { radius, spacing, type, type Palette } from "../src/design/tokens";
import {
    acceptInvitation,
    createTeam,
    listMyInvitations,
    listMyTeams,
    rejectInvitation,
    type Team,
    type TeamInvitation,
} from "../src/teams/remote";

export default function TimesScreen() {
    const { colors } = useTheme();
    const styles = useThemedStyles(criarEstilos);
    const router = useRouter();

    const [times, setTimes] = useState<Team[]>([]);
    const [convites, setConvites] = useState<TeamInvitation[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [criando, setCriando] = useState(false);
    const [nome, setNome] = useState("");
    const [ocupado, setOcupado] = useState(false);

    const carregar = useCallback(async () => {
        const [lista, pedidos] = await Promise.all([
            listMyTeams().catch(() => [] as Team[]),
            listMyInvitations().catch(() => [] as TeamInvitation[]),
        ]);

        setTimes(lista);
        setConvites(pedidos);
        setCarregando(false);
    }, []);

    useFocusEffect(
        useCallback(() => {
            carregar();
        }, [carregar]),
    );

    const agir = async (acao: () => Promise<unknown>, recado: string) => {
        setOcupado(true);

        try {
            await acao();
            mostrarToast(recado);
            await carregar();
        } catch (raw) {
            mostrarToast(
                raw instanceof Error ? raw.message : "Não deu para fazer isso.",
                "erro",
            );
        } finally {
            setOcupado(false);
        }
    };

    if (carregando) {
        return (
            <View style={styles.centro}>
                <ActivityIndicator color={colors.ink} />
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.conteudo}>
            {convites.length > 0 ? (
                <View style={styles.secao}>
                    <Text style={[type.labelCampo, styles.titulo]}>
                        Convites para você
                    </Text>

                    {convites.map((convite) => (
                        <View style={styles.linha} key={convite.id}>
                            <View style={styles.texto}>
                                <Text style={[type.nomeLista, styles.nome]}>
                                    {convite.teamName}
                                </Text>
                                <Text style={[type.metadado, styles.detalhe]}>
                                    convite de {convite.de}
                                </Text>
                            </View>

                            <View style={styles.acoes}>
                                <Pressable
                                    style={styles.aceitar}
                                    disabled={ocupado}
                                    onPress={() =>
                                        agir(
                                            () => acceptInvitation(convite.id),
                                            `Você entrou no ${convite.teamName}.`,
                                        )
                                    }
                                >
                                    <Text
                                        style={[type.labelTab, styles.aceitarTexto]}
                                    >
                                        Entrar
                                    </Text>
                                </Pressable>

                                <Pressable
                                    style={styles.recusar}
                                    disabled={ocupado}
                                    onPress={() =>
                                        agir(
                                            () => rejectInvitation(convite.id),
                                            "Convite recusado.",
                                        )
                                    }
                                >
                                    <Text
                                        style={[type.labelTab, styles.recusarTexto]}
                                    >
                                        Recusar
                                    </Text>
                                </Pressable>
                            </View>
                        </View>
                    ))}
                </View>
            ) : null}

            <View style={styles.secao}>
                <Text style={[type.labelCampo, styles.titulo]}>
                    {times.length === 1 ? "1 time" : `${times.length} times`}
                </Text>

                {times.length === 0 ? (
                    <Text style={[type.corpoSm, styles.vazio]}>
                        Um time é a sua panela fixa: a galera que joga junto toda
                        semana.
                    </Text>
                ) : (
                    times.map((time) => (
                        <Pressable
                            style={styles.linha}
                            key={time.id}
                            onPress={() => router.push(`/time/${time.id}`)}
                        >
                            <View style={styles.texto}>
                                <Text style={[type.nomeLista, styles.nome]}>
                                    {time.name}
                                </Text>
                                <Text style={[type.metadado, styles.detalhe]}>
                                    {time.membersCount === 1
                                        ? "1 pessoa"
                                        : `${time.membersCount} pessoas`}
                                </Text>
                            </View>
                        </Pressable>
                    ))
                )}
            </View>

            {criando ? (
                <View style={styles.criar}>
                    <Text style={[type.labelCampo, styles.titulo]}>
                        Nome do time
                    </Text>

                    <TextInput
                        style={[type.valorCampo, styles.campo]}
                        value={nome}
                        onChangeText={setNome}
                        placeholder="Panela da Facul"
                        placeholderTextColor={colors.mute}
                        maxLength={60}
                    />

                    <View style={styles.botoes}>
                        <Pressable
                            style={styles.voltar}
                            disabled={ocupado}
                            onPress={() => {
                                setCriando(false);
                                setNome("");
                            }}
                        >
                            <Text style={[type.labelCampo, styles.voltarTexto]}>
                                Cancelar
                            </Text>
                        </Pressable>

                        <Pressable
                            style={[
                                styles.confirmar,
                                nome.trim().length < 2 && styles.travado,
                            ]}
                            disabled={ocupado || nome.trim().length < 2}
                            onPress={() =>
                                agir(async () => {
                                    const time = await createTeam(nome);

                                    setCriando(false);
                                    setNome("");
                                    router.push(`/time/${time.id}`);
                                }, "Time criado.")
                            }
                        >
                            <Text
                                style={[type.labelCampo, styles.confirmarTexto]}
                            >
                                {ocupado ? "Criando…" : "Criar time"}
                            </Text>
                        </Pressable>
                    </View>
                </View>
            ) : (
                <Pressable
                    style={styles.novo}
                    onPress={() => setCriando(true)}
                >
                    <Text style={[type.botao, styles.novoTexto]}>
                        Criar um time
                    </Text>
                </Pressable>
            )}
        </ScrollView>
    );
}

const criarEstilos = (c: Palette) =>
    StyleSheet.create({
        conteudo: {
            padding: spacing.xl,
            paddingBottom: spacing.xxxl,
            gap: spacing.xxl,
        },
        centro: {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: c.canvas,
        },
        secao: {
            gap: spacing.md,
        },
        titulo: {
            color: c.mute,
        },
        vazio: {
            color: c.body,
        },
        linha: {
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.md,
            padding: spacing.lg,
            borderRadius: radius.md,
            backgroundColor: c.canvasSoft,
        },
        texto: {
            flex: 1,
            gap: spacing.xxs,
        },
        nome: {
            color: c.ink,
        },
        detalhe: {
            color: c.mute,
        },
        acoes: {
            gap: spacing.xs,
        },
        aceitar: {
            paddingVertical: spacing.xs,
            paddingHorizontal: spacing.md,
            borderRadius: radius.pill,
            backgroundColor: c.primary,
        },
        aceitarTexto: {
            color: c.onPrimary,
        },
        recusar: {
            paddingVertical: spacing.xs,
            paddingHorizontal: spacing.md,
            borderRadius: radius.pill,
            borderWidth: 1,
            borderColor: c.chipBorder,
        },
        recusarTexto: {
            color: c.body,
        },
        criar: {
            gap: spacing.md,
        },
        campo: {
            minHeight: 52,
            paddingHorizontal: spacing.lg,
            borderRadius: radius.sm,
            borderWidth: 1,
            borderColor: c.line,
            color: c.ink,
        },
        botoes: {
            flexDirection: "row",
            gap: spacing.sm,
        },
        voltar: {
            flex: 1,
            height: 48,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: radius.sm,
            borderWidth: 1,
            borderColor: c.chipBorder,
        },
        voltarTexto: {
            color: c.ink,
        },
        confirmar: {
            flex: 1,
            height: 48,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: radius.sm,
            backgroundColor: c.primary,
        },
        travado: {
            opacity: 0.5,
        },
        confirmarTexto: {
            color: c.onPrimary,
        },
        novo: {
            height: 52,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: radius.sm,
            borderWidth: 1,
            borderColor: c.chipBorder,
        },
        novoTexto: {
            color: c.ink,
        },
    });
