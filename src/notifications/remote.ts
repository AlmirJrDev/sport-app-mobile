import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { apiFetch } from "../api/client";

const TOKEN_KEY = "projetoh:push_token";

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

    await AsyncStorage.setItem(TOKEN_KEY, pushToken);
}

/** Desliga o push deste aparelho, usando o token guardado no registro. */
export async function dropDevice(): Promise<void> {
    const guardado = await AsyncStorage.getItem(TOKEN_KEY);

    if (!guardado) {
        return;
    }

    await unregisterDevice(guardado);
    await AsyncStorage.removeItem(TOKEN_KEY);
}

export interface NotificationPrefs {
    push: boolean;
    noApp: boolean;
    jogos: boolean;
    social: boolean;
    novidades: boolean;
}

interface ApiPrefs {
    push_enabled?: unknown;
    in_app_enabled?: unknown;
    game_updates?: unknown;
    social_updates?: unknown;
    marketing?: unknown;
}

const CAMPOS: Record<keyof NotificationPrefs, keyof ApiPrefs> = {
    push: "push_enabled",
    noApp: "in_app_enabled",
    jogos: "game_updates",
    social: "social_updates",
    novidades: "marketing",
};

function ligado(valor: unknown, padrao: boolean): boolean {
    return typeof valor === "boolean" ? valor : padrao;
}

function toPrefs(bruto: ApiPrefs | null): NotificationPrefs | null {
    if (!bruto || typeof bruto !== "object") {
        return null;
    }

    return {
        push: ligado(bruto.push_enabled, true),
        noApp: ligado(bruto.in_app_enabled, true),
        jogos: ligado(bruto.game_updates, true),
        social: ligado(bruto.social_updates, true),
        novidades: ligado(bruto.marketing, false),
    };
}

export async function getPreferences(): Promise<NotificationPrefs | null> {
    const { data } = await apiFetch<ApiPrefs>("/notifications/preferences", {
        auth: true,
    });

    return toPrefs(data);
}

export async function updatePreferences(
    mudanca: Partial<NotificationPrefs>,
): Promise<NotificationPrefs | null> {
    const corpo: Record<string, boolean> = {};

    for (const [chave, valor] of Object.entries(mudanca)) {
        if (typeof valor === "boolean") {
            corpo[CAMPOS[chave as keyof NotificationPrefs]] = valor;
        }
    }

    const { data } = await apiFetch<ApiPrefs>("/notifications/preferences", {
        method: "PATCH",
        body: corpo,
        auth: true,
    });

    return toPrefs(data);
}

export async function unregisterDevice(pushToken: string): Promise<void> {
    await apiFetch<void>(
        `/notifications/devices?push_token=${encodeURIComponent(pushToken)}`,
        { method: "DELETE", auth: true },
    );
}
