import { Platform } from "react-native";

import { apiFetch } from "../api/client";

export interface AppNotification {
    id: string;
    type: string;
    title: string;
    body: string;
    gameId: string | null;
    createdAt: string;
    readAt: string | null;
}

interface ApiNotification {
    id?: unknown;
    type?: unknown;
    title?: unknown;
    body?: unknown;
    data?: Record<string, unknown> | null;
    created_at?: unknown;
    read_at?: unknown;
}

function texto(valor: unknown): string {
    return typeof valor === "string" ? valor : "";
}

function toNotification(bruto: ApiNotification): AppNotification | null {
    const id = texto(bruto?.id);

    if (!id) {
        return null;
    }

    const gameId = texto(bruto.data?.game_id);

    return {
        id,
        type: texto(bruto.type),
        title: texto(bruto.title) || "Aviso",
        body: texto(bruto.body),
        gameId: gameId || null,
        createdAt: texto(bruto.created_at),
        readAt: texto(bruto.read_at) || null,
    };
}

export async function listNotifications(): Promise<AppNotification[]> {
    const { data } = await apiFetch<ApiNotification[]>("/notifications", {
        auth: true,
    });

    if (!Array.isArray(data)) {
        return [];
    }

    return data
        .map(toNotification)
        .filter((item): item is AppNotification => item !== null);
}

export async function markNotificationRead(id: string): Promise<void> {
    await apiFetch<void>(`/notifications/${id}/read`, {
        method: "PATCH",
        auth: true,
    });
}

function plataforma(): string {
    if (Platform.OS === "ios" || Platform.OS === "android") {
        return Platform.OS;
    }

    return Platform.OS === "web" ? "web" : "other";
}

export async function registerDevice(pushToken: string): Promise<void> {
    await apiFetch<unknown>("/notifications/devices", {
        method: "POST",
        auth: true,
        body: { push_token: pushToken, platform: plataforma() },
    });
}
