import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import MockNotice from "../../src/components/MockNotice";
import { DarkHeader } from "../../src/design/header";
import { Avatar } from "../../src/design/pieces";
import { colors, radius, spacing, type } from "../../src/design/tokens";
import {
    RANKING_BOARDS,
    RANKING_SCOPES,
    RANKING_SPORTS,
    type RankingRow,
    type Trend,
} from "../../src/mock/rankings";

const TREND_LABEL: Record<Trend, string> = {
    up: "▲",
    down: "▼",
    flat: "—",
};

const TITULO_LISTA: Record<string, string> = {
    Nacional: "Top do país",
    Estadual: "Top de São Paulo",
    Municipal: "Top de Campinas",
};

export default function RankingsScreen() {
    const [esporte, setEsporte] = useState(RANKING_SPORTS[0]);
    const [abrangencia, setAbrangencia] = useState(RANKING_SCOPES[0]);

    const board = RANKING_BOARDS[esporte];

    return (
        <View style={styles.tela}>
            <DarkHeader title="Rankings">
                <View style={styles.chips}>
                    {RANKING_SPORTS.map((item) => (
                        <Pressable
                            key={item}
                            style={[
                                styles.chip,
                                item === esporte && styles.chipAtivo,
                            ]}
                            onPress={() => setEsporte(item)}
                        >
                            <Text
                                style={[
                                    type.labelCampo,
                                    item === esporte
                                        ? styles.chipTextoAtivo
                                        : styles.chipTexto,
                                ]}
                            >
                                {item}
                            </Text>
                        </Pressable>
                    ))}
                </View>

                <View style={styles.abas}>
                    {RANKING_SCOPES.map((item) => (
                        <Pressable
                            key={item}
                            style={[
                                styles.aba,
                                item === abrangencia && styles.abaAtiva,
                            ]}
                            onPress={() => setAbrangencia(item)}
                        >
                            <Text
                                style={[
                                    type.labelCampo,
                                    item === abrangencia
                                        ? styles.abaTextoAtivo
                                        : styles.abaTexto,
                                ]}
                            >
                                {item}
                            </Text>
                        </Pressable>
                    ))}
                </View>
            </DarkHeader>

            <ScrollView contentContainerStyle={styles.conteudo}>
                <View style={styles.cardVoce}>
                    <Text style={[type.posicaoDestaque, styles.vocePosicao]}>
                        {board.you.position}º
                    </Text>

                    <View style={styles.voceTexto}>
                        <Text style={[type.nomeLista, styles.voceNome]}>
                            Você
                        </Text>
                        <Text style={[type.metadado, styles.voceEscopo]}>
                            {abrangencia} · {esporte}
                        </Text>
                    </View>

                    <View style={styles.vocePontos}>
                        <Text style={[type.placar, styles.voceNome]}>
                            {board.you.points.toLocaleString("pt-BR")}
                        </Text>
                        <Text style={[type.eyebrow, styles.voceEscopo]}>
                            {TREND_LABEL[board.you.trend]} {board.you.delta} pts
                        </Text>
                    </View>
                </View>

                <Text style={[type.labelCampo, styles.tituloLista]}>
                    {TITULO_LISTA[abrangencia] ?? abrangencia}
                </Text>

                <View style={styles.lista}>
                    {board.rows.map((linha) => (
                        <Linha key={linha.position} linha={linha} />
                    ))}
                </View>

                <MockNotice texto="Pontuação e posições são dados de exemplo — o ranking ainda não existe na API." />
            </ScrollView>
        </View>
    );
}

function Linha({ linha }: { linha: RankingRow }) {
    const topo = linha.position <= 3;

    return (
        <View style={styles.linha}>
            <Text
                style={[
                    type.posicaoLista,
                    topo ? styles.posicaoTopo : styles.posicao,
                ]}
            >
                {linha.position}
            </Text>

            <Avatar name={linha.name} size={38} />

            <View style={styles.linhaTexto}>
                <Text style={[type.nomeLista, styles.nome]}>{linha.name}</Text>
                <Text style={[type.metadado, styles.cidade]}>{linha.city}</Text>
            </View>

            <View style={styles.pontos}>
                <Text style={[type.pontos, styles.pontosNumero]}>
                    {linha.points.toLocaleString("pt-BR")}
                </Text>
                <Text
                    style={[
                        type.eyebrow,
                        linha.trend === "up" ? styles.alta : styles.neutro,
                    ]}
                >
                    {TREND_LABEL[linha.trend]}
                    {linha.delta > 0 ? ` ${linha.delta}` : ""}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    tela: {
        flex: 1,
        backgroundColor: colors.canvas,
    },
    chips: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.sm,
    },
    chip: {
        height: 32,
        justifyContent: "center",
        paddingHorizontal: spacing.lg,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(255,254,251,0.22)",
    },
    chipAtivo: {
        borderColor: "transparent",
        backgroundColor: colors.primary,
    },
    chipTexto: {
        color: colors.onHeaderSoft,
    },
    chipTextoAtivo: {
        color: colors.onPrimary,
    },
    abas: {
        flexDirection: "row",
        gap: spacing.lg,
    },
    aba: {
        paddingBottom: spacing.sm,
        borderBottomWidth: 2,
        borderBottomColor: "transparent",
    },
    abaAtiva: {
        borderBottomColor: colors.primary,
    },
    abaTexto: {
        color: "#8A8378",
    },
    abaTextoAtivo: {
        color: colors.onHeader,
    },
    conteudo: {
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.xxxl,
        gap: spacing.lg,
    },
    cardVoce: {
        marginTop: -12,
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        padding: spacing.xl,
        borderRadius: radius.lg,
        backgroundColor: colors.primary,
    },
    vocePosicao: {
        color: colors.onPrimary,
    },
    voceTexto: {
        flex: 1,
    },
    voceNome: {
        color: colors.onPrimary,
    },
    voceEscopo: {
        color: colors.onPrimary,
        opacity: 0.85,
    },
    vocePontos: {
        alignItems: "flex-end",
    },
    tituloLista: {
        color: colors.mute,
    },
    lista: {
        gap: 0,
    },
    linha: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.line,
    },
    posicao: {
        minWidth: 34,
        color: colors.mute,
    },
    posicaoTopo: {
        minWidth: 34,
        color: colors.primary,
    },
    linhaTexto: {
        flex: 1,
    },
    nome: {
        color: colors.ink,
    },
    cidade: {
        color: colors.mute,
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
    neutro: {
        color: colors.mute,
    },
});
