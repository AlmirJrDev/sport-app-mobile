import { Redirect, useLocalSearchParams } from "expo-router";

export default function VerifyRedirectScreen() {
    const { token } = useLocalSearchParams<{ token?: string }>();

    if (!token) {
        return <Redirect href="/entrar" />;
    }

    return <Redirect href={`/criar-conta?token=${encodeURIComponent(token)}`} />;
}
