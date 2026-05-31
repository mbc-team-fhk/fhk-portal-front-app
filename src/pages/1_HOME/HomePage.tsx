import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";

const heroSlides = [
    {
        title: "Home-Lab Based MSA",
        toneClass: "tone-home-lab",
        imageUrl: "/images/home/slide/1.%20home-lab%20based%20msa.jpg",
        mobileImageUrl: "/images/home/slide/1-home-lab-based-msa-mobile.jpg",
        width: 4000,
        height: 3000,
    },
    {
        title: "Hyper-V VM",
        toneClass: "tone-hyperv",
        imageUrl: "/images/home/slide/2.%20hyper-v%20vm.png",
        width: 926,
        height: 685,
    },
    {
        title: "k3s Cluster",
        toneClass: "tone-k3s",
        imageUrl: "/images/home/slide/3.%20k3s%20cluster.png",
        width: 1188,
        height: 871,
    },
    {
        title: "Jenkins CI/CD",
        toneClass: "tone-jenkins",
        imageUrl: "/images/home/slide/4.%20jenkins%20cicd.png",
        width: 1132,
        height: 913,
    },
    {
        title: "MSA Services",
        toneClass: "tone-security",
        imageUrl: "/images/home/slide/5.%20msa%20services.png",
        width: 1544,
        height: 1040,
    },
    {
        title: "Platform Layer",
        toneClass: "tone-platform",
        imageUrl: "/images/home/slide/6.%20platform%20layer.png",
        width: 921,
        height: 554,
    },
];

const mobileSlideMediaQuery = "(max-width: 720px)";

const getPreferredSlideImageUrl = (slide: (typeof heroSlides)[number]) => {
    if (typeof window === "undefined") {
        return slide.imageUrl;
    }

    return window.matchMedia(mobileSlideMediaQuery).matches && slide.mobileImageUrl
        ? slide.mobileImageUrl
        : slide.imageUrl;
};

const nextRoutes = [
    {
        title: "이 포트폴리오는 왜 만들었나요?",
        description: "FHK 팀의 목표, 개발 환경, 브랜치 전략, 아키텍쳐, 향후 목표를 확인하세요",
        to: "/about-notion",
        actionLabel: "바로가기",
    },
    {
        title: "빠른 프로젝트 살펴보기",
        description: "동시 티켓팅, 실시간 채팅 등 핵심기능을 살펴보고, 원한다면 테스트 계정을 통해 직접 시연에 참여할 수 있습니다.",
        to: "/projects",
        actionLabel: "바로가기",
    },
];

export default function HomePage() {
    const [activeSlideIndex, setActiveSlideIndex] = useState(0);
    const slideTimerRef = useRef<number | null>(null);
    const activeSlide = heroSlides[activeSlideIndex];
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

    useEffect(() => {
        const nextSlide = heroSlides[(activeSlideIndex + 1) % heroSlides.length];
        const image = new Image();

        image.decoding = "async";
        image.src = getPreferredSlideImageUrl(nextSlide);
        void image.decode?.().catch(() => undefined);
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
                            <Link to="/projects" className="primary-button link-button">프로젝트 둘러보기</Link>
                        </div>
                    </div>

                    <div className="hero-slider-shell">
                        <div className={`hero-slider-stage ${activeSlide.toneClass}`}>
                            <picture>
                                {activeSlide.mobileImageUrl ? (
                                    <source media={mobileSlideMediaQuery} srcSet={activeSlide.mobileImageUrl} />
                                ) : null}
                                <img
                                    className="hero-slide-image"
                                    src={activeSlide.imageUrl}
                                    alt=""
                                    aria-hidden="true"
                                    width={activeSlide.width}
                                    height={activeSlide.height}
                                    decoding="async"
                                />
                            </picture>
                            <div className="hero-slide-caption">{activeSlide.title}</div>
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
                        <br />
                        <br />
                        <h1>Feature Preview</h1>
                        <p>MSA 기반의 서비스 개발 환경을 만들고자 하였습니다.</p>
                        <p>확장성과 모듈화를 고려한 인프라를 기반으로 지속적인 개발 및 검증을 수행합니다.</p>
                        <br />
                    </div>
                    <div className="feature-preview-banner">
                        <div className="feature-preview-image-scroll">
                            <img
                                className="feature-preview-image"
                                src="/images/home/feature-preview.png"
                                alt="배포 자동화, 중앙 인증, 운영 분리, 데이터 인프라를 보여주는 Feature Preview 구성도"
                                loading="lazy"
                            />
                        </div>
                        <div className="feature-preview-cta">
                            <div className="feature-preview-cta-copy">
                                <span className="feature-preview-cta-kicker">Architecture Detail</span>
                                <strong>핵심 흐름과 구현 배경 더 보기</strong>
                            </div>
                            <Link to="/features" className="feature-preview-cta-button">
                                features 바로가기
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <section className="boundary-section">
                <div className="shell">
                    <div className="section-heading centered home-more-heading">
                        <br/>
                        <h1>Next Route</h1>
                        <br/>
                    </div>
                    <div className="boundary-grid">
                        {nextRoutes.map((route) => (
                            <Link
                                key={route.to}
                                to={route.to}
                                className="boundary-box"
                                aria-label={`${route.title} ${route.actionLabel}`}
                            >
                                <h3>{route.title}</h3>
                                <p>{route.description}</p>
                                <span className="text-link">{route.actionLabel}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
