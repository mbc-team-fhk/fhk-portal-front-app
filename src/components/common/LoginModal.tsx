import { useEffect, useRef, useState, type FormEvent } from "react";
import { useAuth } from "../../context/AuthContext";
import { securityGet, securityPost } from "../../utils/securityApi";
import {
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
type MessageTone = "error" | "success" | "info";

type AvailabilityResponse = {
    available: boolean;
};

const TESTER_TOOLTIP_TEXT = "포트폴리오 시연용 테스터 계정 중 하나로 바로 로그인합니다.";
const TESTER_LOGIN_IDS = Array.from({ length: 10 }, (_, index) => `tester${String(index + 1).padStart(2, "0")}`);
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

function fieldMessageClass(state: AvailabilityState) {
    if (state === "duplicate" || state === "invalid") {
        return "is-error";
    }

    if (state === "available") {
        return "is-success";
    }

    return "";
}

function inlineMessageClass(hasMessage: boolean, tone: MessageTone) {
    if (!hasMessage) {
        return "";
    }

    if (tone === "success") {
        return "is-success";
    }

    if (tone === "info") {
        return "is-info";
    }

    return "is-error";
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
    const { login } = useAuth();
    const [mode, setMode] = useState<ModalMode>("signin");
    const [submitting, setSubmitting] = useState(false);
    const [signinMessage, setSigninMessage] = useState("");
    const [signinMessageTone, setSigninMessageTone] = useState<MessageTone>("error");
    const [globalMessage, setGlobalMessage] = useState("");
    const [globalMessageTone, setGlobalMessageTone] = useState<MessageTone>("error");

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

        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            handledRedirectRef.current = false;
            return;
        }

        setMode("signin");
        setSubmitting(false);
        setSigninMessage("");
        setSigninMessageTone("error");
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
        setSocialNickname("");
        setSocialNicknameState("idle");
        handledRedirectRef.current = false;
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen || handledRedirectRef.current) return;

        const payload = consumePendingSocialRedirect();
        if (!payload) {
            return;
        }

        handledRedirectRef.current = true;
        setSubmitting(true);
        setSigninMessage("");
        setSigninMessageTone("error");
        setGlobalMessage("소셜 로그인 결과를 확인하는 중입니다...");
        setGlobalMessageTone("info");

        resolvePendingSocialRedirect(payload)
            .then((identity) => {
                setSocialProvider(identity.provider);
                setSocialAccount(identity.suggestedLoginId);
                setSocialNickname(sanitizeNicknameSeed(identity.displayName));
                setSocialNicknameState("idle");
                setMode("social-signup");
                setGlobalMessage(`${identity.displayName} 계정 인증이 완료되었습니다. 닉네임을 입력해 가입을 마무리하세요.`);
                setGlobalMessageTone("info");
            })
            .catch((error) => {
                setMode("signin");
                setGlobalMessage("");
                setGlobalMessageTone("error");
                setSigninMessage(readErrorMessage(error, "소셜 로그인 처리에 실패했습니다."));
                setSigninMessageTone("error");
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
    const globalMessageClass =
        globalMessageTone === "success"
            ? "auth-global-message auth-global-message--success"
            : globalMessageTone === "info"
              ? "auth-global-message auth-global-message--info"
              : "auth-global-message";

    const checkLoginIdAvailability = async () => {
        const currentValue = signupId.trim();
        const requestId = signupIdRequestRef.current + 1;
        signupIdRequestRef.current = requestId;

        if (!currentValue) {
            setSignupIdState("idle");
            return;
        }

        if (!isValidLoginId(currentValue)) {
            setSignupIdState("invalid");
            return;
        }

        setSignupIdState("checking");

        try {
            const response = await securityGet<AvailabilityResponse>(
                `/accounts/availability?loginId=${encodeURIComponent(currentValue)}`
            );

            if (signupIdRequestRef.current !== requestId || signupId.trim() !== currentValue) {
                return;
            }

            setSignupIdState(response.result?.available ? "available" : "duplicate");
        } catch {
            if (signupIdRequestRef.current !== requestId || signupId.trim() !== currentValue) {
                return;
            }

            setSignupIdState("invalid");
        }
    };

    const checkSignupNicknameAvailability = async () => {
        const currentValue = signupNickname.trim();
        const requestId = signupNicknameRequestRef.current + 1;
        signupNicknameRequestRef.current = requestId;

        if (!currentValue) {
            setSignupNicknameState("idle");
            return;
        }

        if (!isValidNickname(currentValue)) {
            setSignupNicknameState("invalid");
            return;
        }

        setSignupNicknameState("checking");

        try {
            const response = await securityGet<AvailabilityResponse>(
                `/accounts/availability?nickname=${encodeURIComponent(currentValue)}`
            );

            if (signupNicknameRequestRef.current !== requestId || signupNickname.trim() !== currentValue) {
                return;
            }

            setSignupNicknameState(response.result?.available ? "available" : "duplicate");
        } catch {
            if (signupNicknameRequestRef.current !== requestId || signupNickname.trim() !== currentValue) {
                return;
            }

            setSignupNicknameState("invalid");
        }
    };

    const checkSocialNicknameAvailability = async () => {
        const currentValue = socialNickname.trim();
        const requestId = socialNicknameRequestRef.current + 1;
        socialNicknameRequestRef.current = requestId;

        if (!currentValue) {
            setSocialNicknameState("idle");
            return;
        }

        if (!isValidNickname(currentValue)) {
            setSocialNicknameState("invalid");
            return;
        }

        setSocialNicknameState("checking");

        try {
            const response = await securityGet<AvailabilityResponse>(
                `/accounts/availability?nickname=${encodeURIComponent(currentValue)}`
            );

            if (socialNicknameRequestRef.current !== requestId || socialNickname.trim() !== currentValue) {
                return;
            }

            setSocialNicknameState(response.result?.available ? "available" : "duplicate");
        } catch {
            if (socialNicknameRequestRef.current !== requestId || socialNickname.trim() !== currentValue) {
                return;
            }

            setSocialNicknameState("invalid");
        }
    };

    const handleSignin = async (event: FormEvent) => {
        event.preventDefault();
        if (!signInEnabled) return;

        setSubmitting(true);
        setSigninMessage("");
        setSigninMessageTone("error");
        setGlobalMessage("");
        setGlobalMessageTone("error");

        try {
            await login(signinId, signinPassword);
            onClose();
        } catch (error) {
            setSigninMessage(readErrorMessage(error, "로그인에 실패했습니다."));
            setSigninMessageTone("error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleTesterLogin = async () => {
        const testerLoginId = TESTER_LOGIN_IDS[Math.floor(Math.random() * TESTER_LOGIN_IDS.length)];

        setSubmitting(true);
        setSigninMessage("");
        setSigninMessageTone("error");
        setGlobalMessage("");
        setGlobalMessageTone("error");

        try {
            await login(testerLoginId, TESTER_LOGIN_PASSWORD);
            onClose();
        } catch (error) {
            setSigninMessage(readErrorMessage(error, "테스터 로그인에 실패했습니다."));
            setSigninMessageTone("error");
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
            setSigninMessage("회원가입이 완료되었습니다. 로그인해 주세요.");
            setSigninMessageTone("success");
            setGlobalMessage("");
            setGlobalMessageTone("error");
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
            setSigninMessage("간편 회원가입이 완료되었습니다. 로그인해 주세요.");
            setSigninMessageTone("success");
            setGlobalMessage("");
            setGlobalMessageTone("error");
        } catch (error) {
            setGlobalMessage(readErrorMessage(error, "간편 회원가입에 실패했습니다."));
            setGlobalMessageTone("error");
        } finally {
            setSubmitting(false);
        }
    };

    const moveToSignin = () => {
        setMode("signin");
        setGlobalMessage("");
        setGlobalMessageTone("error");
    };

    const renderSignin = () => (
        <form className="auth-form auth-form--signin" onSubmit={handleSignin}>
            <div className="auth-field-group auth-field-group--tight">
                <input
                    className="auth-input auth-wide-control"
                    placeholder="ID"
                    value={signinId}
                    onChange={(event) => {
                        setSigninId(event.target.value);
                        setSigninMessage("");
                        setSigninMessageTone("error");
                    }}
                />
            </div>

            <div className="auth-field-group auth-field-group--tight">
                <input
                    className="auth-input auth-wide-control"
                    type="password"
                    placeholder="Password"
                    value={signinPassword}
                    onChange={(event) => {
                        setSigninPassword(event.target.value);
                        setSigninMessage("");
                        setSigninMessageTone("error");
                    }}
                />
            </div>

            <div className={`auth-inline-message-slot ${inlineMessageClass(Boolean(signinMessage), signinMessageTone)}`}>
                {signinMessage}
            </div>

            <button className="auth-submit-button auth-wide-control" type="submit" disabled={!signInEnabled}>
                {submitting ? "Signing in..." : "Sign In"}
            </button>

            <div className="tester-login-row">
                <button
                    className="tester-login-button auth-wide-control"
                    type="button"
                    onClick={handleTesterLogin}
                    disabled={submitting}
                >
                    테스터 계정으로 로그인
                </button>
                <div className="tester-help-wrap">
                    <button type="button" className="tester-help-button" aria-label="테스터 로그인 설명">
                        ?
                    </button>
                    <div className="tester-help-tooltip">{TESTER_TOOLTIP_TEXT}</div>
                </div>
            </div>

            <div className="auth-divider"><span>OR</span></div>

            {/*<div className="social-login-row">
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
            </div>*/}

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
                <div className={`auth-field-message ${fieldMessageClass(signupIdState)}`}>
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
                <div className={`auth-field-message ${passwordMismatch ? "is-error" : ""}`}>{signupPasswordMessage}</div>
            </div>

            <div className="auth-field-group">
                <div
                    className={`auth-input-shell ${signupNicknameState === "duplicate" || signupNicknameState === "invalid" ? "is-error" : ""}`}
                >
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
                <div className={`auth-field-message ${fieldMessageClass(signupNicknameState)}`}>
                    {statusMessage("닉네임", signupNicknameState)}
                </div>
            </div>

            <button className="auth-submit-button auth-wide-control" type="submit" disabled={!signupEnabled}>
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
                <div
                    className={`auth-input-shell ${socialNicknameState === "duplicate" || socialNicknameState === "invalid" ? "is-error" : ""}`}
                >
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
                <div className={`auth-field-message ${fieldMessageClass(socialNicknameState)}`}>
                    {statusMessage("닉네임", socialNicknameState)}
                </div>
            </div>

            <button className="auth-submit-button auth-wide-control" type="submit" disabled={!socialSignupEnabled}>
                {submitting ? "Signing up..." : "Sign up"}
            </button>
        </form>
    );

    return (
        <div className="login-modal-overlay">
            <div className="login-modal auth-modal">
                {mode === "signin" ? (
                    <div className="auth-modal-topbar auth-modal-topbar--signin">
                        <div />
                        <div />
                        <button className="auth-topbar-button auth-topbar-close" onClick={onClose} aria-label="닫기" type="button">
                            ×
                        </button>
                    </div>
                ) : (
                    <div className="auth-modal-topbar">
                        <button type="button" className="auth-topbar-button" onClick={moveToSignin}>
                            ‹
                        </button>
                        <div className="auth-modal-heading">{mode === "signup" ? "Sign up" : socialSignTitle}</div>
                        <button className="auth-topbar-button auth-topbar-close" onClick={onClose} aria-label="닫기" type="button">
                            ×
                        </button>
                    </div>
                )}

                <div className="auth-modal-content">
                    {mode === "signin" && renderSignin()}
                    {mode === "signup" && renderSignup()}
                    {mode === "social-signup" && renderSocialSignup()}

                    {mode !== "signin" && <div className={`${globalMessageClass} ${globalMessage ? "is-visible" : ""}`}>{globalMessage}</div>}
                </div>
            </div>
        </div>
    );
}
