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

function MoreMenuIcon() {
    return (
        <svg viewBox="0 0 32 32" aria-hidden="true" className="header-menu-svg">
            <path d="M26,16c0,1.104-0.896,2-2,2H8c-1.104,0-2-0.896-2-2s0.896-2,2-2h16C25.104,14,26,14.896,26,16z" fill="currentColor" />
            <path d="M26,8c0,1.104-0.896,2-2,2H8c-1.104,0-2-0.896-2-2s0.896-2,2-2h16C25.104,6,26,6.896,26,8z" fill="currentColor" />
            <path d="M26,24c0,1.104-0.896,2-2,2H8c-1.104,0-2-0.896-2-2s0.896-2,2-2h16C25.104,22,26,22.896,26,24z" fill="currentColor" />
        </svg>
    );
}

const navItems = [
    { to: "/", label: "Home" },
    { to: "/about-notion?section=1", label: "About" },
    { to: "/features", label: "Features" },
    { to: "/projects", label: "Projects" },
    { to: "/contact", label: "Contact" },
];

export function Header() {
    const { isAuthenticated, logout, user, loading } = useAuth();
    const [scrolled, setScrolled] = useState(false);
    const [loginOpen, setLoginOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();
    const isAboutNotionPage = location.pathname === "/about-notion";

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 8);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        setLoginOpen(false);
        setMobileMenuOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        if (!mobileMenuOpen) return;

        const originalOverflow = document.body.style.overflow;
        const originalPosition = document.body.style.position;
        const originalTop = document.body.style.top;
        const originalWidth = document.body.style.width;
        const scrollY = window.scrollY;

        document.body.style.overflow = "hidden";
        document.body.style.position = "fixed";
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = "100%";

        return () => {
            document.body.style.overflow = originalOverflow;
            document.body.style.position = originalPosition;
            document.body.style.top = originalTop;
            document.body.style.width = originalWidth;
            window.scrollTo(0, scrollY);
        };
    }, [mobileMenuOpen]);

    const handleLogout = async () => {
        await logout();
        setMobileMenuOpen(false);
    };

    return (
        <>
            <header className={`site-header ${isAboutNotionPage || scrolled ? "scrolled" : ""}`}>
                <div className="shell header-inner">
                    <button
                        className={`header-menu-button${mobileMenuOpen ? " active" : ""}`}
                        type="button"
                        aria-label={mobileMenuOpen ? "모바일 메뉴 닫기" : "모바일 메뉴 열기"}
                        aria-expanded={mobileMenuOpen}
                        aria-controls="mobile-header-menu"
                        onClick={() => setMobileMenuOpen((current) => !current)}
                    >
                        <MoreMenuIcon />
                    </button>
                    <Link to="/" className="brand-link" onClick={() => setMobileMenuOpen(false)}>
                        <div className="brand-mark">FHK</div>
                        <div>
                            <div className="brand-title">Home-Lab MSA</div>
                            <div className="brand-subtitle">v{appVersion}</div>
                        </div>
                    </Link>

                    <nav className="header-nav">
                        {navItems.map((item) => (
                            <NavLink key={item.to} to={item.to} className={({ isActive }) => `header-nav-link${isActive ? " active" : ""}`}>
                                {item.label}
                            </NavLink>
                        ))}
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
                <div id="mobile-header-menu" className={`mobile-header-menu${mobileMenuOpen ? " open" : ""}`}>
                    <nav className="mobile-header-nav" aria-label="모바일 주요 메뉴">
                        {navItems.map((item) => (
                            <NavLink key={item.to} to={item.to} className={({ isActive }) => `mobile-header-link${isActive ? " active" : ""}`}>
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>
                    <div className="mobile-header-auth">
                        {loading ? (
                            <div className="mobile-header-status">인증 정보 확인 중...</div>
                        ) : isAuthenticated && user ? (
                            <>
                                <div className="mobile-header-user">
                                    <strong>{user.nickname} 님</strong>
                                    <span>반갑습니다.</span>
                                </div>
                                <div className="mobile-header-auth-actions">
                                    <Link className="secondary-button link-button" to="/myPage">
                                        내 정보
                                    </Link>
                                    <button className="secondary-button" onClick={handleLogout} type="button">
                                        로그아웃
                                    </button>
                                </div>
                            </>
                        ) : (
                            <button className="primary-button mobile-login-button" onClick={() => setLoginOpen(true)} type="button">
                                로그인
                            </button>
                        )}
                    </div>
                </div>
            </header>
            <button
                className={`mobile-header-backdrop${mobileMenuOpen ? " open" : ""}`}
                type="button"
                aria-label="모바일 메뉴 닫기"
                onClick={() => setMobileMenuOpen(false)}
                onTouchMove={(event) => event.preventDefault()}
                onWheel={(event) => event.preventDefault()}
            />
            <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
        </>
    );
}
