import { apiFetch } from "../api/client";
import { prettify } from "../api/catalog";
import { EMPTY_OVERLAY, readOverlay, writeOverlay } from "./overlay";
import type {
    Attendee,
    Coordinates,
    Game,
    GameStatus,
    SkillLevel,
} from "./types";

interface ApiNamed {
    id: string;
    description: string;
}

interface ApiPerson {
    id: string;
    first_name?: string;
    last_name?: string;
    avatar_id?: string | null;
}

interface ApiMembership {
    user_id?: string;
    arrived_at?: string | null;
    left_at?: string | null;
    user?: ApiPerson;
}

export interface ApiGame {
    id: string;
    creator_id: string;
    sport_id: string;
    modality_id: string;
    place_name: string;
    starts_at: string;
    duration_minutes: number;
    level: SkillLevel;
    spots: number;
    latitude: number;
    longitude: number;
    allow_join_after_start?: boolean;
    is_public?: boolean;
    status?: "agendado" | "finalizado" | "cancelado";
    sport?: ApiNamed;
    modality?: ApiNamed;
    creator?: ApiPerson;
    players?: ApiPerson[];
    memberships?: ApiMembership[];
    distance_meters?: number;
}

export interface CreateGamePayload {
    sport_id: string;
    modality_id: string;
    place_name: string;
    starts_at: string;
    duration_minutes: number;
    level: SkillLevel;
    spots: number;
    latitude: number;
    longitude: number;
    is_public: boolean;
    allow_join_after_start: boolean;
}

function fullName(person: ApiPerson): string {
    const nome = `${person.first_name ?? ""} ${person.last_name ?? ""}`.trim();

    return nome || "Atleta";
}

function situacaoDaApi(api: ApiGame, encerradoLocal: boolean): GameStatus {
    if (api.status === "cancelado") {
        return "cancelado";
    }

    if (api.status === "finalizado" || encerradoLocal) {
        return "encerrado";
    }

    return "aberto";
}

async function toGame(api: ApiGame): Promise<Game> {
    const overlay = (await readOverlay(api.id)) ?? EMPTY_OVERLAY;

    const inscritos: Attendee[] | null = api.memberships
        ? api.memberships
              .filter((vinculo) => !vinculo.left_at)
              .map((vinculo) => ({
                  playerId: vinculo.user?.id ?? vinculo.user_id ?? "",
                  name: vinculo.user ? fullName(vinculo.user) : "Atleta",
                  arrived: Boolean(vinculo.arrived_at),
              }))
              .filter((pessoa) => pessoa.playerId !== "")
        : null;

    const doServidor: Attendee[] | null =
        inscritos ??
        (api.players
            ? api.players.map((person) => ({
                  playerId: person.id,
                  name: fullName(person),
                  arrived: overlay.attendees.some(
                      (one) => one.playerId === person.id && one.arrived,
                  ),
              }))
            : null);

    return {
        source: "api",
        id: api.id,
        ownerId: api.creator_id,
        creatorName: api.creator ? fullName(api.creator) : undefined,
        distanceKm:
            api.distance_meters !== undefined
                ? api.distance_meters / 1000
                : undefined,
        sport: api.sport ? prettify(api.sport.description) : "Esporte",
        modality: api.modality ? api.modality.description : "",
        placeName: api.place_name,
        startsAt: api.starts_at,
        durationMinutes: api.duration_minutes,
        level: api.level,
        spots: api.spots,
        status: situacaoDaApi(api, overlay.finished),
        coordinates: {
            latitude: Number(api.latitude),
            longitude: Number(api.longitude),
        },
        allowJoinAfterStart: api.allow_join_after_start ?? false,
        attendees: doServidor ?? overlay.attendees,
        score: overlay.score,
    };
}

export interface MapFilters {
    sportId?: string;
    modalityId?: string;
    level?: SkillLevel;
}

export async function listRemoteGames(
    center: Coordinates,
    radiusKm: number,
    filters: MapFilters = {},
): Promise<Game[]> {
    const query = new URLSearchParams({
        latitude: String(center.latitude),
        longitude: String(center.longitude),
        radius: String(Math.round(radiusKm * 1000)),
    });

    if (filters.sportId) {
        query.set("sport_id", filters.sportId);
    }

    if (filters.modalityId) {
        query.set("modality_id", filters.modalityId);
    }

    if (filters.level) {
        query.set("level", filters.level);
    }

    const { data } = await apiFetch<ApiGame[]>(`/games/map?${query}`, {
        auth: true,
    });
    const list = Array.isArray(data) ? data : [];

    return Promise.all(list.map(toGame));
}

export async function getRemoteGame(id: string): Promise<Game | null> {
    try {
        const { data } = await apiFetch<ApiGame>(`/games/${id}`, {
            auth: true,
        });

        return data ? toGame(data) : null;
    } catch {
        return null;
    }
}

export async function joinRemoteGame(id: string): Promise<Game> {
    const { data } = await apiFetch<ApiGame>(`/games/${id}/join`, {
        method: "POST",
        auth: true,
    });

    const game = await toGame(data);

    await writeOverlay(id, (current) => ({
        ...current,
        attendees: game.attendees.length ? game.attendees : current.attendees,
    }));

    return game;
}

export async function leaveRemoteGame(id: string): Promise<Game> {
    const { data } = await apiFetch<ApiGame>(`/games/${id}/leave`, {
        method: "POST",
        auth: true,
    });

    return toGame(data);
}

export async function arriveRemoteGame(id: string): Promise<Game> {
    const { data } = await apiFetch<ApiGame>(`/games/${id}/arrive`, {
        method: "POST",
        auth: true,
    });

    return toGame(data);
}

export async function cancelRemoteGame(id: string): Promise<void> {
    await apiFetch<void>(`/games/${id}/cancel`, {
        method: "POST",
        auth: true,
    });
}

export async function finishRemoteGame(id: string): Promise<void> {
    await apiFetch<void>(`/games/${id}/finish`, {
        method: "POST",
        auth: true,
    });
}

export async function createRemoteGame(
    payload: CreateGamePayload,
): Promise<Game> {
    const { data } = await apiFetch<ApiGame>("/games", {
        method: "POST",
        body: payload,
        auth: true,
    });

    return toGame(data);
}
