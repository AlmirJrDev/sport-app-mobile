export interface AthleteRanking {
    scope: string;
    position: number;
    trend: "up" | "down" | "flat";
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

export const ATHLETE_BADGES: AthleteBadge[] = [
    { title: "MVP", detail: "Regional '23" },
    { title: "Cestinha", detail: "Liga Estadual" },
    { title: "Iron Man", detail: "30+ minutos" },
];
