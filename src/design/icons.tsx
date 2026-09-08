import Svg, { Path } from "react-native-svg";

/** Traços do protótipo: viewBox 24, sem preenchimento, stroke 1.5 arredondado. */
const PATHS = {
    mapa: "M12 21s7-5.7 7-11a7 7 0 1 0-14 0c0 5.3 7 11 7 11Zm0-13.4a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z",
    locais: "M4 6h16v12H4Zm8 0v12M4 9.5v5M20 9.5v5",
    rankings: "M5 20v-7m7 7V4m7 16v-9",
    alertas: "M12 4a5 5 0 0 0-5 5v3.2L5.2 15.5h13.6L17 12.2V9a5 5 0 0 0-5-5Zm-2.2 11.5a2.2 2.2 0 0 0 4.4 0",
    perfil: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0",
    desafio: "M6 4v7a6 6 0 0 0 12 0V4M9 20h6M12 17v3M4 5h2m12 0h2",
    lembrete: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13v5l3.5 2",
    convite: "M4 6h16v12H4Zm0 0 8 6 8-6",
    aviso: "M12 4 3 19h18L12 4Zm0 6v4m0 3v.5",
    chevron: "M15 5l-7 7 7 7",
    mais: "M12 5v14M5 12h14",
    menos: "M5 12h14",
    fechar: "M6 6l12 12M18 6L6 18",
    busca: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm5 -2 4 4",
    calendario: "M5 6h14v14H5zM8 3v4m8-4v4M5 11h14",
    compartilhar: "M12 16V4m0 0L8 8m4-4 4 4M5 15v4h14v-4",
};

export type IconName = keyof typeof PATHS;

interface IconProps {
    name: IconName;
    size?: number;
    color: string;
}

export function Icon({ name, size = 24, color }: IconProps) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path
                d={PATHS[name]}
                stroke={color}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
}
