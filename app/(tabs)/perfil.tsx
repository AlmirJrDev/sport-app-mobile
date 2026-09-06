import { Redirect, useRouter } from "expo-router";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { signOut } from "../../src/auth/account";
import { useSession } from "../../src/auth/useSession";
import MockNotice from "../../src/components/MockNotice";
import { colors, radius, spacing, type } from "../../src/design/tokens";
import {
    ATHLETE_BADGES,
    ATHLETE_FORM,
    ATHLETE_NOTE,
    ATHLETE_RANKINGS,
    ATHLETE_SEASON,
    ATHLETE_STATS,
    ATHLETE_TAGS,
} from "../../src/mock/athlete";

const TREND_LABEL = {
    up: "↑",
    down: "↓",
    flat: "–",
};

export default function PerfilScreen() {
    const router = useRouter();
    const { account, loading, reload } = useSession();

    const sair = async () => {
        await signOut();
        reload();
        router.replace("/entrar");
    };

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

    const iniciais = account.name
        .split(" ")
        .slice(0, 2)
        .map((parte) => parte.slice(0, 1))
        .join("");

    return (
        <ScrollView contentContainerStyle={styles.conteudo}>
            <View style={styles.capa}>
                <View style={styles.avatar}>
                    <Text style={[type.statLg, styles.avatarTexto]}>
                        {iniciais.toUpperCase()}
                    </Text>
                </View>

                <Text style={[type.headlineMd, styles.nome]}>
                    {account.name}
                </Text>
                <Text style={[type.caption, styles.email]}>
                    {account.email}
                </Text>

                <View style={styles.etiquetas}>
                    {ATHLETE_TAGS.map((tag) => (
                        <View key={tag} style={styles.etiqueta}>
                            <Text style={[type.label, styles.etiquetaTexto]}>
                                {tag}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>

            <Secao titulo="Rankings">
                <View style={styles.rankings}>
                    {ATHLETE_RANKINGS.map((item) => (
                        <View key={item.scope} style={styles.rankingCard}>
                            <Text style={[type.label, styles.rankingRotulo]}>
                                {item.scope}
                            </Text>
                            <Text style={[type.statMd, styles.rankingValor]}>
                                #{item.position} {TREND_LABEL[item.trend]}
                            </Text>
                        </View>
                    ))}
                </View>
            </Secao>

            <Secao titulo="Estatísticas" detalhe={ATHLETE_SEASON}>
                <View style={styles.stats}>
                    {ATHLETE_STATS.map((item) => (
                        <View key={item.label} style={styles.statCard}>
                            <Text style={[type.statLg, styles.statValor]}>
                                {item.value}
                            </Text>
                            <Text style={[type.label, styles.statRotulo]}>
                                {item.label}
                            </Text>

                            <View style={styles.barra}>
                                <View
                                    style={[
                                        styles.barraCheia,
                                        { width: `${item.fill * 100}%` },
                                    ]}
                                />
                            </View>
                        </View>
                    ))}
                </View>
            </Secao>

            <Secao titulo="Evolução recente">
                <View style={styles.evolucao}>
                    <Text style={[type.caption, styles.nota]}>
                        {ATHLETE_NOTE}
                    </Text>

                    <View style={styles.grafico}>
                        {ATHLETE_FORM.map((valor, indice) => (
                            <View key={indice} style={styles.coluna}>
                                <View
                                    style={[
                                        styles.colunaCheia,
                                        { height: Math.round(valor * 96) },
                                    ]}
                                />
                                <Text style={[type.label, styles.colunaRotulo]}>
                                    J{indice + 1}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
            </Secao>

            <Secao titulo="Conquistas">
                <View style={styles.conquistas}>
                    {ATHLETE_BADGES.map((badge) => (
                        <View key={badge.title} style={styles.conquista}>
                            <Text
                                style={[
                                    type.headlineSm,
                                    styles.conquistaTitulo,
                                ]}
                            >
                                {badge.title}
                            </Text>
                            <Text style={[type.label, styles.conquistaDetalhe]}>
                                {badge.detail}
                            </Text>
                        </View>
                    ))}
                </View>
            </Secao>

            <MockNotice texto="Estatísticas, conquistas e rankings são de exemplo — a API hoje só guarda nome, e-mail e cidade." />

            <Pressable style={styles.sair} onPress={sair}>
                <Text style={[type.label, styles.sairTexto]}>Sair da conta</Text>
            </Pressable>
        </ScrollView>
    );
}

function Secao({
    titulo,
    detalhe,
    children,
}: {
    titulo: string;
    detalhe?: string;
    children: React.ReactNode;
}) {
    return (
        <View style={styles.secao}>
            <View style={styles.secaoTopo}>
                <Text style={[type.headlineSm, styles.secaoTitulo]}>
                    {titulo}
                </Text>
                {detalhe ? (
                    <Text style={[type.label, styles.secaoDetalhe]}>
                        {detalhe}
                    </Text>
                ) : null}
            </View>

            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    centro: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: spacing.xl,
    },
    conteudo: {
        padding: spacing.lg,
        paddingBottom: 96,
        gap: spacing.xl,
    },
    capa: {
        alignItems: "center",
        gap: spacing.xs,
        padding: spacing.xl,
        borderRadius: radius.md,
        backgroundColor: colors.canvasSoft,
    },
    avatar: {
        width: 88,
        height: 88,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: radius.pill,
        borderWidth: 2,
        borderColor: colors.primary,
        backgroundColor: colors.canvas,
    },
    avatarTexto: {
        color: colors.primary,
    },
    nome: {
        color: colors.ink,
        marginTop: spacing.sm,
    },
    email: {
        color: colors.body,
    },
    etiquetas: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: spacing.sm,
        marginTop: spacing.sm,
    },
    etiqueta: {
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.md,
        borderRadius: radius.pill,
        backgroundColor: colors.canvas,
    },
    etiquetaTexto: {
        color: colors.body,
    },
    secao: {
        gap: spacing.md,
    },
    secaoTopo: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: spacing.md,
    },
    secaoTitulo: {
        color: colors.ink,
    },
    secaoDetalhe: {
        color: colors.bodyMid,
    },
    rankings: {
        flexDirection: "row",
        gap: spacing.sm,
    },
    rankingCard: {
        flex: 1,
        gap: spacing.xxs,
        padding: spacing.md,
        borderRadius: radius.sm,
        backgroundColor: colors.canvasSoft,
    },
    rankingRotulo: {
        color: colors.bodyMid,
    },
    rankingValor: {
        color: colors.ink,
    },
    stats: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.sm,
    },
    statCard: {
        flexGrow: 1,
        flexBasis: "45%",
        gap: spacing.xxs,
        padding: spacing.lg,
        borderRadius: radius.md,
        backgroundColor: colors.canvasSoft,
    },
    statValor: {
        color: colors.ink,
    },
    statRotulo: {
        color: colors.bodyMid,
    },
    barra: {
        height: 4,
        marginTop: spacing.sm,
        borderRadius: radius.pill,
        backgroundColor: colors.mute,
        overflow: "hidden",
    },
    barraCheia: {
        height: 4,
        borderRadius: radius.pill,
        backgroundColor: colors.primary,
    },
    evolucao: {
        gap: spacing.lg,
        padding: spacing.lg,
        borderRadius: radius.md,
        backgroundColor: colors.canvasSoft,
    },
    nota: {
        color: colors.body,
    },
    grafico: {
        flexDirection: "row",
        alignItems: "flex-end",
        gap: spacing.md,
    },
    coluna: {
        flex: 1,
        justifyContent: "flex-end",
        alignItems: "center",
        gap: spacing.xs,
    },
    colunaCheia: {
        width: "100%",
        borderRadius: radius.sm,
        backgroundColor: colors.primary,
    },
    colunaRotulo: {
        color: colors.bodyMid,
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
        backgroundColor: colors.canvasSoft,
    },
    conquistaTitulo: {
        color: colors.ink,
    },
    conquistaDetalhe: {
        color: colors.bodyMid,
        textAlign: "center",
    },
    sair: {
        alignItems: "center",
        paddingVertical: spacing.md,
        borderRadius: radius.sm,
        borderWidth: 1,
        borderColor: colors.mute,
    },
    sairTexto: {
        color: colors.ink,
    },
});
