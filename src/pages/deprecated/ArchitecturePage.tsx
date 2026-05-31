const architectureSections = [
    {
        id: "overview",
        title: "개요",
        body: "FHK Portal은 단일 화면 포트폴리오가 아니라, 프론트엔드 허브와 BFF, 인증 서버, 개별 백엔드 서비스가 함께 동작하는 실서비스형 구조를 보여주기 위한 프로젝트입니다.",
    },
    {
        id: "traffic-flow",
        title: "트래픽 흐름",
        body: "외부 요청은 공유기와 nginx를 거쳐 프론트엔드 또는 BFF로 진입합니다. 이후 BFF는 요청 URL과 인증 상태를 기준으로 적절한 백엔드 서비스로 라우팅하고, 서비스 간 통신은 내부 네트워크에서 처리됩니다.",
    },
    {
        id: "security",
        title: "인증 구조",
        body: "security-server를 통합 인증 진입점으로 두고, BFF가 프론트를 대신해 토큰 발급과 세션 관리를 담당합니다. 이를 통해 각 하위 서비스가 인증 책임을 중복으로 가지지 않도록 설계합니다.",
    },
    {
        id: "platform",
        title: "플랫폼 구성",
        body: "Kubernetes 기반 배포, Jenkins CI/CD, MariaDB, Redis, Kafka 등을 함께 사용해 단순 CRUD를 넘어 배포와 운영, 메시징, 캐시 전략까지 포함한 구조를 설명할 수 있도록 구성합니다.",
    },
    {
        id: "goal",
        title: "이 페이지의 목적",
        body: "이 페이지는 예쁜 다이어그램보다도 왜 이런 구조를 선택했는지, 서비스 분리와 인증 경계가 어떤 문제를 해결하는지, 앞으로 어떤 확장 여지가 있는지를 전달하는 데 목적이 있습니다.",
    },
];

export default function ArchitecturePage() {
    return (
        <div className="shell section-page two-column-page">
            <aside className="page-toc">
                <div className="toc-card">
                    <h2>Architecture</h2>
                    <nav>
                        {architectureSections.map((section) => (
                            <a key={section.id} href={`#${section.id}`}>{section.title}</a>
                        ))}
                    </nav>
                </div>
            </aside>

            <div className="page-content-stack">
                <div className="section-heading">
                    <h1>Architecture</h1>
                    <p>
                        홈랩 기반 인프라, BFF 라우팅, 인증 경계, 메시징과 캐시 계층까지
                        현재 포트폴리오의 시스템 구성을 한눈에 설명하기 위한 페이지입니다.
                    </p>
                </div>

                {architectureSections.map((section) => (
                    <section key={section.id} id={section.id} className="content-block">
                        <h2>{section.title}</h2>
                        <p>{section.body}</p>
                    </section>
                ))}
            </div>
        </div>
    );
}
