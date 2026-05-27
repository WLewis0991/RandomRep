import { useState, createContext, type ReactNode, useEffect } from "react";
import type { User,  } from "@neondatabase/auth/types";
import { authClient } from "../lib/auth";
import type { UserProfile } from "../types/types";
import { api } from "../lib/api";

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    saveProfile: (profile: Omit<UserProfile, 'userId' | 'updatedAt'>) => Promise <void>
}

export const AuthContext = createContext<AuthContextType | null>(null);

export default function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadUser() {
            try {
                const result = await authClient.getSession();

                if (result?.data?.user) {
                    setUser(result.data.user);
                } else {
                    setUser(null);
                }
            } catch (err) {
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        }

        loadUser();
    }, []);

    async function saveProfile(profileData: Omit<UserProfile, 'userId' | 'updatedAt'>) {
        if (!user){
            throw new Error("User must be uthenticated to save profile")
        }
        await api.saveProfile(user.id, profileData)
    }

    return (
        <AuthContext.Provider value={{ user, isLoading, saveProfile }}>
            {children}
        </AuthContext.Provider>
    );
}