import { Share } from "react-native";

export async function shareInvite(texto: string): Promise<boolean> {
    try {
        const resultado = await Share.share({ message: texto });

        return resultado.action !== Share.dismissedAction;
    } catch {
        return false;
    }
}
