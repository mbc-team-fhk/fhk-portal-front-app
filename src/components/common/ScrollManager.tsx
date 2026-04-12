import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const HEADER_OFFSET = 96;

export default function ScrollManager() {
    const { pathname, hash } = useLocation();

    useEffect(() => {
        if (typeof window === "undefined") return;
        window.history.scrollRestoration = "manual";
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return;

        if (!hash) {
            window.scrollTo({ top: 0, left: 0, behavior: "auto" });
            return;
        }

        const id = hash.replace("#", "");
        const el = document.getElementById(id);
        if (!el) {
            window.scrollTo({ top: 0, left: 0, behavior: "auto" });
            return;
        }

        const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
        window.scrollTo({ top, left: 0, behavior: "smooth" });
    }, [pathname, hash]);

    return null;
}
