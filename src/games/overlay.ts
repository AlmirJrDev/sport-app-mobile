import AsyncStorage from "@react-native-async-storage/async-storage";

import type { Attendee, Score } from "./types";

const KEY = "projetoh:overlay:v1";

export interface GameOverlay {
    attendees: Attendee[];
    score: Score;
    finished: boolean;
}

type OverlayMap = Record<string, GameOverlay>;

let cache: OverlayMap | null = null;

export const EMPTY_OVERLAY: GameOverlay = {
    attendees: [],
    score: { home: 0, away: 0 },
    finished: false,
};

async function readAll(): Promise<OverlayMap> {
    if (cache) {
        return cache;
    }

    const raw = await AsyncStorage.getItem(KEY);
    cache = raw ? (JSON.parse(raw) as OverlayMap) : {};

    return cache;
}

export async function readOverlay(gameId: string): Promise<GameOverlay> {
    const all = await readAll();

    return all[gameId] ?? EMPTY_OVERLAY;
}

export async function readOverlays(): Promise<OverlayMap> {
    return readAll();
}

export async function writeOverlay(
    gameId: string,
    change: (current: GameOverlay) => GameOverlay,
): Promise<GameOverlay> {
    const all = await readAll();
    const next = change(all[gameId] ?? EMPTY_OVERLAY);

    cache = { ...all, [gameId]: next };
    await AsyncStorage.setItem(KEY, JSON.stringify(cache));

    return next;
}
