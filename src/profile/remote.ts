import { API_BASE, apiFetch } from "../api/client";

interface ApiSport {
    id: string;
    description: string;
}

interface ApiProfile {
    id: string;
    first_name?: string | null;
    last_name?: string | null;
    city?: string | null;
    uf?: string | null;
    bio?: string | null;
    height?: number | null;
    weight?: number | null;
    avatar_id?: string | null;
    mainSport?: ApiSport | null;
}

export interface Profile {
    id: string;
    name: string;
    city: string | null;
    mainSport: string | null;
    height: number | null;
    weight: number | null;
    bio: string | null;
    avatarUrl: string | null;
}

function fullName(api: ApiProfile): string {
    return `${api.first_name ?? ""} ${api.last_name ?? ""}`.trim();
}

function place(api: ApiProfile): string | null {
    if (api.city && api.uf) {
        return `${api.city}, ${api.uf}`;
    }

    return api.city ?? api.uf ?? null;
}

export interface ProfileEdit {
    firstName?: string;
    lastName?: string;
    bio?: string;
    height?: number;
    weight?: number;
    mainSportId?: string;
}

export async function updateProfile(
    userId: string,
    dados: ProfileEdit,
    avatar?: { uri: string; name: string; type: string; file?: unknown } | null,
): Promise<void> {
    const form = new FormData();

    const campos: Record<string, string | undefined> = {
        first_name: dados.firstName,
        last_name: dados.lastName,
        bio: dados.bio,
        height: dados.height !== undefined ? String(dados.height) : undefined,
        weight: dados.weight !== undefined ? String(dados.weight) : undefined,
        main_sport: dados.mainSportId,
    };

    for (const [chave, valor] of Object.entries(campos)) {
        if (valor !== undefined && valor !== "") {
            form.append(chave, valor);
        }
    }

    if (avatar) {
        if (avatar.file) {
            form.append("avatar", avatar.file as Blob, avatar.name);
        } else {
            form.append("avatar", {
                uri: avatar.uri,
                name: avatar.name,
                type: avatar.type,
            } as unknown as Blob);
        }
    }

    await apiFetch(`/users/${userId}`, {
        method: "PATCH",
        body: form,
        auth: true,
    });
}

function toProfile(data: ApiProfile): Profile {
    return {
        id: data.id,
        name: fullName(data),
        city: place(data),
        mainSport: data.mainSport?.description ?? null,
        height: data.height ?? null,
        weight: data.weight ?? null,
        bio: data.bio ?? null,
        avatarUrl: data.avatar_id
            ? `${API_BASE}/media/${data.avatar_id}`
            : null,
    };
}

export async function getProfile(userId: string): Promise<Profile | null> {
    try {
        const { data } = await apiFetch<ApiProfile>(`/users/${userId}`, {
            auth: true,
        });

        return data ? toProfile(data) : null;
    } catch {
        return null;
    }
}

/** O próprio perfil vem por rota própria — não depende de saber o id. */
export async function getMyProfile(): Promise<Profile | null> {
    try {
        const { data } = await apiFetch<ApiProfile>("/users/full/me", {
            auth: true,
        });

        return data ? toProfile(data) : null;
    } catch {
        return null;
    }
}
