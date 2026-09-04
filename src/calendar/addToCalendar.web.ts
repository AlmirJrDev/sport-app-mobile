import type { Game } from "../games/types";
import { buildIcs, icsFileName } from "./ics";

export function addToCalendar(game: Game): void {
    const blob = new Blob([buildIcs(game)], {
        type: "text/calendar;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = icsFileName(game);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => URL.revokeObjectURL(url), 5000);
}
