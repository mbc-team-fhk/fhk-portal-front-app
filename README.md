# FHK Portal

MSA 기반 영화 예매/결제 포트폴리오의 메인 입구입니다. React 프론트엔드에서 프로젝트 소개, 팀 역할, 인증 흐름, 좌석 예매/결제 데모를 한 화면 흐름으로 확인할 수 있도록 구성했습니다.

## Overview

- 프론트엔드: React 19, TypeScript, Vite
- API 진입점: BFF 서버를 통한 `/api/**` 라우팅
- 배포: Docker image 기반 k3s 배포
- 주요 화면: 프로젝트 소개, 기술 스택, 기능 소개, 좌석 예매/결제 데모, 팀 소개

## Demo

- Production: https://fhk-team.org
- Production www: https://www.fhk-team.org
- Staging: https://qa.fhk-team.org

## Architecture

```text
Browser
  -> fhk-portal-front-app
  -> /api/**
  -> fhk-bff-server
  -> security / ticketing / asset / other services
```

프론트엔드는 인증 토큰을 직접 보관하지 않고, BFF가 HttpOnly cookie 기반으로 access token과 refresh token을 관리합니다. 보호 API는 BFF를 통해 각 서비스로 전달됩니다.

## Repository Map

| Repository | Role | Status |
| --- | --- | --- |
| [fhk-portal-front-app](https://github.com/mbc-team-fhk/fhk-portal-front-app) | 메인 포털 프론트엔드 | Active |
| [fhk-bff-server](https://github.com/mbc-team-fhk/fhk-bff-server) | JWT cookie 관리와 API 라우팅 | Active |
| [fhk-security-server](https://github.com/mbc-team-fhk/fhk-security-server) | 중앙 로그인 서버 | Active |
| [fhk-ticket-reservation](https://github.com/mbc-team-fhk/fhk-ticket-reservation) | 좌석 예매/결제 흐름 서비스 | Active |
| [fhk-security-core](https://github.com/mbc-team-fhk/fhk-security-core) | 공통 인증 정책 모듈 | Module |
| [fhk-common](https://github.com/mbc-team-fhk/fhk-common) | 공통 응답/예외/로깅 모듈 | Module |

## Key Screens

- About: Notion 스타일의 프로젝트 개요와 아키텍처 문서
- Features: 인증, 예매/결제, 파일 자산 관리 예정 기능 정리
- Projects: 좌석 예매 정상/실패 흐름, 락 경합, 봇 트래픽 결과
- Team: 팀원 역할, 기술 스택, GitHub 링크

## Run Locally

```bash
npm install
npm run dev
```

기본 API 주소는 `http://localhost:4000`입니다. 다른 BFF 주소를 사용할 때는 `.env`에 설정합니다.

```env
VITE_API_BASE_URL=http://localhost:4000
```
