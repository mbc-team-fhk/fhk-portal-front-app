import { useEffect, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mode, setMode] = useState<"signin" | "signup">("signin");
    const [loginId, setLoginId] = useState("");
    const [loginPw, setLoginPw] = useState("");
    const [signup, setSignup] = useState({
        loginId: "",
        password: "",
        passwordConfirm: "",
        nickname: "",
        email: "",
    });
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };

        window.addEventListener("keydown", onKeyDown);
        return () => {
            document.body.style.overflow = originalOverflow;
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleLogin = async (event: FormEvent) => {
        event.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            await login(loginId, loginPw);
            onClose();
        } catch {
            setError("로그인에 실패했습니다. 아이디와 비밀번호를 확인하세요.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleTesterLogin = async () => {
        const testerId = import.meta.env.VITE_TESTER_LOGIN_ID ?? "tester";
        const testerPw = import.meta.env.VITE_TESTER_LOGIN_PW ?? "tester1234";
        setSubmitting(true);
        setError(null);
        try {
            await login(testerId, testerPw);
            onClose();
        } catch {
            setError("테스터 로그인에 실패했습니다. 환경변수를 확인하세요.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleSignupPlaceholder = (event: FormEvent) => {
        event.preventDefault();
        setError("회원가입/중복확인 API는 아직 연결되지 않았습니다. UI만 준비된 상태입니다.");
    };

    const openFullPage = () => {
        onClose();
        navigate("/login", { state: { from: location.pathname } });
    };

    return (
        <div className="login-modal-overlay" onClick={onClose}>
            <div className="login-modal" onClick={(event) => event.stopPropagation()}>
                <button className="modal-close-button" onClick={onClose} aria-label="닫기">
                    ×
                </button>
                <div className="login-modal-tabs">
                    <button
                        className={mode === "signin" ? "active" : ""}
                        onClick={() => setMode("signin")}
                        type="button"
                    >
                        Sign in
                    </button>
                    <button
                        className={mode === "signup" ? "active" : ""}
                        onClick={() => setMode("signup")}
                        type="button"
                    >
                        Sign up
                    </button>
                </div>

                {mode === "signin" ? (
                    <form className="login-form" onSubmit={handleLogin}>
                        <div>
                            <label>Id</label>
                            <input value={loginId} onChange={(e) => setLoginId(e.target.value)} />
                        </div>
                        <div>
                            <label>Password</label>
                            <input type="password" value={loginPw} onChange={(e) => setLoginPw(e.target.value)} />
                        </div>
                        <button className="primary-button" type="submit" disabled={submitting}>
                            {submitting ? "처리 중..." : "Sign in"}
                        </button>
                        <button className="secondary-button" type="button" onClick={handleTesterLogin} disabled={submitting}>
                            테스터로 로그인하기
                        </button>
                        <button className="text-button" type="button" onClick={openFullPage}>
                            전체 페이지 로그인 열기
                        </button>
                    </form>
                ) : (
                    <form className="login-form" onSubmit={handleSignupPlaceholder}>
                        <div>
                            <label>Id</label>
                            <div className="inline-check-row">
                                <input
                                    value={signup.loginId}
                                    onChange={(e) => setSignup((prev) => ({ ...prev, loginId: e.target.value }))}
                                />
                                <button type="button" className="secondary-button compact-button">중복확인</button>
                            </div>
                        </div>
                        <div>
                            <label>Password</label>
                            <input
                                type="password"
                                value={signup.password}
                                onChange={(e) => setSignup((prev) => ({ ...prev, password: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label>Password 확인</label>
                            <input
                                type="password"
                                value={signup.passwordConfirm}
                                onChange={(e) => setSignup((prev) => ({ ...prev, passwordConfirm: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label>닉네임</label>
                            <div className="inline-check-row">
                                <input
                                    value={signup.nickname}
                                    onChange={(e) => setSignup((prev) => ({ ...prev, nickname: e.target.value }))}
                                />
                                <button type="button" className="secondary-button compact-button">중복확인</button>
                            </div>
                        </div>
                        <div>
                            <label>이메일</label>
                            <div className="inline-check-row">
                                <input
                                    type="email"
                                    value={signup.email}
                                    onChange={(e) => setSignup((prev) => ({ ...prev, email: e.target.value }))}
                                />
                                <button type="button" className="secondary-button compact-button">중복확인</button>
                            </div>
                        </div>
                        <button className="primary-button" type="submit">Sign up</button>
                    </form>
                )}

                {error && <p className="form-error-text">{error}</p>}
            </div>
        </div>
    );
}
