import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface InstallEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "projetoh:install-dismissed";

function isStandalone(): boolean {
    return (
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as { standalone?: boolean }).standalone === true
    );
}

function isIos(): boolean {
    return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

export default function InstallPrompt() {
    const [event, setEvent] = useState<InstallEvent | null>(null);
    const [showIosHint, setShowIosHint] = useState(false);
    const [hidden, setHidden] = useState(true);

    useEffect(() => {
        if (isStandalone() || localStorage.getItem(DISMISSED_KEY) === "1") {
            return;
        }

        const onPrompt = (raw: Event) => {
            raw.preventDefault();
            setEvent(raw as InstallEvent);
            setHidden(false);
        };

        const onInstalled = () => {
            setHidden(true);
            setEvent(null);
        };

        window.addEventListener("beforeinstallprompt", onPrompt);
        window.addEventListener("appinstalled", onInstalled);

        if (isIos()) {
            setShowIosHint(true);
            setHidden(false);
        }

        return () => {
            window.removeEventListener("beforeinstallprompt", onPrompt);
            window.removeEventListener("appinstalled", onInstalled);
        };
    }, []);

    if (hidden) {
        return null;
    }

    const dismiss = () => {
        localStorage.setItem(DISMISSED_KEY, "1");
        setHidden(true);
    };

    const install = async () => {
        if (!event) {
            return;
        }

        await event.prompt();
        const choice = await event.userChoice;

        if (choice.outcome === "accepted") {
            setHidden(true);
        }

        setEvent(null);
    };

    return (
        <View style={styles.bar}>
            <View style={styles.text}>
                <Text style={styles.title}>Instalar o Projeto H</Text>
                <Text style={styles.subtitle}>
                    {showIosHint
                        ? "Toque em Compartilhar e depois em Adicionar à Tela de Início."
                        : "Fica com ícone na tela do celular e abre sem barra do navegador."}
                </Text>
            </View>

            {showIosHint ? null : (
                <Pressable style={styles.install} onPress={install}>
                    <Text style={styles.installLabel}>Instalar</Text>
                </Pressable>
            )}

            <Pressable onPress={dismiss} hitSlop={12}>
                <Text style={styles.dismiss}>Agora não</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    bar: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#e5e5e5",
        backgroundColor: "#fff",
    },
    text: {
        flex: 1,
    },
    title: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
    },
    subtitle: {
        fontSize: 13,
        color: "#666",
    },
    install: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 6,
        backgroundColor: "#333",
    },
    installLabel: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },
    dismiss: {
        fontSize: 13,
        color: "#666",
    },
});
