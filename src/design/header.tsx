import type { ReactNode } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useThemedStyles } from "./theme";
import { spacing, type, type Palette } from "./tokens";

interface DarkHeaderProps {
    title: string;
    right?: ReactNode;
    children?: ReactNode;
    withLogo?: boolean;
}

/** Header escuro das abas: logo + título condensado, com espaço para filtros. */
export function DarkHeader({
    title,
    right,
    children,
    withLogo = true,
}: DarkHeaderProps) {
    const insets = useSafeAreaInsets();
    const styles = useThemedStyles(criarEstilos);

    return (
        <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
            <View style={styles.linha}>
                {withLogo ? (
                    <Image
                        source={require("../../assets/logo.png")}
                        style={styles.logo}
                    />
                ) : null}

                <Text style={[type.tituloTela, styles.titulo]}>{title}</Text>

                {right ? <View style={styles.direita}>{right}</View> : null}
            </View>

            {children}
        </View>
    );
}

const criarEstilos = (c: Palette) =>
    StyleSheet.create({
    header: {
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.lg,
        gap: spacing.md,
        backgroundColor: c.header,
    },
    linha: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
    },
    logo: {
        width: 36,
        height: 36,
    },
    titulo: {
        flex: 1,
        color: c.onHeader,
    },
    direita: {
        marginLeft: "auto",
    },
});
