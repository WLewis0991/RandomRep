import { useState, createContext, type ReactNode, useEffect } from "react";
import type { User } from "@neondatabase/auth/types";
import { authClient } from "../lib/auth";

interface AuthContextType {
    user: User | null;
}

export const AuthContext = createContext<AuthContextType | null>(null)

export default function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        async function loadUser() {
            try {
                const result = await authClient.getSession()
                if (result && result.data?.user) {
                    setUser(result.data.user);
                } else {
                    setUser(null);
                }
            } catch (err) {
                setUser(null)
            }
        }
        loadUser()
    }, [])

    return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
}
