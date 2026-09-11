export type SkillLevel = "iniciante" | "intermediario" | "avancado";

export type GameStatus =
    | "aberto"
    | "em-andamento"
    | "encerrado"
    | "cancelado";

export interface Coordinates {
    latitude: number;
    longitude: number;
}

export interface Attendee {
    playerId: string;
    name: string;
    arrived: boolean;
}

export interface Score {
    home: number;
    away: number;
}

export type GameSource = "api" | "local";

export interface Game {
    source: GameSource;
    id: string;
    ownerId: string;
    /** Nome de quem marcou, quando a API informa. */
    creatorName?: string;
    /** Distância calculada pelo servidor, em km. */
    distanceKm?: number;
    sport: string;
    modality: string;
    placeName: string;
    startsAt: string;
    durationMinutes: number;
    level: SkillLevel;
    spots: number;
    status: GameStatus;
    coordinates: Coordinates;
    attendees: Attendee[];
    score: Score;
    /** Se a API aceita inscrição depois do horário de início. */
    allowJoinAfterStart?: boolean;
}

export interface NewGame {
    sport: string;
    modality: string;
    placeName: string;
    startsAt: string;
    durationMinutes: number;
    level: SkillLevel;
    spots: number;
    coordinates: Coordinates;
    isPublic: boolean;
    allowJoinAfterStart: boolean;
}

/** Motivo que impede entrar no jogo agora, ou null quando dá para entrar. */
export function joinBlockReason(game: Game, now = Date.now()): string | null {
    const situacao = currentStatus(game, now);

    if (situacao === "cancelado") {
        return "Jogo cancelado";
    }

    if (situacao === "encerrado") {
        return "Jogo encerrado";
    }

    if (
        game.source === "api" &&
        situacao === "em-andamento" &&
        !game.allowJoinAfterStart
    ) {
        return "Jogo já começou";
    }

    return null;
}

export const SKILL_LABEL: Record<SkillLevel, string> = {
    iniciante: "Iniciante",
    intermediario: "Intermediário",
    avancado: "Avançado",
};

export const SPORTS = ["Basquete", "Futsal", "Vôlei", "Futebol"];

export const MODALITIES: Record<string, string[]> = {
    Basquete: ["3x3", "5x5"],
    Futsal: ["5x5"],
    Vôlei: ["4x4", "6x6"],
    Futebol: ["Society 7x7", "Campo 11x11"],
};

export const DURATIONS = [
    { minutes: 60, label: "1h" },
    { minutes: 90, label: "1h30" },
    { minutes: 120, label: "2h" },
    { minutes: 180, label: "3h" },
];

export function endsAt(game: Game): Date {
    return new Date(
        new Date(game.startsAt).getTime() + game.durationMinutes * 60 * 1000,
    );
}

export function currentStatus(game: Game, now = Date.now()): GameStatus {
    if (game.status === "cancelado") {
        return "cancelado";
    }
    if (game.status === "encerrado" || endsAt(game).getTime() <= now) {
        return "encerrado";
    }

    if (new Date(game.startsAt).getTime() <= now) {
        return "em-andamento";
    }

    return game.status;
}
