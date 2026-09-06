import { distanceInKm } from "../games/service";
import { currentStatus, type Coordinates, type Game } from "../games/types";

const RAIO_MESMO_LOCAL_KM = 0.08;

export interface Place {
    id: string;
    name: string;
    coordinates: Coordinates;
    games: Game[];
    confirmed: number;
    onCourt: number;
    liveGames: number;
}

function pickName(games: Game[]): string {
    const contagem = new Map<string, number>();

    for (const game of games) {
        const nome = game.placeName.trim();

        contagem.set(nome, (contagem.get(nome) ?? 0) + 1);
    }

    let escolhido = games[0].placeName.trim();
    let melhor = 0;

    for (const [nome, vezes] of contagem) {
        if (vezes > melhor) {
            escolhido = nome;
            melhor = vezes;
        }
    }

    return escolhido;
}

function center(games: Game[]): Coordinates {
    const soma = games.reduce(
        (total, game) => ({
            latitude: total.latitude + game.coordinates.latitude,
            longitude: total.longitude + game.coordinates.longitude,
        }),
        { latitude: 0, longitude: 0 },
    );

    return {
        latitude: soma.latitude / games.length,
        longitude: soma.longitude / games.length,
    };
}

export function groupIntoPlaces(games: Game[]): Place[] {
    const grupos: Game[][] = [];

    for (const game of games) {
        const grupo = grupos.find(
            (candidato) =>
                distanceInKm(center(candidato), game.coordinates) <=
                RAIO_MESMO_LOCAL_KM,
        );

        if (grupo) {
            grupo.push(game);
        } else {
            grupos.push([game]);
        }
    }

    return grupos
        .map((grupo) => {
            const emAndamento = grupo.filter(
                (game) => currentStatus(game) === "em-andamento",
            );

            return {
                id: grupo[0].id,
                name: pickName(grupo),
                coordinates: center(grupo),
                games: grupo,
                confirmed: grupo.reduce(
                    (total, game) => total + game.attendees.length,
                    0,
                ),
                onCourt: emAndamento.reduce(
                    (total, game) =>
                        total +
                        game.attendees.filter((one) => one.arrived).length,
                    0,
                ),
                liveGames: emAndamento.length,
            };
        })
        .sort((a, b) => {
            if (a.liveGames !== b.liveGames) {
                return b.liveGames - a.liveGames;
            }

            return b.games.length - a.games.length;
        });
}
