import { apiFetch } from "../api/client";

interface ApiTeamPlayer {
    user_id?: string;
    left_at?: string | null;
}

interface ApiGameTeam {
    id: string;
    name: string;
    position: number;
    score?: number | null;
    players?: ApiTeamPlayer[];
}

export interface GameTeam {
    id: string;
    name: string;
    score: number;
    playerIds: string[];
}

const NOMES_PADRAO = ["Time A", "Time B"];

function toTeam(api: ApiGameTeam): GameTeam {
    const players = api.players ?? [];

    return {
        id: api.id,
        name: api.name,
        score: api.score ?? 0,
        playerIds: players
            .filter((player) => !player.left_at && player.user_id)
            .map((player) => String(player.user_id)),
    };
}

export async function listGameTeams(gameId: string): Promise<GameTeam[]> {
    const { data } = await apiFetch<ApiGameTeam[]>(`/games/${gameId}/teams`, {
        auth: true,
    });

    return Array.isArray(data) ? data.map(toTeam) : [];
}

/** O jogo nasce sem times; os dois primeiros saem daqui. */
export async function createDefaultTeams(gameId: string): Promise<GameTeam[]> {
    for (const nome of NOMES_PADRAO) {
        await apiFetch<ApiGameTeam>(`/games/${gameId}/teams`, {
            method: "POST",
            auth: true,
            body: { name: nome },
        });
    }

    return listGameTeams(gameId);
}

export async function joinGameTeam(
    gameId: string,
    teamId: string,
): Promise<void> {
    await apiFetch<void>(`/games/${gameId}/teams/${teamId}/players`, {
        method: "POST",
        auth: true,
    });
}

export async function leaveGameTeam(
    gameId: string,
    teamId: string,
): Promise<void> {
    await apiFetch<void>(`/games/${gameId}/teams/${teamId}/players`, {
        method: "DELETE",
        auth: true,
    });
}

export async function addTeamPoints(
    gameId: string,
    teamId: string,
    points: number,
): Promise<void> {
    await apiFetch<void>(`/games/${gameId}/teams/${teamId}/points`, {
        method: "POST",
        auth: true,
        body: { points },
    });
}

export async function removeTeamPoints(
    gameId: string,
    teamId: string,
    points: number,
): Promise<void> {
    await apiFetch<void>(`/games/${gameId}/teams/${teamId}/points`, {
        method: "DELETE",
        auth: true,
        body: { points },
    });
}
