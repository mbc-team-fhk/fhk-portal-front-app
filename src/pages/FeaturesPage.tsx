const features = [
    {
        id: "cicd",
        label: "Feature 1",
        title: "CI/CD 자동화",
        summary: "브랜치 전략과 배포 환경을 연결한 자동화 파이프라인",
        detail: "GitHub Webhook, Jenkins, Docker Hub, k3s 배포까지 이어지는 흐름을 구성했습니다. 브랜치별 배포 환경을 분리해 dev, staging, prod 흐름을 명확히 했습니다.",
    },
    {
        id: "security",
        label: "Feature 2",
        title: "중앙 인증 구조",
        summary: "중앙 인증 서버 + 공통 보안 모듈 기반의 인증/인가 처리",
        detail: "각 서비스에 인증 로직을 중복 구현하지 않고, 중앙 인증 서버가 토큰 발급을 담당하도록 분리했습니다. 서비스는 공통 보안 모듈을 통해 토큰 검증과 권한 검사를 수행합니다.",
    },
    {
        id: "asset",
        label: "Feature 3",
        title: "파일 자산 관리",
        summary: "S3 저장소와 메타데이터를 분리한 공통 업로드 구조",
        detail: "업로드 파일을 각 서비스에 분산 저장하지 않고 공통 자산 서비스로 분리했습니다. S3 저장소와 메타데이터 관리를 나누어 재사용성과 추적 가능성을 확보했습니다.",
    },
    {
        id: "infra",
        label: "Feature 4",
        title: "Home-Lab 인프라 운영",
        summary: "로컬 하드웨어 기반의 멀티 노드 서비스 운영 환경",
        detail: "Hyper-V VM 위에 k3s 클러스터를 구성하고 Redis, Kafka, MariaDB, Jenkins, Traefik을 함께 운영했습니다. 제한된 자원 안에서 배포, 라우팅, 인증, 메시징, 데이터 저장 흐름을 직접 검증했습니다.",
    },
];

export default function FeaturesPage() {
    return (
        <div className="shell section-page">
            <div className="section-heading centered">
                <h1>Features</h1>
                <p>개발, 인증, 배포, 운영 흐름을 하나의 구조로 연결하고</p>
                <p>MSA 기반 백엔드 서비스를 반복적으로 개발하고 검증할 수 있는 환경을 구축했습니다.</p>
                <br/>
                <br/>
            </div>


            <div className="section-heading centered">
                <h1>[RESOURCE: IMAGE]</h1>
                <p>feature 1~4 포인트 아이콘 도표</p>
                <br/>
                <br/>
            </div>

            {/*<div className="shortcut-grid compact-shortcut-grid">*/}
            {/*    {features.map((feature) => (*/}
            {/*        <a key={feature.id} href={`#${feature.id}`} className="shortcut-card">*/}
            {/*            <div className="shortcut-icon">{feature.label.replace("Feature ", "F")}</div>*/}
            {/*            <h3>{feature.title}</h3>*/}
            {/*            <p>{feature.summary}</p>*/}
            {/*        </a>*/}
            {/*    ))}*/}
            {/*</div>*/}

            <div className="feature-spotlight-list">
                {features.map((feature, index) => (
                    <section key={feature.id} id={feature.id}
                             className={`feature-spotlight ${index % 2 === 1 ? "reverse" : ""}`}>
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
