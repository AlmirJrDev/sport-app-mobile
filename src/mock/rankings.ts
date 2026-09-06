export type Trend = "up" | "down" | "flat";

export interface RankingRow {
    position: number;
    name: string;
    city: string;
    points: number;
    trend: Trend;
    delta: number;
}

export interface RankingBoard {
    sport: string;
    you: RankingRow;
    rows: RankingRow[];
}

export const RANKING_SPORTS = ["Basquete", "Futsal", "Vôlei"];

export const RANKING_SCOPES = ["Nacional", "Estadual", "Municipal"];

const BASQUETE: RankingBoard = {
    sport: "Basquete",
    you: {
        position: 42,
        name: "Você",
        city: "Nacional · Basquete",
        points: 1250,
        trend: "up",
        delta: 12,
    },
    rows: [
        {
            position: 1,
            name: "Marina Silva",
            city: "São Paulo, SP",
            points: 2450,
            trend: "flat",
            delta: 0,
        },
        {
            position: 2,
            name: "Lucas Alves",
            city: "Rio de Janeiro, RJ",
            points: 2100,
            trend: "up",
            delta: 5,
        },
        {
            position: 3,
            name: "Equipe Pantera",
            city: "Curitiba, PR",
            points: 1850,
            trend: "down",
            delta: 2,
        },
        {
            position: 4,
            name: "Roberto Carlos",
            city: "Belo Horizonte, MG",
            points: 1700,
            trend: "up",
            delta: 1,
        },
        {
            position: 5,
            name: "Ana Prado",
            city: "Recife, PE",
            points: 1610,
            trend: "up",
            delta: 3,
        },
    ],
};

const FUTSAL: RankingBoard = {
    sport: "Futsal",
    you: {
        position: 18,
        name: "Você",
        city: "Nacional · Futsal",
        points: 1720,
        trend: "up",
        delta: 4,
    },
    rows: [
        {
            position: 1,
            name: "Diego Ramos",
            city: "Campinas, SP",
            points: 2890,
            trend: "up",
            delta: 2,
        },
        {
            position: 2,
            name: "Equipe Relâmpago",
            city: "Santos, SP",
            points: 2540,
            trend: "down",
            delta: 1,
        },
        {
            position: 3,
            name: "Paulo Ferraz",
            city: "Goiânia, GO",
            points: 2210,
            trend: "flat",
            delta: 0,
        },
    ],
};

const VOLEI: RankingBoard = {
    sport: "Vôlei",
    you: {
        position: 7,
        name: "Você",
        city: "Nacional · Vôlei",
        points: 2040,
        trend: "down",
        delta: 2,
    },
    rows: [
        {
            position: 1,
            name: "Camila Duarte",
            city: "Florianópolis, SC",
            points: 3120,
            trend: "up",
            delta: 6,
        },
        {
            position: 2,
            name: "Equipe Maré",
            city: "Fortaleza, CE",
            points: 2760,
            trend: "flat",
            delta: 0,
        },
        {
            position: 3,
            name: "Bruno Tavares",
            city: "Porto Alegre, RS",
            points: 2480,
            trend: "down",
            delta: 3,
        },
    ],
};

export const RANKING_BOARDS: Record<string, RankingBoard> = {
    Basquete: BASQUETE,
    Futsal: FUTSAL,
    "Vôlei": VOLEI,
};
