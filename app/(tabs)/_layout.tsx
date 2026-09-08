import { Tabs } from "expo-router";

import { Icon, type IconName } from "../../src/design/icons";
import { colors, font, size, type } from "../../src/design/tokens";

const ABAS: { name: string; title: string; icon: IconName }[] = [
    { name: "index", title: "Mapa", icon: "mapa" },
    { name: "locais", title: "Locais", icon: "locais" },
    { name: "rankings", title: "Rankings", icon: "rankings" },
    { name: "notificacoes", title: "Alertas", icon: "alertas" },
    { name: "perfil", title: "Perfil", icon: "perfil" },
];

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerStyle: { backgroundColor: colors.header },
                headerTintColor: colors.onHeader,
                headerTitleStyle: {
                    fontFamily: font.condensed,
                    fontSize: 28,
                    letterSpacing: 0.8,
                    color: colors.onHeader,
                },
                headerShadowVisible: false,
                sceneStyle: { backgroundColor: colors.canvas },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.mute,
                tabBarStyle: {
                    height: size.tabBar,
                    paddingTop: 11,
                    backgroundColor: colors.canvas,
                    borderTopWidth: 1,
                    borderTopColor: colors.line,
                },
                tabBarLabelStyle: type.labelTab,
                tabBarIconStyle: { marginBottom: 6 },
            }}
        >
            {ABAS.map((aba) => (
                <Tabs.Screen
                    key={aba.name}
                    name={aba.name}
                    options={{
                        title: aba.title,
                        tabBarIcon: ({ color }) => (
                            <Icon
                                name={aba.icon}
                                size={24}
                                color={String(color)}
                            />
                        ),
                    }}
                />
            ))}
        </Tabs>
    );
}
