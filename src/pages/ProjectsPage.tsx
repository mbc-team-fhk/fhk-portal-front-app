import { useAuth } from "../context/AuthContext";
import type { Project } from "../types/portal";

const projects: Project[] = [
    {
        id: "ticketing",
        name: "ticketing-reservation",
        description:
            "영화 예매 도메인을 기반으로 한 MSA 토이 프로젝트. 회원, 영화, 상영, 예매, 결제 등 도메인 분리를 실험합니다.",
        techStack: ["Spring Boot", "JPA", "Redis", "Kafka", "k3s"],
        category: "TICKETING",
        protected: true,
        path: "/ticketing", // Ingress
    },
    {
        id: "movie",
        name: "chat-realtime",
        description:
            "실시간 채팅 수행",
        techStack: ["Spring Boot", "RestTemplate/WebClient", "Redis"],
        category: "MOVIE",
        protected: true,
        path: "/movie", // Ingress
    },
    {
        id: "asset",
        name: "payment-gateway",
        description:
            "결제 상태 관리와 외부 PG API 연동",
        techStack: ["Spring Boot", "S3", "Kafka", "k3s"],
        category: "ASSET",
        protected: true,
        path: "/asset", // Ingress
    },
];

export default function ProjectsPage() {
    const { isAuthenticated } = useAuth();

    const handleEnterProject = (project: Project) => {
        if (project.protected && !isAuthenticated) {
            alert("로그인 후 이용 가능합니다.");
            return;
        }
        // 실제 서비스 프론트로 라우팅 (Ingress 에서 path 매핑하기)
        window.location.href = project.path;
    };

    return (
        <div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem" }}>
                Projects
            </h2>
            <p style={{ color: "#555", fontSize: "0.95rem", marginBottom: "1.5rem" }}>
                FHK 팀이 진행 중인 토이 프로젝트 목록입니다. 각 프로젝트는
                Kubernetes 클러스터 상의 마이크로서비스로 배포되며, 통합 로그인
                서버를 통해 보호됩니다.
            </p>
            <div style={{ display: "grid", gap: "1rem" }}>
                {projects.map((p) => (
                    <div
                        key={p.id}
                        style={{
                            border: "1px solid #eee",
                            borderRadius: "8px",
                            padding: "1rem",
                            marginBottom: "0.4rem",
                        }}
                    >
                        <div
                            style={{
                                fontSize: "1.1rem",
                                fontWeight: 600,
                                marginBottom: "0.4rem",
                            }}
                        >
                            {p.name}
                            {p.protected && (
                                <span
                                    style={{
                                        fontSize: "0.75rem",
                                        marginLeft: "1.5rem",
                                        color: "#d35400",
                                        border: "1px solid #f0ad4e",
                                        padding: "0.1rem 0.3rem",
                                        borderRadius: "4px",
                                    }}
                                >
                  로그인 필요
                </span>
                            )}
                        </div>
                        <p
                            style={{
                                fontSize: "0.9rem",
                                color: "#555",
                                marginBottom: "0.5rem",
                            }}
                        >
                            {p.description}
                        </p>
                        <div style={{ fontSize: "0.8rem", color: "#777", marginBottom: "0.75rem" }}>
                            Tech: {p.techStack.join(" · ")}
                        </div>
                        <button
                            onClick={() => handleEnterProject(p)}
                            style={{
                                border: "1px solid #222",
                                background: "#222",
                                color: "#fff",
                                padding: "0.4rem 0.8rem",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "0.8rem",
                            }}
                        >
                            서비스 접속
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
