import React, { createContext, useContext, useEffect, useState } from "react";
import type { User } from "../types/auth";

interface AuthContextValue {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const API_BASE = ""; // 같은 도메인에서 /auth, /api 로 프록시된다고 가정

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
                                                                          children,
                                                                      }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // 최초 마운트 시 현재 로그인 상태 확인
    useEffect(() => {
        const fetchMe = async () => {
            try {
                const res = await fetch(`${API_BASE}/auth/me`, {
                    credentials: "include",
                });
                if (res.ok) {
                    const data: User = await res.json();
                    setUser(data);
                }
            } catch (e) {
                // ignore
            } finally {
                setLoading(false);
            }
        };

        fetchMe();
    }, []);

    const login = async (username: string, password: string) => {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        if (!res.ok) {
            throw new Error("로그인 실패");
        }

        const data: User = await res.json();
        setUser(data);
    };

    const logout = async () => {
        try {
            await fetch(`${API_BASE}/auth/logout`, {
                method: "POST",
                credentials: "include",
            });
        } catch (e) {
            // ignore
        } finally {
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
