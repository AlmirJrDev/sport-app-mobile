import { Redirect, useLocalSearchParams } from "expo-router";

/** Endereço que o e-mail de redefinição usa; a tela de verdade é /esqueci-senha. */
export default function ResetPasswordLink() {
    const { token } = useLocalSearchParams<{ token?: string }>();

    if (!token) {
        return <Redirect href="/esqueci-senha" />;
    }

    return (
        <Redirect href={`/esqueci-senha?token=${encodeURIComponent(token)}`} />
    );
}
