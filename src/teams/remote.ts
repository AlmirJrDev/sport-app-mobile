import { API_BASE, apiFetch } from "../api/client";

interface ApiPublicUser {
    id: string;
    first_name?: string;
    last_name?: string;
    avatar_id?: string | null;
    city?: string | null;
    main_sport?: string | null;
}

interface ApiTeam {
    id: string;
    name: string;
    description?: string;
    image_id?: string | null;
    creator_id: string;
    members_count?: number;
    members?: {
        user: ApiPublicUser;
        role: string;
    }[];
}

interface ApiInvitation {
    id: string;
    team_id: string;
    team?: { id: string; name: string; image_id?: string | null };
    inviter?: ApiPublicUser;
}

export interface Team {
    id: string;
    name: string;
    description?: string;
    imageUrl?: string;
    creatorId: string;
    membersCount: number;
    members: TeamMember[];
}

export interface TeamMember {
    id: string;
    name: string;
    detail: string;
    dono: boolean;
}

export interface TeamInvitation {
    id: string;
    teamId: string;
    teamName: string;
    de: string;
}

function nome(pessoa?: ApiPublicUser): string {
    if (!pessoa) {
        return "Atleta";
    }

    return (
        `${pessoa.first_name ?? ""} ${pessoa.last_name ?? ""}`.trim() || "Atleta"
    );
}

function toTeam(api: ApiTeam): Team {
    const members = (api.members ?? []).map((item) => ({
        id: item.user?.id ?? "",
        name: nome(item.user),
        detail: [item.user?.main_sport, item.user?.city]
            .filter(Boolean)
            .join(" · "),
        dono: item.role === "OWNER" || item.user?.id === api.creator_id,
    }));

    return {
        id: api.id,
        name: api.name,
        description: api.description,
        imageUrl: api.image_id
            ? `${API_BASE}/media/${api.image_id}`
            : undefined,
        creatorId: api.creator_id,
        membersCount: api.members_count ?? members.length,
        members,
    };
}

function comoLista(data: unknown): unknown[] {
    if (Array.isArray(data)) {
        return data;
    }

    const dentro = (data as { data?: unknown })?.data;

    return Array.isArray(dentro) ? dentro : [];
}

export async function listMyTeams(): Promise<Team[]> {
    const { data } = await apiFetch<unknown>("/teams/my", { auth: true });

    return comoLista(data).map((item) => toTeam(item as ApiTeam));
}

export async function getTeam(teamId: string): Promise<Team | null> {
    try {
        const { data } = await apiFetch<ApiTeam>(`/teams/${teamId}`, {
            auth: true,
        });

        return data ? toTeam(data) : null;
    } catch {
        return null;
    }
}

export async function createTeam(
    name: string,
    description?: string,
): Promise<Team> {
    const { data } = await apiFetch<ApiTeam>("/teams", {
        method: "POST",
        auth: true,
        body: {
            name: name.trim(),
            ...(description?.trim() ? { description: description.trim() } : {}),
        },
    });

    return toTeam(data);
}

export async function listMyInvitations(): Promise<TeamInvitation[]> {
    const { data } = await apiFetch<unknown>("/teams/invitations/my", {
        auth: true,
    });

    return comoLista(data).map((item) => {
        const convite = item as ApiInvitation;

        return {
            id: convite.id,
            teamId: convite.team_id,
            teamName: convite.team?.name ?? "Time",
            de: nome(convite.inviter),
        };
    });
}

export async function acceptInvitation(invitationId: string): Promise<void> {
    await apiFetch<unknown>(`/teams/invitations/${invitationId}/accept`, {
        method: "POST",
        auth: true,
    });
}

export async function rejectInvitation(invitationId: string): Promise<void> {
    await apiFetch<unknown>(`/teams/invitations/${invitationId}/reject`, {
        method: "POST",
        auth: true,
    });
}

export async function invitePlayer(
    teamId: string,
    userId: string,
): Promise<void> {
    await apiFetch<unknown>(`/teams/${teamId}/invitations`, {
        method: "POST",
        auth: true,
        body: { user_id: userId },
    });
}

export async function leaveTeam(teamId: string): Promise<void> {
    await apiFetch<unknown>(`/teams/${teamId}/leave`, {
        method: "POST",
        auth: true,
    });
}

export async function deleteTeam(teamId: string): Promise<void> {
    await apiFetch<unknown>(`/teams/${teamId}`, {
        method: "DELETE",
        auth: true,
    });
}
