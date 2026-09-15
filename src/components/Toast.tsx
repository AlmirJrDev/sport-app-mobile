import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useThemedStyles } from "../design/theme";
import { radius, shadow, spacing, type, type Palette } from "../design/tokens";

type Tom = "ok" | "erro";

interface Mensagem {
    id: number;
    texto: string;
    tom: Tom;
}

const DURACAO = 3500;

let ouvinte: ((mensagem: Mensagem) => void) | null = null;
let contador = 0;

export function mostrarToast(texto: string, tom: Tom = "ok") {
    ouvinte?.({ id: ++contador, texto, tom });
}

export function ToastHost() {
    const styles = useThemedStyles(criarEstilos);
    const insets = useSafeAreaInsets();
    const [mensagem, setMensagem] = useState<Mensagem | null>(null);
    const opacidade = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        ouvinte = setMensagem;

        return () => {
            ouvinte = null;
        };
    }, []);

    useEffect(() => {
        if (!mensagem) {
            return;
        }

        Animated.timing(opacidade, {
            toValue: 1,
            duration: 180,
            useNativeDriver: true,
        }).start();

        const timer = setTimeout(() => {
            Animated.timing(opacidade, {
                toValue: 0,
                duration: 220,
                useNativeDriver: true,
            }).start(() => setMensagem(null));
        }, DURACAO);

        return () => clearTimeout(timer);
    }, [mensagem, opacidade]);

    if (!mensagem) {
        return null;
    }

    return (
        <View
            pointerEvents="none"
            style={[styles.area, { top: insets.top + spacing.md }]}
        >
            <Animated.View
                accessibilityRole="alert"
                style={[
                    styles.toast,
                    mensagem.tom === "erro" && styles.toastErro,
                    { opacity: opacidade },
                ]}
            >
                <View
                    style={[
                        styles.marca,
                        mensagem.tom === "erro" && styles.marcaErro,
                    ]}
                />
                <Text style={[type.corpoSm, styles.texto]}>
                    {mensagem.texto}
                </Text>
            </Animated.View>
        </View>
    );
}

const criarEstilos = (c: Palette) =>
    StyleSheet.create({
        area: {
            position: "absolute",
            left: spacing.lg,
            right: spacing.lg,
            alignItems: "center",
        },
        toast: {
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.md,
            maxWidth: 480,
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.lg,
            borderRadius: radius.md,
            backgroundColor: c.header,
            ...shadow.pill,
        },
        toastErro: {
            borderWidth: 1,
            borderColor: c.primary,
        },
        marca: {
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: "#3FB37F",
        },
        marcaErro: {
            backgroundColor: c.primary,
        },
        texto: {
            flexShrink: 1,
            color: c.onHeader,
        },
    });
