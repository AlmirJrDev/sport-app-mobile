import { FIREBASE_CONFIG, VAPID_KEY, isPushConfigured } from "./config";

export type PushState =
    | "sem-config"
    | "nao-suportado"
    | "bloqueado"
    | "desativado"
    | "ativado";

export interface PushResult {
    state: PushState;
    token?: string;
    message?: string;
}

const SW_PATH = "/firebase-messaging-sw.js";

function suportado(): boolean {
    return (
        typeof window !== "undefined" &&
        "Notification" in window &&
        "serviceWorker" in navigator &&
        "PushManager" in window
    );
}

export async function pushStatus(): Promise<PushState> {
    if (!suportado()) {
        return "nao-suportado";
    }

    if (!isPushConfigured()) {
        return "sem-config";
    }

    if (Notification.permission === "denied") {
        return "bloqueado";
    }

    return Notification.permission === "granted" ? "ativado" : "desativado";
}

/**
 * O service worker recebe a configuração pela query string, para o projeto
 * ficar declarado num lugar só (src/push/config.ts).
 */
function swUrl(): string {
    const query = new URLSearchParams(
        FIREBASE_CONFIG as unknown as Record<string, string>,
    );

    return `${SW_PATH}?${query.toString()}`;
}

export async function enablePush(): Promise<PushResult> {
    if (!suportado()) {
        return {
            state: "nao-suportado",
            message:
                "Este navegador não faz notificação push. No iPhone, funciona só com o app instalado na tela de início.",
        };
    }

    if (!isPushConfigured()) {
        return {
            state: "sem-config",
            message:
                "Falta a configuração do projeto no Firebase para ligar as notificações.",
        };
    }

    const permissao = await Notification.requestPermission();

    if (permissao !== "granted") {
        return {
            state: permissao === "denied" ? "bloqueado" : "desativado",
            message:
                permissao === "denied"
                    ? "As notificações estão bloqueadas para este site. Libere nas permissões do navegador."
                    : "Você fechou o pedido sem responder.",
        };
    }

    try {
        const registro = await navigator.serviceWorker.register(swUrl(), {
            scope: "/",
        });

        const [{ initializeApp }, { getMessaging, getToken, isSupported }] =
            await Promise.all([
                import("firebase/app"),
                import("firebase/messaging"),
            ]);

        if (!(await isSupported())) {
            return {
                state: "nao-suportado",
                message: "Este navegador não é compatível com o Firebase Messaging.",
            };
        }

        const app = initializeApp(FIREBASE_CONFIG);
        const token = await getToken(getMessaging(app), {
            vapidKey: VAPID_KEY,
            serviceWorkerRegistration: registro,
        });

        if (!token) {
            return {
                state: "desativado",
                message: "O Firebase não devolveu o token do dispositivo.",
            };
        }

        return { state: "ativado", token };
    } catch (raw) {
        return {
            state: "desativado",
            message:
                raw instanceof Error
                    ? raw.message
                    : "Não deu para registrar as notificações.",
        };
    }
}
