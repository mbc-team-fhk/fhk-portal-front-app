import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext.tsx";
import { securityGet } from "../../utils/securityApi.ts";

type MyPageTab = "profile" | "edit" | "manage";

type AccountProfile = {
    accountId: number;
    loginId: string;
    nickname: string;
    role: string;
};

type AccountResponse = {
    id?: number;
    accountId?: number;
    loginId?: string;
    nickname?: string;
    role?: string;
};

const myPageTabs: Array<{ key: MyPageTab; label: string }> = [
    { key: "profile", label: "계정 정보" },
    { key: "edit", label: "정보 수정" },
    { key: "manage", label: "계정 관리" },
];

const restrictedTabMessages: Record<Exclude<MyPageTab, "profile">, { kicker: string; title: string; description: string }> = {
    edit: {
        kicker: "보안 정책 적용",
        title: "정보 수정 기능은 현재 화면에서 제공하지 않습니다.",
        description: "닉네임과 비밀번호 변경은 추가 본인 확인이 필요한 작업입니다. 관리자 또는 별도 인증 절차를 통해 요청해 주세요.",
    },
    manage: {
        kicker: "보호 기능 잠금",
        title: "계정 관리 기능은 제한되어 있습니다.",
        description: "탈퇴와 민감한 계정 처리는 서비스 운영 정책상 일반 화면에서 실행할 수 없습니다. 필요한 경우 운영자 확인 후 처리됩니다.",
    },
};

function normalizeAccount(account: AccountResponse | null | undefined, fallback: AccountProfile): AccountProfile {
    return {
        accountId: account?.accountId ?? account?.id ?? fallback.accountId,
        loginId: account?.loginId ?? fallback.loginId,
        nickname: account?.nickname ?? fallback.nickname,
        role: account?.role ?? fallback.role,
    };
}

function getErrorMessage(error: unknown, fallback: string) {
    return error instanceof Error ? error.message : fallback;
}

function getRoleLabel(role: string) {
    const normalizedRole = role.replace(/^ROLE_/, "").trim();

    if (!normalizedRole) {
        return "Member";
    }

    return normalizedRole
        .toLowerCase()
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

function MyPageStateCard({ title, message }: { title: string; message: string }) {
    return (
        <div className="shell section-page narrow-page my-page-shell">
            <article className="my-page-card my-page-state-card">
                <div className="my-page-eyebrow">My Page</div>
                <h1>{title}</h1>
                <p>{message}</p>
            </article>
        </div>
    );
}

function RestrictedTabPanel({ tab }: { tab: Exclude<MyPageTab, "profile"> }) {
    const message = restrictedTabMessages[tab];

    return (
        <div className="my-page-lock-panel">
            <span>{message.kicker}</span>
            <strong>{message.title}</strong>
            <p>{message.description}</p>
        </div>
    );
}

export default function MyPage() {
    const { user, isAuthenticated, loading, logout } = useAuth();
    const [activeTab, setActiveTab] = useState<MyPageTab>("profile");
    const [account, setAccount] = useState<AccountProfile | null>(null);
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileError, setProfileError] = useState("");

    const authAccount = useMemo<AccountProfile | null>(() => {
        if (!user) {
            return null;
        }

        return {
            accountId: user.accountId,
            loginId: user.loginId,
            nickname: user.nickname,
            role: user.role,
        };
    }, [user]);

    const displayAccount = account ?? authAccount;
    const profileInitial = displayAccount?.nickname.trim().charAt(0) || "회";

    useEffect(() => {
        if (!isAuthenticated || !authAccount) {
            setAccount(null);
            setProfileError("");
            return;
        }

        let ignore = false;

        const loadAccount = async () => {
            setProfileLoading(true);
            setProfileError("");

            try {
                const response = await securityGet<AccountResponse>(`/accounts?loginId=${encodeURIComponent(authAccount.loginId)}`);
                if (ignore) {
                    return;
                }

                setAccount(normalizeAccount(response.result, authAccount));
            } catch (error) {
                if (ignore) {
                    return;
                }

                setAccount(authAccount);
                setProfileError(getErrorMessage(error, "계정 상세 정보를 불러오지 못했습니다."));
            } finally {
                if (!ignore) {
                    setProfileLoading(false);
                }
            }
        };

        loadAccount();

        return () => {
            ignore = true;
        };
    }, [authAccount, isAuthenticated]);

    if (loading) {
        return <MyPageStateCard title="내 정보" message="불러오는 중..." />;
    }

    if (!isAuthenticated || !displayAccount) {
        return <MyPageStateCard title="내 정보" message="로그인 상태가 아닙니다." />;
    }

    const infoRows = [
        { label: "계정 번호", value: displayAccount.accountId },
        { label: "로그인 ID", value: displayAccount.loginId },
        { label: "닉네임", value: displayAccount.nickname },
        { label: "권한", value: displayAccount.role },
    ];

    return (
        <div className="shell section-page narrow-page my-page-shell">
            <article className="my-page-card">
                <header className="my-page-profile">
                    <div className="my-page-avatar" aria-hidden="true">
                        {profileInitial}
                    </div>
                    <div className="my-page-profile-copy">
                        <div className="my-page-eyebrow">My Page</div>
                        <h1>{displayAccount.nickname}</h1>
                        <p>{getRoleLabel(displayAccount.role)}</p>
                    </div>
                </header>

                {profileError && <p className="my-page-message my-page-message-info">{profileError}</p>}

                <section className="my-page-card-body" aria-label="마이페이지 상세 정보">
                    <div className="my-page-tab-list" role="tablist" aria-label="마이페이지 탭">
                        {myPageTabs.map((tab) => (
                            <button
                                key={tab.key}
                                id={`my-page-${tab.key}-tab`}
                                type="button"
                                role="tab"
                                aria-selected={activeTab === tab.key}
                                aria-controls={`my-page-${tab.key}-panel`}
                                className={`my-page-tab-button${activeTab === tab.key ? " active" : ""}`}
                                onClick={() => setActiveTab(tab.key)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div
                        key={activeTab}
                        id={`my-page-${activeTab}-panel`}
                        role="tabpanel"
                        aria-labelledby={`my-page-${activeTab}-tab`}
                        className="my-page-tab-panel"
                    >
                        {activeTab === "profile" && (
                            <div className="my-page-profile-panel">
                                <div className="my-page-info-grid">
                                    {infoRows.map((row) => (
                                        <div className="my-page-info-row" key={row.label}>
                                            <span>{row.label}</span>
                                            <strong>{row.value}</strong>
                                        </div>
                                    ))}
                                </div>
                                <div className="my-page-status-strip">
                                    <span>세션 연결됨</span>
                                    <strong>{profileLoading ? "동기화 중" : "최신 정보"}</strong>
                                </div>
                            </div>
                        )}

                        {activeTab === "edit" && <RestrictedTabPanel tab="edit" />}
                        {activeTab === "manage" && <RestrictedTabPanel tab="manage" />}
                    </div>
                </section>

                <div className="my-page-actions">
                    <button type="button" className="my-page-contact-button" onClick={logout}>
                        로그아웃
                    </button>
                </div>
            </article>
        </div>
    );
}
