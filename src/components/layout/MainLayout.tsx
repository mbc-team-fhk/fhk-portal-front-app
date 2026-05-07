import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { useAuth } from "../../context/AuthContext";

export default function MainLayout() {
    const { loading } = useAuth();
    const { pathname } = useLocation();
    const hideFooter = pathname === "/about-notion";

    if (loading) {
        return (
            <div className="app-bootstrap" aria-live="polite" aria-busy="true">
                <div className="app-bootstrap-panel">
                    <div className="app-bootstrap-spinner" aria-hidden="true" />
                    <p className="app-bootstrap-text">인증 정보 확인 중...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="app-shell app-shell-ready">
            <Header />
            <main className="page-main">
                <Outlet />
            </main>
            {!hideFooter && <Footer />}
        </div>
    );
}
