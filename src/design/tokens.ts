import type { TextStyle } from "react-native";

export const colors = {
    primary: "#DA680D",
    onPrimary: "#FFFEFB",
    canvas: "#FFFEFB",
    canvasSoft: "#F7F2EC",
    line: "#EAE4DA",
    chipBorder: "#DCD6C9",
    ink: "#1C1614",
    body: "#605D52",
    mute: "#939084",
    header: "#1C1614",
    onHeader: "#FFFEFB",
    onHeaderSoft: "#C9C3B6",
    mapBase: "#E7E1D6",
    mapStreet: "#FFFEFB",
    mapPark: "#D9E0CD",
    mapBlock: "#EDE7DE",
    stripeA: "#E6DFD5",
    stripeB: "#EFEAE2",
    /** Mantidos para telas ainda não migradas ao visual novo. */
    bodyMid: "#939084",
    inkSoft: "#2f2a26",
    inkMid: "#36342e",
};

export const darkColors: typeof colors = {
    ...colors,
    canvas: "#14100E",
    canvasSoft: "#1F1A16",
    line: "#2A241F",
    chipBorder: "#3A332C",
    ink: "#FFFEFB",
    body: "#B7AFA4",
    mute: "#857D72",
    header: "#0E0B09",
    onHeaderSoft: "#A29A8E",
    mapBase: "#221D19",
    mapStreet: "#2F2822",
    mapPark: "#23291F",
    mapBlock: "#1B1713",
    stripeA: "#221D19",
    stripeB: "#1A1613",
    bodyMid: "#857D72",
};

export const spacing = {
    xxs: 2,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 26,
    xxxl: 40,
    xxxxl: 64,
};

export const radius = {
    none: 0,
    sm: 12,
    md: 16,
    lg: 20,
    sheet: 24,
    chip: 23,
    pill: 9999,
};

/** Alturas fixas do handoff. */
export const size = {
    cta: 56,
    sheetButton: 52,
    input: 54,
    filterChip: 34,
    formChip: 40,
    onboardingChip: 46,
    tabBar: 76,
    fab: 56,
    backButton: 42,
};

export const shadow = {
    sheet: {
        shadowColor: "#0A0806",
        shadowOpacity: 0.4,
        shadowRadius: 22,
        shadowOffset: { width: 0, height: -10 },
        elevation: 12,
    },
    pill: {
        shadowColor: "#0A0806",
        shadowOpacity: 0.45,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 10 },
        elevation: 6,
    },
    fab: {
        shadowColor: "#DA680D",
        shadowOpacity: 0.7,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 14 },
        elevation: 10,
    },
};

export const font = {
    condensed: "BebasNeue_400Regular",
    regular: "Inter_400Regular",
    medium: "Inter_500Medium",
    semibold: "Inter_600SemiBold",
    bold: "Inter_700Bold",
};

export const type: Record<string, TextStyle> = {
    displayEntrada: {
        fontFamily: font.condensed,
        fontSize: 62,
        lineHeight: 56,
        letterSpacing: 1,
        textTransform: "uppercase",
    },
    tituloTela: {
        fontFamily: font.condensed,
        fontSize: 36,
        lineHeight: 32,
        letterSpacing: 0.8,
        textTransform: "uppercase",
    },
    tituloHero: {
        fontFamily: font.condensed,
        fontSize: 44,
        lineHeight: 40,
        letterSpacing: 0.8,
        textTransform: "uppercase",
    },
    tituloPasso: {
        fontFamily: font.condensed,
        fontSize: 42,
        lineHeight: 38,
        letterSpacing: 0.8,
        textTransform: "uppercase",
    },
    nomeCard: {
        fontFamily: font.condensed,
        fontSize: 28,
        lineHeight: 26,
        letterSpacing: 0.5,
        textTransform: "uppercase",
    },
    nomeSheet: {
        fontFamily: font.condensed,
        fontSize: 32,
        lineHeight: 30,
        letterSpacing: 0.6,
        textTransform: "uppercase",
    },
    placar: {
        fontFamily: font.condensed,
        fontSize: 40,
        lineHeight: 34,
        letterSpacing: 2,
    },
    posicaoDestaque: {
        fontFamily: font.condensed,
        fontSize: 48,
        lineHeight: 42,
        letterSpacing: 1,
    },
    posicaoLista: {
        fontFamily: font.condensed,
        fontSize: 28,
        lineHeight: 26,
        letterSpacing: 1,
    },
    pontos: {
        fontFamily: font.condensed,
        fontSize: 22,
        lineHeight: 20,
        letterSpacing: 1,
    },
    statCard: {
        fontFamily: font.condensed,
        fontSize: 26,
        lineHeight: 24,
        letterSpacing: 0.5,
    },
    corpo: {
        fontFamily: font.regular,
        fontSize: 15,
        lineHeight: 23,
    },
    corpoSm: {
        fontFamily: font.regular,
        fontSize: 14,
        lineHeight: 21,
    },
    corpoLg: {
        fontFamily: font.regular,
        fontSize: 17,
        lineHeight: 26,
    },
    nomeLista: {
        fontFamily: font.semibold,
        fontSize: 15,
        lineHeight: 20,
    },
    valorCampo: {
        fontFamily: font.regular,
        fontSize: 17,
        lineHeight: 22,
    },
    botao: {
        fontFamily: font.semibold,
        fontSize: 17,
        lineHeight: 22,
    },
    botaoSheet: {
        fontFamily: font.semibold,
        fontSize: 16,
        lineHeight: 21,
    },
    eyebrow: {
        fontFamily: font.bold,
        fontSize: 11,
        lineHeight: 14,
        letterSpacing: 1.2,
        textTransform: "uppercase",
    },
    labelCampo: {
        fontFamily: font.bold,
        fontSize: 12,
        lineHeight: 15,
        letterSpacing: 1,
        textTransform: "uppercase",
    },
    labelTab: {
        fontFamily: font.semibold,
        fontSize: 10,
        lineHeight: 12,
        letterSpacing: 0.8,
        textTransform: "uppercase",
    },
    metadado: {
        fontFamily: font.regular,
        fontSize: 13,
        lineHeight: 19,
    },

    /* Apelidos do visual anterior, para as telas ainda não migradas. */
    displayLg: {
        fontFamily: font.condensed,
        fontSize: 48,
        lineHeight: 48,
    },
    displayMd: {
        fontFamily: font.condensed,
        fontSize: 36,
        lineHeight: 36,
        letterSpacing: 0.8,
        textTransform: "uppercase",
    },
    displaySubSm: {
        fontFamily: font.semibold,
        fontSize: 24,
        lineHeight: 30,
    },
    displayXs: {
        fontFamily: font.bold,
        fontSize: 20,
        lineHeight: 25,
    },
    headlineMd: {
        fontFamily: font.condensed,
        fontSize: 36,
        lineHeight: 32,
        letterSpacing: 0.8,
        textTransform: "uppercase",
    },
    headlineSm: {
        fontFamily: font.condensed,
        fontSize: 28,
        lineHeight: 26,
        letterSpacing: 0.5,
        textTransform: "uppercase",
    },
    statLg: {
        fontFamily: font.condensed,
        fontSize: 40,
        lineHeight: 34,
        letterSpacing: 2,
    },
    statMd: {
        fontFamily: font.condensed,
        fontSize: 24,
        lineHeight: 22,
        letterSpacing: 1,
    },
    label: {
        fontFamily: font.bold,
        fontSize: 11,
        lineHeight: 14,
        letterSpacing: 1.2,
        textTransform: "uppercase",
    },
    bodyLg: {
        fontFamily: font.regular,
        fontSize: 17,
        lineHeight: 26,
    },
    bodyMd: {
        fontFamily: font.regular,
        fontSize: 15,
        lineHeight: 23,
    },
    bodyMdStrong: {
        fontFamily: font.semibold,
        fontSize: 15,
        lineHeight: 23,
    },
    bodySm: {
        fontFamily: font.regular,
        fontSize: 14,
        lineHeight: 21,
    },
    bodySmStrong: {
        fontFamily: font.semibold,
        fontSize: 15,
        lineHeight: 20,
    },
    caption: {
        fontFamily: font.regular,
        fontSize: 13,
        lineHeight: 19,
    },
    buttonMd: {
        fontFamily: font.semibold,
        fontSize: 17,
        lineHeight: 22,
    },
    buttonSm: {
        fontFamily: font.bold,
        fontSize: 12,
        lineHeight: 15,
        letterSpacing: 1,
        textTransform: "uppercase",
    },
};

export type Palette = typeof colors;
