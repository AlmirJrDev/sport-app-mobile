import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "expo-router";

import { getSession, type Account } from "./account";

export interface SessionState {
    account: Account | null;
    loading: boolean;
    reload: () => void;
}

export function useSession(): SessionState {
    const [account, setAccount] = useState<Account | null>(null);
    const [loading, setLoading] = useState(true);

    /** Qualquer falha vira "sem sessão": senão a tela fica carregando para sempre. */
    const reload = useCallback(() => {
        getSession()
            .catch(() => null)
            .then((found) => {
                setAccount(found);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        reload();
    }, [reload]);

    useFocusEffect(
        useCallback(() => {
            reload();
        }, [reload]),
    );

    return { account, loading, reload };
}
