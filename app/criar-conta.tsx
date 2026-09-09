import { useEffect, useState } from "react";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import {
    AuthError,
    isValidEmail,
    passwordProblems,
    register,
    signIn,
    verifyEmail,
} from "../src/auth/account";
import {
    clearPending,
    readPending,
    savePending,
} from "../src/auth/pending";
import { toIsoDate, ufToCode } from "../src/auth/uf";
import { useSession } from "../src/auth/useSession";
import { colors, spacing, type } from "../src/design/tokens";
import { Button, Card, Eyebrow, Field } from "../src/design/ui";

export default function SignUpScreen() {
    const router = useRouter();
    const { reload } = useSession();
    const { token: tokenFromLink } = useLocalSearchParams<{ token?: string }>();

    const [step, setStep] = useState<1 | 2>(1);
    const [verifyToken, setVerifyToken] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const [sent, setSent] = useState(false);
    const [busy, setBusy] = useState(false);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
        let active = true;

        if (tokenFromLink) {
            setVerifyToken(tokenFromLink);
            setStep(2);
            setNotice(
                "E-mail confirmado. Complete seus dados para concluir o cadastro.",
            );

            return;
        }

        readPending().then((pending) => {
            if (active && pending) {
                setEmail(pending.email);
                setVerifyToken(pending.token);
                setStep(2);
                setNotice(
                    "Você já tinha começado um cadastro com esse e-mail. Continuando de onde parou.",
                );
            }
        });

        return () => {
            active = false;
        };
    }, [tokenFromLink]);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState("");
    const [uf, setUf] = useState("");
    const [city, setCity] = useState("");
    const [birthDate, setBirthDate] = useState("");

    const emailError =
        email.length > 0 && !isValidEmail(email) ? "E-mail inválido." : "";
    const missing = passwordProblems(password);
    const passwordError =
        password.length > 0 && missing.length > 0
            ? `Falta: ${missing.join(", ")}.`
            : "";

    const canSubmitStep1 =
        isValidEmail(email) && missing.length === 0 && !busy;

    const ufCode = ufToCode(uf);
    const isoBirth = toIsoDate(birthDate);
    const canSubmitStep2 =
        firstName.trim().length >= 2 &&
        lastName.trim().length >= 2 &&
        phone.replace(/\D/g, "").length >= 10 &&
        ufCode !== null &&
        city.trim().length >= 2 &&
        isoBirth !== null &&
        !busy;

    const handleStep1 = async () => {
        setBusy(true);
        setError(null);

        try {
            const token = await register(email, password);
            await savePending({ email: email.trim(), token });
            setVerifyToken(token);
            setSent(true);
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

    const handleStep2 = async () => {
        if (ufCode === null || isoBirth === null) {
            return;
        }

        setBusy(true);
        setError(null);

        try {
            await verifyEmail(verifyToken, {
                firstName,
                lastName,
                phone: phone.replace(/\D/g, ""),
                uf: uf.trim().toUpperCase(),
                city,
                birthDate: isoBirth,
            });

            await clearPending();

            if (!password) {
                router.replace("/entrar");
                return;
            }

            await signIn(email, password);
            reload();
            router.replace("/onboarding");
        } catch (raw) {
            setError(
                raw instanceof AuthError
                    ? raw.message
                    : "Não deu para concluir o cadastro.",
            );
        } finally {
            setBusy(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <Eyebrow>{step === 1 ? "Passo 1 de 2" : "Passo 2 de 2"}</Eyebrow>
                <Text style={[type.tituloPasso, styles.title]}>
                    {step === 1 ? "Criar conta" : "Seus dados"}
                </Text>
                <Text style={[type.corpo, styles.lead]}>
                    {step === 1
                        ? "Comece com e-mail e senha."
                        : "Seu nome é o que os outros jogadores veem na lista de presença."}
                </Text>

                {notice ? (
                    <Text style={[type.bodySm, styles.notice]}>{notice}</Text>
                ) : null}
            </View>

            {sent ? (
                <Card style={styles.card}>
                    <Text style={[type.bodyMd, styles.title]}>
                        Confira seu e-mail
                    </Text>
                    <Text style={[type.bodySm, styles.lead]}>
                        Enviamos um link para {email}. Abra ele para completar
                        seus dados e concluir o cadastro.
                    </Text>

                    <Button
                        label="Continuar aqui mesmo"
                        variant="tertiary"
                        onPress={() => {
                            setSent(false);
                            setStep(2);
                        }}
                    />
                </Card>
            ) : step === 1 ? (
                <Card style={styles.card}>
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
                        placeholder="8+ com maiúscula, número e símbolo"
                        secureTextEntry
                        error={passwordError}
                    />

                    {error ? (
                        <Text style={[type.bodySm, styles.error]}>{error}</Text>
                    ) : null}

                    <Button
                        label={busy ? "Enviando…" : "Continuar"}
                        onPress={handleStep1}
                        disabled={!canSubmitStep1}
                    />
                </Card>
            ) : (
                <Card style={styles.card}>
                    <Field
                        label="Nome"
                        value={firstName}
                        onChangeText={setFirstName}
                        placeholder="Almir"
                    />

                    <Field
                        label="Sobrenome"
                        value={lastName}
                        onChangeText={setLastName}
                        placeholder="Gomes"
                    />

                    <Field
                        label="Telefone"
                        value={phone}
                        onChangeText={setPhone}
                        placeholder="19999999999"
                        keyboardType="phone-pad"
                    />

                    <Field
                        label="Cidade"
                        value={city}
                        onChangeText={setCity}
                        placeholder="Campinas"
                    />

                    <Field
                        label="Estado (UF)"
                        value={uf}
                        onChangeText={setUf}
                        placeholder="SP"
                        autoCapitalize="characters"
                        maxLength={2}
                        error={
                            uf.length === 2 && ufCode === null
                                ? "UF não existe."
                                : ""
                        }
                    />

                    <Field
                        label="Data de nascimento"
                        value={birthDate}
                        onChangeText={setBirthDate}
                        placeholder="20/05/1998"
                        maxLength={10}
                        error={
                            birthDate.length === 10 && isoBirth === null
                                ? "Data inválida."
                                : ""
                        }
                    />

                    {error ? (
                        <Text style={[type.bodySm, styles.error]}>{error}</Text>
                    ) : null}

                    <Button
                        label={busy ? "Concluindo…" : "Concluir cadastro"}
                        onPress={handleStep2}
                        disabled={!canSubmitStep2}
                    />
                </Card>
            )}

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
        paddingBottom: spacing.xxxl,
        gap: spacing.xxl,
        backgroundColor: colors.canvas,
        flexGrow: 1,
        justifyContent: "center",
    },
    header: {
        gap: spacing.xs,
    },
    title: {
        color: colors.ink,
    },
    lead: {
        color: colors.body,
    },
    card: {
        gap: spacing.lg,
        padding: 0,
        backgroundColor: "transparent",
    },
    error: {
        color: colors.primary,
    },
    notice: {
        color: colors.ink,
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
