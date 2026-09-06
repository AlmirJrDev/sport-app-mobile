import { SKILL_LABEL, type Game } from "../games/types";

export const APP_URL = "https://sport-app-mobile.vercel.app";

const diaFormatter = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
});

const horaFormatter = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
});

function quando(game: Game): string {
    const inicio = new Date(game.startsAt);
    const hoje = new Date();
    const mesmoDia =
        inicio.getFullYear() === hoje.getFullYear() &&
        inicio.getMonth() === hoje.getMonth() &&
        inicio.getDate() === hoje.getDate();

    if (mesmoDia) {
        return `hoje às ${horaFormatter.format(inicio)}`;
    }

    return `${diaFormatter.format(inicio)} às ${horaFormatter.format(inicio)}`;
}

export function gameLink(game: Game): string {
    return `${APP_URL}/jogo/${game.id}`;
}

export function profileLink(userId: string): string {
    return `${APP_URL}/atleta/${userId}`;
}

export function profileText(nome: string, userId: string): string {
    return [
        `${nome} no Projeto H.`,
        "Veja o perfil e chame para jogar:",
        "",
        profileLink(userId),
    ].join("\n");
}

export function inviteText(game: Game): string {
    const vagas = Math.max(0, game.spots - game.attendees.length);

    const linhas = [
        `Bora jogar ${game.sport} ${game.modality}?`.replace("  ", " "),
        `${quando(game)} na ${game.placeName}.`,
        vagas > 0
            ? `${vagas === 1 ? "Falta 1 vaga" : `Faltam ${vagas} vagas`} · nível ${SKILL_LABEL[game.level].toLowerCase()}.`
            : `Sem vagas, mas dá para acompanhar.`,
        "",
        gameLink(game),
    ];

    return linhas.join("\n");
}
