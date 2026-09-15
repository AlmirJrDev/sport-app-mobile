import { useEffect, useMemo, useRef } from "react";
import { StyleSheet } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";

import { useTheme } from "../design/theme";
import type { Coordinates, Game } from "../games/types";
import { baseMapStyle } from "../map/basemap";
import { areaDeBusca } from "../map/raio";
import { buildMapHtml, type PinoMapa } from "../map/webMapHtml";

interface GameMapProps {
    center: Coordinates;
    games: Game[];
    selectedGameId: string | null;
    onSelectGame: (game: Game) => void;
    onClearSelection: () => void;
    onCenterChange?: (center: Coordinates) => void;
    /** Com raio, o mapa desenha a área da busca em volta de `center`. */
    raioKm?: number;
    voce?: Coordinates | null;
}

type Mensagem =
    | { type: "ready" }
    | { type: "select"; id: string }
    | { type: "clear" }
    | { type: "move"; lat: number; lng: number };

/** A origem dá um Referer às imagens do mapa; o OpenStreetMap recusa pedido sem ele. */
const ORIGEM = "https://sport-app-mobile.vercel.app/";

function pinos(games: Game[]): PinoMapa[] {
    return games.map((game) => ({
        id: game.id,
        letra: game.sport.slice(0, 1).toUpperCase(),
        lat: game.coordinates.latitude,
        lng: game.coordinates.longitude,
    }));
}

export default function GameMap({
    center,
    games,
    selectedGameId,
    onSelectGame,
    onClearSelection,
    onCenterChange,
    raioKm,
    voce,
}: GameMapProps) {
    const { colors, isDark } = useTheme();
    const webview = useRef<WebView>(null);
    const pronto = useRef(false);

    const area = raioKm ? areaDeBusca(center, raioKm) : null;
    const pontoVoce = voce ? { lat: voce.latitude, lng: voce.longitude } : null;

    const valores = {
        games,
        selectedGameId,
        colors,
        isDark,
        area,
        pontoVoce,
        onSelectGame,
        onClearSelection,
        onCenterChange,
    };

    const atual = useRef(valores);

    atual.current = valores;

    /** A página nasce uma vez; depois tudo muda por mensagem, sem recarregar o mapa. */
    const html = useMemo(
        () =>
            buildMapHtml({
                center: { lat: center.latitude, lng: center.longitude },
                style: baseMapStyle(isDark),
                colors,
            }),
        [],
    );

    const chamar = (funcao: string, ...args: unknown[]) => {
        if (!pronto.current) {
            return;
        }

        const lista = args.map((arg) => JSON.stringify(arg)).join(",");

        webview.current?.injectJavaScript(
            `window.panela && window.panela.${funcao}(${lista}); true;`,
        );
    };

    useEffect(() => {
        chamar("setGames", pinos(games));
    }, [games]);

    useEffect(() => {
        chamar("setSelected", selectedGameId);
    }, [selectedGameId]);

    useEffect(() => {
        chamar("setTheme", baseMapStyle(isDark), colors);
    }, [isDark]);

    useEffect(() => {
        chamar("setArea", area);
    }, [area?.centro[0], area?.centro[1], raioKm]);

    useEffect(() => {
        chamar("setVoce", pontoVoce);
    }, [pontoVoce?.lat, pontoVoce?.lng]);

    const aoReceber = (evento: WebViewMessageEvent) => {
        let mensagem: Mensagem;

        try {
            mensagem = JSON.parse(evento.nativeEvent.data) as Mensagem;
        } catch {
            return;
        }

        const agora = atual.current;

        if (mensagem.type === "ready") {
            pronto.current = true;
            chamar("setTheme", baseMapStyle(agora.isDark), agora.colors);
            chamar("setGames", pinos(agora.games));
            chamar("setSelected", agora.selectedGameId);
            chamar("setArea", agora.area);
            chamar("setVoce", agora.pontoVoce);
            return;
        }

        if (mensagem.type === "select") {
            const game = agora.games.find((item) => item.id === mensagem.id);

            if (game) {
                agora.onSelectGame(game);
            }

            return;
        }

        if (mensagem.type === "clear") {
            agora.onClearSelection();
            return;
        }

        agora.onCenterChange?.({
            latitude: mensagem.lat,
            longitude: mensagem.lng,
        });
    };

    return (
        <WebView
            ref={webview}
            source={{ html, baseUrl: ORIGEM }}
            originWhitelist={["*"]}
            onMessage={aoReceber}
            javaScriptEnabled
            domStorageEnabled
            scrollEnabled={false}
            bounces={false}
            overScrollMode="never"
            setSupportMultipleWindows={false}
            style={[StyleSheet.absoluteFill, { backgroundColor: colors.canvas }]}
        />
    );
}
