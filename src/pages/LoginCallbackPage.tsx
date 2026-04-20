import { useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import type { PendingSocialRedirect, SocialProvider } from "../types/socialAuth";

const SOCIAL_REDIRECT_STORAGE_KEY = "fhk.portal.pending-social-redirect";

export default function LoginCallbackPage() {
    const navigate = useNavigate();
    const { provider } = useParams<{ provider: SocialProvider }>();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        if (!provider || (provider !== "kakao" && provider !== "google")) {
            navigate("/login", { replace: true });
            return;
        }

        const payload: PendingSocialRedirect = {
            provider,
            code: searchParams.get("code") ?? undefined,
            accessToken: searchParams.get("access_token") ?? undefined,
            error: searchParams.get("error") ?? undefined,
            state: searchParams.get("state") ?? undefined,
        };

        sessionStorage.setItem(SOCIAL_REDIRECT_STORAGE_KEY, JSON.stringify(payload));
        navigate("/login", { replace: true });
    }, [navigate, provider, searchParams]);

    return (
        <div className="shell section-page narrow-page">
            <div className="content-block">
                <div className="eyebrow">OAuth Redirect</div>
                <h1>로그인 처리 중...</h1>
                <p>외부 인증 응답을 정리한 뒤 로그인 화면으로 이동합니다.</p>
            </div>
        </div>
    );
}
