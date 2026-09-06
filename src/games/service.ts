import { getPlayer } from "../player/identity";
import { readOverlay, writeOverlay } from "./overlay";
import {
    createRemoteGame,
    getRemoteGame,
    joinRemoteGame,
    listRemoteGames,
} from "./remote";
import { readGames, updateGame, writeGames } from "./store";
import { endsAt } from "./types";
import type { Coordinates, Game, NewGame } from "./types";

const EARTH_RADIUS_KM = 6371;

export const GRACE_MINUTES = 30;
export const PURGE_AFTER_HOURS = 24;

function toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
}

export function distanceInKm(from: Coordinates, to: Coordinates): number {
    const deltaLat = toRadians(to.latitude - from.latitude);
    const deltaLon = toRadians(to.longitude - from.longitude);

    const a =
        Math.sin(deltaLat / 2) ** 2 +
        Math.cos(toRadians(from.latitude)) *
            Math.cos(toRadians(to.latitude)) *
            Math.sin(deltaLon / 2) ** 2;

    return EARTH_RADIUS_KM * 2 * Math.asin(Math.sqrt(a));
}

export function distanceFor(game: Game, from: Coordinates): number {
    return game.distanceKm ?? distanceInKm(from, game.coordinates);
}

export function isVisible(game: Game, now = Date.now()): boolean {
    if (game.status === "encerrado") {
        return false;
    }

    return now < endsAt(game).getTime() + GRACE_MINUTES * 60 * 1000;
}

function isPurgeable(game: Game, now = Date.now()): boolean {
    return now > endsAt(game).getTime() + PURGE_AFTER_HOURS * 60 * 60 * 1000;
}

async function loadLocalGames(): Promise<Game[]> {
    const games = await readGames();
    const kept = games.filter((game) => !isPurgeable(game));

    if (kept.length !== games.length) {
        await writeGames(kept);
    }

    return kept;
}

export interface NearbyGames {
    games: Game[];
    remoteError: string | null;
}

export async function listNearbyGames(
    center: Coordinates,
    radiusKm: number,
): Promise<NearbyGames> {
    const horizon = Date.now() + 24 * 60 * 60 * 1000;

    const local = (await loadLocalGames()).filter(
        (game) =>
            isVisible(game) &&
            new Date(game.startsAt).getTime() <= horizon &&
            distanceInKm(center, game.coordinates) <= radiusKm,
    );

    let remote: Game[] = [];
    let remoteError: string | null = null;

    try {
        remote = (await listRemoteGames(center, radiusKm)).filter(isVisible);
    } catch (raw) {
        remoteError =
            raw instanceof Error ? raw.message : "Não deu para falar com a API.";
    }

    const games = [...remote, ...local].sort(
        (a, b) =>
            new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
    );

    return { games, remoteError };
}

export async function getGame(gameId: string): Promise<Game | null> {
    const local = await loadLocalGames();
    const found = local.find((game) => game.id === gameId);

    if (found) {
        return found;
    }

    return getRemoteGame(gameId);
}

async function isLocal(gameId: string): Promise<boolean> {
    const local = await readGames();

    return local.some((game) => game.id === gameId);
}

export interface CreateResult {
    game: Game;
    fallbackReason: string | null;
}

export async function createGame(
    input: NewGame,
    ids: { sportId: string; modalityId: string },
): Promise<CreateResult> {
    try {
        const game = await createRemoteGame({
            sport_id: ids.sportId,
            modality_id: ids.modalityId,
            place_name: input.placeName,
            starts_at: input.startsAt,
            duration_minutes: input.durationMinutes,
            level: input.level,
            spots: input.spots,
            latitude: input.coordinates.latitude,
            longitude: input.coordinates.longitude,
        });

        return { game, fallbackReason: null };
    } catch (raw) {
        const reason =
            raw instanceof Error ? raw.message : "A API recusou o jogo.";

        const games = await readGames();
        const player = await getPlayer().catch(() => null);

        const game: Game = {
            ...input,
            source: "local",
            id: `gm-${Date.now().toString(36)}`,
            ownerId: player?.id ?? "local",
            status: "aberto",
            attendees: [],
            score: { home: 0, away: 0 },
        };

        await writeGames([...games, game]);

        return { game, fallbackReason: reason };
    }
}

export async function deleteGame(gameId: string): Promise<void> {
    const games = await readGames();

    await writeGames(games.filter((game) => game.id !== gameId));
}

export async function toggleAttendance(gameId: string): Promise<Game | null> {
    const player = await getPlayer();

    if (await isLocal(gameId)) {
        return updateGame(gameId, (game) => {
            const already = game.attendees.some(
                (attendee) => attendee.playerId === player.id,
            );

            return {
                ...game,
                attendees: already
                    ? game.attendees.filter(
                          (attendee) => attendee.playerId !== player.id,
                      )
                    : [
                          ...game.attendees,
                          {
                              playerId: player.id,
                              name: player.name,
                              arrived: false,
                          },
                      ],
            };
        });
    }

    return joinRemoteGame(gameId);
}

export async function toggleArrival(gameId: string): Promise<Game | null> {
    const player = await getPlayer();

    const flip = (attendees: Game["attendees"]) =>
        attendees.map((attendee) =>
            attendee.playerId === player.id
                ? { ...attendee, arrived: !attendee.arrived }
                : attendee,
        );

    if (await isLocal(gameId)) {
        return updateGame(gameId, (game) => ({
            ...game,
            attendees: flip(game.attendees),
        }));
    }

    await writeOverlay(gameId, (current) => ({
        ...current,
        attendees: flip(current.attendees),
    }));

    return getRemoteGame(gameId);
}

export async function addPoints(
    gameId: string,
    side: "home" | "away",
    points: number,
): Promise<Game | null> {
    if (await isLocal(gameId)) {
        return updateGame(gameId, (game) => ({
            ...game,
            status: game.status === "aberto" ? "em-andamento" : game.status,
            score: {
                ...game.score,
                [side]: Math.max(0, game.score[side] + points),
            },
        }));
    }

    await writeOverlay(gameId, (current) => ({
        ...current,
        score: {
            ...current.score,
            [side]: Math.max(0, current.score[side] + points),
        },
    }));

    return getRemoteGame(gameId);
}

export async function finishGame(gameId: string): Promise<Game | null> {
    if (await isLocal(gameId)) {
        return updateGame(gameId, (game) => ({
            ...game,
            status: "encerrado",
        }));
    }

    await writeOverlay(gameId, (current) => ({ ...current, finished: true }));

    return getRemoteGame(gameId);
}

export async function readOverlayFor(gameId: string) {
    return readOverlay(gameId);
}
