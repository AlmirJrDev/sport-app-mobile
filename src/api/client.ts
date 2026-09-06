import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

export const API_ORIGIN = "https://api--sport-app--cjlm46fp2mm6.code.run";

/**
 * No web passamos pelo proxy da Vercel para ficar na mesma origem: o cookie
 * de sessão é SameSite=Lax e o navegador não o envia entre domínios.
 * No nativo não existe origem, então falamos direto com a API.
 */
export const API_PREFIX = "/v1";

export const API_BASE =
    Platform.OS === "web"
        ? `/api${API_PREFIX}`
        : `${API_ORIGIN}${API_PREFIX}`;

const ACCESS_KEY = "projetoh:access_token";
const REFRESH_KEY = "projetoh:refresh_token";

export class ApiError extends Error {
    status: number;
    fields: string[];
    payload: unknown;

    constructor(
        message: string,
        status: number,
        fields: string[] = [],
        payload: unknown = null,
    ) {
        super(message);
        this.status = status;
        this.fields = fields;
        this.payload = payload;
    }
}

export function describePayload(payload: unknown): string {
    if (payload === null || payload === undefined) {
        return "corpo vazio";
    }

    if (typeof payload === "string") {
        return `texto: ${payload.slice(0, 120)}`;
    }

    if (typeof payload === "object") {
        const keys = Object.keys(payload as Record<string, unknown>);

        if (keys.length === 0) {
            return "objeto vazio {}";
        }

        return `chaves: ${keys.join(", ")}`;
    }

    return String(payload);
}

let accessToken: string | null = null;
let refreshToken: string | null = null;
let loaded = false;

async function loadTokens(): Promise<void> {
    if (loaded) {
        return;
    }

    const [access, refresh] = await Promise.all([
        AsyncStorage.getItem(ACCESS_KEY),
        AsyncStorage.getItem(REFRESH_KEY),
    ]);

    accessToken = access;
    refreshToken = refresh;
    loaded = true;
}

export async function setTokens(
    access: string | null,
    refresh: string | null,
): Promise<void> {
    accessToken = access;
    refreshToken = refresh;
    loaded = true;

    if (access) {
        await AsyncStorage.setItem(ACCESS_KEY, access);
    } else {
        await AsyncStorage.removeItem(ACCESS_KEY);
    }

    if (refresh) {
        await AsyncStorage.setItem(REFRESH_KEY, refresh);
    } else {
        await AsyncStorage.removeItem(REFRESH_KEY);
    }
}

export async function hasToken(): Promise<boolean> {
    await loadTokens();

    return accessToken !== null;
}

function readMessage(payload: unknown, status: number): [string, string[]] {
    if (payload && typeof payload === "object" && "message" in payload) {
        const raw = (payload as { message: unknown }).message;

        if (Array.isArray(raw)) {
            return [String(raw[0] ?? "Requisição inválida."), raw.map(String)];
        }

        if (typeof raw === "string") {
            return [raw, []];
        }
    }

    return [`Erro ${status} na API.`, []];
}

/**
 * O login pode devolver os tokens no corpo ou só em cookie. Procuramos as
 * formas mais comuns antes de desistir e confiar no cookie.
 */
export function pickTokens(payload: unknown): {
    access: string | null;
    refresh: string | null;
} {
    if (typeof payload === "string") {
        const trimmed = payload.trim();

        return {
            access: trimmed.length > 0 ? trimmed : null,
            refresh: null,
        };
    }

    const bag =
        payload && typeof payload === "object"
            ? ((payload as Record<string, unknown>).data &&
              typeof (payload as Record<string, unknown>).data === "object"
                  ? ((payload as Record<string, unknown>).data as Record<
                        string,
                        unknown
                    >)
                  : (payload as Record<string, unknown>))
            : {};

    const pick = (keys: string[]): string | null => {
        for (const key of keys) {
            const value = bag[key];

            if (typeof value === "string" && value.length > 0) {
                return value;
            }
        }

        return null;
    };

    return {
        access: pick(["access_token", "accessToken", "token", "jwt"]),
        refresh: pick(["refresh_token", "refreshToken"]),
    };
}

interface RequestOptions {
    method?: "GET" | "POST" | "PATCH" | "DELETE";
    body?: unknown;
    auth?: boolean;
    retryOn401?: boolean;
}

export async function apiFetch<T>(
    path: string,
    options: RequestOptions = {},
): Promise<{ data: T; raw: unknown }> {
    const { method = "GET", body, auth = false, retryOn401 = true } = options;

    await loadTokens();

    const headers: Record<string, string> = {};
    const isForm = typeof FormData !== "undefined" && body instanceof FormData;

    if (body !== undefined && !isForm) {
        headers["Content-Type"] = "application/json";
    }

    if (auth && accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await fetch(`${API_BASE}${path}`, {
        method,
        headers,
        credentials: "include",
        body:
            body === undefined
                ? undefined
                : isForm
                  ? (body as FormData)
                  : JSON.stringify(body),
    });

    const text = await response.text();
    let payload: unknown = null;

    if (text) {
        try {
            payload = JSON.parse(text);
        } catch {
            payload = text;
        }
    }

    if (response.status === 401 && auth && retryOn401) {
        const renewed = await refreshSession();

        if (renewed) {
            return apiFetch<T>(path, { ...options, retryOn401: false });
        }
    }

    if (!response.ok) {
        const [message, fields] = readMessage(payload, response.status);
        throw new ApiError(message, response.status, fields, payload);
    }

    return { data: payload as T, raw: payload };
}

export async function refreshSession(): Promise<boolean> {
    try {
        const { raw } = await apiFetch<unknown>("/auth/refresh-token", {
            method: "POST",
            retryOn401: false,
        });

        const tokens = pickTokens(raw);

        if (tokens.access) {
            await setTokens(tokens.access, tokens.refresh ?? refreshToken);
        }

        return true;
    } catch {
        return false;
    }
}
