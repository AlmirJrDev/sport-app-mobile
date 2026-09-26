import { API_BASE, apiFetch } from "../api/client";

export type FriendshipStatus =
    | "PENDING"
    | "ACCEPTED"
    | "REJECTED"
    | "CANCELED";

interface ApiPublicUser {
    id: string;
    first_name?: string;
    last_name?: string;
    avatar_id?: string | null;
    city?: string | null;
    uf?: string | null;
    main_sport?: string | null;
}

interface ApiFriendItem {
    friendship_id: string;
    status: FriendshipStatus;
    friend: ApiPublicUser;
}

export interface Friend {
    friendshipId: string;
    id: string;
    name: string;
    detail: string;
    avatarUrl?: string;
}

export interface FriendshipState {
    status: FriendshipStatus | null;
    friendshipId?: string;
    souQuemPediu: boolean;
}

function nome(pessoa: ApiPublicUser): string {
    return (
        `${pessoa.first_name ?? ""} ${pessoa.last_name ?? ""}`.trim() || "Atleta"
    );
}

function detalhe(pessoa: ApiPublicUser): string {
    return [pessoa.main_sport, pessoa.city].filter(Boolean).join(" · ");
}

function toFriend(item: ApiFriendItem): Friend {
    return {
        friendshipId: item.friendship_id,
        id: item.friend.id,
        name: nome(item.friend),
        detail: detalhe(item.friend),
        avatarUrl: item.friend.avatar_id
            ? `${API_BASE}/media/${item.friend.avatar_id}`
            : undefined,
    };
}

async function lista(caminho: string): Promise<Friend[]> {
    const { data } = await apiFetch<unknown>(caminho, { auth: true });
    const bruto = Array.isArray(data)
        ? data
        : ((data as { data?: unknown })?.data ?? []);

    return Array.isArray(bruto)
        ? (bruto as ApiFriendItem[]).filter((item) => item?.friend).map(toFriend)
        : [];
}

export async function listFriends(): Promise<Friend[]> {
    return lista("/friendships/friends");
}

export async function listReceivedRequests(): Promise<Friend[]> {
    return lista("/friendships/requests/received");
}

export async function listSentRequests(): Promise<Friend[]> {
    return lista("/friendships/requests/sent");
}

export async function friendshipWith(userId: string): Promise<FriendshipState> {
    const { data } = await apiFetch<{
        status?: FriendshipStatus | null;
        friendship_id?: string;
        is_requester?: boolean;
    }>(`/friendships/status/${userId}`, { auth: true });

    return {
        status: data?.status ?? null,
        friendshipId: data?.friendship_id,
        souQuemPediu: Boolean(data?.is_requester),
    };
}

export async function addFriend(userId: string): Promise<void> {
    await apiFetch<unknown>("/friendships", {
        method: "POST",
        auth: true,
        body: { recipient_id: userId },
    });
}

export async function acceptFriend(friendshipId: string): Promise<void> {
    await apiFetch<unknown>(`/friendships/${friendshipId}/accept`, {
        method: "POST",
        auth: true,
    });
}

export async function rejectFriend(friendshipId: string): Promise<void> {
    await apiFetch<unknown>(`/friendships/${friendshipId}/reject`, {
        method: "POST",
        auth: true,
    });
}

/** Serve para cancelar o pedido enviado e para desfazer a amizade. */
export async function cancelFriend(friendshipId: string): Promise<void> {
    await apiFetch<unknown>(`/friendships/${friendshipId}/cancel`, {
        method: "POST",
        auth: true,
    });
}
