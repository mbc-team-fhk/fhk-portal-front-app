import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";

const quickFeatures = [
    {
        step: "01",
        title: "배포 자동화",
        summary: "개발부터 배포까지 연결된 흐름",
        toneClass: "feature-preview-step-cicd",
        visual: "pipeline",
    },
    {
        step: "02",
        title: "중앙 인증",
        summary: "BFF와 보안 서버 중심 구조",
        toneClass: "feature-preview-step-auth",
        visual: "shield",
    },
    {
        step: "03",
        title: "운영 분리",
        summary: "dev · staging · prod 환경 구성",
        toneClass: "feature-preview-step-env",
        visual: "stack",
    },
    {
        step: "04",
        title: "파일 자산 관리",
        summary: "업로드 · 저장 · 메타데이터 관리",
        toneClass: "feature-preview-step-assets",
        visual: "assets",
    },
];

const heroSlides = [
    {
        title: "Home-Lab Based MSA",
        toneClass: "tone-home-lab",
        imageUrl: "/images/home/slide/1.%20home-lab%20based%20msa.jpg",
    },
    {
        title: "Hyper-V VM",
        toneClass: "tone-hyperv",
        imageUrl: "/images/home/slide/2.%20hyper-v%20vm.png",
    },
    {
        title: "k3s Cluster",
        toneClass: "tone-k3s",
        imageUrl: "/images/home/slide/3.%20k3s%20cluster.png",
    },
    {
        title: "Jenkins CI/CD",
        toneClass: "tone-jenkins",
        imageUrl: "/images/home/slide/4.%20jenkins%20cicd.png",
    },
    {
        title: "MSA Services",
        toneClass: "tone-security",
        imageUrl: "/images/home/slide/5.%20msa%20services.png",
    },
    {
        title: "Platform Layer",
        toneClass: "tone-platform",
        imageUrl: "/images/home/slide/6.%20platform%20layer.png",
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
                        <br />
                        <br />
                        <h1>Feature Preview</h1>
                        <p>MSA 기반의 서비스 개발 환경을 만들고자 하였습니다.</p>
                        <p>확장성과 모듈화를 고려한 인프라를 기반으로 지속적인 개발 및 검증을 수행합니다.</p>
                        <br />
                    </div>
                    <div className="feature-preview-banner">
                        <div className="feature-preview-flow" aria-hidden="true" />
                        <div className="feature-preview-grid">
                            {quickFeatures.map((item) => (
                                <article
                                    key={item.title}
                                    className={`feature-preview-step ${item.toneClass}`}
                                >
                                    <div className="feature-preview-step-head">
                                        <div className="feature-preview-step-visual" aria-hidden="true">
                                            <div className={`feature-preview-visual-figure feature-visual-${item.visual}`}>
                                                {item.visual === "pipeline" ? (
                                                    <div className="feature-visual-pipeline">
                                                        <span />
                                                        <span />
                                                        <span />
                                                    </div>
                                                ) : null}
                                                {item.visual === "shield" ? (
                                                    <div className="feature-visual-shield">
                                                        <div className="feature-visual-shield-core" />
                                                        <div className="feature-visual-shield-lock" />
                                                    </div>
                                                ) : null}
                                                {item.visual === "stack" ? (
                                                    <div className="feature-visual-stack">
                                                        <span>dev</span>
                                                        <span>staging</span>
                                                        <span>prod</span>
                                                    </div>
                                                ) : null}
                                                {item.visual === "assets" ? (
                                                    <div className="feature-visual-assets">
                                                        <div className="feature-visual-folder" />
                                                        <div className="feature-visual-cylinder" />
                                                        <div className="feature-visual-cloud" />
                                                    </div>
                                                ) : null}
                                            </div>
                                        </div>
                                        <span className="feature-preview-step-number">{item.step}</span>
                                    </div>
                                    <h3>{item.title}</h3>
                                    <p>{item.summary}</p>
                                </article>
                            ))}
                        </div>
                        <div className="feature-preview-cta">
                            <div className="feature-preview-cta-copy">
                                <span className="feature-preview-cta-kicker">Architecture Detail</span>
                                <strong>핵심 흐름과 구현 배경 더 보기</strong>
                            </div>
                            <Link to="/features" className="feature-preview-cta-button">
                                feature 바로가기
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
                    <div className="boundary-panel">
                        <div className="boundary-grid">
                            <div className="boundary-box">
                            <h3>이 포트폴리오는 왜 만들었나요?</h3>
                            <p>FHK 팀의 목표, 개발 환경, 브랜치 전략, 아키텍쳐, 향후 목표를 확인하세요</p>
                            <Link to="/about-notion" className="text-link">바로가기</Link>
                        </div>
                        <div className="boundary-box">
                            <h3>빠른 프로젝트 살펴보기</h3>
                            <p>동시 티켓팅, 실시간 채팅 등 핵심기능을 살펴보고, 원한다면 테스트 계정을 통해 직접 시연에 참여할 수 있습니다.</p>
                            <Link to="/projects" className="text-link">바로가기</Link>
                        </div>
                    </div>
                </div>
            </div>
            </section>
        </div>
    );
}
