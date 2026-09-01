import AsyncStorage from "@react-native-async-storage/async-storage";

const ACCOUNTS_KEY = "projetoh:accounts";
const SESSION_KEY = "projetoh:session";

export interface Account {
    id: string;
    name: string;
    email: string;
}

interface StoredAccount extends Account {
    secret: string;
}

export class AuthError extends Error {}

function scramble(value: string): string {
    let hash = 5381;

    for (let i = 0; i < value.length; i += 1) {
        hash = (hash * 33) ^ value.charCodeAt(i);
    }

    return (hash >>> 0).toString(36);
}

function normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

async function readAccounts(): Promise<StoredAccount[]> {
    const raw = await AsyncStorage.getItem(ACCOUNTS_KEY);

    return raw ? (JSON.parse(raw) as StoredAccount[]) : [];
}

async function writeAccounts(accounts: StoredAccount[]): Promise<void> {
    await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

function toPublic(account: StoredAccount): Account {
    return { id: account.id, name: account.name, email: account.email };
}

export async function signUp(
    name: string,
    email: string,
    password: string,
): Promise<Account> {
    const accounts = await readAccounts();
    const normalized = normalizeEmail(email);

    if (accounts.some((one) => one.email === normalized)) {
        throw new AuthError("Já existe uma conta com esse e-mail.");
    }

    const account: StoredAccount = {
        id: `p-${Math.random().toString(36).slice(2, 10)}`,
        name: name.trim(),
        email: normalized,
        secret: scramble(password),
    };

    await writeAccounts([...accounts, account]);
    await AsyncStorage.setItem(SESSION_KEY, account.id);

    return toPublic(account);
}

export async function signIn(
    email: string,
    password: string,
): Promise<Account> {
    const accounts = await readAccounts();
    const found = accounts.find((one) => one.email === normalizeEmail(email));

    if (!found || found.secret !== scramble(password)) {
        throw new AuthError("E-mail ou senha não conferem.");
    }

    await AsyncStorage.setItem(SESSION_KEY, found.id);

    return toPublic(found);
}

export async function signOut(): Promise<void> {
    await AsyncStorage.removeItem(SESSION_KEY);
}

export async function getSession(): Promise<Account | null> {
    const id = await AsyncStorage.getItem(SESSION_KEY);

    if (!id) {
        return null;
    }

    const accounts = await readAccounts();
    const found = accounts.find((one) => one.id === id);

    return found ? toPublic(found) : null;
}
