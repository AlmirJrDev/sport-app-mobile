import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "projetoh:pending-verify";

export interface PendingVerification {
    email: string;
    token: string;
}

export async function savePending(
    pending: PendingVerification,
): Promise<void> {
    await AsyncStorage.setItem(KEY, JSON.stringify(pending));
}

export async function readPending(): Promise<PendingVerification | null> {
    const raw = await AsyncStorage.getItem(KEY);

    return raw ? (JSON.parse(raw) as PendingVerification) : null;
}

export async function clearPending(): Promise<void> {
    await AsyncStorage.removeItem(KEY);
}
