import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fallbackSectionGroups } from "../data/aboutNotionFallbackOutline";
import { fetchAboutOutlineGroups, type AboutDropdownItem, type AboutSectionGroup, type AboutSectionItem } from "../utils/aboutOutlineApi";

type ThemeMode = "system" | "light" | "dark";
type OutlineSource = "loading" | "google-sheet" | "fallback";
type ContentStatus = "idle" | "loading" | "loaded" | "delayed" | "missing";

type SectionEntry = AboutSectionItem & {
    no: number;
    groupTitle: string;
    dropdownText?: string;
};

const outlineCacheKey = "about-notion-outline-v1";
const themeModes: { id: ThemeMode; label: string }[] = [
    { id: "system", label: "System" },
    { id: "light", label: "Light" },
    { id: "dark", label: "Dark" },
];

const frameLoaderMinMs = 1000;
const frameLoaderPostLoadMs = 1300;
const frameLoaderFallbackMs = 4500;
const showThemeToggle = false;
const outlineSourceLabels: Record<OutlineSource, string> = {
    loading: "Loading",
    "google-sheet": "Google Sheets",
    fallback: "Local fallback",
};
const contentStatusLabels: Record<ContentStatus, string> = {
    idle: "Notion Embed",
    loading: "Notion Embed",
    loaded: "Notion Embed",
    delayed: "Notion Embed",
    missing: "Missing link",
};

function getSectionEntries(groups: AboutSectionGroup[]) {
    const entries: SectionEntry[] = [];

    groups.forEach(({ sectionGroup }) => {
        sectionGroup.sectionItems.forEach((item) => {
            if (item.type === "SECTION") {
                entries.push({
                    ...item,
                    no: entries.length + 1,
                    groupTitle: sectionGroup.title,
                });
                return;
            }

            item.subSectionItems.forEach((subItem) => {
                entries.push({
                    ...subItem,
                    no: entries.length + 1,
                    groupTitle: sectionGroup.title,
                    dropdownText: item.text,
                });
            });
        });
    });

    return entries;
}
function getDropdownOpenState(groups: AboutSectionGroup[]) {
    return Object.fromEntries(
        groups.flatMap(({ sectionGroup }) =>
            sectionGroup.sectionItems
                .filter((item): item is AboutDropdownItem => item.type === "DROPDOWN")
                .map((item) => [`${sectionGroup.title}-${item.text}`, false]),
        ),
    );
}

function readCachedSectionGroups() {
    if (typeof window === "undefined") return null;

    try {
        const cachedValue = window.sessionStorage.getItem(outlineCacheKey);
        return cachedValue ? (JSON.parse(cachedValue) as AboutSectionGroup[]) : null;
    } catch {
        return null;
    }
}

function cacheSectionGroups(groups: AboutSectionGroup[]) {
    if (typeof window === "undefined") return;

    try {
        window.sessionStorage.setItem(outlineCacheKey, JSON.stringify(groups));
    } catch {
        // sessionStorage can be unavailable in restricted browser contexts.
    }
}

function areSectionGroupsEqual(left: AboutSectionGroup[] | null, right: AboutSectionGroup[]) {
    return left !== null && JSON.stringify(left) === JSON.stringify(right);
}

function AboutOutlineSkeleton() {
    return (
        <div className="about-notion-outline-skeleton" aria-label="목차 불러오는 중">
            {Array.from({ length: 6 }).map((_, groupIndex) => (
                <div className="about-notion-skeleton-group" key={groupIndex}>
                    <div className="about-notion-skeleton-line title" />
                    <div className="about-notion-skeleton-line item wide" />
                    <div className="about-notion-skeleton-line item" />
                    <div className="about-notion-skeleton-line item short" />
                </div>
            ))}
        </div>
    );
}

export default function AboutNotionPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const cachedSectionGroups = useMemo(() => readCachedSectionGroups(), []);
    const [sectionGroups, setSectionGroups] = useState<AboutSectionGroup[] | null>(() => cachedSectionGroups);
    const [outlineSource, setOutlineSource] = useState<OutlineSource>(() => (cachedSectionGroups ? "google-sheet" : "loading"));
    const renderedSectionGroups = sectionGroups ?? [];
    const sectionEntries = useMemo(() => getSectionEntries(renderedSectionGroups), [renderedSectionGroups]);
    const requestedSectionParam = searchParams.get("section");
    const requestedSectionNo = Number(requestedSectionParam);
    const initialSectionNo = sectionEntries.some((section) => section.no === requestedSectionNo) ? requestedSectionNo : 1;
    const [selectedNo, setSelectedNo] = useState(initialSectionNo);
    const [themeMode, setThemeMode] = useState<ThemeMode>("system");
    const [systemTheme, setSystemTheme] = useState<"light" | "dark">("light");
    const [isFrameLoading, setIsFrameLoading] = useState(true);
    const [contentStatus, setContentStatus] = useState<ContentStatus>("idle");
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [hasFrameLoaded, setHasFrameLoaded] = useState(false);
    const frameLoadStartedAt = useRef(Date.now());
    const frameLoaderTimer = useRef<number | null>(null);
    const frameLoaderFallbackTimer = useRef<number | null>(null);
    const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>(() =>
        getDropdownOpenState(cachedSectionGroups ?? []),
    );
    const selectedSection = useMemo(
        () => sectionEntries.find((section) => section.no === selectedNo) ?? sectionEntries[0],
        [sectionEntries, selectedNo],
    );
    const selectedPath = [
        selectedSection?.groupTitle,
        selectedSection?.dropdownText,
        selectedSection?.text,
    ].filter(Boolean);
    const effectiveTheme = themeMode === "system" ? systemTheme : themeMode;
    const isOutlineLoading = sectionGroups === null;
    const hadInitialOutlineCache = useRef(sectionGroups !== null);
    const selectedNotionLink = selectedSection?.notionLink ?? "";
    const isContentReady = Boolean(selectedSection) && !isFrameLoading;

    useEffect(() => {
        let isCurrent = true;

        fetchAboutOutlineGroups()
            .then((nextSectionGroups) => {
                if (!isCurrent) return;

                cacheSectionGroups(nextSectionGroups);
                setSectionGroups((currentGroups) => {
                    if (areSectionGroupsEqual(currentGroups, nextSectionGroups)) {
                        setOutlineSource("google-sheet");
                        return currentGroups;
                    }

                    setOpenDropdowns(getDropdownOpenState(nextSectionGroups));
                    setOutlineSource("google-sheet");
                    return nextSectionGroups;
                });
            })
            .catch((error: unknown) => {
                console.warn("Failed to load about outline from Google Sheets.", error);
                if (!isCurrent) return;

                setSectionGroups((currentGroups) => currentGroups ?? fallbackSectionGroups);
                if (!hadInitialOutlineCache.current) {
                    setOpenDropdowns(getDropdownOpenState(fallbackSectionGroups));
                    setOutlineSource("fallback");
                }
            });

        return () => {
            isCurrent = false;
        };
    }, []);

    useEffect(() => {
        return () => {
            if (frameLoaderFallbackTimer.current !== null) {
                window.clearTimeout(frameLoaderFallbackTimer.current);
            }
        };
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const updateSystemTheme = () => {
            setSystemTheme(mediaQuery.matches ? "dark" : "light");
        };

        updateSystemTheme();
        mediaQuery.addEventListener("change", updateSystemTheme);

        return () => mediaQuery.removeEventListener("change", updateSystemTheme);
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 420);
        };

        handleScroll();
        window.addEventListener("scroll", handleScroll, { passive: true });

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        if (!selectedNotionLink) {
            setIsFrameLoading(false);
            setHasFrameLoaded(true);
            setContentStatus(selectedSection ? "missing" : "idle");
            return;
        }

        if (frameLoaderTimer.current !== null) {
            window.clearTimeout(frameLoaderTimer.current);
        }
        if (frameLoaderFallbackTimer.current !== null) {
            window.clearTimeout(frameLoaderFallbackTimer.current);
        }

        frameLoadStartedAt.current = Date.now();
        setHasFrameLoaded(false);
        setIsFrameLoading(true);
        setContentStatus("loading");
        frameLoaderFallbackTimer.current = window.setTimeout(() => {
            setIsFrameLoading(false);
            setHasFrameLoaded(true);
            setContentStatus("delayed");
            frameLoaderFallbackTimer.current = null;
        }, frameLoaderFallbackMs);

        return () => {
            if (frameLoaderTimer.current !== null) {
                window.clearTimeout(frameLoaderTimer.current);
            }
            if (frameLoaderFallbackTimer.current !== null) {
                window.clearTimeout(frameLoaderFallbackTimer.current);
                frameLoaderFallbackTimer.current = null;
            }
        };
    }, [selectedNotionLink]);

    useEffect(() => {
        if (sectionEntries.length === 0) return;

        const currentNoIsValid = sectionEntries.some((section) => section.no === selectedNo);
        const requestedNoIsValid = sectionEntries.some((section) => section.no === requestedSectionNo);
        const nextNo = requestedNoIsValid ? requestedSectionNo : currentNoIsValid ? selectedNo : 1;

        if (selectedNo !== nextNo) {
            setSelectedNo(nextNo);
        }

        if (String(nextNo) !== requestedSectionParam) {
            setSearchParams({ section: String(nextNo) }, { replace: true });
        }
    }, [requestedSectionNo, requestedSectionParam, sectionEntries, selectedNo, setSearchParams]);

    const handleSelect = (sectionNo: number) => {
        setSelectedNo(sectionNo);
        setSearchParams({ section: String(sectionNo) }, { replace: false });
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    };

    const handleDropdownToggle = (dropdownId: string) => {
        setOpenDropdowns((current) => ({
            ...current,
            [dropdownId]: !current[dropdownId],
        }));
    };

    const handleFrameLoad = () => {
        if (frameLoaderTimer.current !== null) {
            window.clearTimeout(frameLoaderTimer.current);
        }
        if (frameLoaderFallbackTimer.current !== null) {
            window.clearTimeout(frameLoaderFallbackTimer.current);
            frameLoaderFallbackTimer.current = null;
        }

        const elapsedMs = Date.now() - frameLoadStartedAt.current;
        const remainingMinMs = Math.max(frameLoaderMinMs - elapsedMs, 0);
        const delayMs = Math.max(remainingMinMs, frameLoaderPostLoadMs);

        frameLoaderTimer.current = window.setTimeout(() => {
            setIsFrameLoading(false);
            setHasFrameLoaded(true);
            setContentStatus("loaded");
            frameLoaderTimer.current = null;
        }, delayMs);
    };

    const handleScrollTop = () => {
        window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    };

    return (
        <div
            className={`about-notion-shell${isContentReady ? " content-ready" : ""}${hasFrameLoaded ? " frame-loaded" : ""}`}
            data-theme={effectiveTheme}
        >
            <div className="shell section-page about-notion-page">
                <aside className="about-notion-sidebar" data-theme-toggle-visible={showThemeToggle} aria-label="Notion 목차">
                    <div className="about-notion-sidebar-scroll">
                        {isOutlineLoading ? (
                            <AboutOutlineSkeleton />
                        ) : (
                            <nav className="about-notion-nav">
                            {renderedSectionGroups.map(({ sectionGroup }) => (
                                <div className="about-notion-nav-group" key={sectionGroup.title}>
                                    <h2>{sectionGroup.title}</h2>
                                    <div className="about-notion-nav-list">
                                        {sectionGroup.sectionItems.map((item) => {
                                            if (item.type === "SECTION") {
                                                const entry = sectionEntries.find(
                                                    (section) => section.groupTitle === sectionGroup.title && section.text === item.text,
                                                );

                                                if (!entry) return null;

                                                return (
                                                    <button
                                                        key={entry.no}
                                                        type="button"
                                                        className={`about-notion-nav-item${selectedNo === entry.no ? " selected" : ""}`}
                                                        onClick={() => handleSelect(entry.no)}
                                                    >
                                                        {item.text}
                                                    </button>
                                                );
                                            }

                                            const dropdownId = `${sectionGroup.title}-${item.text}`;
                                            const isOpen = openDropdowns[dropdownId] ?? false;

                                            return (
                                                <div className={`about-notion-dropdown${isOpen ? " open" : ""}`} key={dropdownId}>
                                                    <button
                                                        type="button"
                                                        className="about-notion-dropdown-button"
                                                        onClick={() => handleDropdownToggle(dropdownId)}
                                                        aria-expanded={isOpen}
                                                    >
                                                        <span>{item.text}</span>
                                                        <span className="about-notion-arrow-icon about-notion-arrow-down about-notion-dropdown-chevron" aria-hidden="true" />
                                                    </button>
                                                    <div className="about-notion-subnav">
                                                        {item.subSectionItems.map((subItem) => {
                                                            const entry = sectionEntries.find(
                                                                (section) =>
                                                                    section.groupTitle === sectionGroup.title &&
                                                                    section.dropdownText === item.text &&
                                                                    section.text === subItem.text,
                                                            );

                                                            if (!entry) return null;

                                                            return (
                                                                <button
                                                                    key={entry.no}
                                                                    type="button"
                                                                    className={`about-notion-subnav-item${selectedNo === entry.no ? " selected" : ""}`}
                                                                    onClick={() => handleSelect(entry.no)}
                                                                >
                                                                    {subItem.text}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                            </nav>
                        )}
                    </div>

                    {showThemeToggle && (
                        <div className="about-notion-theme-toggle" aria-label="테마 모드">
                            {themeModes.map((mode) => (
                                <button
                                    key={mode.id}
                                    type="button"
                                    className={themeMode === mode.id ? "selected" : ""}
                                    onClick={() => setThemeMode(mode.id)}
                                    aria-pressed={themeMode === mode.id}
                                >
                                    {mode.label}
                                </button>
                            ))}
                        </div>
                    )}
                    <div className="about-notion-source-footer" aria-label="데이터 출처와 콘텐츠 상태">
                        <div className={`about-notion-source-row source-${outlineSource}`}>
                            <span className="about-notion-source-label">Outline</span>
                            <span className="about-notion-source-value">
                                <span className="about-notion-source-dot" aria-hidden="true" />
                                <strong>{outlineSourceLabels[outlineSource]}</strong>
                            </span>
                        </div>
                        <div className={`about-notion-source-row content-${contentStatus}`}>
                            <span className="about-notion-source-label">Content</span>
                            <span className="about-notion-source-value">
                                <span className="about-notion-source-dot" aria-hidden="true" />
                                <strong>{contentStatusLabels[contentStatus]}</strong>
                            </span>
                        </div>
                    </div>
                </aside>

                <main
                    className="notion-document-panel"
                    aria-label={selectedSection ? `${selectedSection.text} Notion preview` : "Notion preview"}
                >
                    <div className="about-notion-content-header" aria-label="현재 문서 위치">
                        <div className="about-notion-breadcrumb">
                            {selectedSection ? (
                                selectedPath.map((pathItem, index) => (
                                    <span className="about-notion-breadcrumb-item" key={`${pathItem}-${index}`}>
                                        {index > 0 && <span className="about-notion-breadcrumb-separator">/</span>}
                                        <span>{pathItem}</span>
                                    </span>
                                ))
                            ) : null}
                        </div>
                    </div>
                    <div className="notion-frame-crop">
                        <div className={`notion-frame-mask${isFrameLoading || !selectedSection ? " visible" : ""}`} aria-hidden="true" />
                        <div
                            className={`notion-frame-loader${isFrameLoading || !selectedSection ? " visible" : ""}`}
                            aria-live="polite"
                            aria-label="Notion 문서 로딩 중"
                        >
                            <div className="notion-frame-spinner" aria-hidden="true" />
                        </div>
                        {selectedNotionLink ? (
                            <iframe
                                key={selectedNotionLink}
                                className="notion-document-frame"
                                title={`${selectedSection.text} Notion page`}
                                src={selectedNotionLink}
                                loading="lazy"
                                referrerPolicy="strict-origin-when-cross-origin"
                                onLoad={handleFrameLoad}
                                allowFullScreen
                            />
                        ) : (
                            <div className="notion-document-frame" aria-label="Notion 문서 링크 미등록" />
                        )}
                    </div>
                </main>
            </div>
            <button
                type="button"
                className={`about-notion-scroll-top${showScrollTop ? " visible" : ""}`}
                onClick={handleScrollTop}
                aria-label="맨 위로 이동"
            >
                <span className="about-notion-arrow-icon about-notion-arrow-up" aria-hidden="true" />
                <span className="about-notion-scroll-top-text">TOP</span>
            </button>
        </div>
    );
}
