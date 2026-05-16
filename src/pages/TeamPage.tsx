import type { TeamMember } from "../types/portal";

const members: TeamMember[] = [
    {
        id: "member-1",
        name: "최준오",
        role: "PM / Backend / DevOps",
        description: "홈랩 인프라 구성, 보안 구조, 배포 흐름, 포트폴리오 방향성을 주도적으로 정리했습니다.",
        github: "https://github.com/username1",
        skills: ["Spring Boot", "k3s", "Jenkins", "Redis"],
    },
    {
        id: "member-2",
        name: "오승환",
        role: "Backend",
        description: "도메인 서비스 구현과 API 설계 중심으로 프로젝트에 참여했습니다.",
        github: "https://github.com/username2",
        skills: ["Spring Boot", "JPA", "MariaDB"],
    },
    {
        id: "member-3",
        name: "이채윤",
        role: "Backend",
        description: "서비스 흐름과 도메인 로직 구현을 담당했습니다.",
        github: "https://github.com/username3",
        skills: ["Spring Boot", "JPA", "Redis"],
    },
    {
        id: "member-4",
        name: "이현우",
        role: "Backend",
        description: "서비스 API와 데이터 흐름 구현에 참여했습니다.",
        github: "https://github.com/username4",
        skills: ["Spring Boot", "QueryDSL", "MariaDB"],
    },
    {
        id: "member-5",
        name: "김채하",
        role: "Backend / Front Support",
        description: "서비스 구현과 프론트 보조 작업을 함께 맡았습니다.",
        github: "https://github.com/username5",
        skills: ["Spring Boot", "React", "TypeScript"],
    },
];

export default function TeamPage() {
    return (
        <div className="shell section-page">
            <div className="section-heading centered">
                <h1>팀원 소개</h1>
                <p>프로젝트에서 담당한 역할과 기술 스택을 함께 확인할 수 있습니다.</p>
                <br/>
                <br/>
            </div>

            <div className="team-grid">
                {members.map((member) => (
                    <article key={member.id} className="team-card">
                        <div className="team-avatar">{member.name[0]}</div>
                        <h3>{member.name}</h3>
                        <div className="team-role">{member.role}</div>
                        <p>{member.description}</p>
                        <div className="team-skill-list">
                            {member.skills.map((skill) => (
                                <span key={skill}>{skill}</span>
                            ))}
                        </div>
                        {member.github && (
                            <a href={member.github} target="_blank" rel="noreferrer" className="text-link">
                                GitHub
                            </a>
                        )}
                    </article>
                ))}
            </div>
        </div>
    );
}
