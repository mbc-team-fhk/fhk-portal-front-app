import type { FormEvent } from "react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation() as any;
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const from = location.state?.from ?? "/";

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            await login(username, password);
            navigate(from, { replace: true });
        } catch (err) {
            setError("로그인에 실패했습니다. 아이디/비밀번호를 확인하세요.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ maxWidth: "360px",
            width: "100%",
            margin: "3rem auto", }}>

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: "1rem" }}>
                    <label
                        style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.25rem" }}
                    >
                        Username
                    </label>
                    <input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "0.4rem 0.5rem",
                            borderRadius: "4px",
                            border: "1px solid #ccc",
                            fontSize: "0.9rem",
                        }}
                    />
                </div>
                <div style={{ marginBottom: "2rem" }}>
                    <label
                        style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.25rem" }}
                    >
                        Password
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "0.4rem 0.5rem",
                            borderRadius: "4px",
                            border: "1px solid #ccc",
                            fontSize: "0.9rem",
                        }}
                    />
                </div>
                <button
                    type="submit"
                    disabled={submitting}
                    style={{
                        width: "100%",
                        borderRadius: "4px",
                        border: "1px solid #222",
                        background: "#222",
                        color: "#fff",
                        padding: "0.5rem 0.5rem",
                        cursor: "pointer",
                        fontSize: "0.9rem",
                        opacity: submitting ? 0.7 : 1,
                    }}
                >
                    {submitting ? "로그인 중..." : "로그인"}
                </button>
                {error && (
                    <div
                        style={{
                            fontSize: "0.8rem",
                            color: "#c0392b",
                            marginTop: "0.75rem",
                        }}
                    >
                        {error}
                    </div>
                )}
            </form>
        </div>
    );
}
