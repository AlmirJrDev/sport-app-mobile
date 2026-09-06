import { StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing, type } from "../design/tokens";

export default function MockNotice({ texto }: { texto: string }) {
    return (
        <View style={styles.faixa}>
            <Text style={[type.label, styles.rotulo]}>Exemplo</Text>
            <Text style={[type.caption, styles.texto]}>{texto}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    faixa: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        padding: spacing.md,
        borderRadius: radius.sm,
        backgroundColor: colors.canvasSoft,
    },
    rotulo: {
        color: colors.primary,
    },
    texto: {
        flex: 1,
        color: colors.body,
    },
});
