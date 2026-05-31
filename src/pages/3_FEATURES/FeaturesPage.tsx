import {useRef, useState, type PointerEvent, type WheelEvent} from "react";
import { MediaTabs, type MediaTabItem } from "../../components/common/PortalDisplay.tsx";

type ArchitectureView = {
    scale: number;
    x: number;
    y: number;
};

type ViewerPointer = {
    x: number;
    y: number;
};

type FeatureSummary = {
    id: string;
    label: string;
    title: string;
    summary: string;
    detail: string;
    mediaTabs: MediaTabItem[];
};

const MIN_ARCHITECTURE_SCALE = 1;
const MAX_ARCHITECTURE_SCALE = 3.2;
const ARCHITECTURE_ZOOM_STEP = 0.4;

const initialArchitectureView: ArchitectureView = {
    scale: MIN_ARCHITECTURE_SCALE,
    x: 0,
    y: 0,
};

function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
}

function getDistance(first: ViewerPointer, second: ViewerPointer) {
    return Math.hypot(first.x - second.x, first.y - second.y);
}

const features: FeatureSummary[] = [
    {
        id: "cicd",
        label: "Feature 1",
        title: "CI/CD 자동화",
        summary: "브랜치 전략과 배포 환경을 연결한 자동화 파이프라인",
        detail: "GitHub Webhook, Jenkins, Docker Hub, k3s 배포까지 이어지는 흐름을 구성했습니다. 브랜치별 배포 환경을 분리해 dev, staging, prod 흐름을 명확히 했습니다.",
        mediaTabs: [
            {
                label: "Jenkins",
                src: "/images/home/slide/4.%20jenkins%20cicd.png",
                caption: "Jenkins 파이프라인에서 빌드와 배포 흐름을 확인합니다.",
                alt: "Jenkins CI/CD pipeline screenshot",
            },
            {
                label: "k3s",
                src: "/images/home/slide/3.%20k3s%20cluster.png",
                caption: "배포 이후 k3s 클러스터에서 서비스 상태를 검증합니다.",
                alt: "k3s cluster status screenshot",
            },
        ],
    },
    {
        id: "security",
        label: "Feature 2",
        title: "중앙 인증 구조",
        summary: "중앙 인증 서버 + 공통 보안 모듈 기반의 인증/인가 처리",
        detail: "각 서비스에 인증 로직을 중복 구현하지 않고, 중앙 인증 서버가 토큰 발급을 담당하도록 분리했습니다. 서비스는 공통 보안 모듈을 통해 토큰 검증과 권한 검사를 수행합니다.",
        mediaTabs: [
            {
                label: "Services",
                src: "/images/home/slide/5.%20msa%20services.png",
                caption: "인증 서버와 서비스 모듈이 분리된 MSA 구성을 확인합니다.",
                alt: "MSA services screenshot",
            },
        ],
    },
    {
        id: "asset",
        label: "Feature 3",
        title: "파일 자산 관리 (예정)",
        summary: "S3 저장소와 메타데이터를 분리한 공통 업로드 구조",
        detail: "업로드 파일을 각 서비스에 분산 저장하지 않고 공통 자산 서비스로 분리했습니다. S3 저장소와 메타데이터 관리를 나누어 재사용성과 추적 가능성을 확보했습니다.",
        mediaTabs: [
            {
                label: "Platform",
                src: "/images/home/slide/6.%20platform%20layer.png",
                caption: "공유 플랫폼 계층에서 저장소와 메시징 컴포넌트를 함께 운영합니다.",
                alt: "Platform layer screenshot",
            },
        ],
    },
    {
        id: "infra",
        label: "Feature 4",
        title: "Home-Lab 인프라 운영",
        summary: "로컬 하드웨어 기반의 멀티 노드 서비스 운영 환경",
        detail: "Hyper-V VM 위에 k3s 클러스터를 구성하고 Redis, Kafka, MariaDB, Jenkins, Traefik을 함께 운영했습니다. 제한된 자원 안에서 배포, 라우팅, 인증, 메시징, 데이터 저장 흐름을 직접 검증했습니다.",
        mediaTabs: [
            {
                label: "Hyper-V",
                src: "/images/home/slide/2.%20hyper-v%20vm.png",
                caption: "Hyper-V VM 위에서 홈랩 기반 서버 구성을 운영합니다.",
                alt: "Hyper-V VM screenshot",
            },
            {
                label: "Cluster",
                src: "/images/home/slide/3.%20k3s%20cluster.png",
                caption: "k3s 클러스터의 노드와 파드 상태를 확인합니다.",
                alt: "k3s cluster screenshot",
            },
            {
                label: "Platform",
                src: "/images/home/slide/6.%20platform%20layer.png",
                caption: "Kafka, Redis 등 공통 플랫폼 컴포넌트를 VM 환경에서 검증합니다.",
                alt: "Kafka and platform layer screenshot",
            },
        ],
    },
];

export default function FeaturesPage() {
    const [architectureView, setArchitectureView] = useState<ArchitectureView>(initialArchitectureView);
    const architectureViewRef = useRef<ArchitectureView>(initialArchitectureView);
    const architectureViewerRef = useRef<HTMLDivElement | null>(null);
    const activePointersRef = useRef(new Map<number, ViewerPointer>());
    const panGestureRef = useRef<{ startX: number; startY: number; x: number; y: number } | null>(null);
    const pinchGestureRef = useRef<{ distance: number; scale: number } | null>(null);

    const clampArchitectureView = (nextView: ArchitectureView): ArchitectureView => {
        const scale = clamp(nextView.scale, MIN_ARCHITECTURE_SCALE, MAX_ARCHITECTURE_SCALE);
        const viewer = architectureViewerRef.current;

        if (!viewer || scale <= MIN_ARCHITECTURE_SCALE) {
            return {
                scale: MIN_ARCHITECTURE_SCALE,
                x: 0,
                y: 0,
            };
        }

        const maxX = (viewer.clientWidth * (scale - 1)) / 2;
        const maxY = (viewer.clientHeight * (scale - 1)) / 2;

        return {
            scale,
            x: clamp(nextView.x, -maxX, maxX),
            y: clamp(nextView.y, -maxY, maxY),
        };
    };

    const updateArchitectureView = (nextView: ArchitectureView | ((currentView: ArchitectureView) => ArchitectureView)) => {
        setArchitectureView((currentView) => {
            const resolvedView = typeof nextView === "function" ? nextView(currentView) : nextView;
            const clampedView = clampArchitectureView(resolvedView);
            architectureViewRef.current = clampedView;
            return clampedView;
        });
    };

    const zoomArchitecture = (amount: number) => {
        updateArchitectureView((currentView) => ({
            ...currentView,
            scale: currentView.scale + amount,
        }));
    };

    const resetArchitectureView = () => {
        updateArchitectureView(initialArchitectureView);
    };

    const handleArchitecturePointerDown = (event: PointerEvent<HTMLDivElement>) => {
        if (event.pointerType === "mouse" && event.button !== 0) {
            return;
        }

        event.currentTarget.setPointerCapture(event.pointerId);
        activePointersRef.current.set(event.pointerId, {
            x: event.clientX,
            y: event.clientY,
        });

        const activePointers = Array.from(activePointersRef.current.values());
        const currentView = architectureViewRef.current;

        if (activePointers.length === 1) {
            panGestureRef.current = {
                startX: event.clientX,
                startY: event.clientY,
                x: currentView.x,
                y: currentView.y,
            };
            pinchGestureRef.current = null;
            return;
        }

        if (activePointers.length === 2) {
            panGestureRef.current = null;
            pinchGestureRef.current = {
                distance: getDistance(activePointers[0], activePointers[1]),
                scale: currentView.scale,
            };
        }
    };

    const handleArchitecturePointerMove = (event: PointerEvent<HTMLDivElement>) => {
        if (!activePointersRef.current.has(event.pointerId)) {
            return;
        }

        activePointersRef.current.set(event.pointerId, {
            x: event.clientX,
            y: event.clientY,
        });

        const activePointers = Array.from(activePointersRef.current.values());

        if (activePointers.length >= 2 && pinchGestureRef.current) {
            event.preventDefault();
            const nextDistance = getDistance(activePointers[0], activePointers[1]);
            const nextScale = pinchGestureRef.current.scale * (nextDistance / pinchGestureRef.current.distance);

            updateArchitectureView((currentView) => ({
                ...currentView,
                scale: nextScale,
            }));
            return;
        }

        const currentView = architectureViewRef.current;
        if (currentView.scale <= MIN_ARCHITECTURE_SCALE || !panGestureRef.current) {
            return;
        }

        event.preventDefault();
        updateArchitectureView({
            scale: currentView.scale,
            x: panGestureRef.current.x + event.clientX - panGestureRef.current.startX,
            y: panGestureRef.current.y + event.clientY - panGestureRef.current.startY,
        });
    };

    const handleArchitecturePointerEnd = (event: PointerEvent<HTMLDivElement>) => {
        activePointersRef.current.delete(event.pointerId);

        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }

        const activePointers = Array.from(activePointersRef.current.values());
        const currentView = architectureViewRef.current;

        if (activePointers.length === 1) {
            panGestureRef.current = {
                startX: activePointers[0].x,
                startY: activePointers[0].y,
                x: currentView.x,
                y: currentView.y,
            };
            pinchGestureRef.current = null;
            return;
        }

        panGestureRef.current = null;
        pinchGestureRef.current = null;
    };

    const handleArchitectureWheel = (event: WheelEvent<HTMLDivElement>) => {
        if (!event.ctrlKey && !event.metaKey) {
            return;
        }

        event.preventDefault();
        updateArchitectureView((currentView) => ({
            ...currentView,
            scale: currentView.scale - event.deltaY * 0.002,
        }));
    };

    const handleArchitectureDoubleClick = () => {
        if (architectureViewRef.current.scale > MIN_ARCHITECTURE_SCALE) {
            resetArchitectureView();
            return;
        }

        updateArchitectureView({
            scale: 2,
            x: 0,
            y: 0,
        });
    };

    return (
        <div className="shell section-page features-page">
            <div className="section-heading centered">
                <h1>Home-Lab 기반의 MSA 인프라</h1>
                <p>개발, 인증, 배포, 운영 흐름을 하나의 구조로 연결하고</p>
                <p>MSA 기반 백엔드 서비스를 반복적으로 개발하고 검증할 수 있는 환경을 구축했습니다.</p>
                <br/>
                <br/>
            </div>


            <section className="architecture-overview" aria-labelledby="architecture-overview-title">
                <div className="section-heading centered architecture-overview-heading">
                    <span className="eyebrow">Architecture</span>
                    <h2 id="architecture-overview-title">전체 인프라 아키텍처</h2>
                    <p>DEV → CI/CD → Registry → k3s → Staging/Production → Shared Data VM까지 이어지는 구조입니다.</p>
                </div>
                <figure className="architecture-diagram-frame">
                    <div
                        ref={architectureViewerRef}
                        className={`architecture-diagram-viewer ${architectureView.scale > MIN_ARCHITECTURE_SCALE ? "is-zoomed" : ""}`}
                        tabIndex={0}
                        aria-label="FHK Home-Lab Kubernetes Deployment Architecture diagram"
                        onPointerDown={handleArchitecturePointerDown}
                        onPointerMove={handleArchitecturePointerMove}
                        onPointerUp={handleArchitecturePointerEnd}
                        onPointerCancel={handleArchitecturePointerEnd}
                        onWheel={handleArchitectureWheel}
                        onDoubleClick={handleArchitectureDoubleClick}
                    >
                        <img
                            className="architecture-diagram-image"
                            src="/images/features/architecture-diagram.png"
                            alt="FHK Home-Lab Kubernetes Deployment Architecture"
                            draggable={false}
                            style={{
                                transform: `translate3d(${architectureView.x}px, ${architectureView.y}px, 0) scale(${architectureView.scale})`,
                            }}
                        />
                    </div>
                    <div className="architecture-zoom-controls" aria-label="아키텍처 이미지 확대 축소">
                        <button
                            type="button"
                            className="architecture-zoom-button"
                            aria-label="아키텍처 이미지 축소"
                            disabled={architectureView.scale <= MIN_ARCHITECTURE_SCALE}
                            onClick={() => zoomArchitecture(-ARCHITECTURE_ZOOM_STEP)}
                        >
                            -
                        </button>
                        <button
                            type="button"
                            className="architecture-zoom-button"
                            aria-label="아키텍처 이미지 전체보기"
                            disabled={architectureView.scale <= MIN_ARCHITECTURE_SCALE}
                            onClick={resetArchitectureView}
                        >
                            1x
                        </button>
                        <button
                            type="button"
                            className="architecture-zoom-button"
                            aria-label="아키텍처 이미지 확대"
                            disabled={architectureView.scale >= MAX_ARCHITECTURE_SCALE}
                            onClick={() => zoomArchitecture(ARCHITECTURE_ZOOM_STEP)}
                        >
                            +
                        </button>
                    </div>
                </figure>
            </section>

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
                        <div className="spotlight-visual-panel feature-media-panel">
                            <MediaTabs
                                tabs={feature.mediaTabs}
                                ariaLabel={`${feature.title} 미디어`}
                                fallback={(
                                    <div className="spotlight-visual-card accent-card">
                                        <div className="spotlight-visual-title">{feature.label}</div>
                                        <div className="spotlight-visual-body">{feature.title}</div>
                                    </div>
                                )}
                            />
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
