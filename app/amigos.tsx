import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import {
    ActivityIndicator,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { mostrarToast } from "../src/components/Toast";
import { Avatar } from "../src/design/pieces";
import { useTheme, useThemedStyles } from "../src/design/theme";
import { radius, spacing, type, type Palette } from "../src/design/tokens";
import {
    acceptFriend,
    cancelFriend,
    listFriends,
    listReceivedRequests,
    listSentRequests,
    rejectFriend,
    type Friend,
} from "../src/friends/remote";

export default function AmigosScreen() {
    const { colors } = useTheme();
    const styles = useThemedStyles(criarEstilos);
    const router = useRouter();

    const [amigos, setAmigos] = useState<Friend[]>([]);
    const [recebidos, setRecebidos] = useState<Friend[]>([]);
    const [enviados, setEnviados] = useState<Friend[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<string | null>(null);
    const [ocupado, setOcupado] = useState(false);

    const carregar = useCallback(async () => {
        try {
            const [lista, pedidos, mandados] = await Promise.all([
                listFriends(),
                listReceivedRequests(),
                listSentRequests(),
            ]);

            setAmigos(lista);
            setRecebidos(pedidos);
            setEnviados(mandados);
            setErro(null);
        } catch {
            setErro("Não deu para carregar seus amigos agora.");
        } finally {
            setCarregando(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            carregar();
        }, [carregar]),
    );

    const agir = async (acao: () => Promise<void>, recado: string) => {
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

    const Linha = ({
        pessoa,
        children,
    }: {
        pessoa: Friend;
        children?: React.ReactNode;
    }) => (
        <Pressable
            style={styles.linha}
            onPress={() => router.push(`/atleta/${pessoa.id}`)}
        >
            {pessoa.avatarUrl ? (
                <Image source={{ uri: pessoa.avatarUrl }} style={styles.foto} />
            ) : (
                <Avatar name={pessoa.name} size={44} />
            )}

            <View style={styles.texto}>
                <Text style={[type.nomeLista, styles.nome]}>{pessoa.name}</Text>
                {pessoa.detail ? (
                    <Text style={[type.metadado, styles.detalhe]}>
                        {pessoa.detail}
                    </Text>
                ) : null}
            </View>

            {children}
        </Pressable>
    );

    return (
        <ScrollView contentContainerStyle={styles.conteudo}>
            {erro ? (
                <Text style={[type.corpoSm, styles.erro]}>{erro}</Text>
            ) : null}

            {recebidos.length > 0 ? (
                <View style={styles.secao}>
                    <Text style={[type.labelCampo, styles.titulo]}>
                        Pedidos para você
                    </Text>

                    {recebidos.map((pessoa) => (
                        <Linha pessoa={pessoa} key={pessoa.friendshipId}>
                            <View style={styles.acoes}>
                                <Pressable
                                    style={styles.aceitar}
                                    disabled={ocupado}
                                    onPress={() =>
                                        agir(
                                            () =>
                                                acceptFriend(
                                                    pessoa.friendshipId,
                                                ),
                                            `${pessoa.name} agora é seu amigo.`,
                                        )
                                    }
                                >
                                    <Text
                                        style={[type.labelTab, styles.aceitarTexto]}
                                    >
                                        Aceitar
                                    </Text>
                                </Pressable>

                                <Pressable
                                    style={styles.recusar}
                                    disabled={ocupado}
                                    onPress={() =>
                                        agir(
                                            () =>
                                                rejectFriend(
                                                    pessoa.friendshipId,
                                                ),
                                            "Pedido recusado.",
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
                        </Linha>
                    ))}
                </View>
            ) : null}

            <View style={styles.secao}>
                <Text style={[type.labelCampo, styles.titulo]}>
                    {amigos.length === 1
                        ? "1 amigo"
                        : `${amigos.length} amigos`}
                </Text>

                {amigos.length === 0 ? (
                    <Text style={[type.corpoSm, styles.vazio]}>
                        Ainda sem amigos por aqui. Abra o perfil de alguém que
                        jogou com você e toque em adicionar.
                    </Text>
                ) : (
                    amigos.map((pessoa) => (
                        <Linha pessoa={pessoa} key={pessoa.friendshipId}>
                            <Pressable
                                style={styles.desfazer}
                                disabled={ocupado}
                                onPress={() =>
                                    agir(
                                        () => cancelFriend(pessoa.friendshipId),
                                        "Amizade desfeita.",
                                    )
                                }
                            >
                                <Text style={[type.labelTab, styles.desfazerTexto]}>
                                    Desfazer
                                </Text>
                            </Pressable>
                        </Linha>
                    ))
                )}
            </View>

            {enviados.length > 0 ? (
                <View style={styles.secao}>
                    <Text style={[type.labelCampo, styles.titulo]}>
                        Pedidos enviados
                    </Text>

                    {enviados.map((pessoa) => (
                        <Linha pessoa={pessoa} key={pessoa.friendshipId}>
                            <Pressable
                                style={styles.desfazer}
                                disabled={ocupado}
                                onPress={() =>
                                    agir(
                                        () => cancelFriend(pessoa.friendshipId),
                                        "Pedido cancelado.",
                                    )
                                }
                            >
                                <Text style={[type.labelTab, styles.desfazerTexto]}>
                                    Cancelar
                                </Text>
                            </Pressable>
                        </Linha>
                    ))}
                </View>
            ) : null}
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
        erro: {
            color: c.primary,
        },
        linha: {
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.md,
            padding: spacing.md,
            borderRadius: radius.md,
            backgroundColor: c.canvasSoft,
        },
        foto: {
            width: 44,
            height: 44,
            borderRadius: 22,
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
        desfazer: {
            paddingVertical: spacing.xs,
            paddingHorizontal: spacing.md,
            borderRadius: radius.pill,
            borderWidth: 1,
            borderColor: c.chipBorder,
        },
        desfazerTexto: {
            color: c.body,
        },
    });
