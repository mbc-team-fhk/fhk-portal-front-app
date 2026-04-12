import { Link } from "react-router-dom";

const sections = [
    {
        id: "team",
        title: "팀 소개",
        body: "FHK 팀은 백엔드와 인프라 중심으로 MSA 구조를 실제로 구성해보는 것을 목표로 했습니다. 단순 CRUD가 아니라 인증, 배포, 자산 흐름, 운영 구조까지 직접 정리하는 데 초점을 두었습니다.",
    },
    {
        id: "environment",
        title: "개발 환경",
        body: "Backend는 Spring Boot, JPA, QueryDSL, Frontend는 React와 Vite를 사용했습니다. Hyper-V VM 위에 Ubuntu를 올리고 k3s 클러스터를 구성해 Jenkins, Docker, Traefik, cert-manager까지 묶어 실험했습니다.",
    },
    {
        id: "branch-strategy",
        title: "브랜치 전략",
        body: "dev에서는 기능 개발과 빠른 검증, staging에서는 RC 기반 배포 검증, prod에서는 최종 배포를 분리했습니다. 코드 관리와 배포 흐름이 섞이지 않도록 브랜치와 태그 전략을 함께 가져갔습니다.",
    },
    {
        id: "architecture",
        title: "아키텍처",
        body: "프론트- BFF - 백엔드 구조를 두고, 중앙 인증 서버와 공통 보안 모듈을 통해 서비스별 인증 중복을 줄였습니다. Redis, Kafka, S3는 서비스의 보조 인프라가 아니라 전체 흐름에서 역할이 분명한 컴포넌트로 배치했습니다.",
    },
    {
        id: "goal",
        title: "향후 목표",
        body: "관측성 개선, 테스트 자동화 확장, 이벤트 기반 흐름 고도화, 배포 안정성 강화까지 이어지는 실험 과제로 확장할 계획입니다.",
    },
];

export default function AboutPage() {
    return (
        <div className="shell section-page two-column-page">
            <aside className="page-toc">
                <div className="toc-card">
                    <h2>FHK에 대하여</h2>
                    <nav>
                        {sections.map((section) => (
                            <a key={section.id} href={`#${section.id}`}>{section.title}</a>
                        ))}
                    </nav>
                </div>
            </aside>
            <div className="page-content-stack">
                <div className="section-heading">
                    <h1>About</h1>
                </div>

                {sections.map((section) => (
                    <section key={section.id} id={section.id} className="content-block">
                        <h2>{section.title}</h2>
                        <p>{section.body}</p>
                    </section>
                ))}

                <section className="content-block muted-block">
                    <h2>핵심 페이지 이동</h2>
                    <p>메인에서는 요약만 보여주고, 상세 Feature와 Projects는 별도 페이지에서 보여주도록 분리했습니다.</p>
                    <div className="inline-links">
                        <Link to="/features" className="text-link">Features</Link>
                        <Link to="/projects" className="text-link">Projects</Link>
                    </div>
                </section>
            </div>
        </div>
    );
}
