import { endsAt, type Game } from "../games/types";

function stamp(date: Date): string {
    return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function escape(text: string): string {
    return text.replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
}

export function buildIcs(game: Game): string {
    const titulo = `${game.sport} ${game.modality} — ${game.placeName}`;
    const descricao = [
        `${game.attendees.length} de ${game.spots} vagas confirmadas.`,
        "Marcado pelo Panela.",
    ].join(" ");

    return [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Panela//pelada//PT-BR",
        "CALSCALE:GREGORIAN",
        "BEGIN:VEVENT",
        `UID:${game.id}@projetoh`,
        `DTSTAMP:${stamp(new Date())}`,
        `DTSTART:${stamp(new Date(game.startsAt))}`,
        `DTEND:${stamp(endsAt(game))}`,
        `SUMMARY:${escape(titulo)}`,
        `LOCATION:${escape(game.placeName)}`,
        `DESCRIPTION:${escape(descricao)}`,
        `GEO:${game.coordinates.latitude};${game.coordinates.longitude}`,
        "BEGIN:VALARM",
        "TRIGGER:-PT1H",
        "ACTION:DISPLAY",
        `DESCRIPTION:${escape(titulo)}`,
        "END:VALARM",
        "END:VEVENT",
        "END:VCALENDAR",
    ].join("\r\n");
}

export function icsFileName(game: Game): string {
    const limpo = `${game.sport}-${game.placeName}`
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    return `${limpo || "jogo"}.ics`;
}
