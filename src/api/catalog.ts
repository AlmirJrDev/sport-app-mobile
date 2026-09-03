import { apiFetch } from "./client";

export interface Sport {
    id: string;
    description: string;
}

export interface Modality {
    id: string;
    description: string;
    minium_players: number;
    sport_id: string;
}

let sportsCache: Sport[] | null = null;
const modalitiesCache = new Map<string, Modality[]>();

export function prettify(description: string): string {
    const fixes: Record<string, string> = {
        basquete: "Basquete",
        futebol: "Futebol",
        futsal: "Futsal",
        volei: "Vôlei",
    };

    return (
        fixes[description.toLowerCase()] ??
        description.charAt(0).toUpperCase() + description.slice(1)
    );
}

export async function listSports(): Promise<Sport[]> {
    if (sportsCache) {
        return sportsCache;
    }

    const { data } = await apiFetch<Sport[]>("/sports");
    sportsCache = Array.isArray(data) ? data : [];

    return sportsCache;
}

export async function listModalities(sportId: string): Promise<Modality[]> {
    const cached = modalitiesCache.get(sportId);

    if (cached) {
        return cached;
    }

    const { data } = await apiFetch<Modality[]>(
        `/sports/${sportId}/modalities`,
    );
    const list = Array.isArray(data) ? data : [];

    modalitiesCache.set(sportId, list);

    return list;
}

export async function describeIds(
    sportId: string,
    modalityId: string,
): Promise<{ sport: string; modality: string }> {
    try {
        const sports = await listSports();
        const sport = sports.find((one) => one.id === sportId);

        if (!sport) {
            return { sport: "Esporte", modality: "" };
        }

        const modalities = await listModalities(sportId);
        const modality = modalities.find((one) => one.id === modalityId);

        return {
            sport: prettify(sport.description),
            modality: modality ? modality.description : "",
        };
    } catch {
        return { sport: "Esporte", modality: "" };
    }
}
