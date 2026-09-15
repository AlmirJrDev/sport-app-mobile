import { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import {
    AuthError,
    isValidEmail,
    passwordProblems,
    requestPasswordReset,
    resetPassword,
} from "../src/auth/account";
import { mostrarToast } from "../src/components/Toast";
import { colors, radius, size, spacing, type } from "../src/design/tokens";

/** Mesmo fundo escuro da tela de entrar. */
const FUNDO = "#1C1614";
const TEXTO_SUAVE = "#C9C3B6";
const NOTA = "#7C766B";
const CONTORNO = "#4A423C";

export default function EsqueciSenhaScreen() {
    const { token } = useLocalSearchParams<{ token?: string }>();

    return (
        <View style={styles.tela}>
            <View style={styles.brilho} />

            <ScrollView
                contentContainerStyle={styles.conteudo}
                keyboardShouldPersistTaps="handled"
            >
                {token ? <NovaSenha token={token} /> : <PedirLink />}
            </ScrollView>
        </View>
    );
}

function PedirLink() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [erro, setErro] = useState<string | null>(null);
    const [enviando, setEnviando] = useState(false);
    const [enviado, setEnviado] = useState(false);

    const bloqueado = enviando || !isValidEmail(email);

    const enviar = async () => {
        setErro(null);
        setEnviando(true);

        try {
            await requestPasswordReset(email);
            setEnviado(true);
        } catch (raw) {
            setErro(
                raw instanceof AuthError
                    ? raw.message
                    : "Não deu para enviar o e-mail agora.",
            );
        } finally {
            setEnviando(false);
        }
    };

    if (enviado) {
        return (
            <View style={styles.bloco}>
                <Text style={[type.tituloTela, styles.titulo]}>
                    Confira seu e-mail
                </Text>
                <Text style={[type.corpo, styles.texto]}>
                    Mandamos um link para {email.trim()}. Ele vale por 1 hora.
                    Se não aparecer, olhe o spam.
                </Text>

                <Pressable
                    style={styles.cta}
                    onPress={() => router.replace("/entrar")}
                >
                    <Text style={[type.botao, styles.ctaTexto]}>
                        Voltar para entrar
                    </Text>
                </Pressable>

                <Pressable
                    style={styles.link}
                    hitSlop={8}
                    onPress={() => setEnviado(false)}
                >
                    <Text style={[type.labelCampo, styles.linkTexto]}>
                        Usar outro e-mail
                    </Text>
                </Pressable>
            </View>
        );
    }

    return (
        <View style={styles.bloco}>
            <Text style={[type.tituloTela, styles.titulo]}>
                Esqueci minha senha
            </Text>
            <Text style={[type.corpo, styles.texto]}>
                Diga o e-mail da sua conta e mandamos um link para criar uma
                senha nova.
            </Text>

            <View style={styles.campo}>
                <Text style={[type.labelCampo, styles.rotulo]}>E-mail</Text>
                <TextInput
                    style={[type.valorCampo, styles.input]}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="voce@email.com"
                    placeholderTextColor={NOTA}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                    onSubmitEditing={bloqueado ? undefined : enviar}
                />
            </View>

            {erro ? (
                <Text style={[type.corpoSm, styles.erro]}>{erro}</Text>
            ) : null}

            <Pressable
                style={[styles.cta, bloqueado && styles.ctaBloqueado]}
                disabled={bloqueado}
                onPress={enviar}
            >
                <Text
                    style={[
                        type.botao,
                        bloqueado ? styles.ctaTextoFraco : styles.ctaTexto,
                    ]}
                >
                    {enviando ? "Enviando…" : "Enviar link"}
                </Text>
            </Pressable>

            <Pressable
                style={styles.link}
                hitSlop={8}
                onPress={() => router.replace("/entrar")}
            >
                <Text style={[type.labelCampo, styles.linkTexto]}>
                    Lembrei, voltar
                </Text>
            </Pressable>
        </View>
    );
}

function NovaSenha({ token }: { token: string }) {
    const router = useRouter();
    const [senha, setSenha] = useState("");
    const [repetir, setRepetir] = useState("");
    const [erro, setErro] = useState<string | null>(null);
    const [salvando, setSalvando] = useState(false);

    const faltando = passwordProblems(senha);
    const diferentes = repetir.length > 0 && repetir !== senha;
    const bloqueado =
        salvando || faltando.length > 0 || repetir !== senha || !senha;

    const salvar = async () => {
        setErro(null);
        setSalvando(true);

        try {
            await resetPassword(token, senha);
            router.replace("/entrar");
            mostrarToast("Senha nova salva. Já pode entrar.");
        } catch (raw) {
            setErro(
                raw instanceof AuthError
                    ? raw.message
                    : "Não deu para salvar a senha agora.",
            );
            setSalvando(false);
        }
    };

    return (
        <View style={styles.bloco}>
            <Text style={[type.tituloTela, styles.titulo]}>Senha nova</Text>
            <Text style={[type.corpo, styles.texto]}>
                Escolha a senha que vai usar para entrar no Panela.
            </Text>

            <View style={styles.campo}>
                <Text style={[type.labelCampo, styles.rotulo]}>Senha nova</Text>
                <TextInput
                    style={[type.valorCampo, styles.input]}
                    value={senha}
                    onChangeText={setSenha}
                    placeholder="••••••"
                    placeholderTextColor={NOTA}
                    secureTextEntry
                    autoComplete="new-password"
                />
                {senha.length > 0 && faltando.length > 0 ? (
                    <Text style={[type.metadado, styles.dica]}>
                        Falta: {faltando.join(", ")}.
                    </Text>
                ) : null}
            </View>

            <View style={styles.campo}>
                <Text style={[type.labelCampo, styles.rotulo]}>
                    Repita a senha
                </Text>
                <TextInput
                    style={[type.valorCampo, styles.input]}
                    value={repetir}
                    onChangeText={setRepetir}
                    placeholder="••••••"
                    placeholderTextColor={NOTA}
                    secureTextEntry
                    autoComplete="new-password"
                />
                {diferentes ? (
                    <Text style={[type.metadado, styles.dica]}>
                        As senhas não são iguais.
                    </Text>
                ) : null}
            </View>

            {erro ? (
                <Text style={[type.corpoSm, styles.erro]}>{erro}</Text>
            ) : null}

            <Pressable
                style={[styles.cta, bloqueado && styles.ctaBloqueado]}
                disabled={bloqueado}
                onPress={salvar}
            >
                <Text
                    style={[
                        type.botao,
                        bloqueado ? styles.ctaTextoFraco : styles.ctaTexto,
                    ]}
                >
                    {salvando ? "Salvando…" : "Salvar senha"}
                </Text>
            </Pressable>

            {erro ? (
                <Pressable
                    style={styles.link}
                    hitSlop={8}
                    onPress={() => router.replace("/esqueci-senha")}
                >
                    <Text style={[type.labelCampo, styles.linkTexto]}>
                        Pedir um link novo
                    </Text>
                </Pressable>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    tela: {
        flex: 1,
        backgroundColor: FUNDO,
        overflow: "hidden",
    },
    brilho: {
        position: "absolute",
        width: 460,
        height: 460,
        borderRadius: 230,
        left: -130,
        top: 60,
        opacity: 0.16,
        backgroundColor: colors.primary,
    },
    conteudo: {
        flexGrow: 1,
        justifyContent: "flex-end",
        paddingHorizontal: 28,
        paddingBottom: 40,
        paddingTop: 80,
    },
    bloco: {
        gap: spacing.md,
    },
    titulo: {
        color: colors.onPrimary,
    },
    texto: {
        color: TEXTO_SUAVE,
        marginBottom: spacing.sm,
    },
    campo: {
        gap: spacing.sm,
    },
    rotulo: {
        color: TEXTO_SUAVE,
    },
    input: {
        minHeight: size.input,
        paddingHorizontal: spacing.lg,
        borderRadius: radius.sm,
        borderWidth: 1,
        borderColor: CONTORNO,
        color: colors.onPrimary,
    },
    dica: {
        color: NOTA,
    },
    erro: {
        color: colors.primary,
    },
    cta: {
        minHeight: size.cta,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: radius.sm,
        backgroundColor: colors.primary,
    },
    ctaBloqueado: {
        backgroundColor: "rgba(218,104,13,0.35)",
    },
    ctaTexto: {
        color: colors.onPrimary,
    },
    ctaTextoFraco: {
        color: "rgba(255,254,251,0.6)",
    },
    link: {
        alignSelf: "center",
        paddingVertical: spacing.sm,
    },
    linkTexto: {
        color: TEXTO_SUAVE,
    },
});
