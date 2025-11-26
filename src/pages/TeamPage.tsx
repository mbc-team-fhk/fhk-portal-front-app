import type {TeamMember} from "../types/portal";

const members: TeamMember[] = [
    {
        id: "member-1",
        name: "최준오",
        role: "PM / Backend / DevOps ",
        description: "담당 내용 작성",
        github: "https://github.com/username1",
        skills: ["Spring Boot", "Kubernetes", "Jenkins", "Redis", "Kafka"],
    },
    {
        id: "member-2",
        name: "오승환",
        role: "Backend",
        description: "담당 내용 작성",
        github: "https://github.com/username2",
        skills: ["Spring Boot", "JPA", "MySQL"],
    },
    {
        id: "member-3",
        name: "이채윤",
        role: "Backend",
        description: "담당 내용 작성",
        github: "https://github.com/username3",
        skills: ["Spring Boot", "JPA", "MySQL"],
    },
    {
        id: "member-4",
        name: "이현우",
        role: "Backend",
        description: "담당 내용 작성",
        github: "https://github.com/username3",
        skills: ["Spring Boot", "JPA", "MySQL"],
    },
    {
        id: "member-5",
        name: "김채하",
        role: "Backend",
        description: "담당 내용 작성",
        github: "https://github.com/username3",
        skills: ["Spring Boot", "JPA", "MySQL", "React", "TypeScript", "UI/UX"],
    },
];

export default function TeamPage() {
    return (
        <div>
            <div style={{fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem"}}>
                Team
            </div>
            <div style={{color: "#555", fontSize: "0.95rem", marginBottom: "1.5rem"}}>
                FHK 팀은 백엔드/인프라 중심의 토이 프로젝트를 통해
                MSA·DevOps 환경 위에서 상용되는 핵심 서비스를 구현하면서 발생하는 인사이트를 얻는것을 목표로 개발하였습니다.
            </div>

            <div
                style={{
                    display: "grid",
                    gap: "2rem",
                    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                }}
            >
                {members.map((m) => (
                    <div
                        key={m.id}
                        style={{
                            border: "1px solid #eee",
                            borderRadius: "8px",
                            padding: "1rem",
                        }}
                    >
                        <h3
                            style={{
                                fontSize: "1.1rem",
                                fontWeight: 600,
                                marginBottom: "0.2rem",
                            }}
                        >
                            {m.name}
                        </h3>
                        <div
                            style={{
                                fontSize: "0.85rem",
                                color: "#666",
                                marginBottom: "0.5rem",
                            }}
                        >
                            {m.role}
                        </div>
                        <p
                            style={{
                                fontSize: "0.9rem",
                                color: "#555",
                                marginBottom: "0.75rem",
                            }}
                        >
                            {m.description}
                        </p>
                        <div
                            style={{
                                fontSize: "0.8rem",
                                color: "#777",
                                marginBottom: "0.5rem",
                            }}
                        >
                            {m.skills.join(" · ")}
                        </div>
                        {m.github && (
                            <a
                                href={m.github}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                    fontSize: "0.8rem",
                                    color: "#0070f3",
                                    textDecoration: "none",
                                }}
                            >
                                GitHub
                            </a>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
