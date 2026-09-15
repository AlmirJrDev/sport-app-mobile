import { StyleSheet, Text, View } from "react-native";

import { useThemedStyles } from "../design/theme";
import { spacing, type, type Palette } from "../design/tokens";
import { isExpoGo } from "../platform/expoGo";
import type { GameMapProps } from "./GameMapNative";

/**
 * O mapa nativo só existe no app compilado. O require fica dentro da função
 * para o Expo Go nem carregar o módulo, que derrubaria o app.
 */
export default function GameMap(props: GameMapProps) {
    if (isExpoGo) {
        return <SemMapa />;
    }

    const GameMapNative = require("./GameMapNative").default;

    return <GameMapNative {...props} />;
}

function SemMapa() {
    const styles = useThemedStyles(criarEstilos);

    return (
        <View style={styles.caixa}>
            <Text style={[type.corpo, styles.texto]}>
                O mapa aparece no app instalado. No Expo Go, use a lista.
            </Text>
        </View>
    );
}

const criarEstilos = (c: Palette) =>
    StyleSheet.create({
        caixa: {
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            alignItems: "center",
            justifyContent: "center",
            padding: spacing.xl,
            backgroundColor: c.canvasSoft,
        },
        texto: {
            color: c.body,
            textAlign: "center",
        },
    });
