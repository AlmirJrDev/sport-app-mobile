import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Lê um JSON guardado no aparelho. Dado corrompido some em vez de derrubar a
 * tela: um `JSON.parse` solto aqui trava o app na abertura, sem saída.
 */
export async function lerJson<T>(chave: string, padrao: T): Promise<T> {
    let bruto: string | null = null;

    try {
        bruto = await AsyncStorage.getItem(chave);
    } catch {
        return padrao;
    }

    if (!bruto) {
        return padrao;
    }

    try {
        return JSON.parse(bruto) as T;
    } catch {
        await AsyncStorage.removeItem(chave).catch(() => {});

        return padrao;
    }
}
