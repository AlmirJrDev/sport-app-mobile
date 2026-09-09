import { StyleSheet, Text, View } from "react-native";

import { useThemedStyles } from "../design/theme";
import {
    radius,
    spacing,
    type,
    type Palette,
} from "../design/tokens";

export default function MockNotice({ texto }: { texto: string }) {
    const styles = useThemedStyles(criarEstilos);
    return (
        <View style={styles.faixa}>
            <Text style={[type.label, styles.rotulo]}>Exemplo</Text>
            <Text style={[type.caption, styles.texto]}>{texto}</Text>
        </View>
    );
}

const criarEstilos = (c: Palette) =>
    StyleSheet.create({
    faixa: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        padding: spacing.md,
        borderRadius: radius.sm,
        backgroundColor: c.canvasSoft,
    },
    rotulo: {
        color: c.primary,
    },
    texto: {
        flex: 1,
        color: c.body,
    },
});
