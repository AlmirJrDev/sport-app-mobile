import AsyncStorage from "@react-native-async-storage/async-storage";

import type { Game } from "./types";

const KEY = "projetoh:games:v3";

/** Os antigos jogos de demonstração foram gravados com esse dono. */
const DONO_DEMONSTRACAO = "seed";

let cache: Game[] | null = null;

export async function readGames(): Promise<Game[]> {
    if (cache) {
        return cache;
    }

    const raw = await AsyncStorage.getItem(KEY);
    const guardados = raw ? (JSON.parse(raw) as Game[]) : [];
    const reais = guardados.filter((game) => game.ownerId !== DONO_DEMONSTRACAO);

    if (reais.length !== guardados.length) {
        await AsyncStorage.setItem(KEY, JSON.stringify(reais));
    }

    cache = reais;

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
