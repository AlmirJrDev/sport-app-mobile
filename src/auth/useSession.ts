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

    const reload = useCallback(() => {
        getSession().then((found) => {
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
