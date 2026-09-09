import { useState } from "react";
import { Link, Redirect, useRouter } from "expo-router";
import {
    ActivityIndicator,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { AuthError, signIn } from "../src/auth/account";
import { useSession } from "../src/auth/useSession";
import { colors, radius, size, spacing, type } from "../src/design/tokens";

/** A entrada é sempre escura, mesmo quando o app tiver tema claro/escuro. */
const FUNDO = "#1C1614";
const TEXTO_SUAVE = "#C9C3B6";
const NOTA = "#7C766B";
const CONTORNO = "#4A423C";

export default function SignInScreen() {
    const router = useRouter();
    const { account, loading, reload } = useSession();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    if (loading) {
        return (
            <View style={styles.centro}>
                <ActivityIndicator color={colors.primary} />
            </View>
        );
    }

    if (account) {
        return <Redirect href="/" />;
    }

    const bloqueado = busy || !email || !password;

    const handleSubmit = async () => {
        setBusy(true);
        setError(null);

        try {
            await signIn(email, password);
            reload();
            router.replace("/");
        } catch (raw) {
            setError(
                raw instanceof AuthError
                    ? raw.message
                    : "Não deu para entrar agora.",
            );
        } finally {
            setBusy(false);
        }
    };

    return (
        <View style={styles.tela}>
            <View style={styles.brilho} />

            <ScrollView contentContainerStyle={styles.conteudo}>
                <View style={styles.marca}>
                    <Image
                        source={require("../assets/logo.png")}
                        style={styles.logo}
                    />

                    <Text style={[type.displayEntrada, styles.display]}>
                        {"Jogo perto\nde você,\nagora"}
                    </Text>

                    <Text style={[type.corpoLg, styles.subtitulo]}>
                        Ache quem está jogando na sua rua, confirme presença e
                        acompanhe o placar.
                    </Text>
                </View>

                <View style={styles.formulario}>
                    <View style={styles.campo}>
                        <Text style={[type.labelCampo, styles.rotulo]}>
                            E-mail
                        </Text>
                        <TextInput
                            style={[type.valorCampo, styles.input]}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="voce@email.com"
                            placeholderTextColor={NOTA}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            autoComplete="email"
                        />
                    </View>

                    <View style={styles.campo}>
                        <Text style={[type.labelCampo, styles.rotulo]}>
                            Senha
                        </Text>
                        <TextInput
                            style={[type.valorCampo, styles.input]}
                            value={password}
                            onChangeText={setPassword}
                            placeholder="••••••"
                            placeholderTextColor={NOTA}
                            secureTextEntry
                        />
                    </View>

                    {error ? (
                        <Text style={[type.corpoSm, styles.erro]}>{error}</Text>
                    ) : null}

                    <Pressable
                        style={[styles.cta, bloqueado && styles.ctaBloqueado]}
                        disabled={bloqueado}
                        onPress={handleSubmit}
                    >
                        <Text
                            style={[
                                type.botao,
                                bloqueado ? styles.ctaTextoFraco : styles.ctaTexto,
                            ]}
                        >
                            {busy ? "Entrando…" : "Entrar"}
                        </Text>
                    </Pressable>

                    <Link href="/criar-conta" asChild>
                        <View style={styles.secundario}>
                            <Text style={[type.botao, styles.secundarioTexto]}>
                                Criar conta
                            </Text>
                        </View>
                    </Link>

                    <Text style={[type.metadado, styles.nota]}>
                        Ao entrar você concorda em aparecer na lista de presença
                        dos jogos que confirmar.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    tela: {
        flex: 1,
        backgroundColor: FUNDO,
        overflow: "hidden",
    },
    centro: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: FUNDO,
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
        gap: 28,
    },
    marca: {
        gap: spacing.lg,
    },
    logo: {
        width: 92,
        height: 92,
    },
    display: {
        color: colors.onPrimary,
    },
    subtitulo: {
        maxWidth: 300,
        color: TEXTO_SUAVE,
    },
    formulario: {
        gap: spacing.md,
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
    secundario: {
        minHeight: size.cta,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: radius.sm,
        borderWidth: 1,
        borderColor: CONTORNO,
    },
    secundarioTexto: {
        color: colors.onPrimary,
    },
    nota: {
        marginTop: spacing.sm,
        textAlign: "center",
        color: NOTA,
    },
});
