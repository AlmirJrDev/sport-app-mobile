import { useCallback, useEffect, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { DarkHeader } from "../../src/design/header";
import { Icon, type IconName } from "../../src/design/icons";
import { useTheme, useThemedStyles } from "../../src/design/theme";
import {
    radius,
    spacing,
    type,
    type Palette,
} from "../../src/design/tokens";
import {
    dropDevice,
    getPreferences,
    listNotifications,
    markNotificationRead,
    registerDevice,
    updatePreferences,
    type AppNotification,
    type NotificationPrefs,
} from "../../src/notifications/remote";
import {
    enablePush,
    pushStatus,
    type PushState,
} from "../../src/push/register";
import { shareInvite } from "../../src/share/share";

const ICONS: Record<string, IconName> = {
    game_joined: "convite",
    game_left: "aviso",
    game_arrival_confirmed: "lembrete",
    game_finished: "desafio",
    game_cancelled: "aviso",
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

const PREFERENCIAS: [keyof NotificationPrefs, string][] = [
    ["push", "Push neste aparelho"],
    ["noApp", "Avisos dentro do app"],
    ["jogos", "Movimento nos meus jogos"],
    ["social", "Quando alguém interage comigo"],
    ["novidades", "Novidades do Panela"],
];

interface Grupo {
    label: string;
    items: AppNotification[];
}

function mesmoDia(a: Date, b: Date): boolean {
    return (
        a.getDate() === b.getDate() &&
        a.getMonth() === b.getMonth() &&
        a.getFullYear() === b.getFullYear()
    );
}

function rotuloDoDia(iso: string): string {
    const data = new Date(iso);

    if (Number.isNaN(data.getTime())) {
        return "Antes";
    }

    const hoje = new Date();
    const ontem = new Date(hoje);
    ontem.setDate(hoje.getDate() - 1);

    if (mesmoDia(data, hoje)) {
        return "Hoje";
    }

    if (mesmoDia(data, ontem)) {
        return "Ontem";
    }

    return data.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
    });
}

function hora(iso: string): string {
    const data = new Date(iso);

    if (Number.isNaN(data.getTime())) {
        return "";
    }

    return data.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

function agrupar(itens: AppNotification[]): Grupo[] {
    const grupos: Grupo[] = [];

    for (const item of itens) {
        const label = rotuloDoDia(item.createdAt);
        const atual = grupos[grupos.length - 1];

        if (atual && atual.label === label) {
            atual.items.push(item);
        } else {
            grupos.push({ label, items: [item] });
        }
    }

    return grupos;
}

export default function NotificacoesScreen() {
    const { colors } = useTheme();
    const styles = useThemedStyles(criarEstilos);
    const router = useRouter();

    const [itens, setItens] = useState<AppNotification[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<string | null>(null);

    const carregar = useCallback(() => {
        listNotifications()
            .then((lista) => {
                setItens(lista);
                setErro(null);
            })
            .catch(() => setErro("Não deu para carregar seus avisos agora."))
            .finally(() => setCarregando(false));
    }, []);

    useFocusEffect(
        useCallback(() => {
            carregar();
        }, [carregar]),
    );

    const naoLidas = itens.filter((item) => !item.readAt);

    const abrir = (item: AppNotification) => {
        if (!item.readAt) {
            const agora = new Date().toISOString();

            setItens((atual) =>
                atual.map((outro) =>
                    outro.id === item.id ? { ...outro, readAt: agora } : outro,
                ),
            );

            markNotificationRead(item.id).catch(() => {});
        }

        if (item.gameId) {
            router.push(`/jogo/${item.gameId}`);
        }
    };

    const marcarTodas = () => {
        if (naoLidas.length === 0) {
            return;
        }

        const agora = new Date().toISOString();

        setItens((atual) =>
            atual.map((item) =>
                item.readAt ? item : { ...item, readAt: agora },
            ),
        );

        for (const item of naoLidas) {
            markNotificationRead(item.id).catch(() => {});
        }
    };

    const grupos = agrupar(itens);

    return (
        <View style={styles.tela}>
            <DarkHeader
                title="Alertas"
                withLogo={false}
                right={
                    naoLidas.length > 0 ? (
                        <Pressable onPress={marcarTodas} hitSlop={8}>
                            <Text style={[type.labelCampo, styles.marcarLidas]}>
                                Marcar lidas
                            </Text>
                        </Pressable>
                    ) : null
                }
            >
                <Text style={[type.metadado, styles.resumo]}>
                    {naoLidas.length > 0
                        ? `${naoLidas.length} ${naoLidas.length === 1 ? "aviso novo" : "avisos novos"}`
                        : "Tudo em dia por aqui."}
                </Text>
            </DarkHeader>

            <ScrollView contentContainerStyle={styles.conteudo}>
                <PushCard />

                <PrefsCard />

                {carregando ? (
                    <ActivityIndicator color={colors.ink} />
                ) : erro ? (
                    <View style={styles.aviso}>
                        <Text style={[type.corpoSm, styles.avisoTexto]}>
                            {erro}
                        </Text>

                        <Pressable
                            style={styles.avisoBotao}
                            onPress={() => {
                                setCarregando(true);
                                carregar();
                            }}
                        >
                            <Text
                                style={[type.labelCampo, styles.avisoBotaoTexto]}
                            >
                                Tentar de novo
                            </Text>
                        </Pressable>
                    </View>
                ) : itens.length === 0 ? (
                    <View style={styles.vazio}>
                        <Icon name="alertas" size={28} color={colors.mute} />
                        <Text style={[type.nomeLista, styles.vazioTitulo]}>
                            Nenhum aviso ainda
                        </Text>
                        <Text style={[type.corpoSm, styles.vazioCorpo]}>
                            Você recebe aviso quando alguém entra ou sai do seu
                            jogo, confirma chegada, e quando um jogo é
                            finalizado ou cancelado.
                        </Text>
                    </View>
                ) : (
                    grupos.map((grupo) => (
                        <View key={grupo.label} style={styles.grupo}>
                            <Text style={[type.eyebrow, styles.grupoRotulo]}>
                                {grupo.label}
                            </Text>

                            {grupo.items.map((item) => (
                                <Cartao
                                    key={item.id}
                                    item={item}
                                    onAbrir={() => abrir(item)}
                                />
                            ))}
                        </View>
                    ))
                )}
            </ScrollView>
        </View>
    );
}

function PushCard() {
    const styles = useThemedStyles(criarEstilos);
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

        if (!resultado.token) {
            setRecado(resultado.message ?? null);
            return;
        }

        try {
            await registerDevice(resultado.token);
            setRecado("Aparelho registrado para receber avisos.");
        } catch {
            setRecado("Peguei o token, mas a API não registrou o aparelho.");
        }
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

function Chave({ ligado, onPress }: { ligado: boolean; onPress: () => void }) {
    const styles = useThemedStyles(criarEstilos);

    return (
        <Pressable
            style={[styles.chave, ligado && styles.chaveLigada]}
            onPress={onPress}
            hitSlop={6}
        >
            <View style={[styles.bola, ligado && styles.bolaLigada]} />
        </Pressable>
    );
}

function PrefsCard() {
    const styles = useThemedStyles(criarEstilos);
    const [prefs, setPrefs] = useState<NotificationPrefs | null>(null);

    useEffect(() => {
        getPreferences()
            .then(setPrefs)
            .catch(() => setPrefs(null));
    }, []);

    if (!prefs) {
        return null;
    }

    const alternar = (chave: keyof NotificationPrefs) => {
        const anterior = prefs;
        const novo: NotificationPrefs = { ...prefs, [chave]: !prefs[chave] };
        const mudanca: Partial<NotificationPrefs> = { [chave]: novo[chave] };

        setPrefs(novo);
        updatePreferences(mudanca).catch(() => setPrefs(anterior));

        if (chave === "push" && !novo.push) {
            dropDevice().catch(() => {});
        }
    };

    return (
        <View style={styles.push}>
            <Text style={[type.eyebrow, styles.pushRotulo]}>
                O que você quer receber
            </Text>

            {PREFERENCIAS.map(([chave, rotulo]) => (
                <View key={chave} style={styles.pref}>
                    <Text style={[type.corpoSm, styles.prefTexto]}>
                        {rotulo}
                    </Text>

                    <Chave
                        ligado={prefs[chave]}
                        onPress={() => alternar(chave)}
                    />
                </View>
            ))}
        </View>
    );
}

interface CartaoProps {
    item: AppNotification;
    onAbrir: () => void;
}

function Cartao({ item, onAbrir }: CartaoProps) {
    const { colors } = useTheme();
    const styles = useThemedStyles(criarEstilos);
    const novo = !item.readAt;

    return (
        <Pressable
            style={[styles.cartao, novo && styles.cartaoDestaque]}
            onPress={onAbrir}
        >
            <View style={[styles.selo, novo && styles.seloDestaque]}>
                <Icon
                    name={ICONS[item.type] ?? "alertas"}
                    size={20}
                    color={novo ? colors.primary : colors.body}
                />
            </View>

            <View style={styles.miolo}>
                <View style={styles.cabecalho}>
                    <Text style={[type.nomeLista, styles.titulo]}>
                        {item.title}
                    </Text>
                    <Text style={[type.metadado, styles.hora]}>
                        {hora(item.createdAt)}
                    </Text>
                </View>

                <Text style={[type.corpoSm, styles.corpo]}>{item.body}</Text>

                {item.gameId ? (
                    <Text style={[type.labelCampo, styles.link]}>
                        Ver o jogo
                    </Text>
                ) : null}
            </View>
        </Pressable>
    );
}

const criarEstilos = (c: Palette) =>
    StyleSheet.create({
        tela: {
            flex: 1,
            backgroundColor: c.canvas,
        },
        marcarLidas: {
            color: c.primary,
        },
        resumo: {
            color: c.onHeaderSoft,
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
            borderColor: c.line,
        },
        pushRotulo: {
            color: c.mute,
        },
        pushTexto: {
            color: c.body,
        },
        pushBotao: {
            alignSelf: "flex-start",
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.lg,
            borderRadius: 10,
            backgroundColor: c.primary,
        },
        pushBotaoTexto: {
            color: c.onPrimary,
        },
        pushToken: {
            padding: spacing.sm,
            borderRadius: 10,
            backgroundColor: c.canvasSoft,
        },
        pushTokenTexto: {
            color: c.mute,
        },
        pref: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: spacing.md,
        },
        prefTexto: {
            flex: 1,
            color: c.body,
        },
        chave: {
            width: 46,
            height: 28,
            borderRadius: 14,
            padding: 3,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: c.line,
        },
        chaveLigada: {
            backgroundColor: c.primary,
        },
        bola: {
            width: 22,
            height: 22,
            borderRadius: 11,
            backgroundColor: c.canvas,
        },
        bolaLigada: {
            marginLeft: "auto",
        },
        aviso: {
            gap: spacing.md,
            padding: spacing.lg,
            borderRadius: radius.md,
            backgroundColor: c.canvasSoft,
        },
        avisoTexto: {
            color: c.body,
        },
        avisoBotao: {
            alignSelf: "flex-start",
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.lg,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: c.chipBorder,
        },
        avisoBotaoTexto: {
            color: c.ink,
        },
        vazio: {
            alignItems: "center",
            gap: spacing.sm,
            paddingVertical: spacing.xxl,
            paddingHorizontal: spacing.lg,
        },
        vazioTitulo: {
            color: c.ink,
        },
        vazioCorpo: {
            color: c.body,
            textAlign: "center",
        },
        grupo: {
            gap: spacing.md,
        },
        grupoRotulo: {
            color: c.mute,
        },
        cartao: {
            flexDirection: "row",
            gap: spacing.md,
            padding: spacing.lg,
            borderRadius: 18,
            backgroundColor: c.canvasSoft,
        },
        cartaoDestaque: {
            borderWidth: 1,
            borderColor: c.primary,
            backgroundColor: c.canvas,
        },
        selo: {
            width: 38,
            height: 38,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 12,
            backgroundColor: c.canvas,
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
            color: c.ink,
        },
        hora: {
            color: c.mute,
        },
        corpo: {
            color: c.body,
        },
        link: {
            color: c.primary,
            marginTop: spacing.xxs,
        },
    });
