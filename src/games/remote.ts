import { apiFetch } from "../api/client";
import { describeIds } from "../api/catalog";
import { readOverlays } from "./overlay";
import { EMPTY_OVERLAY } from "./overlay";
import type { Coordinates, Game, SkillLevel } from "./types";

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
}

async function toGame(api: ApiGame): Promise<Game> {
    const [names, overlays] = await Promise.all([
        describeIds(api.sport_id, api.modality_id),
        readOverlays(),
    ]);

    const overlay = overlays[api.id] ?? EMPTY_OVERLAY;

    return {
        source: "api",
        id: api.id,
        ownerId: api.creator_id,
        sport: names.sport,
        modality: names.modality,
        placeName: api.place_name,
        startsAt: api.starts_at,
        durationMinutes: api.duration_minutes,
        level: api.level,
        spots: api.spots,
        status: overlay.finished ? "encerrado" : "aberto",
        coordinates: {
            latitude: Number(api.latitude),
            longitude: Number(api.longitude),
        },
        attendees: overlay.attendees,
        score: overlay.score,
    };
}

export async function listRemoteGames(
    center: Coordinates,
    radiusKm: number,
): Promise<Game[]> {
    const query = new URLSearchParams({
        latitude: String(center.latitude),
        longitude: String(center.longitude),
        radius: String(Math.round(radiusKm * 1000)),
    });

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
