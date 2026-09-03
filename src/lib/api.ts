
import type { UserProfile } from "../types/types";
import { authClient } from "./auth";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"

async function getSessionToken(): Promise<string | null> {
    try {
        const result = await authClient.getSession();
        return result?.data?.session?.token ?? null;
    } catch {
        return null;
    }
}

async function authHeaders(): Promise<Record<string, string>> {
    const token = await getSessionToken();
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
}

async function post(path: string, body:object){
    const res = await fetch(`${BASE_URL}/api${path}`, {
        method: "POST",
        headers: await authHeaders(),
        body: JSON.stringify(body),
    });

    if(!res.ok)
        throw new Error(
            (await res.json().catch(() => ({}))).error || "Request failed",
        );

    return res.json();
}

async function get(path: string){
    const headers = await authHeaders();
    const res = await fetch(`${BASE_URL}/api${path}`, { headers });

    if(!res.ok)
        throw new Error(
            (await res.json().catch(() => ({}))).error || "Request failed",
        );

    return res.json();
}

export const api = {
  saveProfile: (
    profile: Omit<UserProfile, "userId" | "updatedAt">,
  ) => {
    return post("/profile", profile);
  },
  generatePlan: () => {
    return post("/plan/generate", {});
  },

  getCurrentPlan: () => {
    return get("/plan/current");
  }
};