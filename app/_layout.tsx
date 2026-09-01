import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    useFonts,
} from "@expo-google-fonts/inter";
import { ActivityIndicator, View } from "react-native";

import InstallPrompt from "../src/components/InstallPrompt";
import { colors, font, type } from "../src/design/tokens";
import { registerPwa } from "../src/pwa/register";

export default function RootLayout() {
    const [fontsLoaded] = useFonts({
        Inter_400Regular,
        Inter_500Medium,
        Inter_600SemiBold,
        Inter_700Bold,
    });

    useEffect(() => {
        registerPwa();
    }, []);

    if (!fontsLoaded) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.canvas }}>
                <ActivityIndicator color={colors.ink} />
            </View>
        );
    }

    return (
        <SafeAreaProvider>
            <InstallPrompt />

            <Stack
                screenOptions={{
                    headerStyle: { backgroundColor: colors.canvas },
                    headerTintColor: colors.ink,
                    headerTitleStyle: {
                        fontFamily: font.semibold,
                        fontSize: type.bodyMd.fontSize,
                    },
                    headerShadowVisible: false,
                    contentStyle: { backgroundColor: colors.canvas },
                }}
            >
                <Stack.Screen name="index" options={{ title: "Jogos perto" }} />
                <Stack.Screen name="novo" options={{ title: "Marcar jogo" }} />
                <Stack.Screen name="jogo/[id]" options={{ title: "Jogo" }} />
                <Stack.Screen
                    name="entrar"
                    options={{ title: "Entrar", headerShown: false }}
                />
                <Stack.Screen
                    name="criar-conta"
                    options={{ title: "Criar conta", headerShown: false }}
                />
            </Stack>

            <StatusBar style="dark" />
        </SafeAreaProvider>
    );
}
