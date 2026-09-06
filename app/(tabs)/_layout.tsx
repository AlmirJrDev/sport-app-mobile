import { MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

import { colors, font, type } from "../../src/design/tokens";

type IconName = keyof typeof MaterialIcons.glyphMap;

const ABAS: { name: string; title: string; icon: IconName }[] = [
    { name: "index", title: "Buscar", icon: "explore" },
    { name: "locais", title: "Locais", icon: "place" },
    { name: "rankings", title: "Rankings", icon: "bar-chart" },
    { name: "notificacoes", title: "Avisos", icon: "notifications-none" },
    { name: "perfil", title: "Perfil", icon: "person-outline" },
];

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerStyle: { backgroundColor: colors.canvas },
                headerTintColor: colors.ink,
                headerTitleStyle: {
                    fontFamily: font.condensed,
                    fontSize: 24,
                    letterSpacing: 0.5,
                },
                headerShadowVisible: false,
                sceneStyle: { backgroundColor: colors.canvas },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.bodyMid,
                tabBarStyle: {
                    backgroundColor: colors.canvas,
                    borderTopWidth: 1,
                    borderTopColor: colors.canvasSoft,
                },
                tabBarLabelStyle: {
                    ...type.label,
                    fontSize: 11,
                    lineHeight: 14,
                },
            }}
        >
            {ABAS.map((aba) => (
                <Tabs.Screen
                    key={aba.name}
                    name={aba.name}
                    options={{
                        title: aba.title,
                        tabBarIcon: ({ color }) => (
                            <MaterialIcons
                                name={aba.icon}
                                size={22}
                                color={color}
                            />
                        ),
                    }}
                />
            ))}
        </Tabs>
    );
}
