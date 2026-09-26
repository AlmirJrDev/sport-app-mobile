import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    ActivityIndicator,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { useTheme, useThemedStyles } from "../../src/design/theme";
import {
    radius,
    spacing,
    type,
    type Palette,
} from "../../src/design/tokens";
import CaixaMotivo from "../../src/components/CaixaMotivo";
import {
    acceptFriend,
    addFriend,
    cancelFriend,
    friendshipWith,
    type FriendshipState,
} from "../../src/friends/remote";
import { getPlayer } from "../../src/player/identity";
import { mostrarToast } from "../../src/components/Toast";
import { MOTIVOS_PESSOA, blockUser } from "../../src/moderation/remote";
import { getProfile, type Profile } from "../../src/profile/remote";
import { profileText } from "../../src/share/invite";
import { shareInvite } from "../../src/share/share";

export default function AtletaScreen() {
    const { colors } = useTheme();
    const styles = useThemedStyles(criarEstilos);
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();

    const [perfil, setPerfil] = useState<Profile | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [bloqueando, setBloqueando] = useState(false);
    const [amizade, setAmizade] = useState<FriendshipState | null>(null);
    const [mexendoAmizade, setMexendoAmizade] = useState(false);
    const [souEu, setSouEu] = useState(false);

    useEffect(() => {
        let ativo = true;

        getPlayer()
            .then((eu) => {
                if (!ativo) {
                    return;
                }

                if (eu.id === id) {
                    setSouEu(true);
                    return Promise.resolve(null);
                }

                return friendshipWith(id);
            })
            .then((estado) => {
                if (ativo && estado) {
                    setAmizade(estado);
                }
            })
            .catch(() => {});

        return () => {
            ativo = false;
        };
    }, [id]);

    useEffect(() => {
        getProfile(id).then((encontrado) => {
            setPerfil(encontrado);
            setCarregando(false);
        });
    }, [id]);

    if (carregando) {
        return (
            <View style={styles.centro}>
                <ActivityIndicator color={colors.ink} />
            </View>
        );
    }

    if (!perfil) {
        return (
            <View style={styles.centro}>
                <Text style={[type.headlineSm, styles.titulo]}>
                    Atleta não encontrado
                </Text>
                <Text style={[type.bodySm, styles.texto]}>
                    O link pode estar errado, ou o perfil saiu do ar.
                </Text>
            </View>
        );
    }

    const pediramParaMim =
        amizade?.status === "PENDING" && !amizade.souQuemPediu;

    const rotuloAmizade = mexendoAmizade
        ? "Um instante…"
        : amizade?.status === "ACCEPTED"
          ? "Amigos · desfazer"
          : pediramParaMim
            ? "Aceitar pedido de amizade"
            : amizade?.status === "PENDING"
              ? "Pedido enviado · cancelar"
              : "Adicionar como amigo";

    const mudarAmizade = async () => {
        if (!amizade) {
            return;
        }

        setMexendoAmizade(true);

        try {
            if (amizade.status === "ACCEPTED" || amizade.status === "PENDING") {
                const acao = pediramParaMim ? acceptFriend : cancelFriend;

                await acao(amizade.friendshipId ?? "");
                mostrarToast(
                    pediramParaMim
                        ? "Pedido aceito."
                        : amizade.status === "ACCEPTED"
                          ? "Amizade desfeita."
                          : "Pedido cancelado.",
                );
            } else {
                await addFriend(id);
                mostrarToast("Pedido de amizade enviado.");
            }

            setAmizade(await friendshipWith(id));
        } catch (raw) {
            mostrarToast(
                raw instanceof Error
                    ? raw.message
                    : "Não deu para fazer isso agora.",
                "erro",
            );
        } finally {
            setMexendoAmizade(false);
        }
    };

    const iniciais = perfil.name
        .split(" ")
        .slice(0, 2)
        .map((parte) => parte.slice(0, 1))
        .join("")
        .toUpperCase();

    const etiquetas = [
        perfil.mainSport,
        perfil.city,
        perfil.height
            ? `${(perfil.height / 100).toFixed(2).replace(".", ",")} m`
            : null,
        perfil.weight ? `${perfil.weight} kg` : null,
    ].filter((item): item is string => Boolean(item));

    return (
        <ScrollView contentContainerStyle={styles.conteudo}>
            <View style={styles.capa}>
                {perfil.avatarUrl ? (
                    <Image
                        source={{ uri: perfil.avatarUrl }}
                        style={styles.foto}
                    />
                ) : (
                    <View style={[styles.foto, styles.fotoVazia]}>
                        <Text style={[type.statLg, styles.iniciais]}>
                            {iniciais || "?"}
                        </Text>
                    </View>
                )}

                <Text style={[type.headlineMd, styles.nome]}>
                    {perfil.name || "Atleta"}
                </Text>

                {perfil.bio ? (
                    <Text style={[type.caption, styles.bio]}>{perfil.bio}</Text>
                ) : null}

                {etiquetas.length > 0 ? (
                    <View style={styles.etiquetas}>
                        {etiquetas.map((tag) => (
                            <View key={tag} style={styles.etiqueta}>
                                <Text style={[type.label, styles.etiquetaTexto]}>
                                    {tag}
                                </Text>
                            </View>
                        ))}
                    </View>
                ) : null}
            </View>

            {amizade && !souEu ? (
                <Pressable
                    style={[
                        styles.amizade,
                        amizade.status === "ACCEPTED" && styles.amizadeFeita,
                    ]}
                    disabled={mexendoAmizade}
                    onPress={mudarAmizade}
                >
                    <Text
                        style={[
                            type.label,
                            amizade.status === "ACCEPTED"
                                ? styles.amizadeTextoFeita
                                : styles.amizadeTexto,
                        ]}
                    >
                        {rotuloAmizade}
                    </Text>
                </Pressable>
            ) : null}

            <Pressable
                style={styles.compartilhar}
                onPress={() =>
                    shareInvite(profileText(perfil.name || "Atleta", perfil.id))
                }
            >
                <Text style={[type.label, styles.compartilharTexto]}>
                    Compartilhar este perfil
                </Text>
            </Pressable>

            {bloqueando ? (
                <CaixaMotivo
                    titulo={`Bloquear ${perfil.name || "este atleta"}?`}
                    explicacao="Vocês param de se ver no app: os jogos de um somem para o outro."
                    motivos={MOTIVOS_PESSOA}
                    rotuloEnviar="Bloquear"
                    onCancelar={() => setBloqueando(false)}
                    onEnviar={async (motivo, detalhe) => {
                        await blockUser(
                            perfil.id,
                            detalhe.trim() ? `${motivo}: ${detalhe}` : motivo,
                        );
                        setBloqueando(false);
                        mostrarToast("Pessoa bloqueada.");
                        router.back();
                    }}
                />
            ) : (
                <Pressable
                    style={styles.bloquear}
                    hitSlop={8}
                    onPress={() => setBloqueando(true)}
                >
                    <Text style={[type.label, styles.bloquearTexto]}>
                        Bloquear e denunciar
                    </Text>
                </Pressable>
            )}
        </ScrollView>
    );
}

const criarEstilos = (c: Palette) =>
    StyleSheet.create({
    conteudo: {
        padding: spacing.lg,
        gap: spacing.lg,
    },
    centro: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: spacing.xl,
        gap: spacing.sm,
    },
    titulo: {
        color: c.ink,
    },
    texto: {
        color: c.body,
        textAlign: "center",
    },
    capa: {
        alignItems: "center",
        gap: spacing.sm,
        padding: spacing.xl,
        borderRadius: radius.md,
        backgroundColor: c.canvasSoft,
    },
    foto: {
        width: 112,
        height: 112,
        borderRadius: radius.pill,
        borderWidth: 2,
        borderColor: c.primary,
    },
    fotoVazia: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: c.canvas,
    },
    iniciais: {
        color: c.primary,
    },
    nome: {
        color: c.ink,
        marginTop: spacing.xs,
    },
    bio: {
        color: c.body,
        textAlign: "center",
    },
    etiquetas: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: spacing.sm,
        marginTop: spacing.xs,
    },
    etiqueta: {
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.md,
        borderRadius: radius.pill,
        backgroundColor: c.canvas,
    },
    etiquetaTexto: {
        color: c.body,
    },
    compartilhar: {
        alignItems: "center",
        paddingVertical: spacing.md,
        borderRadius: radius.sm,
        borderWidth: 1,
        borderColor: c.ink,
    },
    compartilharTexto: {
        color: c.ink,
    },
    amizade: {
        alignItems: "center",
        paddingVertical: spacing.md,
        borderRadius: radius.sm,
        backgroundColor: c.primary,
    },
    amizadeFeita: {
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: c.chipBorder,
    },
    amizadeTexto: {
        color: c.onPrimary,
    },
    amizadeTextoFeita: {
        color: c.ink,
    },
    bloquear: {
        alignSelf: "center",
        paddingVertical: spacing.sm,
    },
    bloquearTexto: {
        color: c.mute,
    },
});
