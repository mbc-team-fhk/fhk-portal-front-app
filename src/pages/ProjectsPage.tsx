import type { Project } from "../types/portal";

const projects: Array<Project & { preview: string; bullets: string[] }> = [
    {
        id: "ticketing",
        name: "Ticket Reservation",
        description: "영화 예매 흐름을 MSA 구조로 나누고, 좌석 경쟁과 결제 흐름을 실험한 토이 프로젝트입니다.",
        techStack: ["Spring Boot", "JPA", "Redis", "Kafka", "k3s"],
        category: "TICKETING",
        protected: true,
        path: "/ticketing",
        preview: "회원 · 영화 · 상영 · 예매 · 결제 도메인 분리",
        bullets: [
            "좌석 경쟁 상황을 고려한 예약 처리",
            "BFF와 통합 인증 서버를 통한 로그인 흐름",
            "프로젝트 구조와 기능 시연을 먼저 공개",
        ],
    },
    {
        id: "asset",
        name: "Asset Management",
        description: "공통 업로드와 자산 추적 흐름을 서비스 외부로 분리해 재사용성을 높인 프로젝트입니다.",
        techStack: ["Spring Boot", "S3", "Kafka", "k3s"],
        category: "ASSET",
        protected: true,
        path: "/asset",
        preview: "업로드 · 저장 · 메타데이터 · 재사용 흐름 정리",
        bullets: [
            "서비스마다 다른 파일 업로드 방식 통합",
            "S3 기반 저장과 메타데이터 관리 분리",
            "추후 비동기 처리 확장 고려",
        ],
    },
];

export default function ProjectsPage() {
    return (
        <div className="shell section-page">
            <div className="section-heading centered">
                <h1>로그인 없이 간편하게 프로젝트를 살펴보세요</h1>
                <p>*시연을 위해서는 로그인이 필요합니다.</p>
            </div>

            <div className="project-showcase-list">
                {projects.map((project, index) => (
                    <article key={project.id} className={`feature-spotlight ${index % 2 === 1 ? "reverse" : ""}`}>
                        <div className="spotlight-visual-panel subtle-panel">
                            {/* 이미지 영역 */}
                            <div className="spotlight-visual-card project-preview-card">
                                <div className="spotlight-visual-title">{project.name}</div>
                                <div className="spotlight-visual-body">{project.preview}</div>
                            </div>
                        </div>
                        <div className="spotlight-copy">
                            <h2>{project.name}</h2>
                            <p className="spotlight-lead">{project.description}</p>
                            <ul className="project-bullet-list">
                                {project.bullets.map((bullet) => (
                                    <li key={bullet}>{bullet}</li>
                                ))}
                            </ul>
                            <div className="project-meta">Tech Stack: {project.techStack.join(" · ")}</div>
                            <div className="hero-actions">
                                <a href={project.path} className="primary-button link-button">프로젝트 상세정보</a>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
}
