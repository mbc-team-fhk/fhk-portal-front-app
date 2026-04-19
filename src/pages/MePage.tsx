import { useAuth } from "../context/AuthContext";

export default function MePage() {
    const { user, isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="shell section-page narrow-page">
                <div className="content-block">
                    <h1>내 정보</h1>
                    <p>불러오는 중...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return (
            <div className="shell section-page narrow-page">
                <div className="content-block">
                    <h1>내 정보</h1>
                    <p>로그인 상태가 아닙니다.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="shell section-page narrow-page">
            <div className="content-block">
                <div className="eyebrow">My Page</div>
                <h1>{user.nickname}</h1>
                <p>계정 ID: {user.accountId}</p>
                <p>로그인 ID: {user.loginId}</p>
                <p>권한: {user.role}</p>
            </div>
        </div>
    );
}
