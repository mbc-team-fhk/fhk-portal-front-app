import { useState } from "react";
import { Link } from "react-router-dom";
import { MediaTabs, TechStackBadges, type MediaTabItem } from "../../components/common/PortalDisplay.tsx";
import type { Project } from "../../types/portal.ts";

type ProjectItem = Project & {
    published: boolean;
    preview: string;
    previewImage: string;
    mediaTabs: MediaTabItem[];
    bullets: string[];
};

const projects: ProjectItem[] = [
    {
        id: "ticketing",
        name: "Ticket Reservation",
        description: "영화 예매 흐름을 MSA 구조로 나누고 좌석 점유, 예약 생성, 결제 콜백까지 확인하는 프로젝트입니다.",
        techStack: ["Spring Boot", "JPA", "Redis"],
        category: "TICKETING",
        protected: true,
        path: "/projects/ticket-reservations",
        published: true,
        preview: "상영 선택 · 좌석 점유 · 예약 생성 · Mock 결제",
        previewImage: "/images/projects/ticket-reservation-preview.svg",
        mediaTabs: [
            {
                label: "Overview",
                src: "/images/projects/ticket-reservation-preview.svg",
                caption: "상영 선택, 좌석 점유, 예약 생성, Mock 결제로 이어지는 프로젝트 흐름입니다.",
                alt: "Ticket Reservation project preview",
            },
            {
                label: "예매 Flow",
                src: "/images/projects/ticket-reservation/reservation-flow-placeholder.svg",
                caption: "정상 케이스 GIF: 영화 선택부터 좌석 선택, 예약 생성, 결제 대기까지 이어지는 흐름입니다.",
                alt: "Ticket reservation normal flow placeholder",
            },
            {
                label: "예매 실패 Flow",
                src: "/images/projects/ticket-reservation/reservation-failure-flow-placeholder.svg",
                caption: "두 클라이언트 동시 시도 GIF: 이미 판매된 좌석 요청이 실패 처리되는 흐름입니다.",
                alt: "Ticket reservation failure flow placeholder",
            },
            {
                label: "락 경합",
                src: "/images/projects/ticket-reservation/lock-contention-placeholder.svg",
                caption: "봇 테스트 출력 PNG: 동일 좌석 경합에서 단일 예약만 성공하는지 확인합니다.",
                alt: "Ticket reservation lock contention placeholder",
            },
            {
                label: "봇 트래픽 결과",
                src: "/images/projects/ticket-reservation/bot-traffic-result-placeholder.svg",
                caption: "봇 트래픽 테스트 결과 PNG: 요청량, 실패율, 락 경합 결과를 요약 그래프로 정리합니다.",
                alt: "Ticket reservation bot traffic result placeholder",
            },
        ],
        bullets: [
            "상영별 좌석 상태를 조회하고 선택 가능한 좌석만 예약",
            "로그인 계정 기반 예약 생성과 결제 대기 상태 확인",
            "payment-service Mock PG 승인/실패 흐름 연동",
        ],
    },
    {
        id: "realtime-chat",
        name: "Realtime Chat",
        description: "WebSocket 기반 실시간 메시징과 채팅방 입장, 메시지 브로드캐스트 흐름을 검증하는 프로젝트입니다.",
        techStack: ["Spring Boot", "Redis", "Kafka"],
        category: "CHAT",
        protected: true,
        path: "/projects/realtime-chat",
        published: true,
        preview: "채팅방 · 실시간 메시지 · 브로드캐스트 · 이벤트 처리",
        previewImage: "/images/projects/realtime-chat-preview.svg",
        mediaTabs: [
            {
                label: "Overview",
                src: "/images/projects/realtime-chat-preview.svg",
                caption: "실시간 채팅 프로젝트를 위한 더미 슬롯입니다. published를 true로 바꾸면 목록에 노출됩니다.",
                alt: "Realtime Chat project placeholder",
            },
        ],
        bullets: [
            "채팅방 입장과 퇴장 이벤트를 실시간으로 반영",
            "메시지 브로드캐스트와 읽음 상태 흐름 검증",
            "Redis/Kafka 기반 확장 메시징 구조 검토",
        ],
    },
    {
        id: "payment-gateway",
        name: "Payment Gateway",
        description: "실제 PG 승인 요청, 콜백 검증, 결제 상태 동기화 흐름을 분리해 검증하는 프로젝트입니다.",
        techStack: ["Spring Boot", "JPA", "Kafka"],
        category: "OTHER",
        protected: true,
        path: "/projects/payment-gateway",
        published: true,
        preview: "PG 승인 · 콜백 검증 · 결제 상태 동기화 · 실패 보상",
        previewImage: "/images/projects/payment-gateway-preview.svg",
        mediaTabs: [
            {
                label: "Overview",
                src: "/images/projects/payment-gateway-preview.svg",
                caption: "실제 Payment Gateway 연동 프로젝트를 위한 더미 슬롯입니다. published를 true로 바꾸면 목록에 노출됩니다.",
                alt: "Payment Gateway project placeholder",
            },
        ],
        bullets: [
            "실제 PG 승인 요청과 응답 상태 저장",
            "결제 콜백 서명 검증과 멱등 처리",
            "실패/취소 이벤트를 서비스 상태와 동기화",
        ],
    },
];

const publishedProjects = projects.filter((project) => project.published);

function getProjectPreviewSlot(projectIndex: number, selectedProjectIndex: number, projectCount: number) {
    if (projectCount <= 1 || projectIndex === selectedProjectIndex) {
        return "center";
    }

    const previousProjectIndex = (selectedProjectIndex - 1 + projectCount) % projectCount;
    const nextProjectIndex = (selectedProjectIndex + 1) % projectCount;

    if (projectIndex === previousProjectIndex) {
        return "left";
    }

    if (projectIndex === nextProjectIndex) {
        return "right";
    }

    return "hidden";
}

export default function ProjectsPage() {
    const [selectedProjectId, setSelectedProjectId] = useState(publishedProjects[0]?.id ?? "");
    const selectedProject = publishedProjects.find((project) => project.id === selectedProjectId) ?? publishedProjects[0];
    const selectedProjectIndex = selectedProject
        ? Math.max(0, publishedProjects.findIndex((project) => project.id === selectedProject.id))
        : -1;

    return (
        <div className="shell section-page">
            <div className="section-heading centered projects-page-heading">
                <h1>프로젝트를 가볍게 둘러보고 직접 테스트해보세요</h1>
                <p>일부 기능은 로그인 후 예약/결제 흐름까지 실행할 수 있습니다.</p>
                <br />
                <br />
            </div>

            {selectedProject ? (
                <>
                    <div className="project-preview-rail" aria-label="프로젝트 목록">
                        {publishedProjects.map((project, projectIndex) => {
                            const previewSlot = getProjectPreviewSlot(projectIndex, selectedProjectIndex, publishedProjects.length);
                            const isSelected = project.id === selectedProject.id;

                            return (
                                <button
                                    key={project.id}
                                    type="button"
                                    className={`project-preview-item slot-${previewSlot} ${isSelected ? "selected" : ""}`}
                                    onClick={() => setSelectedProjectId(project.id)}
                                    aria-pressed={isSelected}
                                    aria-hidden={previewSlot === "hidden"}
                                    tabIndex={previewSlot === "hidden" ? -1 : 0}
                                >
                                    <span className="project-preview-thumb">
                                        <img src={project.previewImage} alt="" aria-hidden="true" />
                                    </span>
                                    <span className="project-preview-name">{project.name}</span>
                                </button>
                            );
                        })}
                    </div>

                    <div key={selectedProject.id} className="project-showcase-list project-detail-area">
                        <article className="feature-spotlight">
                            <div className="spotlight-visual-panel feature-media-panel">
                                <MediaTabs
                                    tabs={selectedProject.mediaTabs}
                                    ariaLabel={`${selectedProject.name} 미디어`}
                                    fallback={(
                                        <div className="spotlight-visual-card project-preview-card">
                                            <div className="spotlight-visual-title">{selectedProject.name}</div>
                                            <div className="spotlight-visual-body">{selectedProject.preview}</div>
                                        </div>
                                    )}
                                />
                            </div>
                            <div className="spotlight-copy">
                                <h2>{selectedProject.name}</h2>
                                <p className="spotlight-lead">{selectedProject.description}</p>
                                <ul className="project-bullet-list">
                                    {selectedProject.bullets.map((bullet) => (
                                        <li key={bullet}>{bullet}</li>
                                    ))}
                                </ul>
                                <TechStackBadges items={selectedProject.techStack} className="project-tech-stack" />
                                <div className="hero-actions">
                                    <Link to={selectedProject.path} className="primary-button link-button">프로젝트 열기</Link>
                                </div>
                                <br />
                                <br />
                                <br />
                            </div>
                        </article>
                    </div>
                </>
            ) : (
                <div className="empty-state">게시된 프로젝트가 없습니다.</div>
            )}
        </div>
    );
}
