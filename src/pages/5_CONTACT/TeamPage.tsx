import { useState } from "react";
import { TechStackBadges } from "../../components/common/PortalDisplay.tsx";

type TeamTabKey = "role" | "stack" | "history";

type TechStackGroup = {
    label: string;
    items: string[];
};

type HistoryItem = {
    title: string;
    meta?: string;
};

type TeamMemberProfile = {
    id: string;
    name: string;
    role: string;
    profileImage?: string;
    quote: string;
    roleSummary: string;
    roleTags: string[];
    techGroups: TechStackGroup[];
    historyItems: HistoryItem[];
    email?: string;
    github?: string;
};

const teamTabs: Array<{ key: TeamTabKey; label: string }> = [
    { key: "history", label: "이력사항" },
    { key: "role", label: "담당 역할" },
    { key: "stack", label: "기술스택" },
];

const members: TeamMemberProfile[] = [
    {
        id: "member-1",
        name: "최준오",
        role: "PM / Backend / DevOps",
        quote: "홈랩 인프라 구성과 인증, 예매/결제 흐름을 연결한 경험이 있습니다. 현재는 운영 관점까지 고려하는 백엔드 전환 주니어로 활동하고 있습니다.",
        roleSummary: "홈랩 인프라 구성, 보안 구조, 배포 흐름, 포트폴리오 방향성을 주도적으로 정리했습니다.",
        roleTags: ["인프라 구축", "좌석 예매/결제 서비스 구현", "통합 인증 서버 개발", "BFF 서버 개발"],
        techGroups: [
            { label: "Language", items: ["Java"] },
            { label: "Backend", items: ["Spring Boot", "JPA"] },
            { label: "Data", items: ["MariaDB", "Redis"] },
            { label: "DevOps", items: ["k3s", "Jenkins", "Docker"] },
            { label: "IDE", items: ["IntelliJ IDEA", "VS Code"] },
        ],
        historyItems: [
            { title: "Jenkins · Docker · k3s 배포 운영 경험" },
            { title: "홈랩 기반 MSA 포트폴리오 구축" },
            { title: "백엔드 전환 학습 및 프로젝트 수행" },
            { title: "Unity Client Developer", meta: "6~7년 실무 경험" },
        ],
        profileImage:"/profiles/juno.jpg",
        email: "mbca.juno@gmail.com",
        github: "https://github.com/mbcChoiJuno",
    },
    {
        id: "member-2",
        name: "오승환",
        role: "Backend",
        quote: "...",
        roleSummary: "공통 자산 관리 서비스와 실시간 채팅 서비스 개발을 맡았습니다.",
        roleTags: ["예약 API 개발", "실시간 채팅 서비스 구현", "데이터 모델 정리"],
        techGroups: [
            { label: "Language", items: ["Java"] },
            { label: "Backend", items: ["Spring Boot", "JPA"] },
            { label: "Data", items: ["MariaDB", "Redis"] },
            { label: "IDE", items: ["IntelliJ IDEA"] },
        ],
        historyItems: [
            { title: "S3 스키마 설계 · 파일 자산 관리 서비스 구현" },
            { title: "2년 실무 경험" },
        ],
        github: "https://github.com/rayoh95",
    },
    {
        id: "member-3",
        name: "이채윤",
        role: "Backend",
        quote: "...",
        roleSummary: "BFF 서버 구축 및 테스트를 수행하였고, PG 결제 연동 및 이력관리 서비스 개발을 맡았습니다.",
        roleTags: ["BFF 서버 개발", "PG 결제 연동 및 이력관리 서비스", "AWS 배포"],
        techGroups: [
            { label: "Language", items: ["Java"] },
            { label: "Backend", items: ["Spring Boot", "JPA"] },
            { label: "Data", items: ["MariaDB", "Redis"] },
            { label: "IDE", items: ["IntelliJ IDEA"] },
        ],
        historyItems: [
            { title: "도커 AWS 클라우드 기반 웹 개발 교육 이수" },
            // { title: "서비스 계층 예외 처리와 응답 흐름 정리" },
            // { title: "동시 요청 시나리오 검토 참여" },
        ],
        github: "https://github.com/ChaeYun250724",
    },
    {
        id: "member-4",
        name: "이현우",
        role: "Backend",
        quote: "...",
        roleSummary: "공통 모듈 형상관리 방안 조사, 실시간 재고기록 관리 서비스 개발을 맡았습니다.",
        roleTags: ["공통 모듈 형상관리 방안", "실시간 재고기록 관리 서비스"],
        techGroups: [
            { label: "Language", items: ["Java"] },
            { label: "Backend", items: ["Spring Boot", "JPA"] },
            { label: "Data", items: ["MariaDB"] },
            { label: "IDE", items: ["IntelliJ IDEA"] },
        ],
        historyItems: [
            { title: "서비스 API 구현과 응답 DTO 정리 참여" },
            { title: "QueryDSL 기반 조회 흐름 구현" },
            { title: "MariaDB 기반 데이터 연동 검토" },
        ],
        github: "https://github.com/leehwoo2290",
    },
    {
        id: "member-5",
        name: "김채하",
        role: "Backend / Front Support",
        quote: "...",
        roleSummary: "서비스 구현과 프론트 보조 작업을 함께 맡아 화면과 API 연결을 담당했고, 실시간 트렌드 분석 서비스 흐름 개발을 맡았습니다.",
        roleTags: ["서비스 구현", "프론트 보조", "React 화면 연동", "실시간 트렌드 분석 서비스"],
        techGroups: [
            { label: "Language", items: ["TypeScript", "Java"] },
            { label: "Backend", items: ["Spring Boot"] },
            { label: "Frontend", items: ["React"] },
            { label: "Data", items: ["MariaDB"] },
            { label: "IDE", items: ["VS Code", "IntelliJ IDEA"] },
        ],
        historyItems: [
            { title: "백엔드 서비스 구현과 화면 연동 보조" },
            { title: "React 기반 포털 화면 구성 참여" },
            { title: "API 응답 확인과 간단한 UI 보완 담당" },
        ],
        github: "https://github.com/chihikawa",
    },
];

function MailIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="team-contact-icon-svg">
            <path
                d="M4.75 5.5h14.5A2.75 2.75 0 0 1 22 8.25v7.5a2.75 2.75 0 0 1-2.75 2.75H4.75A2.75 2.75 0 0 1 2 15.75v-7.5A2.75 2.75 0 0 1 4.75 5.5Zm0 1.5c-.3 0-.58.08-.82.23l7.2 5.15c.52.37 1.22.37 1.74 0l7.2-5.15A1.5 1.5 0 0 0 19.25 7H4.75Zm15.75 2.02-6.76 4.84a3 3 0 0 1-3.48 0L3.5 9.02v6.73c0 .69.56 1.25 1.25 1.25h14.5c.69 0 1.25-.56 1.25-1.25V9.02Z"
                fill="currentColor"
            />
        </svg>
    );
}

function GithubIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="team-contact-icon-svg">
            <path
                d="M12 2.25c-5.38 0-9.75 4.37-9.75 9.75 0 4.31 2.8 7.96 6.68 9.25.49.09.67-.21.67-.47v-1.72c-2.72.59-3.3-1.16-3.3-1.16-.44-1.13-1.08-1.43-1.08-1.43-.89-.61.07-.6.07-.6.98.07 1.5 1.01 1.5 1.01.87 1.49 2.29 1.06 2.85.81.09-.63.34-1.06.62-1.3-2.17-.25-4.45-1.09-4.45-4.83 0-1.07.38-1.94 1.01-2.62-.1-.25-.44-1.24.1-2.59 0 0 .82-.26 2.69 1a9.25 9.25 0 0 1 4.9 0c1.87-1.26 2.69-1 2.69-1 .54 1.35.2 2.34.1 2.59.63.68 1.01 1.55 1.01 2.62 0 3.75-2.29 4.58-4.47 4.82.35.3.66.9.66 1.81v2.68c0 .26.18.57.68.47A9.75 9.75 0 0 0 21.75 12c0-5.38-4.37-9.75-9.75-9.75Z"
                fill="currentColor"
            />
        </svg>
    );
}

function TeamMemberCard({ member }: { member: TeamMemberProfile }) {
    const [activeTab, setActiveTab] = useState<TeamTabKey>("history");

    return (
        <article className="team-card">
            <header className="team-profile">
                <div className="team-avatar" aria-hidden="true">
                    {member.profileImage ? <img src={member.profileImage} alt="" loading="lazy" /> : member.name[0]}
                </div>
                <div className="team-profile-copy">
                    <h3>{member.name}</h3>
                    <div className="team-role">{member.role}</div>
                </div>
            </header>

            <div className={`team-quote-slot${activeTab === "role" ? "" : " collapsed"}`} aria-hidden={activeTab !== "role"}>
                <p className="team-quote">
                    <span className="team-quote-mark team-quote-mark-start" aria-hidden="true">
                        “
                    </span>
                    <span className="team-quote-text">{member.quote}</span>
                    <span className="team-quote-mark team-quote-mark-end" aria-hidden="true">
                        ”
                    </span>
                </p>
            </div>

            <section className="team-card-body" aria-labelledby={`${member.id}-tabs-label`}>
                <h4 id={`${member.id}-tabs-label`} className="visually-hidden">
                    {member.name} 상세 정보
                </h4>
                <div className="team-tab-list" role="tablist" aria-label={`${member.name} 상세 탭`}>
                    {teamTabs.map((tab) => (
                        <button
                            key={tab.key}
                            id={`${member.id}-${tab.key}-tab`}
                            type="button"
                            role="tab"
                            className={`team-tab-button${activeTab === tab.key ? " active" : ""}`}
                            aria-selected={activeTab === tab.key}
                            aria-controls={`${member.id}-${tab.key}-panel`}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div
                    key={activeTab}
                    id={`${member.id}-${activeTab}-panel`}
                    className="team-tab-panel"
                    role="tabpanel"
                    aria-labelledby={`${member.id}-${activeTab}-tab`}
                >
                    {activeTab === "role" && (
                        <div className="team-role-panel">
                            <p className="team-role-summary">{member.roleSummary}</p>
                            <div className="team-tag-list" aria-label="프로젝트 및 담당 태그">
                                {member.roleTags.map((tag) => (
                                    <span key={tag} className="team-role-tag">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === "stack" && (
                        <div className="team-stack-list">
                            {member.techGroups.map((group) => (
                                <div key={group.label} className="team-stack-row">
                                    <div className="team-stack-label">{group.label}</div>
                                    <TechStackBadges items={group.items} className="team-skill-list" />
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === "history" && (
                        <ul className="team-history-list">
                            {member.historyItems.map((history) => (
                                <li key={`${history.title}-${history.meta ?? ""}`} className="team-history-item">
                                    <span className="team-history-marker" aria-hidden="true" />
                                    <span className="team-history-content">
                                        <span className="team-history-title">{history.title}</span>
                                        {history.meta && <span className="team-history-meta">{history.meta}</span>}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </section>

            <footer className="team-contact">
                {member.email ? (
                    <a
                        className="team-contact-button"
                        href={`mailto:${member.email}`}
                        aria-label={`${member.name}에게 메일 보내기`}
                        title="메일 보내기"
                    >
                        <MailIcon />
                    </a>
                ) : (
                    <button
                        type="button"
                        className="team-contact-button"
                        aria-label={`${member.name} 메일 정보 준비 중`}
                        title="메일 정보 준비 중"
                        disabled
                    >
                        <MailIcon />
                    </button>
                )}
                {member.github ? (
                    <a
                        className="team-contact-button"
                        href={member.github}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`${member.name} GitHub 열기`}
                        title="GitHub"
                    >
                        <GithubIcon />
                    </a>
                ) : (
                    <button
                        type="button"
                        className="team-contact-button"
                        aria-label={`${member.name} GitHub 정보 준비 중`}
                        title="GitHub 정보 준비 중"
                        disabled
                    >
                        <GithubIcon />
                    </button>
                )}
            </footer>
        </article>
    );
}

export default function TeamPage() {
    return (
        <div className="shell section-page team-page">
            <div className="section-heading centered">
                <h1>팀원 소개</h1>
                <p>프로젝트에서 담당한 역할과 기술 스택을 함께 확인할 수 있습니다.</p>
                <br/>
            </div>

            <div className="team-grid">
                {members.map((member) => (
                    <TeamMemberCard key={member.id} member={member} />
                ))}
            </div>
        </div>
    );
}
