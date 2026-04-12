import LoginModal from "../components/common/LoginModal";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
    const navigate = useNavigate();

    return (
        <div className="shell section-page narrow-page">
            <div className="content-block">
                <div className="eyebrow">Login</div>
                <h1>로그인</h1>
                <p>현재 포트폴리오에서는 레이어 팝업이 기본입니다. 이 페이지는 직접 접근용 백업 진입점입니다.</p>
            </div>
            <LoginModal isOpen={true} onClose={() => navigate(-1)} />
        </div>
    );
}
