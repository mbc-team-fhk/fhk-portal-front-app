import {useNavigate} from "react-router-dom";

interface ButtonProps {
    path: string;
    value: string;
}

function DarkButton({path, value}: ButtonProps) {
    const navigate = useNavigate();
    return (
        <button
            onClick={() => navigate(path)}
            style={{
                border: "1px solid #ccc",
                background: "#fff",
                color: "#333",
                padding: "0.6rem 1rem",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "0.9rem",
            }}
        >
            {value}
        </button>
    )
}

function LightButton({path, value}: ButtonProps) {
    const navigate = useNavigate();
    return (
        <button
            onClick={() => navigate(path)}
            style={{
                border: "1px solid #222",
                background: "#222",
                color: "#fff",
                padding: "0.6rem 1rem",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "0.9rem",
            }}
        >
            {value}
        </button>
    )
}

export default function HomePage() {
    return (
        <div>
            <section style={{marginBottom: "7rem"}}>

                {/* 1. 인프라 설명 */}
                <div>
                    <div>
                        <img src="/images/main_banner1.PNG" width="1080" alt="a"/>
                    </div>

                    <div style={{fontSize: "2rem", fontWeight: 700, marginTop: "2rem"}}>
                        컨테이너 오케스트레이션 기반 지속적 개발·통합·배포 인프라 구현
                    </div>
                    <div style={{fontSize: "1.2rem", fontWeight: 200, marginBottom: "2rem"}}>
                        Building a CI/CD infrastructure based on container orchestration.
                    </div>
                    <div
                        style={{
                            maxWidth: "1080px",
                            color: "#555",
                            marginBottom: "1.5rem",
                            lineHeight: 1.5,
                        }}
                    >
                        FHK 팀의 토이 프로젝트 허브를 소개합니다.
                        <br/>Home-Lab 에서 Windows Hyper-V를 이용해 Ubuntu Linux 환경의 VM에 서비스가 필요로 하는 하드웨어 자원을 분배하고,
                        <br/>가상 네트워크 스위치를 외부 네트워크와 연결해 191.168.45.0/24 대역에 내부 접근용 IP를 각 VM에 수동으로 할당해 논리적 MSA 환경을 구축합니다.
                        <br/>Jenkins, Docker, Kubernetes를 활용하여 컨테이너 오케스트레이션 기반으로 지속적인 개발·통합·배포를 실험합니다.

                    </div>
                    <div
                        style={{
                            maxWidth: "1080px",
                            color: "#555",
                            marginBottom: "4rem",
                            lineHeight: 2,
                        }}
                    >
                        {/*버튼*/}
                        <div style={{display: "flex", gap: "0.75rem"}}>
                            <LightButton path="/branch" value="브랜치 전략"/>
                            <DarkButton path="/architecture" value="인프라 아키텍처"/>
                        </div>

                    </div>
                </div>


                {/* 2. 프로젝트 설명 */}
                <div>
                    <img src="/images/main_banner2.PNG" width="1080"/>

                    <div style={{fontSize: "2rem", fontWeight: 700, marginTop: "2rem"}}>
                        MSA 기반 서비스 구현
                    </div>
                    <div style={{fontSize: "1.2rem", fontWeight: 200, marginBottom: "2rem"}}>
                        Microservices-Oriented Service Implementation
                    </div>
                    <div
                        style={{
                            maxWidth: "1080px",
                            color: "#555",
                            marginBottom: "1.5rem",
                            lineHeight: 1.5,
                        }}
                    >
                        Redis와 Kafka를 활용해 MSA 환경에서의 분산 트랜잭션과 상태 동기화를 설계했습니다.
                        <br/>서비스 특성에 따라 데이터베이스 부하를 캐시와 메시지 큐로 분산해 안정성과 확장성을 높였습니다.
                        <br/>실시간 채팅 로그 관리, 영화관 좌석 예매 시 경쟁 처리, 결제 시 외부 API 의존성 등 MSA 환경에서 발생하는 문제를 단계적으로 해결합니다.
                    </div>

                    <div
                        style={{
                            maxWidth: "1080px",
                            color: "#555",
                            marginBottom: "4rem",
                            lineHeight: 2,
                        }}
                    >
                        {/*버튼*/}
                        <div style={{display: "flex", gap: "0.75rem"}}>
                            <LightButton path="/projects" value="프로젝트 보러가기"/>
                        </div>
                    </div>
                </div>
            </section>


            {/* 3. 요소 아이템 */}
            <div style={{fontSize: "2rem", fontWeight: 700, marginBottom: "1.5rem"}}>
                Features
            </div>
            <section style={{display: "grid", gap: "1rem", gridTemplateColumns: "1fr 1fr 1fr", marginBottom: "5rem"}}>
                <div
                    style={{
                        border: "1px solid #eee",
                        borderRadius: "8px",
                        padding: "1rem",
                    }}
                >
                    <h3 style={{fontSize: "1.2rem", fontWeight: 600, marginBottom: "0.5rem"}}>
                        <p>CI/CD 파이프라인</p>
                    </h3>
                    <div style={{fontSize: "0.9rem", color: "#555", lineHeight: 1.5}}>
                        <p>GitHub Webhook → Jenkins → Docker Hub → kubernetes 순으로 배포 파이프라인을 구축하여,
                            브랜치에 따라 dev, staging, prod 향 환경설정으로 컨테이너 이미지 빌드 및 배포까지 이어지도록 구성하였습니다.</p>
                        <p>브랜치 전략은</p>
                    </div>
                </div>
                <div
                    style={{
                        border: "1px solid #eee",
                        borderRadius: "8px",
                        padding: "1rem",
                    }}
                >
                    <h3 style={{fontSize: "1.2rem", fontWeight: 600, marginBottom: "0.5rem"}}>
                        <p>MSA + Security Module</p>
                    </h3>
                    <div style={{fontSize: "0.9rem", color: "#555", lineHeight: 1.5}}>
                        <p>OAuth2.0 JWT 기반 인증을 적용한 통합 로그인 서버를 별도 구현하였으며, 비대칭키로 암호화된 토큰을 발급/재발급 할 수 있습니다.</p>
                        <p>각 MSA Service는 공통 보안 모듈을 import하여 filterChain을 적용하는 형태로 공개키만 가지고 요청헤더의 토큰을
                            검증/인가하도록 구현하여
                            여러 마이크로서비스에서 공통으로 사용할 수 있는 보안 레이어를 설계하였습니다.</p>
                        <p>BFF(Backend For Frontend) Server를 통해 내부 대역 IP로만 토큰 발급 및 재발급이 가능하며
                            Front에서 BFF로 요청할때는 JS Security가 적용된 쿠키/세션 방식으로 로그인을 수행합니다.</p>
                    </div>
                </div>
                <div
                    style={{
                        border: "1px solid #eee",
                        borderRadius: "8px",
                        padding: "1rem",
                    }}
                >
                    <h3 style={{fontSize: "1.2rem", fontWeight: 600, marginBottom: "0.5rem"}}>
                        <p>Home-Lab Kubernetes</p>
                    </h3>
                    <div style={{fontSize: "0.9rem", color: "#555", lineHeight: 1.5}}>
                        <p>
                            로컬 하드웨어 위에서 kubernetes 기반의 멀티 노드 클러스터를 구성하고,
                            Redis, Kafka, DB 등 인프라를 컨테이너로 운영하며 실제 서비스와
                            유사한 인프라 환경에서 서비스를 구현하고자 하였습니다.
                        </p>
                    </div>
                </div>
                <div
                    style={{
                        border: "1px solid #eee",
                        borderRadius: "8px",
                        padding: "1rem",
                    }}
                >
                    <h3 style={{fontSize: "1.2rem", fontWeight: 600, marginBottom: "0.5rem"}}>
                        <p>통합 자산 관리 서비스</p>
                    </h3>
                    <div style={{fontSize: "0.9rem", color: "#555", lineHeight: 1.5}}>
                        <p>각 MSA 서비스에서 필요로하는 이미지, 동영상, 파일 리소스는 AWS S3로 직접 업로드/다운로드 하도록 구성하였고,
                            S3 Storage와 연동된 fhk-asset-service 를 공통적으로 이용하여 자산을 추적하고 재활용이 가능하도록 설계하였습니다.</p>
                    </div>
                </div>
                <div
                    style={{
                        border: "1px solid #eee",
                        borderRadius: "8px",
                        padding: "1rem",
                    }}
                >
                    <h3 style={{fontSize: "1.2rem", fontWeight: 600, marginBottom: "0.5rem"}}>
                        <p>Feature </p>
                    </h3>
                    <div style={{fontSize: "0.9rem", color: "#555", lineHeight: 1.5}}>
                        <p>content</p>
                    </div>
                </div>
                <div
                    style={{
                        border: "1px solid #eee",
                        borderRadius: "8px",
                        padding: "1rem",
                    }}
                >
                    <h3 style={{fontSize: "1.2rem", fontWeight: 600, marginBottom: "0.5rem"}}>
                        <p>Feature </p>
                    </h3>
                    <div style={{fontSize: "0.9rem", color: "#555", lineHeight: 1.5}}>
                        <p>content</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
