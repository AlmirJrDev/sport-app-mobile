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

import { mostrarToast } from "../../src/components/Toast";
import { Avatar } from "../../src/design/pieces";
import { useTheme, useThemedStyles } from "../../src/design/theme";
import {
    radius,
    spacing,
    type,
    type Palette,
} from "../../src/design/tokens";
import { listFriends, type Friend } from "../../src/friends/remote";
import { getPlayer } from "../../src/player/identity";
import {
    deleteTeam,
    getTeam,
    invitePlayer,
    leaveTeam,
    type Team,
} from "../../src/teams/remote";

export default function TimeScreen() {
    const { colors } = useTheme();
    const styles = useThemedStyles(criarEstilos);
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();

    const [time, setTime] = useState<Team | null>(null);
    const [euId, setEuId] = useState<string | null>(null);
    const [amigos, setAmigos] = useState<Friend[]>([]);
    const [convidando, setConvidando] = useState(false);
    const [carregando, setCarregando] = useState(true);
    const [ocupado, setOcupado] = useState(false);

    const carregar = useCallback(async () => {
        const [encontrado, eu] = await Promise.all([
            getTeam(id),
            getPlayer().catch(() => null),
        ]);

        setTime(encontrado);
        setEuId(eu?.id ?? null);
        setCarregando(false);
    }, [id]);

    useEffect(() => {
        carregar();
    }, [carregar]);

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

    if (!time) {
        return (
            <View style={styles.centro}>
                <Text style={[type.corpo, styles.vazio]}>
                    Time não encontrado.
                </Text>
            </View>
        );
    }

    const souDono = euId !== null && time.creatorId === euId;
    const jaNoTime = (amigoId: string) =>
        time.members.some((membro) => membro.id === amigoId);

    const abrirConvite = async () => {
        setConvidando(true);

        if (amigos.length === 0) {
            setAmigos(await listFriends().catch(() => []));
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.conteudo}>
            <View style={styles.capa}>
                <Text style={[type.tituloTela, styles.nome]}>{time.name}</Text>
                <Text style={[type.metadado, styles.detalhe]}>
                    {time.membersCount === 1
                        ? "1 pessoa"
                        : `${time.membersCount} pessoas`}
                </Text>
            </View>

            <View style={styles.secao}>
                <Text style={[type.labelCampo, styles.titulo]}>Quem está</Text>

                {time.members.map((membro) => (
                    <Pressable
                        style={styles.linha}
                        key={membro.id}
                        disabled={membro.id === euId}
                        onPress={() => router.push(`/atleta/${membro.id}`)}
                    >
                        <Avatar name={membro.name} size={40} />

                        <View style={styles.texto}>
                            <Text style={[type.nomeLista, styles.nomeLinha]}>
                                {membro.id === euId
                                    ? `${membro.name} · você`
                                    : membro.name}
                            </Text>
                            {membro.detail ? (
                                <Text style={[type.metadado, styles.detalhe]}>
                                    {membro.detail}
                                </Text>
                            ) : null}
                        </View>

                        {membro.dono ? (
                            <Text style={[type.labelTab, styles.dono]}>
                                dono
                            </Text>
                        ) : null}
                    </Pressable>
                ))}
            </View>

            {convidando ? (
                <View style={styles.secao}>
                    <Text style={[type.labelCampo, styles.titulo]}>
                        Chamar um amigo
                    </Text>

                    {amigos.length === 0 ? (
                        <Text style={[type.corpoSm, styles.vazio]}>
                            Você ainda não tem amigos no app. Adicione alguém no
                            perfil dele primeiro.
                        </Text>
                    ) : (
                        amigos.map((amigo) => (
                            <View style={styles.linha} key={amigo.id}>
                                <Avatar name={amigo.name} size={40} />

                                <View style={styles.texto}>
                                    <Text
                                        style={[type.nomeLista, styles.nomeLinha]}
                                    >
                                        {amigo.name}
                                    </Text>
                                </View>

                                {jaNoTime(amigo.id) ? (
                                    <Text
                                        style={[type.labelTab, styles.dono]}
                                    >
                                        já está
                                    </Text>
                                ) : (
                                    <Pressable
                                        style={styles.convidar}
                                        disabled={ocupado}
                                        onPress={() =>
                                            agir(
                                                () =>
                                                    invitePlayer(
                                                        time.id,
                                                        amigo.id,
                                                    ),
                                                `Convite enviado para ${amigo.name}.`,
                                            )
                                        }
                                    >
                                        <Text
                                            style={[
                                                type.labelTab,
                                                styles.convidarTexto,
                                            ]}
                                        >
                                            Convidar
                                        </Text>
                                    </Pressable>
                                )}
                            </View>
                        ))
                    )}

                    <Pressable
                        style={styles.fechar}
                        onPress={() => setConvidando(false)}
                    >
                        <Text style={[type.labelCampo, styles.fecharTexto]}>
                            Fechar
                        </Text>
                    </Pressable>
                </View>
            ) : (
                <Pressable style={styles.principal} onPress={abrirConvite}>
                    <Text style={[type.botao, styles.principalTexto]}>
                        Chamar gente para o time
                    </Text>
                </Pressable>
            )}

            <Pressable
                style={styles.sair}
                disabled={ocupado}
                onPress={() =>
                    agir(
                        () =>
                            souDono ? deleteTeam(time.id) : leaveTeam(time.id),
                        souDono ? "Time desfeito." : "Você saiu do time.",
                    ).then(() => router.back())
                }
            >
                <Text style={[type.labelCampo, styles.sairTexto]}>
                    {souDono ? "Desfazer o time" : "Sair do time"}
                </Text>
            </Pressable>
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
            padding: spacing.xl,
            backgroundColor: c.canvas,
        },
        capa: {
            gap: spacing.xxs,
        },
        nome: {
            color: c.ink,
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
            padding: spacing.md,
            borderRadius: radius.md,
            backgroundColor: c.canvasSoft,
        },
        texto: {
            flex: 1,
            gap: spacing.xxs,
        },
        nomeLinha: {
            color: c.ink,
        },
        detalhe: {
            color: c.mute,
        },
        dono: {
            color: c.mute,
        },
        convidar: {
            paddingVertical: spacing.xs,
            paddingHorizontal: spacing.md,
            borderRadius: radius.pill,
            backgroundColor: c.primary,
        },
        convidarTexto: {
            color: c.onPrimary,
        },
        principal: {
            height: 52,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: radius.sm,
            backgroundColor: c.primary,
        },
        principalTexto: {
            color: c.onPrimary,
        },
        fechar: {
            alignSelf: "center",
            paddingVertical: spacing.sm,
        },
        fecharTexto: {
            color: c.mute,
        },
        sair: {
            alignSelf: "center",
            paddingVertical: spacing.sm,
        },
        sairTexto: {
            color: c.mute,
        },
    });
