import { getSession } from "../auth/account";

export interface Player {
    id: string;
    name: string;
}

export async function getPlayer(): Promise<Player> {
    const account = await getSession();

    if (!account) {
        throw new Error("Sem sessão — o jogador precisa estar logado.");
    }

    return { id: account.id, name: account.name };
}
