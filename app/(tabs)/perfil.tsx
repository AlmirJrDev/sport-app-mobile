import { useEffect, useState } from "react";
import { Redirect, useRouter } from "expo-router";
import {
    ActivityIndicator,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { signOut } from "../../src/auth/account";
import { useSession } from "../../src/auth/useSession";
import MockNotice from "../../src/components/MockNotice";
import { Stripes, initials } from "../../src/design/pieces";
import { useTheme, useThemedStyles } from "../../src/design/theme";
import {
    radius,
    size,
    spacing,
    type,
    type Palette,
} from "../../src/design/tokens";
import {
    ATHLETE_BADGES,
    ATHLETE_RANKINGS,
    ATHLETE_SEASON,
    ATHLETE_STATS,
} from "../../src/mock/athlete";
import { getMyProfile, type Profile } from "../../src/profile/remote";
import { profileText } from "../../src/share/invite";
import { shareInvite } from "../../src/share/share";

const TREND_LABEL = {
    up: "▲",
    down: "▼",
    flat: "—",
};

export default function PerfilScreen() {
    const { colors, mode, setMode } = useTheme();
    const styles = useThemedStyles(criarEstilos);
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { account, loading, reload } = useSession();
    const [perfil, setPerfil] = useState<Profile | null>(null);

    useEffect(() => {
        if (account) {
            getMyProfile().then(setPerfil);
        }
    }, [account?.id]);

    if (loading) {
        return (
            <View style={styles.centro}>
                <ActivityIndicator color={colors.ink} />
            </View>
        );
    }

    if (!account) {
        return <Redirect href="/entrar" />;
    }

    const sair = async () => {
        await signOut();
        reload();
        router.replace("/entrar");
    };

    const nome = perfil?.name || account.name;

    const linha = [
        perfil?.mainSport,
        perfil?.city,
        ATHLETE_SEASON,
    ]
        .filter(Boolean)
        .join(" · ");

    return (
        <ScrollView contentContainerStyle={styles.conteudo}>
            <View style={[styles.header, { paddingTop: insets.top + spacing.xl }]}>
                <View style={styles.brilho} />

                {perfil?.avatarUrl ? (
                    <Image
                        source={{ uri: perfil.avatarUrl }}
                        style={styles.avatar}
                    />
                ) : (
                    <Stripes
                        caption={initials(nome) || "sem foto"}
                        style={styles.avatar}
                        rounded={42}
                    />
                )}

                <Text style={[type.tituloTela, styles.nome]}>{nome}</Text>
                <Text style={[type.metadado, styles.linha]}>
                    {linha || account.email}
                </Text>

                <View style={styles.rankings}>
                    {ATHLETE_RANKINGS.map((item, indice) => (
                        <View key={item.scope} style={styles.rankingCard}>
                            <Text
                                style={[
                                    type.statCard,
                                    indice === 0
                                        ? styles.rankingBranco
                                        : styles.rankingLaranja,
                                ]}
                            >
                                #{item.position} {TREND_LABEL[item.trend]}
                            </Text>
                            <Text style={[type.labelTab, styles.rankingEscopo]}>
                                {item.scope}
                            </Text>
                        </View>
                    ))}
                </View>

                <View style={styles.acoes}>
                    <Pressable
                        style={styles.acao}
                        onPress={() => router.push("/onboarding")}
                    >
                        <Text style={[type.labelCampo, styles.acaoTexto]}>
                            Editar perfil
                        </Text>
                    </Pressable>

                    {perfil ? (
                        <Pressable
                            style={styles.acao}
                            onPress={() =>
                                shareInvite(profileText(nome, perfil.id))
                            }
                        >
                            <Text style={[type.labelCampo, styles.acaoTexto]}>
                                Compartilhar
                            </Text>
                        </Pressable>
                    ) : null}
                </View>

                <Pressable
                    onPress={() => router.push("/onboarding?novo=1")}
                    hitSlop={8}
                >
                    <Text style={[type.labelTab, styles.previa]}>
                        Ver onboarding de boas-vindas
                    </Text>
                </Pressable>
            </View>

            <View style={styles.corpo}>
                <View style={styles.secao}>
                    <Text style={[type.labelCampo, styles.secaoTitulo]}>
                        Temporada
                    </Text>

                    {ATHLETE_STATS.map((item) => (
                        <View key={item.label} style={styles.stat}>
                            <View style={styles.statTopo}>
                                <Text style={[type.metadado, styles.statRotulo]}>
                                    {item.label}
                                </Text>
                                <Text style={[type.statMd, styles.statValor]}>
                                    {item.value}
                                </Text>
                            </View>

                            <View style={styles.trilha}>
                                <View
                                    style={[
                                        styles.trilhaFill,
                                        { width: `${item.fill * 100}%` },
                                    ]}
                                />
                            </View>
                        </View>
                    ))}
                </View>

                <View style={styles.secao}>
                    <Text style={[type.labelCampo, styles.secaoTitulo]}>
                        Conquistas
                    </Text>

                    <View style={styles.conquistas}>
                        {ATHLETE_BADGES.map((badge) => (
                            <View key={badge.title} style={styles.conquista}>
                                <Text
                                    style={[type.statMd, styles.conquistaTitulo]}
                                >
                                    {badge.title}
                                </Text>
                                <Text
                                    style={[
                                        type.labelTab,
                                        styles.conquistaDetalhe,
                                    ]}
                                >
                                    {badge.detail}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={styles.secao}>
                    <Text style={[type.labelCampo, styles.secaoTitulo]}>
                        Tema
                    </Text>

                    <View style={styles.temas}>
                        {(["sistema", "claro", "escuro"] as const).map(
                            (opcao) => (
                                <Pressable
                                    key={opcao}
                                    style={[
                                        styles.tema,
                                        mode === opcao && styles.temaAtivo,
                                    ]}
                                    onPress={() => setMode(opcao)}
                                >
                                    <Text
                                        style={[
                                            type.labelCampo,
                                            mode === opcao
                                                ? styles.temaTextoAtivo
                                                : styles.temaTexto,
                                        ]}
                                    >
                                        {opcao === "sistema"
                                            ? "Do sistema"
                                            : opcao === "claro"
                                              ? "Claro"
                                              : "Escuro"}
                                    </Text>
                                </Pressable>
                            ),
                        )}
                    </View>
                </View>

                <MockNotice texto="Estatísticas, conquistas e rankings ainda são de exemplo — nome, foto, esporte, altura e bio já vêm da API." />

                <Pressable style={styles.sair} onPress={sair}>
                    <Text style={[type.botao, styles.sairTexto]}>
                        Sair da conta
                    </Text>
                </Pressable>
            </View>
        </ScrollView>
    );
}

const criarEstilos = (c: Palette) =>
    StyleSheet.create({
    conteudo: {
        paddingBottom: spacing.xxxl,
    },
    centro: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: spacing.xl,
        backgroundColor: c.canvas,
    },
    header: {
        alignItems: "center",
        gap: spacing.sm,
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.xl,
        backgroundColor: c.header,
        overflow: "hidden",
    },
    brilho: {
        position: "absolute",
        width: 240,
        height: 240,
        borderRadius: 120,
        top: -70,
        right: -70,
        opacity: 0.18,
        backgroundColor: c.primary,
    },
    avatar: {
        width: 84,
        height: 84,
        borderRadius: 42,
        borderWidth: 3,
        borderColor: c.primary,
    },
    nome: {
        color: c.onHeader,
        marginTop: spacing.sm,
    },
    linha: {
        color: c.onHeaderSoft,
        textAlign: "center",
    },
    rankings: {
        flexDirection: "row",
        gap: spacing.sm,
        marginTop: spacing.md,
        alignSelf: "stretch",
    },
    rankingCard: {
        flex: 1,
        alignItems: "center",
        gap: spacing.xxs,
        paddingVertical: spacing.md,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "rgba(255,254,251,0.16)",
    },
    rankingBranco: {
        color: c.onHeader,
    },
    rankingLaranja: {
        color: c.primary,
    },
    rankingEscopo: {
        color: "#A29A8E",
    },
    acoes: {
        flexDirection: "row",
        gap: spacing.sm,
        marginTop: spacing.md,
    },
    acao: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        borderRadius: radius.sm,
        borderWidth: 1,
        borderColor: "rgba(255,254,251,0.3)",
    },
    acaoTexto: {
        color: c.onHeader,
    },
    previa: {
        color: c.onHeaderSoft,
        marginTop: spacing.md,
    },
    corpo: {
        padding: spacing.xl,
        gap: spacing.xxl,
    },
    secao: {
        gap: spacing.md,
    },
    secaoTitulo: {
        color: c.mute,
    },
    stat: {
        gap: spacing.sm,
    },
    statTopo: {
        flexDirection: "row",
        alignItems: "baseline",
        justifyContent: "space-between",
    },
    statRotulo: {
        color: c.body,
    },
    statValor: {
        color: c.ink,
    },
    trilha: {
        height: 6,
        borderRadius: 3,
        backgroundColor: c.line,
        overflow: "hidden",
    },
    trilhaFill: {
        height: 6,
        borderRadius: 3,
        backgroundColor: c.primary,
    },
    conquistas: {
        flexDirection: "row",
        gap: spacing.sm,
    },
    conquista: {
        flex: 1,
        alignItems: "center",
        gap: spacing.xxs,
        padding: spacing.md,
        borderRadius: radius.md,
        backgroundColor: c.canvasSoft,
    },
    conquistaTitulo: {
        color: c.ink,
    },
    conquistaDetalhe: {
        color: c.mute,
        textAlign: "center",
    },
    temas: {
        flexDirection: "row",
        gap: spacing.sm,
    },
    tema: {
        flex: 1,
        height: size.formChip,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 20,
        borderWidth: 1,
        borderColor: c.line,
    },
    temaAtivo: {
        borderColor: "transparent",
        backgroundColor: c.ink,
    },
    temaTexto: {
        color: c.body,
    },
    temaTextoAtivo: {
        color: c.canvas,
    },
    sair: {
        height: 52,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: radius.sm,
        borderWidth: 1,
        borderColor: c.chipBorder,
    },
    sairTexto: {
        color: c.ink,
    },
});
