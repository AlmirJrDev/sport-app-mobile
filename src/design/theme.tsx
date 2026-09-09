import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
    type PropsWithChildren,
} from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { applyBrowserChrome } from "./chrome";
import { colors as claro, darkColors as escuro, type Palette } from "./tokens";

export type ThemeMode = "sistema" | "claro" | "escuro";

const CHAVE = "projetoh:tema";

interface ThemeValue {
    colors: Palette;
    isDark: boolean;
    mode: ThemeMode;
    setMode: (mode: ThemeMode) => void;
}

const Contexto = createContext<ThemeValue>({
    colors: claro,
    isDark: false,
    mode: "sistema",
    setMode: () => {},
});

export function ThemeProvider({ children }: PropsWithChildren) {
    const sistema = useColorScheme();
    const [mode, setModeState] = useState<ThemeMode>("sistema");

    useEffect(() => {
        AsyncStorage.getItem(CHAVE).then((guardado) => {
            if (
                guardado === "claro" ||
                guardado === "escuro" ||
                guardado === "sistema"
            ) {
                setModeState(guardado);
            }
        });
    }, []);

    const valor = useMemo<ThemeValue>(() => {
        const setMode = (novo: ThemeMode) => {
            setModeState(novo);
            AsyncStorage.setItem(CHAVE, novo);
        };

        const isDark =
            mode === "escuro" || (mode === "sistema" && sistema === "dark");

        return {
            colors: isDark ? escuro : claro,
            isDark,
            mode,
            setMode,
        };
    }, [mode, sistema]);

    useEffect(() => {
        applyBrowserChrome(valor.colors, valor.isDark);
    }, [valor.colors, valor.isDark]);

    return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useTheme(): ThemeValue {
    return useContext(Contexto);
}

/** Monta a folha de estilo com a paleta do tema, refazendo só quando ele muda. */
export function useThemedStyles<T>(fabrica: (c: Palette) => T): T {
    const { colors } = useTheme();

    return useMemo(() => fabrica(colors), [fabrica, colors]);
}
