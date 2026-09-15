import { Linking, Platform } from "react-native";

const SITE = "https://sport-app-mobile.vercel.app";

export const PRIVACIDADE_URL = `${SITE}/privacidade`;
export const TERMOS_URL = `${SITE}/termos`;

/** No navegador abre em outra aba, para não tirar a pessoa do app. */
export function abrirDocumento(url: string) {
    if (Platform.OS === "web") {
        window.open(url, "_blank", "noopener");
        return;
    }

    Linking.openURL(url);
}
