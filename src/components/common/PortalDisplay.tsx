import { useEffect, useState, type ReactNode } from "react";
import type { TechStackMeta } from "../../data/techStackMap.ts";
import { getTechStackMeta } from "../../data/techStackMap.ts";

type ExternalTextLinkProps = {
    href: string;
    children: ReactNode;
    className?: string;
};

type TechStackBadgesProps = {
    items: string[];
    className?: string;
};

export type MediaTabItem = {
    label: string;
    src: string;
    caption: string;
    alt?: string;
};

type MediaTabsProps = {
    tabs: MediaTabItem[];
    ariaLabel: string;
    fallback?: ReactNode;
    className?: string;
};

export function ExternalTextLink({ href, children, className = "" }: ExternalTextLinkProps) {
    return (
        <span className={`external-text-link ${className}`.trim()}>
            <span className="external-text-link-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false">
                    <path d="M10.975 14.51a1.05 1.05 0 0 0 0-1.485 2.95 2.95 0 0 1 0-4.172l3.536-3.535a2.95 2.95 0 1 1 4.172 4.172l-1.093 1.092a1.05 1.05 0 0 0 1.485 1.485l1.093-1.092a5.05 5.05 0 0 0-7.142-7.142L9.49 7.368a5.05 5.05 0 0 0 0 7.142c.41.41 1.075.41 1.485 0zm2.05-5.02a1.05 1.05 0 0 0 0 1.485 2.95 2.95 0 0 1 0 4.172l-3.5 3.5a2.95 2.95 0 1 1-4.171-4.172l1.025-1.025a1.05 1.05 0 0 0-1.485-1.485L3.87 12.99a5.05 5.05 0 0 0 7.142 7.142l3.5-3.5a5.05 5.05 0 0 0 0-7.142 1.05 1.05 0 0 0-1.485 0z" />
                </svg>
            </span>
            <a href={href} target="_blank" rel="noreferrer" className="external-text-link-anchor">
                {children}
            </a>
        </span>
    );
}

export function MediaTabs({ tabs, ariaLabel, fallback = null, className = "" }: MediaTabsProps) {
    const [activeTabIndex, setActiveTabIndex] = useState(0);
    const activeTab = tabs[activeTabIndex];

    useEffect(() => {
        setActiveTabIndex(0);
    }, [tabs]);

    if (!activeTab) {
        return <>{fallback}</>;
    }

    return (
        <div className={`feature-media-tabs ${className}`.trim()}>
            <div className="feature-media-tab-list" role="tablist" aria-label={ariaLabel}>
                {tabs.map((tab, index) => (
                    <button
                        key={`${tab.label}-${tab.src}`}
                        type="button"
                        role="tab"
                        className={`feature-media-tab ${index === activeTabIndex ? "active" : ""}`}
                        aria-selected={index === activeTabIndex}
                        onClick={() => setActiveTabIndex(index)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            <figure key={`${activeTab.label}-${activeTab.src}`} className="feature-media-frame">
                <div className="feature-media-asset-box">
                    <img className="feature-media-asset" src={activeTab.src} alt={activeTab.alt ?? activeTab.caption} />
                </div>
                <figcaption>{activeTab.caption}</figcaption>
            </figure>
        </div>
    );
}

function TechIcon({ meta }: { meta: TechStackMeta }) {
    if (!meta.iconSrc) {
        return <span className="tech-stack-badge-fallback">{meta.shortLabel}</span>;
    }

    return (
        <img
            className={`tech-stack-logo ${meta.iconClassName ?? ""}`.trim()}
            src={meta.iconSrc}
            alt=""
            aria-hidden="true"
            loading="lazy"
        />
    );
}

export function TechStackBadges({ items, className = "" }: TechStackBadgesProps) {
    return (
        <div className={`tech-stack-badges ${className}`.trim()} aria-label="Tech stack">
            {items.map((item) => {
                const meta = getTechStackMeta(item);

                return (
                    <span
                        key={item}
                        className={`tech-stack-badge tech-stack-badge-${meta.tone} ${meta.iconSrc ? "tech-stack-badge-logo" : ""}`}
                        tabIndex={0}
                        aria-label={meta.label}
                    >
                        <span className="tech-stack-badge-icon" aria-hidden="true">
                            <TechIcon meta={meta} />
                        </span>
                        <span className="tech-stack-tooltip" role="tooltip">{meta.label}</span>
                    </span>
                );
            })}
        </div>
    );
}
