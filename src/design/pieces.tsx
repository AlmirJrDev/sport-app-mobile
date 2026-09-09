import {
    StyleSheet,
    Text,
    View,
    type StyleProp,
    type ViewStyle,
} from "react-native";
import Svg, { Defs, Pattern, Path, Rect } from "react-native-svg";

import { useTheme, useThemedStyles } from "./theme";
import { font, radius, type, type Palette } from "./tokens";

export function initials(nome: string): string {
    return nome
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((parte) => parte.slice(0, 1))
        .join("")
        .toUpperCase();
}

interface AvatarProps {
    name: string;
    size?: number;
    style?: StyleProp<ViewStyle>;
}

export function Avatar({ name, size = 40, style }: AvatarProps) {
    const { colors } = useTheme();

    return (
        <View
            style={[
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: colors.ink,
                    alignItems: "center",
                    justifyContent: "center",
                },
                style,
            ]}
        >
            <Text
                style={{
                    fontFamily: font.semibold,
                    fontSize: Math.round(size * 0.34),
                    color: colors.onPrimary,
                }}
            >
                {initials(name) || "?"}
            </Text>
        </View>
    );
}

interface StripesProps {
    caption?: string;
    style?: StyleProp<ViewStyle>;
    rounded?: number;
}

/** Placeholder listrado a 45°, o estado vazio de foto que o handoff pede. */
export function Stripes({ caption, style, rounded }: StripesProps) {
    const { colors } = useTheme();
    const styles = useThemedStyles(criarEstilos);

    return (
        <View
            style={[
                styles.stripes,
                rounded !== undefined && { borderRadius: rounded },
                style,
            ]}
        >
            <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
                <Defs>
                    <Pattern
                        id="listras"
                        patternUnits="userSpaceOnUse"
                        width="12"
                        height="12"
                        patternTransform="rotate(45)"
                    >
                        <Rect width="12" height="12" fill={colors.stripeB} />
                        <Path
                            d="M0 0 H6 V12 H0 Z"
                            fill={colors.stripeA}
                        />
                    </Pattern>
                </Defs>
                <Rect width="100%" height="100%" fill="url(#listras)" />
            </Svg>

            {caption ? (
                <Text style={[type.labelTab, styles.caption]}>{caption}</Text>
            ) : null}
        </View>
    );
}

const criarEstilos = (c: Palette) =>
    StyleSheet.create({
    stripes: {
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        borderRadius: radius.md,
        backgroundColor: c.stripeB,
    },
    caption: {
        color: c.mute,
    },
});
