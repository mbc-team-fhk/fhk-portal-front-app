import { useEffect, useState } from "react";

export default function ScrollTopButton() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setVisible(window.scrollY > 420);
        };

        handleScroll();
        window.addEventListener("scroll", handleScroll, { passive: true });

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleClick = () => {
        window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    };

    return (
        <button
            type="button"
            className={`scroll-top-button${visible ? " visible" : ""}`}
            onClick={handleClick}
            aria-label="맨 위로 이동"
        >
            <span className="scroll-top-icon" aria-hidden="true" />
            <span className="scroll-top-text">TOP</span>
        </button>
    );
}
