import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { securityGet, securityPost } from "../../utils/securityApi";

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type ModalMode = "signin" | "signup" | "social-signup";
type AvailabilityState = "idle" | "invalid" | "checking" | "available" | "duplicate";

type AvailabilityResponse = {
    available: boolean;
};

const TESTER_TOOLTIP_TEXT = "포트폴리오 시연용 계정으로 바로 로그인합니다.";

function isValidLoginId(value: string) {
    return /^[A-Za-z][A-Za-z0-9]{5,19}$/.test(value);
}

function isValidPassword(value: string) {
    return /^\S{8,24}$/.test(value);
}

function isValidNickname(value: string) {
    return /^[A-Za-z0-9가-힣]{2,16}$/.test(value);
}

function statusMessage(field: string, state: AvailabilityState) {
    switch (state) {
        case "invalid":
            return `${field} 입력칸을 확인하세요`;
        case "checking":
            return "";
        case "available":
            return `사용 가능한 ${field} 입니다.`;
        case "duplicate":
            return `중복된 ${field} 입니다.`;
        default:
            return "";
    }
}

function readErrorMessage(error: unknown, fallback: string) {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    return fallback;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [mode, setMode] = useState<ModalMode>("signin");
    const [submitting, setSubmitting] = useState(false);
    const [globalError, setGlobalError] = useState("");

    const [signinId, setSigninId] = useState("");
    const [signinPassword, setSigninPassword] = useState("");

    const [signupId, setSignupId] = useState("");
    const [signupPassword, setSignupPassword] = useState("");
    const [signupPasswordConfirm, setSignupPasswordConfirm] = useState("");
    const [signupNickname, setSignupNickname] = useState("");
    const [signupIdState, setSignupIdState] = useState<AvailabilityState>("idle");
    const [signupNicknameState, setSignupNicknameState] = useState<AvailabilityState>("idle");

    const [socialAccount, setSocialAccount] = useState("");
    const [socialProvider, setSocialProvider] = useState<"kakao" | "google" | null>(null);
    const [socialNickname, setSocialNickname] = useState("");
    const [socialNicknameState, setSocialNicknameState] = useState<AvailabilityState>("idle");

    useEffect(() => {
        if (!isOpen) return;

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => {
            document.body.style.overflow = originalOverflow;
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [isOpen, onClose]);

    useEffect(() => {
        if (!isOpen) {
            setMode("signin");
            setSubmitting(false);
            setGlobalError("");
            setSigninId("");
            setSigninPassword("");
            setSignupId("");
            setSignupPassword("");
            setSignupPasswordConfirm("");
            setSignupNickname("");
            setSignupIdState("idle");
            setSignupNicknameState("idle");
            setSocialAccount("");
            setSocialProvider(null);
            setSocialNickname("");
            setSocialNicknameState("idle");
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const signInEnabled = isValidLoginId(signinId) && isValidPassword(signinPassword) && !submitting;
    const passwordMismatch = signupPasswordConfirm.length > 0 && signupPassword !== signupPasswordConfirm;
    const signupEnabled =
        isValidLoginId(signupId) &&
        signupIdState === "available" &&
        isValidPassword(signupPassword) &&
        signupPassword === signupPasswordConfirm &&
        isValidNickname(signupNickname) &&
        signupNicknameState === "available" &&
        !submitting;

    const socialSignupEnabled =
        socialAccount.length > 0 &&
        isValidNickname(socialNickname) &&
        socialNicknameState === "available" &&
        !submitting;

    const signupPasswordMessage = passwordMismatch ? "비밀번호가 다릅니다." : "";

    const socialSignTitle = socialProvider === "google" ? "Google 간편 회원가입" : "Kakao 간편 회원가입";

    const checkLoginIdAvailability = async () => {
        if (!signupId) {
            setSignupIdState("idle");
            return;
        }

        if (!isValidLoginId(signupId)) {
            setSignupIdState("invalid");
            return;
        }

        try {
            setSignupIdState("checking");
            const response = await securityGet<AvailabilityResponse>(
                `/accounts/availability?loginId=${encodeURIComponent(signupId)}`
            );
            setSignupIdState(response.result?.available ? "available" : "duplicate");
        } catch {
            setSignupIdState("invalid");
        }
    };

    const checkSignupNicknameAvailability = async () => {
        if (!signupNickname) {
            setSignupNicknameState("idle");
            return;
        }

        if (!isValidNickname(signupNickname)) {
            setSignupNicknameState("invalid");
            return;
        }

        try {
            setSignupNicknameState("checking");
            const response = await securityGet<AvailabilityResponse>(
                `/accounts/availability?nickname=${encodeURIComponent(signupNickname)}`
            );
            setSignupNicknameState(response.result?.available ? "available" : "duplicate");
        } catch {
            setSignupNicknameState("invalid");
        }
    };

    const checkSocialNicknameAvailability = async () => {
        if (!socialNickname) {
            setSocialNicknameState("idle");
            return;
        }

        if (!isValidNickname(socialNickname)) {
            setSocialNicknameState("invalid");
            return;
        }

        try {
            setSocialNicknameState("checking");
            const response = await securityGet<AvailabilityResponse>(
                `/accounts/availability?nickname=${encodeURIComponent(socialNickname)}`
            );
            setSocialNicknameState(response.result?.available ? "available" : "duplicate");
        } catch {
            setSocialNicknameState("invalid");
        }
    };

    const handleSignin = async (event: FormEvent) => {
        event.preventDefault();
        if (!signInEnabled) return;

        setSubmitting(true);
        setGlobalError("");

        try {
            await login(signinId, signinPassword);
            onClose();
        } catch (error) {
            setGlobalError(readErrorMessage(error, "로그인에 실패했습니다."));
        } finally {
            setSubmitting(false);
        }
    };

    const handleTesterLogin = async () => {
        const testerId = import.meta.env.VITE_TESTER_LOGIN_ID ?? "tester01";
        const testerPw = import.meta.env.VITE_TESTER_LOGIN_PW ?? "tester1234";

        setSubmitting(true);
        setGlobalError("");

        try {
            await login(testerId, testerPw);
            onClose();
        } catch (error) {
            setGlobalError(readErrorMessage(error, "테스터 로그인에 실패했습니다."));
        } finally {
            setSubmitting(false);
        }
    };

    const handleSignup = async (event: FormEvent) => {
        event.preventDefault();
        if (!signupEnabled) return;

        setSubmitting(true);
        setGlobalError("");

        try {
            await securityPost<unknown>("/accounts", {
                loginId: signupId,
                loginPw: signupPassword,
                nickname: signupNickname,
            });
            setMode("signin");
            setSigninId(signupId);
            setSigninPassword("");
            setGlobalError("회원가입이 완료되었습니다. 로그인해 주세요.");
        } catch (error) {
            setGlobalError(readErrorMessage(error, "회원가입에 실패했습니다."));
        } finally {
            setSubmitting(false);
        }
    };

    const handleSocialSignup = async (event: FormEvent) => {
        event.preventDefault();
        if (!socialSignupEnabled) return;

        setSubmitting(true);
        setGlobalError("");

        try {
            await securityPost<unknown>("/accounts/kakao", {
                loginId: socialAccount,
                nickname: socialNickname,
            });
            setMode("signin");
            setSigninId(socialAccount);
            setGlobalError("간편 회원가입이 완료되었습니다. 로그인해 주세요.");
        } catch (error) {
            setGlobalError(readErrorMessage(error, "간편 회원가입에 실패했습니다."));
        } finally {
            setSubmitting(false);
        }
    };

    const handleSocialPreview = (provider: "kakao" | "google") => {
        setSocialProvider(provider);
        setSocialAccount(provider === "kakao" ? "kakao_juno" : "google_juno");
        setSocialNickname("");
        setSocialNicknameState("idle");
        setMode("social-signup");
        setGlobalError("소셜 로그인 연동 전 단계로, 회원가입 UI를 먼저 연결했습니다.");
    };

    const openFullPage = () => {
        onClose();
        navigate("/login");
    };

    const renderSignin = () => (
        <form className="auth-form" onSubmit={handleSignin}>
            <div className="auth-field-group">
                <input
                    className="auth-input"
                    placeholder="ID"
                    value={signinId}
                    onChange={(event) => setSigninId(event.target.value)}
                />
                <div className="auth-field-message" />
            </div>

            <div className="auth-field-group">
                <input
                    className="auth-input"
                    type="password"
                    placeholder="Password"
                    value={signinPassword}
                    onChange={(event) => setSigninPassword(event.target.value)}
                />
                <div className="auth-field-message" />
            </div>

            <button className="auth-submit-button" type="submit" disabled={!signInEnabled}>
                {submitting ? "Signing in..." : "Sign In"}
            </button>

            <div className="tester-login-row">
                <button
                    className="tester-login-button"
                    type="button"
                    onClick={handleTesterLogin}
                    disabled={submitting}
                >
                    테스터로그인
                </button>
                <div className="tester-help-wrap">
                    <button type="button" className="tester-help-button" aria-label="테스터 로그인 설명">
                        ?
                    </button>
                    <div className="tester-help-tooltip">{TESTER_TOOLTIP_TEXT}</div>
                </div>
            </div>

            <div className="auth-divider"><span>OR</span></div>

            <div className="social-login-row">
                <button
                    type="button"
                    className="social-login-button social-login-button--kakao"
                    onClick={() => handleSocialPreview("kakao")}
                    aria-label="카카오로 로그인"
                >
                    K
                </button>
                <button
                    type="button"
                    className="social-login-button social-login-button--google"
                    onClick={() => handleSocialPreview("google")}
                    aria-label="구글로 로그인"
                >
                    G
                </button>
            </div>

            <div className="auth-switch-row">
                <span>아직 계정이 없으신가요?</span>
                <button type="button" className="auth-link-button" onClick={() => setMode("signup")}>
                    Sign up
                </button>
            </div>

            <button type="button" className="text-button auth-fullpage-button" onClick={openFullPage}>
                전체 페이지 로그인 열기
            </button>
        </form>
    );

    const renderSignup = () => (
        <form className="auth-form" onSubmit={handleSignup}>
            <div className="auth-field-group">
                <div className={`auth-input-shell ${signupIdState === "duplicate" ? "is-error" : ""}`}>
                    <input
                        className="auth-input"
                        placeholder="ID (6~20 characters)"
                        value={signupId}
                        onChange={(event) => {
                            setSignupId(event.target.value);
                            setSignupIdState("idle");
                        }}
                        onBlur={checkLoginIdAvailability}
                    />
                    {signupIdState === "checking" && <span className="auth-inline-spinner" aria-hidden="true" />}
                </div>
                <div className={`auth-field-message ${signupIdState === "duplicate" ? "is-error" : ""}`}>
                    {statusMessage("ID", signupIdState)}
                </div>
            </div>

            <div className="auth-field-group">
                <input
                    className="auth-input"
                    type="password"
                    placeholder="Password (8~24)"
                    value={signupPassword}
                    onChange={(event) => setSignupPassword(event.target.value)}
                />
                <div className="auth-field-message" />
            </div>

            <div className="auth-field-group">
                <div className={`auth-input-shell ${passwordMismatch ? "is-error" : ""}`}>
                    <input
                        className="auth-input"
                        type="password"
                        placeholder="Re-enter password"
                        value={signupPasswordConfirm}
                        onChange={(event) => setSignupPasswordConfirm(event.target.value)}
                    />
                </div>
                <div className={`auth-field-message ${passwordMismatch ? "is-error" : ""}`}>
                    {signupPasswordMessage}
                </div>
            </div>

            <div className="auth-field-group">
                <div className={`auth-input-shell ${signupNicknameState === "duplicate" ? "is-error" : ""}`}>
                    <input
                        className="auth-input"
                        placeholder="Nickname (2~16)"
                        value={signupNickname}
                        onChange={(event) => {
                            setSignupNickname(event.target.value);
                            setSignupNicknameState("idle");
                        }}
                        onBlur={checkSignupNicknameAvailability}
                    />
                    {signupNicknameState === "checking" && <span className="auth-inline-spinner" aria-hidden="true" />}
                </div>
                <div className={`auth-field-message ${signupNicknameState === "duplicate" ? "is-error" : ""}`}>
                    {statusMessage("닉네임", signupNicknameState)}
                </div>
            </div>

            <button className="auth-submit-button" type="submit" disabled={!signupEnabled}>
                {submitting ? "Signing up..." : "Sign up"}
            </button>
        </form>
    );

    const renderSocialSignup = () => (
        <form className="auth-form" onSubmit={handleSocialSignup}>
            <div className="auth-field-group">
                <input className="auth-input auth-input-readonly" value={socialAccount} readOnly />
                <div className="auth-field-message" />
            </div>

            <div className="auth-field-group">
                <div className={`auth-input-shell ${socialNicknameState === "duplicate" ? "is-error" : ""}`}>
                    <input
                        className="auth-input"
                        placeholder="Nickname"
                        value={socialNickname}
                        onChange={(event) => {
                            setSocialNickname(event.target.value);
                            setSocialNicknameState("idle");
                        }}
                        onBlur={checkSocialNicknameAvailability}
                    />
                    {socialNicknameState === "checking" && <span className="auth-inline-spinner" aria-hidden="true" />}
                </div>
                <div className={`auth-field-message ${socialNicknameState === "duplicate" ? "is-error" : ""}`}>
                    {statusMessage("닉네임", socialNicknameState)}
                </div>
            </div>

            <button className="auth-submit-button" type="submit" disabled={!socialSignupEnabled}>
                {submitting ? "Signing up..." : "Sign up"}
            </button>
        </form>
    );

    return (
        <div className="login-modal-overlay" onClick={onClose}>
            <div className="login-modal auth-modal" onClick={(event) => event.stopPropagation()}>
                {mode === "signin" ? (
                    <button className="modal-close-button" onClick={onClose} aria-label="닫기" type="button">
                        ×
                    </button>
                ) : (
                    <div className="auth-modal-topbar">
                        <button type="button" className="auth-topbar-button" onClick={() => setMode("signin")}>
                            ‹
                        </button>
                        <div className="auth-modal-heading">{mode === "signup" ? "Sign up" : socialSignTitle}</div>
                        <button className="auth-topbar-button auth-topbar-close" onClick={onClose} aria-label="닫기" type="button">
                            ×
                        </button>
                    </div>
                )}

                {mode === "signin" && renderSignin()}
                {mode === "signup" && renderSignup()}
                {mode === "social-signup" && renderSocialSignup()}

                <div className={`auth-global-message ${globalError ? "is-visible" : ""}`}>
                    {globalError}
                </div>
            </div>
        </div>
    );
}
