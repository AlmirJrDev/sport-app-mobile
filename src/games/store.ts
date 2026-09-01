import AsyncStorage from "@react-native-async-storage/async-storage";

import { seedGames } from "./mock";
import type { Game } from "./types";

const KEY = "projetoh:games:v3";

let cache: Game[] | null = null;

export async function readGames(): Promise<Game[]> {
    if (cache) {
        return cache;
    }

    const raw = await AsyncStorage.getItem(KEY);

    if (raw) {
        cache = JSON.parse(raw) as Game[];
        return cache;
    }

    const seeded = seedGames();
    await AsyncStorage.setItem(KEY, JSON.stringify(seeded));
    cache = seeded;

    return cache;
}

export async function writeGames(games: Game[]): Promise<void> {
    cache = games;
    await AsyncStorage.setItem(KEY, JSON.stringify(games));
}

export async function updateGame(
    gameId: string,
    change: (game: Game) => Game,
): Promise<Game | null> {
    const games = await readGames();
    let updated: Game | null = null;

    const next = games.map((game) => {
        if (game.id !== gameId) {
            return game;
        }

        updated = change(game);
        return updated;
    });

    await writeGames(next);

    return updated;
}

export async function resetGames(): Promise<void> {
    cache = null;
    await AsyncStorage.removeItem(KEY);
}
