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

export async function pushStatus(): Promise<PushState> {
    return "nao-suportado";
}

export async function enablePush(): Promise<PushResult> {
    return {
        state: "nao-suportado",
        message: "Notificações por enquanto só no navegador e no PWA.",
    };
}
