import { Link } from "react-router-dom";
import type { Project } from "../types/portal";

const projects: Array<Project & { preview: string; previewImage?: string; bullets: string[] }> = [
    {
        id: "ticketing",
        name: "Ticket Reservation",
        description: "영화 예매 흐름을 MSA 구조로 나누고 좌석 점유, 예약 생성, 결제 콜백까지 확인하는 프로젝트입니다.",
        techStack: ["Spring Boot", "JPA", "Redis", "Kafka", "k3s"],
        category: "TICKETING",
        protected: true,
        path: "/projects/ticket-reservations",
        preview: "상영 선택 · 좌석 점유 · 예약 생성 · Mock 결제",
        previewImage: "/images/projects/ticket-reservation-preview.svg",
        bullets: [
            "상영별 좌석 상태를 조회하고 선택 가능한 좌석만 예약",
            "로그인 계정 기반 예약 생성과 결제 대기 상태 확인",
            "payment-service Mock PG 승인/실패 흐름 연동",
        ],
    },
    {
        id: "asset",
        name: "Asset Management",
        description: "공통 업로드와 자산 추적 흐름을 서비스 단위로 분리해 재사용성을 높이는 프로젝트입니다.",
        techStack: ["Spring Boot", "S3", "Kafka", "k3s"],
        category: "ASSET",
        protected: true,
        path: "/asset",
        preview: "업로드 · 저장 · 메타데이터 · 재사용 흐름 정리",
        bullets: [
            "서비스마다 다른 파일 업로드 방식을 통합",
            "S3 기반 저장과 메타데이터 관리 분리",
            "추후 비동기 처리 확장을 고려",
        ],
    },
];

export default function ProjectsPage() {
    return (
        <div className="shell section-page">
            <div className="section-heading centered">
                <h1>프로젝트를 가볍게 둘러보고 직접 테스트해보세요</h1>
                <p>일부 기능은 로그인 후 예약/결제 흐름까지 실행할 수 있습니다.</p>
            </div>

            <div className="project-showcase-list">
                {projects.map((project, index) => (
                    <article key={project.id} className={`feature-spotlight ${index % 2 === 1 ? "reverse" : ""}`}>
                        <div className="spotlight-visual-panel subtle-panel">
                            {project.previewImage ? (
                                <img className="project-preview-image" src={project.previewImage} alt={`${project.name} preview`} />
                            ) : (
                                <div className="spotlight-visual-card project-preview-card">
                                    <div className="spotlight-visual-title">{project.name}</div>
                                    <div className="spotlight-visual-body">{project.preview}</div>
                                </div>
                            )}
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
                                <Link to={project.path} className="primary-button link-button">프로젝트 열기</Link>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
}
