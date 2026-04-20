import React, { createContext, useContext, useEffect, useState } from "react";
import type { User } from "../types/auth";
import type { ApiResponse } from "../types/wrapper.ts";

interface AuthContextValue {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (loginId: string, loginPw: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
const API_PREFIX = "/api/security";
const API_ROUTING_URL = API_BASE + API_PREFIX;
const AUTH_HINT_KEY = "fhk_portal_authenticated";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchMe = async (): Promise<User | null> => {
        const res = await fetch(`${API_ROUTING_URL}/auth/me`, {
            credentials: "include",
        });

        if (!res.ok) {
            return null;
        }

        const data: ApiResponse<User> = await res.json();

        if (!data.isSuccess || !data.result) {
            return null;
        }

        return data.result;
    };

    useEffect(() => {
        const initializeAuth = async () => {
            const hasAuthHint = window.localStorage.getItem(AUTH_HINT_KEY) === "true";

            if (!hasAuthHint) {
                setLoading(false);
                return;
            }

            try {
                const me = await fetchMe();

                if (me) {
                    setUser(me);
                } else {
                    setUser(null);
                    window.localStorage.removeItem(AUTH_HINT_KEY);
                }
            } catch {
                setUser(null);
                window.localStorage.removeItem(AUTH_HINT_KEY);
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, []);

    const login = async (loginId: string, loginPw: string) => {
        const res = await fetch(`${API_ROUTING_URL}/auth/login`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ loginId, loginPw }),
        });

        if (!res.ok) {
            window.localStorage.removeItem(AUTH_HINT_KEY);
            throw new Error("로그인 실패");
        }

        window.localStorage.setItem(AUTH_HINT_KEY, "true");

        const me = await fetchMe();
        if (!me) {
            window.localStorage.removeItem(AUTH_HINT_KEY);
            throw new Error("로그인 후 사용자 정보 조회 실패");
        }

        setUser(me);
    };

    const logout = async () => {
        try {
            await fetch(`${API_ROUTING_URL}/auth/logout`, {
                method: "POST",
                credentials: "include",
            });
        } finally {
            window.localStorage.removeItem(AUTH_HINT_KEY);
            setUser(null);
        }
    };

    const value: AuthContextValue = {
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return ctx;
};
