import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import LoginModal from "../common/LoginModal";

const appVersion = import.meta.env.VITE_APP_VERSION ?? "0.0.0";

export function Header() {
    const { isAuthenticated, logout } = useAuth();
    const [scrolled, setScrolled] = useState(false);
    const [loginOpen, setLoginOpen] = useState(false);
    const location = useLocation();

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
            <header className={`site-header ${scrolled ? "scrolled" : ""}`}>
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
                        <NavLink to="/about" className={({ isActive }) => `header-nav-link${isActive ? " active" : ""}`}>
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
                        {isAuthenticated ? (
                            <>
                                <Link className="header-ghost-link" to="/me">
                                    내 정보
                                </Link>
                                <button className="header-solid-button" onClick={handleLogout}>
                                    로그아웃
                                </button>
                            </>
                        ) : (
                            <button className="header-solid-button" onClick={() => setLoginOpen(true)}>
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
