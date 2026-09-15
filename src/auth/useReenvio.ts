import { useEffect, useState } from "react";

import { AuthError, resendVerification } from "./account";

const ESPERA_SEGUNDOS = 60;

/** Reenvio do e-mail de verificação com espera entre um envio e outro. */
export function useReenvio(email: string, acabouDeEnviar = false) {
    const [restante, setRestante] = useState(
        acabouDeEnviar ? ESPERA_SEGUNDOS : 0,
    );
    const [enviando, setEnviando] = useState(false);
    const [recado, setRecado] = useState<string | null>(null);

    useEffect(() => {
        if (restante <= 0) {
            return;
        }

        const timer = setTimeout(() => setRestante((atual) => atual - 1), 1000);

        return () => clearTimeout(timer);
    }, [restante]);

    const reenviar = async () => {
        setEnviando(true);
        setRecado(null);

        try {
            await resendVerification(email);
            setRecado(`Mandamos outro link para ${email.trim()}.`);
            setRestante(ESPERA_SEGUNDOS);
        } catch (raw) {
            setRecado(
                raw instanceof AuthError
                    ? raw.message
                    : "Não deu para reenviar agora. Tente de novo.",
            );
        } finally {
            setEnviando(false);
        }
    };

    const rotulo = enviando
        ? "Reenviando…"
        : restante > 0
          ? `Reenviar e-mail em ${restante}s`
          : "Reenviar e-mail";

    return {
        reenviar,
        rotulo,
        recado,
        bloqueado: enviando || restante > 0 || !email.trim(),
    };
}
