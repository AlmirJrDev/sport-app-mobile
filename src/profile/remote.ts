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

export async function getProfile(userId: string): Promise<Profile | null> {
    try {
        const { data } = await apiFetch<ApiProfile>(`/users/${userId}`, {
            auth: true,
        });

        if (!data) {
            return null;
        }

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
    } catch {
        return null;
    }
}
