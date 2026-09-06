export interface AthleteRanking {
    scope: string;
    position: number;
    trend: "up" | "down" | "flat";
}

export interface AthleteStat {
    label: string;
    value: string;
    fill: number;
}

export interface AthleteBadge {
    title: string;
    detail: string;
}

export const ATHLETE_RANKINGS: AthleteRanking[] = [
    { scope: "Nacional", position: 42, trend: "down" },
    { scope: "Estadual", position: 8, trend: "up" },
    { scope: "Municipal", position: 2, trend: "up" },
];

export const ATHLETE_SEASON = "temporada 23/24";

export const ATHLETE_STATS: AthleteStat[] = [
    { label: "pts / jogo", value: "24.5", fill: 0.86 },
    { label: "reb / jogo", value: "8.2", fill: 0.55 },
    { label: "ast / jogo", value: "5.4", fill: 0.42 },
    { label: "fg %", value: "48%", fill: 0.48 },
];

export const ATHLETE_NOTE =
    "Desempenho constante nos últimos 4 jogos, com evolução no rebote defensivo.";

export const ATHLETE_FORM = [0.35, 0.52, 0.48, 0.74];

export const ATHLETE_BADGES: AthleteBadge[] = [
    { title: "MVP", detail: "Regional '23" },
    { title: "Cestinha", detail: "Liga Estadual" },
    { title: "Iron Man", detail: "30+ minutos" },
];
