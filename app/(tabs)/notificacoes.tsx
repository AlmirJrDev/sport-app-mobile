import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import MockNotice from "../../src/components/MockNotice";
import { DarkHeader } from "../../src/design/header";
import { Icon, type IconName } from "../../src/design/icons";
import { colors, radius, spacing, type } from "../../src/design/tokens";
import {
    NOTIFICATION_GROUPS,
    WEATHER_ALERT,
    type NotificationItem,
    type NotificationKind,
} from "../../src/mock/notifications";
import {
    enablePush,
    pushStatus,
    type PushState,
} from "../../src/push/register";
import { shareInvite } from "../../src/share/share";

const ICONS: Record<NotificationKind, IconName> = {
    desafio: "desafio",
    lembrete: "lembrete",
    convite: "convite",
    aviso: "aviso",
};

const ESTADO_TEXTO: Record<PushState, string> = {
    "sem-config": "Falta a configuração do Firebase para ligar o push.",
    "nao-suportado":
        "Este aparelho não faz push aqui. No iPhone, só com o app instalado na tela de início.",
    bloqueado:
        "As notificações estão bloqueadas para este site nas permissões do navegador.",
    desativado: "Receba aviso quando seu jogo estiver perto de começar.",
    ativado: "Notificações ligadas neste aparelho.",
};

export default function NotificacoesScreen() {
    const [resolvidas, setResolvidas] = useState<Record<string, string>>({});
    const [lidas, setLidas] = useState(false);

    const marcarLidas = () => setLidas(true);

    return (
        <View style={styles.tela}>
            <DarkHeader
                title="Alertas"
                withLogo={false}
                right={
                    <Pressable onPress={marcarLidas} hitSlop={8}>
                        <Text style={[type.labelCampo, styles.marcarLidas]}>
                            Marcar lidas
                        </Text>
                    </Pressable>
                }
            >
                <View style={styles.alerta}>
                    <Icon name="aviso" size={22} color={colors.primary} />

                    <View style={styles.alertaTexto}>
                        <Text style={[type.nomeLista, styles.alertaTitulo]}>
                            {WEATHER_ALERT.title}
                        </Text>
                        <Text style={[type.metadado, styles.alertaCorpo]}>
                            {WEATHER_ALERT.body}
                        </Text>
                    </View>
                </View>
            </DarkHeader>

            <ScrollView contentContainerStyle={styles.conteudo}>
                <PushCard />

                {NOTIFICATION_GROUPS.map((grupo) => (
                    <View key={grupo.label} style={styles.grupo}>
                        <Text style={[type.eyebrow, styles.grupoRotulo]}>
                            {grupo.label}
                        </Text>

                        {grupo.items.map((item) => (
                            <Cartao
                                key={item.id}
                                item={item}
                                lida={lidas}
                                resolvida={resolvidas[item.id]}
                                onAcao={(acao) =>
                                    setResolvidas((atual) => ({
                                        ...atual,
                                        [item.id]: acao,
                                    }))
                                }
                            />
                        ))}
                    </View>
                ))}

                <MockNotice texto="Notificações são dados de exemplo — ainda não existe endpoint para elas." />
            </ScrollView>
        </View>
    );
}

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
            <Text style={[type.eyebrow, styles.pushRotulo]}>Notificações</Text>
            <Text style={[type.metadado, styles.pushTexto]}>
                {recado ?? ESTADO_TEXTO[estado]}
            </Text>

            {estado === "desativado" ? (
                <Pressable style={styles.pushBotao} onPress={ligar}>
                    <Text style={[type.labelCampo, styles.pushBotaoTexto]}>
                        Ativar notificações
                    </Text>
                </Pressable>
            ) : null}

            {token ? (
                <Pressable
                    style={styles.pushToken}
                    onPress={() => shareInvite(token)}
                >
                    <Text style={[type.metadado, styles.pushTokenTexto]}>
                        {token.slice(0, 24)}… — toque para copiar o token
                    </Text>
                </Pressable>
            ) : null}
        </View>
    );
}

interface CartaoProps {
    item: NotificationItem;
    lida: boolean;
    resolvida?: string;
    onAcao: (acao: string) => void;
}

function Cartao({ item, lida, resolvida, onAcao }: CartaoProps) {
    const destaque = item.kind === "desafio" && !lida && !resolvida;

    return (
        <View style={[styles.cartao, destaque && styles.cartaoDestaque]}>
            <View
                style={[styles.selo, destaque && styles.seloDestaque]}
            >
                <Icon
                    name={ICONS[item.kind]}
                    size={20}
                    color={destaque ? colors.primary : colors.body}
                />
            </View>

            <View style={styles.miolo}>
                <View style={styles.cabecalho}>
                    <Text style={[type.nomeLista, styles.titulo]}>
                        {item.title}
                    </Text>
                    <Text style={[type.metadado, styles.hora]}>{item.at}</Text>
                </View>

                <Text style={[type.corpoSm, styles.corpo]}>{item.body}</Text>

                {resolvida ? (
                    <Text style={[type.labelCampo, styles.resolvida]}>
                        {resolvida}
                    </Text>
                ) : item.actions ? (
                    <View style={styles.acoes}>
                        {item.actions.map((acao, indice) => (
                            <Pressable
                                key={acao}
                                style={[
                                    styles.acao,
                                    indice === 0 && styles.acaoPrincipal,
                                ]}
                                onPress={() =>
                                    onAcao(
                                        acao === "Aceitar"
                                            ? "Desafio aceito"
                                            : acao === "Recusar"
                                              ? "Desafio recusado"
                                              : "Visto",
                                    )
                                }
                            >
                                <Text
                                    style={[
                                        type.labelCampo,
                                        indice === 0
                                            ? styles.acaoPrincipalTexto
                                            : styles.acaoTexto,
                                    ]}
                                >
                                    {acao}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                ) : null}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    tela: {
        flex: 1,
        backgroundColor: colors.canvas,
    },
    marcarLidas: {
        color: colors.primary,
    },
    alerta: {
        flexDirection: "row",
        gap: spacing.md,
        padding: spacing.lg,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "rgba(218,104,13,0.4)",
        backgroundColor: "rgba(218,104,13,0.16)",
    },
    alertaTexto: {
        flex: 1,
        gap: spacing.xxs,
    },
    alertaTitulo: {
        color: colors.onHeader,
    },
    alertaCorpo: {
        color: "#D8D0C4",
    },
    conteudo: {
        padding: spacing.xl,
        paddingBottom: spacing.xxxl,
        gap: spacing.xxl,
    },
    push: {
        gap: spacing.sm,
        padding: spacing.lg,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.line,
    },
    pushRotulo: {
        color: colors.mute,
    },
    pushTexto: {
        color: colors.body,
    },
    pushBotao: {
        alignSelf: "flex-start",
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
        borderRadius: 10,
        backgroundColor: colors.primary,
    },
    pushBotaoTexto: {
        color: colors.onPrimary,
    },
    pushToken: {
        padding: spacing.sm,
        borderRadius: 10,
        backgroundColor: colors.canvasSoft,
    },
    pushTokenTexto: {
        color: colors.mute,
    },
    grupo: {
        gap: spacing.md,
    },
    grupoRotulo: {
        color: colors.mute,
    },
    cartao: {
        flexDirection: "row",
        gap: spacing.md,
        padding: spacing.lg,
        borderRadius: 18,
        backgroundColor: colors.canvasSoft,
    },
    cartaoDestaque: {
        borderWidth: 1,
        borderColor: colors.primary,
        backgroundColor: colors.canvas,
    },
    selo: {
        width: 38,
        height: 38,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 12,
        backgroundColor: colors.canvas,
    },
    seloDestaque: {
        backgroundColor: "rgba(218,104,13,0.14)",
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
        color: colors.mute,
    },
    corpo: {
        color: colors.body,
    },
    resolvida: {
        color: colors.primary,
        marginTop: spacing.xs,
    },
    acoes: {
        flexDirection: "row",
        gap: spacing.sm,
        marginTop: spacing.xs,
    },
    acao: {
        height: 38,
        justifyContent: "center",
        paddingHorizontal: spacing.lg,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.chipBorder,
    },
    acaoPrincipal: {
        borderColor: "transparent",
        backgroundColor: colors.primary,
    },
    acaoTexto: {
        color: colors.ink,
    },
    acaoPrincipalTexto: {
        color: colors.onPrimary,
    },
});
