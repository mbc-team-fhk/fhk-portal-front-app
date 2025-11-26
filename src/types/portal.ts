export interface Project {
    id: string;
    name: string;
    description: string;
    techStack: string[];
    category: "TICKETING" | "CHAT" | "ASSET" | "MOVIE" | "OTHER";
    protected: boolean; // 로그인 필요 여부
    path: string; // 실제 서비스 진입 path (예: /ticketing)
}

export interface TeamMember {
    id: string;
    name: string;
    role: string;
    description: string;
    github?: string;
    blog?: string;
    skills: string[];
}
