import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { BebasNeue_400Regular } from "@expo-google-fonts/bebas-neue";
import {
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
    useFonts,
} from "@expo-google-fonts/inter";

import InstallPrompt from "../src/components/InstallPrompt";
import { ThemeProvider, useTheme } from "../src/design/theme";
import { font, type } from "../src/design/tokens";
import { registerPwa } from "../src/pwa/register";

export default function RootLayout() {
    /**
     * As fontes carregam em segundo plano. A tela aparece na hora com a fonte
     * do sistema e troca sozinha quando elas chegam.
     */
    useFonts({
        BebasNeue_400Regular,
        Inter_400Regular,
        Inter_600SemiBold,
        Inter_700Bold,
    });

    useEffect(() => {
        registerPwa();
    }, []);

    return (
        <ThemeProvider>
            <Raiz />
        </ThemeProvider>
    );
}

function Raiz() {
    const { colors, isDark } = useTheme();

    return (
        <SafeAreaProvider>
            <InstallPrompt />

            <Stack
                screenOptions={{
                    headerStyle: { backgroundColor: colors.canvas },
                    headerTintColor: colors.ink,
                    headerTitleStyle: {
                        fontFamily: font.semibold,
                        fontSize: type.corpo.fontSize,
                        color: colors.ink,
                    },
                    headerShadowVisible: false,
                    contentStyle: { backgroundColor: colors.canvas },
                }}
            >
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="novo" options={{ title: "Marcar jogo" }} />
                <Stack.Screen
                    name="jogo/[id]"
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="onboarding"
                    options={{ title: "Seu perfil" }}
                />
                <Stack.Screen name="atleta/[id]" options={{ title: "Atleta" }} />
                <Stack.Screen
                    name="entrar"
                    options={{ title: "Entrar", headerShown: false }}
                />
                <Stack.Screen
                    name="criar-conta"
                    options={{ title: "Criar conta", headerShown: false }}
                />
            </Stack>

            <StatusBar style={isDark ? "light" : "dark"} />
        </SafeAreaProvider>
    );
}
