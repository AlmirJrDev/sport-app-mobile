export type NotificationKind =
    | "desafio"
    | "lembrete"
    | "convite"
    | "aviso";

export interface NotificationItem {
    id: string;
    kind: NotificationKind;
    title: string;
    body: string;
    at: string;
    actions?: string[];
}

export interface NotificationGroup {
    label: string;
    items: NotificationItem[];
}

export const WEATHER_ALERT = {
    title: "Alerta climático",
    body: "Calor extremo entre 10h e 14h. Hidrate-se e evite atividades ao ar livre.",
};

export const NOTIFICATION_GROUPS: NotificationGroup[] = [
    {
        label: "Hoje",
        items: [
            {
                id: "nt-01",
                kind: "desafio",
                title: "Desafio recebido",
                body: "Red Devils F.C. desafiou sua equipe para uma partida amanhã às 19h.",
                at: "10:30",
                actions: ["Aceitar", "Recusar"],
            },
            {
                id: "nt-02",
                kind: "lembrete",
                title: "Lembrete de jogo",
                body: "Sua partida contra Cobras F.C. começa em 2 horas. Confirme sua presença.",
                at: "08:15",
            },
        ],
    },
    {
        label: "Esta semana",
        items: [
            {
                id: "nt-03",
                kind: "convite",
                title: "Convite para equipe",
                body: "Spartans está procurando um goleiro para o torneio de fim de semana.",
                at: "Ter, 14:20",
                actions: ["Ver detalhes"],
            },
            {
                id: "nt-04",
                kind: "aviso",
                title: "Atualização médica",
                body: "Seu período de recuperação estipulado terminou. Atualize seu status de aptidão física.",
                at: "Seg, 09:00",
            },
        ],
    },
];
