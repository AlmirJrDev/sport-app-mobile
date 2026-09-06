import type { TextStyle } from "react-native";

export const colors = {
    primary: "#ff4f00",
    onPrimary: "#fffefb",
    canvas: "#fffefb",
    canvasSoft: "#f8f4f0",
    ink: "#201515",
    inkSoft: "#2f2a26",
    inkMid: "#36342e",
    body: "#605d52",
    bodyMid: "#939084",
    mute: "#c5c0b1",
};

export const spacing = {
    xxs: 2,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    xxxl: 48,
    xxxxl: 64,
};

export const radius = {
    none: 0,
    sm: 6,
    md: 12,
    pill: 9999,
};

export const font = {
    condensed: "BebasNeue_400Regular",
    regular: "Inter_400Regular",
    medium: "Inter_500Medium",
    semibold: "Inter_600SemiBold",
    bold: "Inter_700Bold",
};

export const type: Record<string, TextStyle> = {
    displayLg: {
        fontFamily: font.medium,
        fontSize: 48,
        lineHeight: 48,
    },
    displayMd: {
        fontFamily: font.medium,
        fontSize: 32,
        lineHeight: 36,
        letterSpacing: 1,
    },
    displaySubSm: {
        fontFamily: font.semibold,
        fontSize: 24,
        lineHeight: 30,
        letterSpacing: -0.6,
    },
    displayXs: {
        fontFamily: font.bold,
        fontSize: 20,
        lineHeight: 25,
        letterSpacing: -0.5,
    },
    bodyLg: {
        fontFamily: font.regular,
        fontSize: 20,
        lineHeight: 30,
        letterSpacing: -0.2,
    },
    bodyMd: {
        fontFamily: font.regular,
        fontSize: 18,
        lineHeight: 27,
    },
    bodyMdStrong: {
        fontFamily: font.semibold,
        fontSize: 18,
        lineHeight: 27,
    },
    bodySm: {
        fontFamily: font.regular,
        fontSize: 16,
        lineHeight: 24,
    },
    bodySmStrong: {
        fontFamily: font.semibold,
        fontSize: 16,
        lineHeight: 24,
    },
    caption: {
        fontFamily: font.regular,
        fontSize: 14,
        lineHeight: 21,
    },
    eyebrow: {
        fontFamily: font.medium,
        fontSize: 14,
        lineHeight: 14,
        letterSpacing: 1,
        textTransform: "uppercase",
    },
    buttonMd: {
        fontFamily: font.semibold,
        fontSize: 18,
        lineHeight: 27,
    },
    buttonSm: {
        fontFamily: font.bold,
        fontSize: 14.4,
        lineHeight: 14.4,
        letterSpacing: 0.144,
    },
    headlineMd: {
        fontFamily: font.condensed,
        fontSize: 36,
        lineHeight: 36,
        letterSpacing: 0.7,
        textTransform: "uppercase",
    },
    headlineSm: {
        fontFamily: font.condensed,
        fontSize: 26,
        lineHeight: 26,
        letterSpacing: 0.5,
        textTransform: "uppercase",
    },
    statLg: {
        fontFamily: font.condensed,
        fontSize: 44,
        lineHeight: 44,
        letterSpacing: 2,
    },
    statMd: {
        fontFamily: font.condensed,
        fontSize: 24,
        lineHeight: 24,
        letterSpacing: 1,
    },
    label: {
        fontFamily: font.semibold,
        fontSize: 12,
        lineHeight: 16,
        letterSpacing: 1.2,
        textTransform: "uppercase",
    },
};
