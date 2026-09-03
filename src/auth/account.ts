import {
    ApiError,
    apiFetch,
    describePayload,
    hasToken,
    pickTokens,
    setTokens,
} from "../api/client";

export interface Account {
    id: string;
    name: string;
    email: string;
}

export interface ProfileInput {
    firstName: string;
    lastName: string;
    phone: string;
    uf: number;
    city: string;
    birthDate: string;
}

export { ApiError as AuthError };

export const PASSWORD_RULES = [
    { test: (v: string) => v.length >= 8, label: "8 caracteres ou mais" },
    { test: (v: string) => /[a-z]/.test(v), label: "uma letra minúscula" },
    { test: (v: string) => /[A-Z]/.test(v), label: "uma letra maiúscula" },
    { test: (v: string) => /\d/.test(v), label: "um número" },
    {
        test: (v: string) => /[^A-Za-z0-9]/.test(v),
        label: "um símbolo",
    },
    {
        test: (v: string) => !/(.)\1\1/.test(v),
        label: "sem 3 caracteres iguais seguidos",
    },
    {
        test: (v: string) =>
            !/(123456|654321|qwerty|abcdef|senha|password)/i.test(v),
        label: "sem sequências óbvias",
    },
];

export function passwordProblems(password: string): string[] {
    return PASSWORD_RULES.filter((rule) => !rule.test(password)).map(
        (rule) => rule.label,
    );
}

export function isValidEmail(email: string): boolean {
    const trimmed = email.trim();

    return /^[^\s@]{3,}@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

interface MeResponse {
    id?: string | number;
    _id?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    name?: string;
    data?: MeResponse;
}

function toAccount(payload: MeResponse): Account {
    const body = payload.data ?? payload;

    const first = body.first_name ?? "";
    const last = body.last_name ?? "";
    const composed = `${first} ${last}`.trim();

    return {
        id: String(body.id ?? body._id ?? body.email ?? "sem-id"),
        name: composed || body.name || body.email || "Atleta",
        email: body.email ?? "",
    };
}

let cached: Account | null = null;

export async function register(
    email: string,
    password: string,
): Promise<string> {
    const { raw } = await apiFetch<{ token?: string }>(
        "/auth/email/register",
        {
            method: "POST",
            body: { email: email.trim(), password, confirmPassword: password },
        },
    );

    const token =
        typeof raw === "string"
            ? raw.trim()
            : raw && typeof raw === "object" && "token" in raw
              ? String((raw as { token: unknown }).token)
              : "";

    if (!token || token === "undefined") {
        throw new ApiError(
            `O register não devolveu o token de verificação. Resposta — ${describePayload(raw)}`,
            500,
            [],
            raw,
        );
    }

    return token;
}

export async function verifyEmail(
    verifyToken: string,
    profile: ProfileInput,
): Promise<void> {
    await apiFetch("/auth/email/verify", {
        method: "POST",
        body: {
            verify_token: verifyToken,
            first_name: profile.firstName.trim(),
            last_name: profile.lastName.trim(),
            phone: profile.phone.trim(),
            uf: profile.uf,
            city: profile.city.trim(),
            birth_date: profile.birthDate,
        },
    });
}

export async function signIn(
    email: string,
    password: string,
): Promise<Account> {
    const { raw } = await apiFetch<unknown>("/auth/email/login", {
        method: "POST",
        body: { email: email.trim(), password },
    });

    const tokens = pickTokens(raw);
    await setTokens(tokens.access, tokens.refresh);

    const account = await loadMe();

    if (account) {
        return account;
    }

    const detalhe = describePayload(raw);

    throw new ApiError(
        tokens.access
            ? `Peguei o token no login, mas /users/me recusou. Resposta do login — ${detalhe}`
            : `O login não devolveu token no corpo e o cookie não autenticou /users/me. Resposta do login — ${detalhe}`,
        500,
        [],
        raw,
    );
}

async function loadMe(): Promise<Account | null> {
    try {
        const { raw } = await apiFetch<MeResponse>("/users/me", { auth: true });
        cached = toAccount(raw as MeResponse);

        return cached;
    } catch {
        return null;
    }
}

export async function getSession(): Promise<Account | null> {
    if (cached) {
        return cached;
    }

    const stored = await hasToken();

    if (!stored) {
        return null;
    }

    return loadMe();
}

export async function signOut(): Promise<void> {
    try {
        await apiFetch("/auth/logout", { method: "POST", auth: true });
    } catch {
        // sessão já pode estar morta na API; o que importa é limpar aqui
    }

    cached = null;
    await setTokens(null, null);
}
