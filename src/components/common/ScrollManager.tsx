import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const HEADER_OFFSET = 96;

export default function ScrollManager() {
    const { pathname, hash, search, key } = useLocation();

    useEffect(() => {
        if (typeof window === "undefined") return;
        window.history.scrollRestoration = "manual";
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const scrollToTop = () => {
            const reset = () => {
                window.scrollTo({ top: 0, left: 0, behavior: "auto" });
                document.scrollingElement?.scrollTo({ top: 0, left: 0, behavior: "auto" });
                document.documentElement.scrollTop = 0;
                document.body.scrollTop = 0;
            };

            reset();
            window.requestAnimationFrame(reset);
            window.setTimeout(reset, 0);
            window.setTimeout(reset, 80);
        };

        if (!hash) {
            scrollToTop();
            return;
        }

        const id = hash.replace("#", "");
        const el = document.getElementById(id);
        if (!el) {
            scrollToTop();
            return;
        }

        const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
        window.scrollTo({ top, left: 0, behavior: "smooth" });
    }, [pathname, hash, search, key]);

    return null;
}
