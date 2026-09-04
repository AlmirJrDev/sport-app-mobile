import { Share } from "react-native";

import type { Game } from "../games/types";
import { buildIcs } from "./ics";

export function addToCalendar(game: Game): void {
    Share.share({
        title: `${game.sport} ${game.modality}`,
        message: buildIcs(game),
    }).catch(() => {});
}
