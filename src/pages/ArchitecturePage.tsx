export default function ArchitecturePage() {
    return (
        <div>
            <h2 style={{fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem"}}>
                Architecture
            </h2>
            <p style={{color: "#555", fontSize: "0.95rem", marginBottom: "1rem"}}>
                FHK 팀의 토이 프로젝트는 Home-Lab 환경의 k3s 클러스터 위에서
                동작합니다. Jenkins 기반 CI/CD 파이프라인을 통해 소스 코드 변경부터
                컨테이너 이미지 빌드, 배포까지 자동화되어 있습니다.
            </p>

            <img src="/images/main_banner1.PNG" width="1080"/>

            <ul style={{paddingLeft: "1.2rem", fontSize: "0.9rem", color: "#555", marginTop: "5rem" }}>
                <li style={{marginBottom: "0.4rem"}}>
                    <b>fhk-portal-web-front</b> — 팀/프로젝트 소개 및 허브 역할을 하는
                    React 기반 포털 프론트.
                </li>
                <li style={{marginBottom: "0.4rem"}}>
                    <b>fhk-bff-server</b> — 브라우저에서 오는 요청을 받아 공통 인증/인가
                    처리 및 여러 마이크로서비스의 API를 조합하는 BFF 계층.
                </li>
                <li style={{marginBottom: "0.4rem"}}>
                    <b>fhk-security-server</b> — 통합 로그인 서버. JWT 발급, 토큰 버전
                    관리, Redis 캐시 등을 담당.
                </li>
                <li style={{marginBottom: "0.4rem"}}>
                    <b>fhk-ticket-*-service</b> — 티켓팅 도메인의 각 마이크로서비스
                    (회원, 영화, 예매 등).
                </li>
                <li style={{marginBottom: "0.4rem"}}>
                    <b>Infra</b> — Redis, Kafka, DB 등은 별도의 노드/Pod 로 구성되어
                    있으며, k3s 네트워크를 통해 각 서비스에서 접근합니다.
                </li>
            </ul>

            <p style={{color: "#555", fontSize: "0.9rem", marginTop: "1rem"}}>
                모든 서비스는 Docker 이미지로 빌드되어 k3s Deployment 로 관리되며,
                Ingress를 통해 <code>www.fhk-team.org</code> 하나의 도메인으로
                노출됩니다.
            </p>
        </div>
    );
}
