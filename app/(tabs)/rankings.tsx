import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import MockNotice from "../../src/components/MockNotice";
import { colors, radius, spacing, type } from "../../src/design/tokens";
import {
    RANKING_BOARDS,
    RANKING_SCOPES,
    RANKING_SPORTS,
    type RankingRow,
    type Trend,
} from "../../src/mock/rankings";

const TREND_LABEL: Record<Trend, string> = {
    up: "↑",
    down: "↓",
    flat: "–",
};

export default function RankingsScreen() {
    const [esporte, setEsporte] = useState(RANKING_SPORTS[0]);
    const [abrangencia, setAbrangencia] = useState(RANKING_SCOPES[0]);

    const board = RANKING_BOARDS[esporte];

    return (
        <ScrollView contentContainerStyle={styles.conteudo}>
            <View style={styles.filtros}>
                {RANKING_SPORTS.map((item) => (
                    <Chip
                        key={item}
                        texto={item}
                        ativo={item === esporte}
                        onPress={() => setEsporte(item)}
                    />
                ))}
            </View>

            <View style={styles.filtros}>
                {RANKING_SCOPES.map((item) => (
                    <Chip
                        key={item}
                        texto={item}
                        ativo={item === abrangencia}
                        onPress={() => setAbrangencia(item)}
                    />
                ))}
            </View>

            <View style={styles.seuCard}>
                <View style={styles.seuTexto}>
                    <Text style={[type.headlineSm, styles.seuTitulo]}>
                        Seu ranking
                    </Text>
                    <Text style={[type.caption, styles.seuDetalhe]}>
                        {abrangencia} · {esporte} · #{board.you.position}
                    </Text>
                </View>

                <View style={styles.seuPontos}>
                    <Text style={[type.statLg, styles.seuNumero]}>
                        {board.you.points.toLocaleString("pt-BR")}
                    </Text>
                    <Text style={[type.label, styles.seuUnidade]}>
                        pts {TREND_LABEL[board.you.trend]} {board.you.delta}
                    </Text>
                </View>
            </View>

            {board.rows.map((linha) => (
                <Linha key={linha.position} linha={linha} />
            ))}

            <MockNotice texto="Pontuação e posições são dados de exemplo — o ranking ainda não existe na API." />
        </ScrollView>
    );
}

function Linha({ linha }: { linha: RankingRow }) {
    const lider = linha.position === 1;

    return (
        <View style={[styles.linha, lider && styles.linhaLider]}>
            <Text
                style={[
                    type.statMd,
                    styles.posicao,
                    lider && styles.posicaoLider,
                ]}
            >
                #{linha.position}
            </Text>

            <View style={styles.linhaTexto}>
                <Text style={[type.headlineSm, styles.nome]}>{linha.name}</Text>
                <Text style={[type.label, styles.cidade]}>{linha.city}</Text>
            </View>

            <View style={styles.pontos}>
                <Text style={[type.statMd, styles.pontosNumero]}>
                    {linha.points.toLocaleString("pt-BR")}
                </Text>
                <Text
                    style={[
                        type.label,
                        linha.trend === "down"
                            ? styles.queda
                            : linha.trend === "up"
                              ? styles.alta
                              : styles.estavel,
                    ]}
                >
                    {TREND_LABEL[linha.trend]}
                    {linha.delta > 0 ? ` ${linha.delta}` : ""}
                </Text>
            </View>
        </View>
    );
}

function Chip({
    texto,
    ativo,
    onPress,
}: {
    texto: string;
    ativo: boolean;
    onPress: () => void;
}) {
    return (
        <Pressable
            style={[styles.chip, ativo && styles.chipAtivo]}
            onPress={onPress}
        >
            <Text
                style={[
                    type.label,
                    ativo ? styles.chipTextoAtivo : styles.chipTexto,
                ]}
            >
                {texto}
            </Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    conteudo: {
        padding: spacing.lg,
        paddingBottom: 96,
        gap: spacing.sm,
    },
    filtros: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.sm,
    },
    chip: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: colors.mute,
    },
    chipAtivo: {
        borderColor: "transparent",
        backgroundColor: colors.ink,
    },
    chipTexto: {
        color: colors.body,
    },
    chipTextoAtivo: {
        color: colors.onPrimary,
    },
    seuCard: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        marginTop: spacing.sm,
        padding: spacing.lg,
        borderRadius: radius.md,
        backgroundColor: colors.ink,
    },
    seuTexto: {
        flex: 1,
        gap: spacing.xxs,
    },
    seuTitulo: {
        color: colors.onPrimary,
    },
    seuDetalhe: {
        color: colors.mute,
    },
    seuPontos: {
        alignItems: "flex-end",
    },
    seuNumero: {
        color: colors.primary,
    },
    seuUnidade: {
        color: colors.mute,
    },
    linha: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        padding: spacing.lg,
        borderRadius: radius.md,
        backgroundColor: colors.canvasSoft,
    },
    linhaLider: {
        borderWidth: 1,
        borderColor: colors.primary,
    },
    posicao: {
        color: colors.bodyMid,
        minWidth: 40,
    },
    posicaoLider: {
        color: colors.primary,
    },
    linhaTexto: {
        flex: 1,
        gap: spacing.xxs,
    },
    nome: {
        color: colors.ink,
    },
    cidade: {
        color: colors.bodyMid,
    },
    pontos: {
        alignItems: "flex-end",
    },
    pontosNumero: {
        color: colors.ink,
    },
    alta: {
        color: colors.primary,
    },
    queda: {
        color: colors.bodyMid,
    },
    estavel: {
        color: colors.mute,
    },
});
