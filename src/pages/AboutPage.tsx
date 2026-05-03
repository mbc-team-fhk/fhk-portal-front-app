import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const aboutSections = [
    {
        id: "about",
        title: "FHK에 대하여",
        document: `# FHK에 대하여

FHK는 백엔드 인프라와 서비스 운영 흐름을 실제로 설계하고 검증하기 위한 포털 프로젝트입니다.

단순한 CRUD 구현을 넘어 인증, 배포, 네트워크, 관측성, 운영 자동화까지 하나의 서비스 흐름 안에서 다루는 것을 목표로 합니다.

## 핵심 방향

- 서비스별 책임을 분리한 구조
- 프론트엔드와 백엔드 API의 명확한 계약
- 개발, 검증, 배포 환경의 단계적 분리
- 운영 과정에서 반복되는 작업의 자동화`,
    },
    {
        id: "environment",
        title: "개발 환경",
        document: `# 개발 환경

Frontend는 React와 Vite를 기반으로 구성하고, Backend는 Spring Boot 중심으로 구성합니다.

로컬 및 사설 인프라 환경에서는 Hyper-V VM, Ubuntu, Docker, k3s를 활용해 실제 배포 환경과 유사한 실험 환경을 유지합니다.

## 주요 구성

- React, TypeScript, Vite
- Spring Boot, JPA, QueryDSL
- Docker, k3s, Traefik
- Jenkins 기반 CI/CD
- cert-manager 기반 인증서 자동화`,
    },
    {
        id: "branch-strategy",
        title: "브랜치 전략",
        document: `# 브랜치 전략

브랜치는 개발 속도와 배포 안정성을 함께 가져갈 수 있도록 역할을 분리합니다.

## 브랜치 역할

- dev: 기능 개발 및 빠른 통합
- staging: 릴리즈 후보 검증
- prod: 운영 배포 기준

기능 단위 작업은 별도 브랜치에서 진행하고, 검증된 변경만 상위 브랜치로 병합합니다.`,
    },
    {
        id: "architecture",
        title: "아키텍쳐",
        document: `# 아키텍쳐

FHK는 프론트엔드, BFF, 백엔드 서비스, 공통 보안 모듈, 인프라 계층을 나누어 확장 가능한 구조를 지향합니다.

## 설계 관점

- 프론트엔드는 사용자 흐름과 화면 상태에 집중
- BFF는 화면 요구사항에 맞춘 API 조합 담당
- 백엔드는 도메인 책임을 기준으로 분리
- 인증과 보안 정책은 공통 모듈에서 일관되게 관리
- Redis, Kafka, S3 등은 서비스 흐름에 필요한 보조 인프라로 배치`,
    },
    {
        id: "goal",
        title: "향후 목표",
        document: `# 향후 목표

향후에는 운영 안정성과 자동화 수준을 높이는 방향으로 프로젝트를 확장합니다.

## 개선 과제

- 관측성 강화
- 테스트 자동화 확대
- 이벤트 기반 처리 흐름 고도화
- 배포 안정성 개선
- 운영 문서와 장애 대응 절차 정리`,
    },
];

export default function AboutPage() {
    const { hash, pathname } = useLocation();
    const navigate = useNavigate();
    const defaultSectionId = aboutSections[0].id;
    const hashSectionId = hash.replace("#", "");
    const initialSectionId = aboutSections.some((section) => section.id === hashSectionId)
        ? hashSectionId
        : defaultSectionId;
    const [selectedId, setSelectedId] = useState(initialSectionId);
    const [documents, setDocuments] = useState(() =>
        Object.fromEntries(aboutSections.map((section) => [section.id, section.document])),
    );
    const selectedSection = useMemo(
        () => aboutSections.find((section) => section.id === selectedId) ?? aboutSections[0],
        [selectedId],
    );

    useEffect(() => {
        const nextId = aboutSections.some((section) => section.id === hashSectionId)
            ? hashSectionId
            : defaultSectionId;

        setSelectedId(nextId);

        if (!hash || nextId !== hashSectionId) {
            navigate(`${pathname}#${nextId}`, { replace: true });
        }
    }, [defaultSectionId, hash, hashSectionId, navigate, pathname]);

    const handleSelect = (sectionId: string) => {
        setSelectedId(sectionId);
        navigate(`${pathname}#${sectionId}`, { replace: false });
    };

    const handleDocumentChange = (value: string) => {
        setDocuments((currentDocuments) => ({
            ...currentDocuments,
            [selectedSection.id]: value,
        }));
    };

    return (
        <div className="shell section-page about-page">
            <aside className="about-sidebar" aria-label="About 목차">
                <div className="about-toc-panel">
                    <h1>About</h1>
                    <nav className="about-toc-nav">
                        {aboutSections.map((section) => (
                            <button
                                key={section.id}
                                type="button"
                                className={`about-toc-button${selectedId === section.id ? " selected" : ""}`}
                                onClick={() => handleSelect(section.id)}
                            >
                                <span>{section.title}</span>
                            </button>
                        ))}
                    </nav>
                </div>
            </aside>

            <main className="about-document-panel">
                <div className="about-document-header">
                    <span className="eyebrow">FHK Documentation</span>
                    <h2>{selectedSection.title}</h2>
                </div>
                <textarea
                    className="about-document-editor"
                    aria-label={`${selectedSection.title} 문서영역`}
                    value={documents[selectedSection.id]}
                    onChange={(event) => handleDocumentChange(event.target.value)}
                    spellCheck={false}
                />
            </main>
        </div>
    );
}
