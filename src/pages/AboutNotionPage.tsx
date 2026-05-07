import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

type ThemeMode = "system" | "light" | "dark";

type SectionItem = {
    text: string;
    type: "SECTION";
    notionLink: string;
    notionHeight: number;
};

type DropdownItem = {
    text: string;
    type: "DROPDOWN";
    subSectionItems: SectionItem[];
};

type SectionGroup = {
    sectionGroup: {
        title: string;
        sectionItems: Array<SectionItem | DropdownItem>;
    };
};

type SectionEntry = SectionItem & {
    no: number;
    groupTitle: string;
    dropdownText?: string;
};

const portfolioNotionEmbedUrl = "https://alabaster-calendula-c54.notion.site/ebd//3595db377ef8806a86a3fb54c8fe0a5a";

const deploySection: SectionItem = {
    text: "배포 Deploy",
    type: "SECTION",
    notionLink: portfolioNotionEmbedUrl,
    notionHeight: 5200,
};

const teamSpaceSection: SectionItem = {
    text: "팀 스페이스 홈",
    type: "SECTION",
    notionLink: portfolioNotionEmbedUrl,
    notionHeight: 4600,
};

const sectionGroups: SectionGroup[] = [
    {
        sectionGroup: {
            title: "Introduction",
            sectionItems: [
                { ...teamSpaceSection, text: "프로젝트 소개", notionHeight: 4200 },
                { ...deploySection, text: "포트폴리오 개요", notionHeight: 4200 },
                { ...teamSpaceSection, text: "기술적 목표", notionHeight: 4200 },
            ],
        },
    },
    {
        sectionGroup: {
            title: "Architecture",
            sectionItems: [
                { ...deploySection, text: "전체 아키텍처", notionHeight: 3800 },
                { ...teamSpaceSection, text: "프론트엔드 구조", notionHeight: 3600 },
                { ...deploySection, text: "백엔드 구조", notionHeight: 3800 },
                { ...teamSpaceSection, text: "인프라 구성", notionHeight: 3800 },
            ],
        },
    },
    {
        sectionGroup: {
            title: "Features",
            sectionItems: [
                {
                    text: "회원 기능",
                    type: "DROPDOWN",
                    subSectionItems: [
                        { ...deploySection, text: "Overview", notionHeight: 3200 },
                        { ...teamSpaceSection, text: "회원가입 및 이메일 인증", notionHeight: 3200 },
                        { ...deploySection, text: "소셜 로그인", notionHeight: 3200 },
                        { ...teamSpaceSection, text: "토큰 갱신", notionHeight: 3200 },
                        { ...deploySection, text: "내 정보 관리", notionHeight: 3200 },
                    ],
                },
                {
                    text: "티켓 예매 기능",
                    type: "DROPDOWN",
                    subSectionItems: [
                        { ...teamSpaceSection, text: "Overview", notionHeight: 3200 },
                        { ...deploySection, text: "좌석 선택", notionHeight: 3400 },
                        { ...teamSpaceSection, text: "예약 생성", notionHeight: 3400 },
                        { ...deploySection, text: "결제 흐름", notionHeight: 3400 },
                        { ...teamSpaceSection, text: "동시성 처리", notionHeight: 3600 },
                    ],
                },
            ],
        },
    },
    {
        sectionGroup: {
            title: "Backend",
            sectionItems: [
                { ...deploySection, text: "API 설계 원칙", notionHeight: 3200 },
                { ...teamSpaceSection, text: "인증/인가 구조", notionHeight: 3400 },
                { ...deploySection, text: "공통 응답 및 예외 처리", notionHeight: 3200 },
                { ...teamSpaceSection, text: "JPA/QueryDSL 활용", notionHeight: 3400 },
                { ...deploySection, text: "Redis 활용", notionHeight: 3200 },
            ],
        },
    },
    {
        sectionGroup: {
            title: "DevOps",
            sectionItems: [
                { ...deploySection, text: "배포 파이프라인", notionHeight: 3400 },
                { ...teamSpaceSection, text: "Docker 이미지 전략", notionHeight: 3400 },
                { ...deploySection, text: "k3s 배포 구조", notionHeight: 3600 },
                { ...teamSpaceSection, text: "Traefik 라우팅", notionHeight: 3400 },
                { ...deploySection, text: "cert-manager 인증서 자동화", notionHeight: 3400 },
            ],
        },
    },
    {
        sectionGroup: {
            title: "Troubleshooting",
            sectionItems: [
                { ...deploySection, text: "노드 메모리 부족", notionHeight: 5200 },
                { ...teamSpaceSection, text: "배포 장애 대응", notionHeight: 4200 },
                { ...deploySection, text: "인증 리다이렉트 문제", notionHeight: 3600 },
                { ...teamSpaceSection, text: "예약 동시성 이슈", notionHeight: 3800 },
                { ...deploySection, text: "프론트 빌드/라우팅 문제", notionHeight: 3600 },
            ],
        },
    },
    {
        sectionGroup: {
            title: "Retrospective",
            sectionItems: [
                { ...teamSpaceSection, text: "기술 선택 회고", notionHeight: 3200 },
                { ...deploySection, text: "개선 예정 사항", notionHeight: 3200 },
                { ...teamSpaceSection, text: "배운 점", notionHeight: 3200 },
            ],
        },
    },
];

const themeModes: { id: ThemeMode; label: string }[] = [
    { id: "system", label: "System" },
    { id: "light", label: "Light" },
    { id: "dark", label: "Dark" },
];

function getSectionEntries(groups: SectionGroup[]) {
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

function getDropdownOpenState(groups: SectionGroup[]) {
    return Object.fromEntries(
        groups.flatMap(({ sectionGroup }) =>
            sectionGroup.sectionItems
                .filter((item): item is DropdownItem => item.type === "DROPDOWN")
                .map((item) => [`${sectionGroup.title}-${item.text}`, true]),
        ),
    );
}

export default function AboutNotionPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const sectionEntries = useMemo(() => getSectionEntries(sectionGroups), []);
    const requestedSectionParam = searchParams.get("section");
    const requestedSectionNo = Number(requestedSectionParam);
    const initialSectionNo = sectionEntries.some((section) => section.no === requestedSectionNo) ? requestedSectionNo : 1;
    const [selectedNo, setSelectedNo] = useState(initialSectionNo);
    const [themeMode, setThemeMode] = useState<ThemeMode>("system");
    const [systemTheme, setSystemTheme] = useState<"light" | "dark">("light");
    const [isFrameLoading, setIsFrameLoading] = useState(true);
    const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>(() =>
        getDropdownOpenState(sectionGroups),
    );
    const selectedSection = useMemo(
        () => sectionEntries.find((section) => section.no === selectedNo) ?? sectionEntries[0],
        [sectionEntries, selectedNo],
    );
    const effectiveTheme = themeMode === "system" ? systemTheme : themeMode;

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
        setIsFrameLoading(true);
    }, [selectedSection.no]);

    useEffect(() => {
        const nextNo = sectionEntries.some((section) => section.no === requestedSectionNo) ? requestedSectionNo : 1;

        setSelectedNo(nextNo);

        if (String(nextNo) !== requestedSectionParam) {
            setSearchParams({ section: String(nextNo) }, { replace: true });
        }
    }, [requestedSectionNo, requestedSectionParam, sectionEntries, setSearchParams]);

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

    return (
        <div className="about-notion-shell" data-theme={effectiveTheme}>
            <div className="shell section-page about-notion-page">
                <aside className="about-notion-sidebar" aria-label="Notion 목차">
                    <div className="about-notion-sidebar-scroll">
                        <nav className="about-notion-nav">
                            {sectionGroups.map(({ sectionGroup }) => (
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
                                                        <span className="about-notion-dropdown-chevron" aria-hidden="true">⌄</span>
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
                    </div>

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
                </aside>

                <main
                    className="notion-document-panel"
                    style={{ height: `${selectedSection.notionHeight}px` }}
                    aria-label={`${selectedSection.text} Notion preview`}
                >
                    <div className="notion-frame-crop">
                        {isFrameLoading && (
                            <div className="notion-frame-loader" aria-live="polite" aria-label="Notion 문서 로딩 중">
                                <div className="notion-frame-spinner" aria-hidden="true" />
                            </div>
                        )}
                        <iframe
                            key={selectedSection.no}
                            className="notion-document-frame"
                            title={`${selectedSection.text} Notion page`}
                            src={selectedSection.notionLink}
                            loading="lazy"
                            referrerPolicy="strict-origin-when-cross-origin"
                            onLoad={() => setIsFrameLoading(false)}
                            allowFullScreen
                        />
                    </div>
                </main>
            </div>
        </div>
    );
}
