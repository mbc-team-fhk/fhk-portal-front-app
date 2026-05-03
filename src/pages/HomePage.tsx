import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";

const quickFeatures = [
    {
        title: "CI/CD 자동화",
        summary: "GitHub → Jenkins → Docker Hub → k3s 배포 흐름을 표준화해 개발부터 검증, 배포까지 이어지는 운영 루프를 정리했습니다.",
        toneClass: "feature-card-cicd",
        imageUrl: "/images/home/feature-cicd.jpg",
        cta: false,
    },
    {
        title: "인증/인가 통합 모듈",
        summary: "중앙 인증 서버와 공통 보안 모듈을 기준으로 토큰 발급과 서비스 검증 책임을 나눠 인증 흐름을 일관되게 유지했습니다.",
        toneClass: "feature-card-security",
        imageUrl: "/images/home/feature-security.jpg",
        cta: false,
    },
    {
        title: "자산 관리 일원화",
        summary: "S3와 asset-service 기반으로 업로드, 저장, 메타데이터 추적 흐름을 분리해 재사용 가능한 공통 자산 경로를 만들었습니다.",
        toneClass: "feature-card-asset",
        imageUrl: "/images/home/feature-asset.jpg",
        cta: false,
    },
    {
        title: "Features",
        summary: "핵심 아키텍처와 상세 구현 흐름을 정리한 페이지로 이동합니다.",
        toneClass: "feature-card-cta",
        cta: true,
        href: "/features",
    },
];

const heroSlides = [
    {
        title: "Home-Lab Based MSA",
        toneClass: "tone-home-lab",
        imageUrl: "/images/home/slide-home-lab.jpg",
    },
    {
        title: "Hyper-V VM",
        toneClass: "tone-hyperv",
        imageUrl: "/images/home/slide-hyperv.jpg",
    },
    {
        title: "k3s Cluster",
        toneClass: "tone-k3s",
        imageUrl: "/images/home/slide-k3s.jpg",
    },
    {
        title: "Jenkins CI/CD",
        toneClass: "tone-jenkins",
        imageUrl: "/images/home/slide-jenkins.jpg",
    },
    {
        title: "Security Server",
        toneClass: "tone-security",
        imageUrl: "/images/home/slide-security.jpg",
    },
    {
        title: "Redis · Kafka · S3",
        toneClass: "tone-platform",
        imageUrl: "/images/home/slide-platform.jpg",
    },
];

export default function HomePage() {
    const [activeSlideIndex, setActiveSlideIndex] = useState(0);
    const slideTimerRef = useRef<number | null>(null);
    const heroBackgroundStyle = {
        "--hero-background-image": "url('/images/home/hero-background.jpg')",
    } as CSSProperties;

    const resetSlideTimer = () => {
        if (slideTimerRef.current !== null) {
            window.clearTimeout(slideTimerRef.current);
        }

        slideTimerRef.current = window.setTimeout(() => {
            setActiveSlideIndex((prev) => (prev + 1) % heroSlides.length);
        }, 4200);
    };

    useEffect(() => {
        resetSlideTimer();

        return () => {
            if (slideTimerRef.current !== null) {
                window.clearTimeout(slideTimerRef.current);
            }
        };
    }, [activeSlideIndex]);

    const handleIndicatorClick = (index: number) => {
        setActiveSlideIndex(index);
    };

    return (
        <div>
            <section className="hero-section hero-section-reworked">
                <div className="hero-background-layer" aria-hidden="true">
                    <div className="hero-background-overlay" />
                    <div className="hero-background-placeholder" style={heroBackgroundStyle} />
                </div>

                <div className="shell hero-grid hero-grid-reworked">
                    <div className="hero-copy-panel">
                        <h1 className="hero-title hero-title-tight">
                            홈랩 기반의 MSA 포트폴리오 팀.
                            <br />
                            백엔드 중심 설계와 운영 흔적까지 보여주는 웹 앱 프론트 허브.
                        </h1>
                        <p className="hero-description hero-description-reworked">
                            Hyper-V 가상머신, k3s 클러스터, Jenkins CI/CD, 통합 인증 서버를 기반으로
                            다양한 요구 기능을 백엔드 중심으로 직접 설계·구현·배포하고
                            이를 포트폴리오 형태로 정리했습니다.
                        </p>
                        <div className="hero-actions">
                            <Link to="/features" className="primary-button link-button">Features 보기</Link>
                            <Link to="/projects" className="secondary-button link-button">Projects 보기</Link>
                        </div>
                    </div>

                    <div className="hero-slider-shell">
                        <div className={`hero-slider-stage ${heroSlides[activeSlideIndex].toneClass}`}>
                            <img
                                className="hero-slide-image"
                                src={heroSlides[activeSlideIndex].imageUrl}
                                alt=""
                                aria-hidden="true"
                            />
                            <div className="hero-slide-caption">{heroSlides[activeSlideIndex].title}</div>
                        </div>
                        <div className="hero-indicators" aria-label="Hero slides">
                            {heroSlides.map((slide, index) => (
                                <button
                                    key={slide.title}
                                    type="button"
                                    className={`hero-indicator ${index === activeSlideIndex ? "active" : ""}`}
                                    onClick={() => handleIndicatorClick(index)}
                                    aria-label={`${slide.title} 보기`}
                                    aria-pressed={index === activeSlideIndex}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="jump-section feature-preview-section">
                <div className="shell">
                    <div className="section-heading centered feature-preview-heading">
                        <h2>Feature Preview</h2>
                    </div>
                    <div className="shortcut-grid feature-preview-grid">
                        {quickFeatures.map((item) => {
                            if (item.cta) {
                                return (
                                    <Link
                                        key={item.title}
                                        to={item.href!}
                                        className={`shortcut-card feature-preview-card ${item.toneClass} feature-preview-card-cta`}
                                    >
                                        <div className="feature-preview-visual" aria-hidden="true">
                                            <div className="feature-preview-arrow">→</div>
                                        </div>
                                        <h3>{item.title}</h3>
                                        <p>{item.summary}</p>
                                        <div className="feature-preview-cta-label">바로가기</div>
                                    </Link>
                                );
                            }

                            return (
                                <article
                                    key={item.title}
                                    className={`shortcut-card feature-preview-card ${item.toneClass}`}
                                >
                                    <div className="feature-preview-visual" aria-hidden="true">
                                        <img className="feature-preview-image" src={item.imageUrl} alt="" />
                                    </div>
                                    <h3>{item.title}</h3>
                                    <p>{item.summary}</p>
                                </article>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section className="boundary-section">
                <div className="shell boundary-panel">
                    <div className="section-heading centered">
                        <div className="eyebrow"><h2>More</h2></div>
                    </div>
                    <div className="boundary-grid">
                        <div className="boundary-box">
                            <h3>이 포트폴리오는 왜 만들었나요?</h3>
                            <p>FHK 팀의 목표, 개발 환경, 브랜치 전략, 아키텍쳐, 향후 목표를 확인하세요</p>
                            <Link to="/about" className="text-link">바로가기</Link>
                        </div>
                        <div className="boundary-box">
                            <h3>빠른 프로젝트 살펴보기</h3>
                            <p>동시 티켓팅, 실시간 채팅 등 핵심기능을 살펴보고, 원한다면 테스트 계정을 통해 직접 시연에 참여할 수 있습니다.</p>
                            <Link to="/projects" className="text-link">바로가기</Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
