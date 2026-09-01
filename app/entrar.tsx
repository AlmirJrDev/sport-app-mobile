import { useState } from "react";
import { Link, Redirect, useRouter } from "expo-router";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";

import { AuthError, signIn } from "../src/auth/account";
import { useSession } from "../src/auth/useSession";
import { colors, spacing, type } from "../src/design/tokens";
import { Button, Card, Eyebrow, Field } from "../src/design/ui";

export default function SignInScreen() {
    const router = useRouter();
    const { account, loading, reload } = useSession();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator color={colors.ink} />
            </View>
        );
    }

    if (account) {
        return <Redirect href="/" />;
    }

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
        <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <Eyebrow>Projeto H</Eyebrow>
                <Text style={[type.displayMd, styles.title]}>
                    Entrar na sua conta
                </Text>
                <Text style={[type.bodyMd, styles.lead]}>
                    Para marcar jogo, confirmar presença e aparecer na lista.
                </Text>
            </View>

            <Card style={styles.card}>
                <Field
                    label="E-mail"
                    value={email}
                    onChangeText={setEmail}
                    placeholder="voce@email.com"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                />

                <Field
                    label="Senha"
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••"
                    secureTextEntry
                />

                {error ? (
                    <Text style={[type.bodySm, styles.error]}>{error}</Text>
                ) : null}

                <Button
                    label={busy ? "Entrando…" : "Entrar"}
                    onPress={handleSubmit}
                    disabled={busy || !email || !password}
                />
            </Card>

            <View style={styles.footer}>
                <Text style={[type.bodySm, styles.lead]}>
                    Ainda não tem conta?
                </Text>
                <Link href="/criar-conta" style={[type.bodySmStrong, styles.link]}>
                    Criar conta
                </Link>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    content: {
        padding: spacing.xl,
        gap: spacing.xl,
        backgroundColor: colors.canvas,
        flexGrow: 1,
        justifyContent: "center",
    },
    centered: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.canvas,
    },
    header: {
        gap: spacing.sm,
    },
    title: {
        color: colors.ink,
    },
    lead: {
        color: colors.body,
    },
    card: {
        gap: spacing.lg,
    },
    error: {
        color: colors.primary,
    },
    footer: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
    },
    link: {
        color: colors.primary,
    },
});
