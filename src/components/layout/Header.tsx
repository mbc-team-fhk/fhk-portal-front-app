import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import LoginModal from "../common/LoginModal";

const appVersion = import.meta.env.VITE_APP_VERSION ?? "0.0.0";

function UserIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="header-icon-svg">
            <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-3.31 0-6 2.02-6 4.5 0 .28.22.5.5.5h11a.5.5 0 0 0 .5-.5C18 16.02 15.31 14 12 14Z" fill="currentColor" />
        </svg>
    );
}

function LogoutIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="header-icon-svg">
            <path d="M10 4.75A.75.75 0 0 1 10.75 4h6.5A1.75 1.75 0 0 1 19 5.75v12.5A1.75 1.75 0 0 1 17.25 20h-6.5a.75.75 0 0 1 0-1.5h6.5a.25.25 0 0 0 .25-.25V5.75a.25.25 0 0 0-.25-.25h-6.5A.75.75 0 0 1 10 4.75Zm1.78 11.28a.75.75 0 0 1-1.06-1.06l1.22-1.22H5.75a.75.75 0 0 1 0-1.5h6.19l-1.22-1.22a.75.75 0 0 1 1.06-1.06l2.5 2.5a.75.75 0 0 1 0 1.06Z" fill="currentColor" />
        </svg>
    );
}

export function Header() {
    const { isAuthenticated, logout, user, loading } = useAuth();
    const [scrolled, setScrolled] = useState(false);
    const [loginOpen, setLoginOpen] = useState(false);
    const location = useLocation();
    const isAboutNotionPage = location.pathname === "/about-notion";

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 8);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        setLoginOpen(false);
    }, [location.pathname]);

    const handleLogout = async () => {
        await logout();
    };

    return (
        <>
            <header className={`site-header ${isAboutNotionPage || scrolled ? "scrolled" : ""}`}>
                <div className="shell header-inner">
                    <Link to="/" className="brand-link">
                        <div className="brand-mark">FHK</div>
                        <div>
                            <div className="brand-title">Home-Lab MSA</div>
                            <div className="brand-subtitle">v{appVersion}</div>
                        </div>
                    </Link>

                    <nav className="header-nav">
                        <NavLink to="/" className={({ isActive }) => `header-nav-link${isActive ? " active" : ""}`}>
                            Home
                        </NavLink>
                        <NavLink to="/about-notion?section=1" className={({ isActive }) => `header-nav-link${isActive ? " active" : ""}`}>
                            About
                        </NavLink>
                        <NavLink to="/features" className={({ isActive }) => `header-nav-link${isActive ? " active" : ""}`}>
                            Features
                        </NavLink>
                        <NavLink to="/projects" className={({ isActive }) => `header-nav-link${isActive ? " active" : ""}`}>
                            Projects
                        </NavLink>
                        <NavLink to="/contact" className={({ isActive }) => `header-nav-link${isActive ? " active" : ""}`}>
                            Contact
                        </NavLink>
                    </nav>

                    <div className="header-actions">
                        {loading ? (
                            <div className="header-auth-placeholder" aria-hidden="true" />
                        ) : isAuthenticated && user ? (
                            <div className="header-auth-panel">
                                <div className="header-auth-copy">
                                    <div className="header-auth-nickname">{user.nickname} 님</div>
                                    <div className="header-auth-greeting">반갑습니다.</div>
                                </div>
                                <div className="header-auth-buttons">
                                    <Link className="header-icon-button" to="/myPage" aria-label="내 정보">
                                        <UserIcon />
                                    </Link>
                                    <button className="header-icon-button" onClick={handleLogout} aria-label="로그아웃" type="button">
                                        <LogoutIcon />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button className="header-solid-button" onClick={() => setLoginOpen(true)} type="button">
                                로그인
                            </button>
                        )}
                    </div>
                </div>
            </header>
            <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
        </>
    );
}
