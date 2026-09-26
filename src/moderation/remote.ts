import { apiFetch } from "../api/client";

export const MOTIVOS_JOGO = [
    "Informações falsas",
    "O local não existe",
    "Conteúdo ofensivo",
    "Golpe ou propaganda",
    "Outro motivo",
];

export const MOTIVOS_PESSOA = [
    "Me incomodou",
    "Conteúdo ofensivo",
    "Perfil falso",
    "Golpe ou propaganda",
    "Outro motivo",
];

export async function reportGame(
    gameId: string,
    reason: string,
    description?: string,
): Promise<void> {
    await apiFetch<unknown>(`/games/${gameId}/report`, {
        method: "POST",
        auth: true,
        body: {
            reason,
            ...(description?.trim() ? { description: description.trim() } : {}),
        },
    });
}

export async function blockUser(
    userId: string,
    reason?: string,
): Promise<void> {
    await apiFetch<unknown>(`/users/${userId}/block`, {
        method: "POST",
        auth: true,
        body: reason?.trim() ? { reason: reason.trim() } : {},
    });
}
