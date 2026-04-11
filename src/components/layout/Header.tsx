import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";

const linkStyle: CSSProperties = {
    textDecoration: "none",
    color: "#333",
};

const activeStyle: CSSProperties = {
    fontWeight: "bold",
};

const headerBaseStyle: CSSProperties = {
    borderBottom: "1.5px solid #e5e5e5",
    padding: "1rem 1.5rem",
    position: "sticky",
    top: 0,
    zIndex: 10,
    // 기본도 살짝 투명 + 약한 블러
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    backdropFilter: "blur(6px)",
    WebkitBackdropFilter: "blur(6px)",
    transition: "background-color 0.2s ease, backdrop-filter 0.2s ease, box-shadow 0.2s ease",
};

const headerScrolledStyle: CSSProperties = {
    // 스크롤 내려갔을 때 조금 더 또렷 + 블러 + 그림자
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.06)",
};

export function Header() {
    const { isAuthenticated, user, logout } = useAuth();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 0);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleLogout = async () => {
        await logout();
    };

    return (
        <header
            style={{
                ...headerBaseStyle,
                ...(scrolled ? headerScrolledStyle : {}),
            }}
        >
            <div
                style={{
                    maxWidth: "1080px",
                    margin: "0 auto",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <Link to="/" style={{...linkStyle, fontWeight: 700, fontSize: "1.1rem"}}>
                    FHK <div className="text-sm text-gray-500">v{import.meta.env.VITE_APP_VERSION}</div>
                </Link>
                <nav style={{display: "flex", gap: "1rem", alignItems: "center" }}>
                    <NavLink
                        to="/"
                        style={({ isActive }) => ({
                            ...linkStyle,
                            ...(isActive ? activeStyle : {}),
                        })}
                    >
                        Introduction
                    </NavLink>
                    <NavLink
                        to="/projects"
                        style={({ isActive }) => ({
                            ...linkStyle,
                            ...(isActive ? activeStyle : {}),
                        })}
                    >
                        Projects
                    </NavLink>
                    <NavLink
                        to="/architecture"
                        style={({ isActive }) => ({
                            ...linkStyle,
                            ...(isActive ? activeStyle : {}),
                        })}
                    >
                        Architecture
                    </NavLink>
                    <NavLink
                        to="/contact"
                        style={({ isActive }) => ({
                            ...linkStyle,
                            ...(isActive ? activeStyle : {}),
                        })}
                    >
                        Contact
                    </NavLink>

                    {isAuthenticated ? (
                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                            <span style={{ fontSize: "0.85rem", color: "#555" }}>
                                {user?.name}
                            </span>
                            <button
                                onClick={handleLogout}
                                style={{
                                    border: "1px solid #ccc",
                                    padding: "0.25rem 0.6rem",
                                    borderRadius: "4px",
                                    background: "#fff",
                                    cursor: "pointer",
                                    fontSize: "0.8rem",
                                }}
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <NavLink
                            to="/login"
                            style={({ isActive }) => ({
                                ...linkStyle,
                                ...(isActive ? activeStyle : {}),
                                border: "1px solid #ccc",
                                padding: "0.25rem 0.6rem",
                                borderRadius: "4px",
                                fontSize: "0.8rem",
                            })}
                        >
                            Login
                        </NavLink>
                    )}
                </nav>
            </div>
        </header>
    );
}
