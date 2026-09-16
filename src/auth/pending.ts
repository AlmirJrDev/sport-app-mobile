import AsyncStorage from "@react-native-async-storage/async-storage";

import { lerJson } from "../storage/json";

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
    return lerJson<PendingVerification | null>(KEY, null);
}

export async function clearPending(): Promise<void> {
    await AsyncStorage.removeItem(KEY);
}
