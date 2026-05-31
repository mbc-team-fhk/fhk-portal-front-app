import React, { createContext, useContext, useEffect, useState } from "react";
import type { User } from "../types/auth";
import type { ApiResponse } from "../types/wrapper.ts";
import { AUTH_HINT_KEY, AUTH_SESSION_EXPIRED_EVENT } from "../utils/authSession";

interface AuthContextValue {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (loginId: string, loginPw: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? (import.meta.env.DEV ? "http://localhost:4000" : "");
const API_PREFIX = "/api/security";
const API_ROUTING_URL = API_BASE + API_PREFIX;
const AUTH_REQUEST_TIMEOUT_MS = 10000;

type AuthCheckResult =
    | { status: "authenticated"; user: User }
    | { status: "unauthenticated" }
    | { status: "unknown" };

async function authFetch(input: RequestInfo | URL, init?: RequestInit) {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), AUTH_REQUEST_TIMEOUT_MS);

    try {
        return await fetch(input, {
            ...init,
            signal: controller.signal,
        });
    } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
            throw new Error("요청 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.");
        }

        throw error;
    } finally {
        window.clearTimeout(timeoutId);
    }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchMe = async (): Promise<AuthCheckResult> => {
        const res = await authFetch(`${API_ROUTING_URL}/auth/me`, {
            credentials: "include",
        });

        if (!res.ok) {
            if (res.status === 401 || res.status === 403) {
                return { status: "unauthenticated" };
            }

            return { status: "unknown" };
        }

        const data: ApiResponse<User> = await res.json();

        if (!data.isSuccess || !data.result) {
            return { status: "unknown" };
        }

        return { status: "authenticated", user: data.result };
    };

    useEffect(() => {
        const initializeAuth = async () => {
            const hasAuthHint = window.localStorage.getItem(AUTH_HINT_KEY) === "true";

            if (!hasAuthHint) {
                setLoading(false);
                return;
            }

            try {
                const meResult = await fetchMe();

                if (meResult.status === "authenticated") {
                    setUser(meResult.user);
                } else if (meResult.status === "unauthenticated") {
                    setUser(null);
                    window.localStorage.removeItem(AUTH_HINT_KEY);
                } else {
                    setUser(null);
                }
            } catch {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, []);

    useEffect(() => {
        const handleSessionExpired = () => {
            setUser(null);
        };

        window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired);
        return () => window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired);
    }, []);

    const login = async (loginId: string, loginPw: string) => {
        const res = await authFetch(`${API_ROUTING_URL}/auth/login`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ loginId, loginPw }),
        });

        if (!res.ok) {
            window.localStorage.removeItem(AUTH_HINT_KEY);
            throw new Error("로그인에 실패했습니다.");
        }

        const loginData: ApiResponse<unknown> = await res.json();

        if (!loginData.isSuccess) {
            window.localStorage.removeItem(AUTH_HINT_KEY);
            throw new Error("로그인 응답이 올바르지 않습니다.");
        }

        window.localStorage.setItem(AUTH_HINT_KEY, "true");

        const meResult = await fetchMe();
        if (meResult.status !== "authenticated") {
            window.localStorage.removeItem(AUTH_HINT_KEY);
            throw new Error("로그인 후 사용자 정보를 조회하지 못했습니다.");
        }

        setUser(meResult.user);
    };

    const logout = async () => {
        try {
            await authFetch(`${API_ROUTING_URL}/auth/logout`, {
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
