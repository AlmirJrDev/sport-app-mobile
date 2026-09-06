import { useEffect, useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import MockNotice from "../../src/components/MockNotice";
import {
    enablePush,
    pushStatus,
    type PushState,
} from "../../src/push/register";
import { shareInvite } from "../../src/share/share";
import { colors, radius, spacing, type } from "../../src/design/tokens";
import {
    NOTIFICATION_GROUPS,
    WEATHER_ALERT,
    type NotificationItem,
    type NotificationKind,
} from "../../src/mock/notifications";

type IconName = keyof typeof MaterialIcons.glyphMap;

const ICONS: Record<NotificationKind, IconName> = {
    desafio: "sports-score",
    lembrete: "event",
    convite: "group-add",
    aviso: "medical-services",
};

export default function NotificacoesScreen() {
    return (
        <ScrollView contentContainerStyle={styles.conteudo}>
            <PushCard />

            <View style={styles.alerta}>
                <MaterialIcons
                    name="warning-amber"
                    size={22}
                    color={colors.onPrimary}
                />

                <View style={styles.alertaTexto}>
                    <Text style={[type.headlineSm, styles.alertaTitulo]}>
                        {WEATHER_ALERT.title}
                    </Text>
                    <Text style={[type.caption, styles.alertaCorpo]}>
                        {WEATHER_ALERT.body}
                    </Text>
                </View>
            </View>

            {NOTIFICATION_GROUPS.map((grupo) => (
                <View key={grupo.label} style={styles.grupo}>
                    <Text style={[type.label, styles.grupoRotulo]}>
                        {grupo.label}
                    </Text>

                    {grupo.items.map((item) => (
                        <Cartao key={item.id} item={item} />
                    ))}
                </View>
            ))}

            <MockNotice texto="Notificações são dados de exemplo — ainda não existe endpoint para elas." />
        </ScrollView>
    );
}

const ESTADO_TEXTO: Record<PushState, string> = {
    "sem-config": "Falta a configuração do Firebase para ligar o push.",
    "nao-suportado":
        "Este aparelho não faz push aqui. No iPhone, só com o app instalado na tela de início.",
    bloqueado:
        "As notificações estão bloqueadas para este site nas permissões do navegador.",
    desativado: "Receba aviso quando seu jogo estiver perto de começar.",
    ativado: "Notificações ligadas neste aparelho.",
};

function PushCard() {
    const [estado, setEstado] = useState<PushState | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [recado, setRecado] = useState<string | null>(null);

    useEffect(() => {
        pushStatus().then(setEstado);
    }, []);

    if (!estado) {
        return null;
    }

    const ligar = async () => {
        const resultado = await enablePush();

        setEstado(resultado.state);
        setToken(resultado.token ?? null);
        setRecado(resultado.message ?? null);
    };

    return (
        <View style={styles.push}>
            <Text style={[type.label, styles.pushRotulo]}>Notificações</Text>
            <Text style={[type.caption, styles.pushTexto]}>
                {recado ?? ESTADO_TEXTO[estado]}
            </Text>

            {estado === "desativado" ? (
                <Pressable style={styles.pushBotao} onPress={ligar}>
                    <Text style={[type.label, styles.pushBotaoTexto]}>
                        Ativar notificações
                    </Text>
                </Pressable>
            ) : null}

            {token ? (
                <Pressable
                    style={styles.pushToken}
                    onPress={() => shareInvite(token)}
                >
                    <Text style={[type.caption, styles.pushTokenTexto]}>
                        {token.slice(0, 24)}… — toque para copiar o token
                    </Text>
                </Pressable>
            ) : null}
        </View>
    );
}

function Cartao({ item }: { item: NotificationItem }) {
    return (
        <View style={styles.cartao}>
            <View style={styles.selo}>
                <MaterialIcons
                    name={ICONS[item.kind]}
                    size={20}
                    color={colors.ink}
                />
            </View>

            <View style={styles.miolo}>
                <View style={styles.cabecalho}>
                    <Text style={[type.bodySmStrong, styles.titulo]}>
                        {item.title}
                    </Text>
                    <Text style={[type.label, styles.hora]}>{item.at}</Text>
                </View>

                <Text style={[type.caption, styles.corpo]}>{item.body}</Text>

                {item.actions ? (
                    <View style={styles.acoes}>
                        {item.actions.map((acao, indice) => (
                            <View
                                key={acao}
                                style={[
                                    styles.acao,
                                    indice === 0 && styles.acaoPrincipal,
                                ]}
                            >
                                <Text
                                    style={[
                                        type.label,
                                        indice === 0
                                            ? styles.acaoPrincipalTexto
                                            : styles.acaoTexto,
                                    ]}
                                >
                                    {acao}
                                </Text>
                            </View>
                        ))}
                    </View>
                ) : null}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    conteudo: {
        padding: spacing.lg,
        paddingBottom: 96,
        gap: spacing.lg,
    },
    push: {
        gap: spacing.sm,
        padding: spacing.lg,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.mute,
    },
    pushRotulo: {
        color: colors.bodyMid,
    },
    pushTexto: {
        color: colors.body,
    },
    pushBotao: {
        alignSelf: "flex-start",
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
        borderRadius: radius.sm,
        backgroundColor: colors.primary,
    },
    pushBotaoTexto: {
        color: colors.onPrimary,
    },
    pushToken: {
        padding: spacing.sm,
        borderRadius: radius.sm,
        backgroundColor: colors.canvasSoft,
    },
    pushTokenTexto: {
        color: colors.bodyMid,
    },
    alerta: {
        flexDirection: "row",
        gap: spacing.md,
        padding: spacing.lg,
        borderRadius: radius.md,
        backgroundColor: colors.primary,
    },
    alertaTexto: {
        flex: 1,
        gap: spacing.xxs,
    },
    alertaTitulo: {
        color: colors.onPrimary,
    },
    alertaCorpo: {
        color: colors.onPrimary,
    },
    grupo: {
        gap: spacing.sm,
    },
    grupoRotulo: {
        color: colors.bodyMid,
    },
    cartao: {
        flexDirection: "row",
        gap: spacing.md,
        padding: spacing.lg,
        borderRadius: radius.md,
        backgroundColor: colors.canvasSoft,
        borderLeftWidth: 3,
        borderLeftColor: colors.primary,
    },
    selo: {
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: radius.pill,
        backgroundColor: colors.canvas,
    },
    miolo: {
        flex: 1,
        gap: spacing.xs,
    },
    cabecalho: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: spacing.md,
    },
    titulo: {
        flex: 1,
        color: colors.ink,
    },
    hora: {
        color: colors.bodyMid,
    },
    corpo: {
        color: colors.body,
    },
    acoes: {
        flexDirection: "row",
        gap: spacing.sm,
        marginTop: spacing.xs,
    },
    acao: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
        borderRadius: radius.sm,
        borderWidth: 1,
        borderColor: colors.mute,
    },
    acaoPrincipal: {
        borderColor: "transparent",
        backgroundColor: colors.ink,
    },
    acaoTexto: {
        color: colors.body,
    },
    acaoPrincipalTexto: {
        color: colors.onPrimary,
    },
});
