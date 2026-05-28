import { useState, type ReactNode, useEffect, useCallback, useRef } from "react";
import type { User } from "@neondatabase/auth/types";
import { authClient } from "../lib/auth";
import type { TrainingPlan, UserProfile } from "../types/types";
import { api } from "../lib/api";
import { AuthContext } from "./authContext";


export default function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDataLoading, setIsDataLoading] = useState(false);
    const [plan, setPlan] = useState<TrainingPlan | null>(null);
    const isRefreshing = useRef(false);

    useEffect(() => {
        async function loadUser() {
            try {
                const result = await authClient.getSession();
                if (result?.data?.user) {
                    setUser(result.data.user);
                } else {
                    setUser(null);
                }
            } catch {
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        }
        loadUser();
    }, []);

    const refreshData = useCallback(async () => {
        if (!user || isRefreshing.current) return;

        isRefreshing.current = true;
        setIsDataLoading(true);
        try {
            const planData = await api.getCurrentPlan(user.id).catch(() => null);
            if (planData) {
                console.log("Fetched plan data:", planData.planJson);
                setPlan({
                    id: planData.id,
                    userId: planData.user_id,
                    overview: planData.planJson.overview,
                    weeklySchedule: planData.planJson.weeklySchedule,
                    progression: planData.planJson.progression,
                    version: planData.version,
                    createdAt: planData.createdAt,
                });
            }
        } finally {
            isRefreshing.current = false;
            setIsDataLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            refreshData();
        }
    }, [user, refreshData]);

    async function saveProfile(profileData: Omit<UserProfile, 'userId' | 'updatedAt'>) {
        if (!user) throw new Error("User must be authenticated to save profile");
        await api.saveProfile(user.id, profileData);
        await refreshData();
    }

    async function generatePlan() {
        if (!user) throw new Error("User must be authenticated to generate plan");
        await api.generatePlan(user.id);
        await refreshData();
    }

    return (
        <AuthContext.Provider value={{ user, isLoading, isDataLoading, plan, saveProfile, generatePlan, refreshData }}>
            {children}
        </AuthContext.Provider>
    );
}