const features = [
    {
        id: "cicd",
        label: "Feature 1",
        title: "CI/CD 자동화",
        summary: "브랜치 전략과 배포 환경을 연결한 자동화 파이프라인",
        detail: "GitHub Webhook부터 Jenkins, Docker Hub, k3s 반영까지 이어지는 흐름을 정리했습니다. 단순히 빌드만 하는 것이 아니라 어떤 브랜치가 어떤 환경으로 배포되는지 기준을 함께 두었습니다.",
    },
    {
        id: "security",
        label: "Feature 2",
        title: "인증/인가 일원화",
        summary: "중앙 인증 서버 + 공통 보안 모듈 구조",
        detail: "서비스마다 인증 로직을 흩뿌리지 않고, 중앙 인증 서버가 토큰 발급을 담당하며 각 서비스는 공통 모듈을 통해 검증과 인가를 수행하도록 분리했습니다.",
    },
    {
        id: "asset",
        label: "Feature 3",
        title: "자산 관리 서비스",
        summary: "S3와 자산 메타데이터를 공통 흐름으로 통합",
        detail: "업로드 파일을 서비스 내부에 흩뿌리지 않고, 공통 자산 서비스와 저장소 흐름으로 묶어 재사용성과 추적성을 확보했습니다.",
    },
    {
        id: "infra",
        label: "Feature 4",
        title: "Home-Lab 인프라 실험",
        summary: "로컬 하드웨어 위에 멀티 노드 환경을 재현",
        detail: "Hyper-V VM 위에 Ubuntu와 k3s를 구성하고, Redis, Kafka, MariaDB, Jenkins, Traefik 등을 운영하면서 실제 서비스 운영 구조와 유사한 조건을 실험했습니다.",
    },
];

export default function FeaturesPage() {
    return (
        <div className="shell section-page">
            <div className="section-heading centered">
                <h1>Features</h1>
                <p></p>
            </div>

            <div className="shortcut-grid compact-shortcut-grid">
                {features.map((feature) => (
                    <a key={feature.id} href={`#${feature.id}`} className="shortcut-card">
                        <div className="shortcut-icon">{feature.label.replace("Feature ", "F")}</div>
                        <h3>{feature.title}</h3>
                        <p>{feature.summary}</p>
                    </a>
                ))}
            </div>

            <div className="feature-spotlight-list">
                {features.map((feature, index) => (
                    <section key={feature.id} id={feature.id} className={`feature-spotlight ${index % 2 === 1 ? "reverse" : ""}`}>
                        <div className="spotlight-visual-panel subtle-panel">
                            <div className="spotlight-visual-card accent-card">
                                <div className="spotlight-visual-title">{feature.label}</div>
                                <div className="spotlight-visual-body">{feature.title}</div>
                            </div>
                        </div>
                        <div className="spotlight-copy">
                            <div className="eyebrow">{feature.label}</div>
                            <h2>{feature.title}</h2>
                            <p className="spotlight-lead">{feature.summary}</p>
                            <p>{feature.detail}</p>
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
}
