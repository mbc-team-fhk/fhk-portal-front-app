import { useEffect, useRef, useState, type FormEvent } from "react";
import { useAuth } from "../../context/AuthContext";
import { securityGet, securityPost } from "../../utils/securityApi";
import {
    beginGoogleRedirectLogin,
    beginKakaoRedirectLogin,
    consumePendingSocialRedirect,
    resolvePendingSocialRedirect,
} from "../../utils/socialAuth";
import type { SocialProvider } from "../../types/socialAuth";

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type ModalMode = "signin" | "signup" | "social-signup";
type AvailabilityState = "idle" | "invalid" | "checking" | "available" | "duplicate";
type GlobalMessageTone = "error" | "success" | "info";

type AvailabilityResponse = {
    available: boolean;
};

const TESTER_TOOLTIP_TEXT = "포트폴리오 시연용 계정으로 바로 로그인합니다.";
const TESTER_LOGIN_ID = "tester01";
const TESTER_LOGIN_PASSWORD = "tester1234";

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

function sanitizeNicknameSeed(value: string) {
    const normalized = value.replace(/[^A-Za-z0-9가-힣]/g, "").trim();
    return normalized.slice(0, 16);
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
    const { login } = useAuth();
    const [mode, setMode] = useState<ModalMode>("signin");
    const [submitting, setSubmitting] = useState(false);
    const [globalMessage, setGlobalMessage] = useState("");
    const [globalMessageTone, setGlobalMessageTone] = useState<GlobalMessageTone>("error");

    const [signinId, setSigninId] = useState("");
    const [signinPassword, setSigninPassword] = useState("");

    const [signupId, setSignupId] = useState("");
    const [signupPassword, setSignupPassword] = useState("");
    const [signupPasswordConfirm, setSignupPasswordConfirm] = useState("");
    const [signupNickname, setSignupNickname] = useState("");
    const [signupIdState, setSignupIdState] = useState<AvailabilityState>("idle");
    const [signupNicknameState, setSignupNicknameState] = useState<AvailabilityState>("idle");

    const [socialAccount, setSocialAccount] = useState("");
    const [socialProvider, setSocialProvider] = useState<SocialProvider | null>(null);
    const [socialProviderUserId, setSocialProviderUserId] = useState("");
    const [socialNickname, setSocialNickname] = useState("");
    const [socialNicknameState, setSocialNicknameState] = useState<AvailabilityState>("idle");

    const signupIdRequestRef = useRef(0);
    const signupNicknameRequestRef = useRef(0);
    const socialNicknameRequestRef = useRef(0);
    const handledRedirectRef = useRef(false);

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
            setGlobalMessage("");
            setGlobalMessageTone("error");
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
            setSocialProviderUserId("");
            setSocialNickname("");
            setSocialNicknameState("idle");
            handledRedirectRef.current = false;
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen || handledRedirectRef.current) return;

        const payload = consumePendingSocialRedirect();
        if (!payload) {
            handledRedirectRef.current = true;
            return;
        }

        handledRedirectRef.current = true;
        setSubmitting(true);
        setGlobalMessage("소셜 로그인 결과를 확인하는 중입니다...");
        setGlobalMessageTone("info");

        resolvePendingSocialRedirect(payload)
            .then((identity) => {
                setSocialProvider(identity.provider);
                setSocialProviderUserId(identity.providerUserId);
                setSocialAccount(identity.suggestedLoginId);
                setSocialNickname(sanitizeNicknameSeed(identity.displayName));
                setSocialNicknameState("idle");
                setMode("social-signup");
                setGlobalMessage("소셜 인증이 완료되었습니다. 가입 정보를 확인해 주세요.");
                setGlobalMessageTone("info");
            })
            .catch((error) => {
                setGlobalMessage(readErrorMessage(error, "소셜 로그인 처리에 실패했습니다."));
                setGlobalMessageTone("error");
            })
            .finally(() => {
                setSubmitting(false);
            });
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
        socialProvider !== null &&
        isValidNickname(socialNickname) &&
        socialNicknameState === "available" &&
        !submitting;

    const signupPasswordMessage = passwordMismatch ? "비밀번호가 다릅니다." : "";
    const socialSignTitle = socialProvider === "google" ? "Google 간편 회원가입" : "Kakao 간편 회원가입";

    const applyAvailabilityResult = (
        currentToken: number,
        requestRef: { current: number },
        setter: (value: AvailabilityState) => void,
        state: AvailabilityState
    ) => {
        if (requestRef.current !== currentToken) {
            return;
        }

        setter(state);
    };

    const checkLoginIdAvailability = async () => {
        if (!signupId) {
            setSignupIdState("idle");
            return;
        }

        if (!isValidLoginId(signupId)) {
            setSignupIdState("invalid");
            return;
        }

        const nextToken = signupIdRequestRef.current + 1;
        signupIdRequestRef.current = nextToken;
        setSignupIdState("checking");

        try {
            const response = await securityGet<AvailabilityResponse>(
                `/accounts/availability?loginId=${encodeURIComponent(signupId)}`
            );
            applyAvailabilityResult(
                nextToken,
                signupIdRequestRef,
                setSignupIdState,
                response.result?.available ? "available" : "duplicate"
            );
        } catch {
            applyAvailabilityResult(nextToken, signupIdRequestRef, setSignupIdState, "invalid");
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

        const nextToken = signupNicknameRequestRef.current + 1;
        signupNicknameRequestRef.current = nextToken;
        setSignupNicknameState("checking");

        try {
            const response = await securityGet<AvailabilityResponse>(
                `/accounts/availability?nickname=${encodeURIComponent(signupNickname)}`
            );
            applyAvailabilityResult(
                nextToken,
                signupNicknameRequestRef,
                setSignupNicknameState,
                response.result?.available ? "available" : "duplicate"
            );
        } catch {
            applyAvailabilityResult(nextToken, signupNicknameRequestRef, setSignupNicknameState, "invalid");
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

        const nextToken = socialNicknameRequestRef.current + 1;
        socialNicknameRequestRef.current = nextToken;
        setSocialNicknameState("checking");

        try {
            const response = await securityGet<AvailabilityResponse>(
                `/accounts/availability?nickname=${encodeURIComponent(socialNickname)}`
            );
            applyAvailabilityResult(
                nextToken,
                socialNicknameRequestRef,
                setSocialNicknameState,
                response.result?.available ? "available" : "duplicate"
            );
        } catch {
            applyAvailabilityResult(nextToken, socialNicknameRequestRef, setSocialNicknameState, "invalid");
        }
    };

    const handleSignin = async (event: FormEvent) => {
        event.preventDefault();
        if (!signInEnabled) return;

        setSubmitting(true);
        setGlobalMessage("");
        setGlobalMessageTone("error");

        try {
            await login(signinId, signinPassword);
            onClose();
        } catch (error) {
            setGlobalMessage(readErrorMessage(error, "로그인에 실패했습니다."));
            setGlobalMessageTone("error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleTesterLogin = async () => {
        setSubmitting(true);
        setGlobalMessage("");
        setGlobalMessageTone("error");

        try {
            await login(TESTER_LOGIN_ID, TESTER_LOGIN_PASSWORD);
            onClose();
        } catch (error) {
            setGlobalMessage(readErrorMessage(error, "테스터 로그인에 실패했습니다."));
            setGlobalMessageTone("error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleSignup = async (event: FormEvent) => {
        event.preventDefault();
        if (!signupEnabled) return;

        setSubmitting(true);
        setGlobalMessage("");
        setGlobalMessageTone("error");

        try {
            await securityPost<unknown>("/accounts", {
                loginId: signupId,
                loginPw: signupPassword,
                nickname: signupNickname,
            });
            setMode("signin");
            setSigninId(signupId);
            setSigninPassword("");
            setGlobalMessage("회원가입이 완료되었습니다. 로그인해 주세요.");
            setGlobalMessageTone("success");
        } catch (error) {
            setGlobalMessage(readErrorMessage(error, "회원가입에 실패했습니다."));
            setGlobalMessageTone("error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleSocialSignup = async (event: FormEvent) => {
        event.preventDefault();
        if (!socialSignupEnabled || !socialProvider) return;

        setSubmitting(true);
        setGlobalMessage("");
        setGlobalMessageTone("error");

        try {
            const targetPath = socialProvider === "google" ? "/accounts/google" : "/accounts/kakao";
            await securityPost<unknown>(targetPath, {
                loginId: socialAccount,
                nickname: socialNickname,
            });
            setMode("signin");
            setSigninId(socialAccount);
            setSigninPassword("");
            setGlobalMessage("간편 회원가입이 완료되었습니다. 로그인해 주세요.");
            setGlobalMessageTone("success");
        } catch (error) {
            setGlobalMessage(readErrorMessage(error, "간편 회원가입에 실패했습니다."));
            setGlobalMessageTone("error");
        } finally {
            setSubmitting(false);
        }
    };

    const startSocialLogin = async (provider: SocialProvider) => {
        if (submitting) return;

        setSubmitting(true);
        setGlobalMessage("");
        setGlobalMessageTone("error");

        try {
            if (provider === "kakao") {
                await beginKakaoRedirectLogin();
                return;
            }

            beginGoogleRedirectLogin();
        } catch (error) {
            setGlobalMessage(readErrorMessage(error, "소셜 로그인 시작에 실패했습니다."));
            setGlobalMessageTone("error");
            setSubmitting(false);
        }
    };

    const moveToSignin = () => {
        setMode("signin");
        setGlobalMessage("");
        setGlobalMessageTone("error");
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
                    onClick={() => void startSocialLogin("kakao")}
                    aria-label="카카오로 로그인"
                    disabled={submitting}
                >
                    <span aria-hidden="true">K</span>
                </button>
                <button
                    type="button"
                    className="social-login-button social-login-button--google"
                    onClick={() => void startSocialLogin("google")}
                    aria-label="구글로 로그인"
                    disabled={submitting}
                >
                    <span aria-hidden="true">G</span>
                </button>
            </div>

            <div className="auth-switch-row">
                <span>아직 계정이 없으신가요?</span>
                <button type="button" className="auth-link-button" onClick={() => setMode("signup")}>
                    Sign up
                </button>
            </div>
        </form>
    );

    const renderSignup = () => (
        <form className="auth-form" onSubmit={handleSignup}>
            <div className="auth-field-group">
                <div className={`auth-input-shell ${signupIdState === "duplicate" || signupIdState === "invalid" ? "is-error" : ""}`}>
                    <input
                        className="auth-input"
                        placeholder="ID (6~20 characters)"
                        value={signupId}
                        onChange={(event) => {
                            setSignupId(event.target.value);
                            setSignupIdState("idle");
                        }}
                        onBlur={() => void checkLoginIdAvailability()}
                    />
                    {signupIdState === "checking" && <span className="auth-inline-spinner" aria-hidden="true" />}
                </div>
                <div className={`auth-field-message ${signupIdState === "duplicate" || signupIdState === "invalid" ? "is-error" : signupIdState === "available" ? "is-success" : ""}`}>
                    {statusMessage("ID", signupIdState)}
                </div>
            </div>

            <div className="auth-field-group">
                <div className={`${signupPassword.length > 0 && !isValidPassword(signupPassword) ? "auth-input-shell is-error" : "auth-input-shell"}`}>
                    <input
                        className="auth-input"
                        type="password"
                        placeholder="Password (8~24)"
                        value={signupPassword}
                        onChange={(event) => setSignupPassword(event.target.value)}
                    />
                </div>
                <div className={`auth-field-message ${signupPassword.length > 0 && !isValidPassword(signupPassword) ? "is-error" : ""}`}>
                    {signupPassword.length > 0 && !isValidPassword(signupPassword) ? "Password 입력칸을 확인하세요" : ""}
                </div>
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
                <div className={`auth-input-shell ${signupNicknameState === "duplicate" || signupNicknameState === "invalid" ? "is-error" : ""}`}>
                    <input
                        className="auth-input"
                        placeholder="Nickname (2~16)"
                        value={signupNickname}
                        onChange={(event) => {
                            setSignupNickname(event.target.value);
                            setSignupNicknameState("idle");
                        }}
                        onBlur={() => void checkSignupNicknameAvailability()}
                    />
                    {signupNicknameState === "checking" && <span className="auth-inline-spinner" aria-hidden="true" />}
                </div>
                <div className={`auth-field-message ${signupNicknameState === "duplicate" || signupNicknameState === "invalid" ? "is-error" : signupNicknameState === "available" ? "is-success" : ""}`}>
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
                <div className="auth-field-message auth-provider-summary">
                    {socialProvider ? `${socialProvider.toUpperCase()} 인증 완료` : ""}
                    {socialProviderUserId ? ` · providerId ${socialProviderUserId}` : ""}
                </div>
            </div>

            <div className="auth-field-group">
                <div className={`auth-input-shell ${socialNicknameState === "duplicate" || socialNicknameState === "invalid" ? "is-error" : ""}`}>
                    <input
                        className="auth-input"
                        placeholder="Nickname"
                        value={socialNickname}
                        onChange={(event) => {
                            setSocialNickname(event.target.value);
                            setSocialNicknameState("idle");
                        }}
                        onBlur={() => void checkSocialNicknameAvailability()}
                    />
                    {socialNicknameState === "checking" && <span className="auth-inline-spinner" aria-hidden="true" />}
                </div>
                <div className={`auth-field-message ${socialNicknameState === "duplicate" || socialNicknameState === "invalid" ? "is-error" : socialNicknameState === "available" ? "is-success" : ""}`}>
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
                <div className="auth-modal-topbar">
                    {mode === "signin" ? (
                        <span className="auth-topbar-placeholder" aria-hidden="true" />
                    ) : (
                        <button type="button" className="auth-topbar-button" onClick={moveToSignin}>
                            ‹
                        </button>
                    )}
                    <div className="auth-modal-heading">
                        {mode === "signin" ? "Sign In" : mode === "signup" ? "Sign up" : socialSignTitle}
                    </div>
                    <button className="auth-topbar-button auth-topbar-close" onClick={onClose} aria-label="닫기" type="button">
                        ×
                    </button>
                </div>

                {mode === "signin" && renderSignin()}
                {mode === "signup" && renderSignup()}
                {mode === "social-signup" && renderSocialSignup()}

                <div
                    className={`auth-global-message ${globalMessage ? "is-visible" : ""} ${
                        globalMessageTone === "success"
                            ? "auth-global-message--success"
                            : globalMessageTone === "info"
                              ? "auth-global-message--info"
                              : ""
                    }`}
                >
                    {globalMessage}
                </div>
            </div>
        </div>
    );
}
