import { createContext } from "react";
import type { User } from "@neondatabase/auth/types";
import type { TrainingPlan, UserProfile } from "../types/types";

export interface AuthContextType {
    user: User | null;
    plan: TrainingPlan | null;
    isLoading: boolean;
    isDataLoading: boolean;
    saveProfile: (profile: Omit<UserProfile, "userId" | "updatedAt">) => Promise<void>;
    generatePlan: () => Promise<void>;
    refreshData: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);