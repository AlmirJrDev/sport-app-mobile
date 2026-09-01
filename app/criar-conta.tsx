import { useState } from "react";
import { Link, useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { AuthError, isValidEmail, signUp } from "../src/auth/account";
import { useSession } from "../src/auth/useSession";
import { colors, spacing, type } from "../src/design/tokens";
import { Button, Card, Eyebrow, Field } from "../src/design/ui";

export default function SignUpScreen() {
    const router = useRouter();
    const { reload } = useSession();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    const nameError =
        name.length > 0 && name.trim().length < 2 ? "Nome muito curto." : "";
    const emailError =
        email.length > 0 && !isValidEmail(email) ? "E-mail inválido." : "";
    const passwordError =
        password.length > 0 && password.length < 6
            ? "Use pelo menos 6 caracteres."
            : "";

    const canSubmit =
        name.trim().length >= 2 &&
        isValidEmail(email) &&
        password.length >= 6 &&
        !busy;

    const handleSubmit = async () => {
        setBusy(true);
        setError(null);

        try {
            await signUp(name, email, password);
            reload();
            router.replace("/");
        } catch (raw) {
            setError(
                raw instanceof AuthError
                    ? raw.message
                    : "Não deu para criar a conta agora.",
            );
        } finally {
            setBusy(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <Eyebrow>Projeto H</Eyebrow>
                <Text style={[type.displayMd, styles.title]}>Criar conta</Text>
                <Text style={[type.bodyMd, styles.lead]}>
                    Seu nome é o que os outros jogadores veem na lista de
                    presença.
                </Text>
            </View>

            <Card style={styles.card}>
                <Field
                    label="Nome"
                    value={name}
                    onChangeText={setName}
                    placeholder="Como te chamam na quadra"
                    error={nameError}
                />

                <Field
                    label="E-mail"
                    value={email}
                    onChangeText={setEmail}
                    placeholder="voce@email.com"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    error={emailError}
                />

                <Field
                    label="Senha"
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Mínimo 6 caracteres"
                    secureTextEntry
                    error={passwordError}
                />

                {error ? (
                    <Text style={[type.bodySm, styles.error]}>{error}</Text>
                ) : null}

                <Button
                    label={busy ? "Criando…" : "Criar conta"}
                    onPress={handleSubmit}
                    disabled={!canSubmit}
                />
            </Card>

            <View style={styles.footer}>
                <Text style={[type.bodySm, styles.lead]}>Já tem conta?</Text>
                <Link href="/entrar" style={[type.bodySmStrong, styles.link]}>
                    Entrar
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
