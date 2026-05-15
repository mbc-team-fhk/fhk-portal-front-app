import { useEffect } from "react";

const dragAllowedSelector = "iframe, input, textarea, select, [contenteditable='true'], [data-drag-allowed='true']";

export default function DragGuard() {
    useEffect(() => {
        if (typeof document === "undefined") return;

        const handleDragStart = (event: DragEvent) => {
            const target = event.target instanceof Element ? event.target : null;

            if (target?.closest(dragAllowedSelector)) {
                return;
            }

            event.preventDefault();
        };

        document.addEventListener("dragstart", handleDragStart);

        return () => document.removeEventListener("dragstart", handleDragStart);
    }, []);

    return null;
}
