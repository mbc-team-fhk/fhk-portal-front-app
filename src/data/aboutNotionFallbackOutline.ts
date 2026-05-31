import type { AboutSectionGroup, AboutSectionItem } from "../utils/aboutOutlineApi";

const tmpLink = "https://alabaster-calendula-c54.notion.site/ebd//35d5db377ef880e2b1a3d96c29c0a69f";

const createSection = (text: string, notionLink = tmpLink): AboutSectionItem => ({
    type: "SECTION",
    text,
    notionLink,
});

export const fallbackSectionGroups: AboutSectionGroup[] = [
    {
        sectionGroup: {
            title: "Introduction",
            sectionItems: [
                createSection("프로젝트 소개", "https://alabaster-calendula-c54.notion.site/ebd//35d5db377ef880178da9cd9648a04c51"),
                createSection("포트폴리오 목적", "https://alabaster-calendula-c54.notion.site/ebd//35e5db377ef8807bbab6cf2af20093f3"),
                createSection("기술 목표", "https://alabaster-calendula-c54.notion.site/ebd//35e5db377ef880e09c49d151727163db"),
                createSection("기술 스택", "https://alabaster-calendula-c54.notion.site/ebd//35e5db377ef8807ea247ca488a3cab8d"),
            ],
        },
    },
    {
        sectionGroup: {
            title: "Architecture",
            sectionItems: [
                createSection("전체 아키텍처", "https://alabaster-calendula-c54.notion.site/ebd//35e5db377ef880cfa3bdd1077634738e"),
                {
                    text: "트래픽 / 요청 흐름",
                    type: "DROPDOWN",
                    subSectionItems: [
                        createSection("사용자 요청 흐름", "https://alabaster-calendula-c54.notion.site/ebd//35e5db377ef880ceb579c8b588c648c7"),
                        createSection("내부 서비스 라우팅", "https://alabaster-calendula-c54.notion.site/ebd//35e5db377ef8801ba967e0f3d5feb72a"),
                        createSection("파드 간 통신", "https://alabaster-calendula-c54.notion.site/ebd//35e5db377ef8807cb520f90de3111f03"),
                    ],
                },
                createSection("인증 경계", "https://alabaster-calendula-c54.notion.site/ebd//35e5db377ef880d0ad42f15a6242b6de"),
                createSection("서비스 책임 분리", "https://alabaster-calendula-c54.notion.site/ebd//35e5db377ef88042984ccc417ce6f758"),
                createSection("배포 / 운영 구조", "https://alabaster-calendula-c54.notion.site/ebd//35e5db377ef8808892f1c70a074a2119"),
            ],
        },
    },
    {
        sectionGroup: {
            title: "Core Implementations",
            sectionItems: [
                {
                    text: "통합 인증 / BFF",
                    type: "DROPDOWN",
                    subSectionItems: [
                        createSection("Overview", "https://alabaster-calendula-c54.notion.site/ebd//35e5db377ef88089a500c634769df6a2"),
                        createSection("Central Security Server", "https://alabaster-calendula-c54.notion.site/ebd//35e5db377ef8809d9ab7cdf8aca527c2"),
                        createSection("RSA JWT", "https://alabaster-calendula-c54.notion.site/ebd//35e5db377ef8800aa5e0dac150d32905"),
                        createSection("Security Core Module", "https://alabaster-calendula-c54.notion.site/ebd//35e5db377ef88057bfe6e3d99518606d"),
                        createSection("BFF Token Handling", "https://alabaster-calendula-c54.notion.site/ebd//35e5db377ef880cfa718c176d1411fca"),
                    ],
                },
                {
                    text: "좌석 예매 / 결제",
                    type: "DROPDOWN",
                    subSectionItems: [
                        createSection("Overview", "https://alabaster-calendula-c54.notion.site/ebd//35e5db377ef88012b9c2cd43b694a312"),
                        createSection("좌석 점유 / 중복 예약 방지", "https://alabaster-calendula-c54.notion.site/ebd//35e5db377ef880779747e53f1765307e"),
                        createSection("결제 정합성", "https://alabaster-calendula-c54.notion.site/ebd//35e5db377ef8804bab67d1ac784d0ef0"),
                        createSection("정합성 검증 / 부하 테스트", "https://alabaster-calendula-c54.notion.site/ebd//35e5db377ef880adb1a7e36d6132ba5d"),
                    ],
                },
            ],
        },
    },
    {
        sectionGroup: {
            title: "Troubleshooting",
            sectionItems: [
                {
                    text: "Backend / Security",
                    type: "DROPDOWN",
                    subSectionItems: [
                        createSection("Security Filter 중복 등록", "https://alabaster-calendula-c54.notion.site/ebd//35f5db377ef88005aed3f1c554745756"),
                        createSection("예약번호 / 결제번호 충돌", "https://alabaster-calendula-c54.notion.site/ebd//35f5db377ef8807ca108f2920319fe74"),
                        createSection("좌석 중복 선점", "https://alabaster-calendula-c54.notion.site/ebd//35f5db377ef8803d90e4e72309c7a065"),
                        createSection("결제 콜백 중복 처리", "https://alabaster-calendula-c54.notion.site/ebd//35f5db377ef88005a71ce96697134388"),
                    ],
                },
                {
                    text: "Infra / DevOps",
                    type: "DROPDOWN",
                    subSectionItems: [
                        createSection("Kubernetes Pending / OOMKilled", "https://alabaster-calendula-c54.notion.site/ebd//35f5db377ef880db91aad60fadbf6c42"),
                        createSection("MariaDB Connection", "https://alabaster-calendula-c54.notion.site/ebd//35f5db377ef8803494bdde93f17c17ed"),
                        createSection("로그 가시성 / SPOF", "https://alabaster-calendula-c54.notion.site/ebd//35f5db377ef88045a468cb21b0a68da2"),
                    ],
                },
            ],
        },
    },
    {
        sectionGroup: {
            title: "Insights",
            sectionItems: [
                {
                    text: "Backend",
                    type: "DROPDOWN",
                    subSectionItems: [
                        createSection("Request Flow", "https://alabaster-calendula-c54.notion.site/ebd//35f5db377ef8800bace2dfb44572e0a6"),
                        createSection("Security Flow", "https://alabaster-calendula-c54.notion.site/ebd//35f5db377ef880f28657f8658a80dd4b"),
                        createSection("Transaction Boundary", "https://alabaster-calendula-c54.notion.site/ebd//35f5db377ef880ae9a9accb9f88f7a6b"),
                    ],
                },
                {
                    text: "Data Consistency",
                    type: "DROPDOWN",
                    subSectionItems: [
                        createSection("Idempotency", "https://alabaster-calendula-c54.notion.site/ebd//35f5db377ef880229ec0fca499f723f4"),
                        createSection("DB Constraint", "https://alabaster-calendula-c54.notion.site/ebd//35f5db377ef8808bb4a7fcd6b703f323"),
                        createSection("분산 트랜잭션 한계", "https://alabaster-calendula-c54.notion.site/ebd//35f5db377ef88025845ac0a014a1c972"),
                    ],
                },
                {
                    text: "Infra / DevOps",
                    type: "DROPDOWN",
                    subSectionItems: [
                        createSection("Resource requests / limits", "https://alabaster-calendula-c54.notion.site/ebd//35f5db377ef88000a344d2cdbcb05e5e"),
                        createSection("Rolling Update", "https://alabaster-calendula-c54.notion.site/ebd//35f5db377ef8808f8f16c6ee366d9362"),
                        createSection("오버엔지니어링 판단", "https://alabaster-calendula-c54.notion.site/ebd//35f5db377ef880269e4ed531bb9c710d"),
                    ],
                },
            ],
        },
    },
    {
        sectionGroup: {
            title: "Next Steps",
            sectionItems: [
                createSection("OAuth2/OIDC", "https://alabaster-calendula-c54.notion.site/ebd//35e5db377ef8806da307ed69728c09c0"),
                createSection("모니터링 / 알림", "https://alabaster-calendula-c54.notion.site/ebd//35e5db377ef880daa747ff5628ec2010"),
                createSection("테스트 자동화 고도화", "https://alabaster-calendula-c54.notion.site/ebd//35e5db377ef8806f91bfecc47ae1f575"),
                createSection("운영 문서화 / Runbook", "https://alabaster-calendula-c54.notion.site/ebd//35e5db377ef88016ac6ff24360564802"),
            ],
        },
    },
];
