export type TechStackTone =
    | "spring"
    | "database"
    | "cache"
    | "storage"
    | "event"
    | "infra"
    | "frontend"
    | "language"
    | "pipeline"
    | "query"
    | "ide"
    | "default";

export type TechStackMeta = {
    label: string;
    shortLabel: string;
    tone: TechStackTone;
    iconSrc?: string;
    iconClassName?: string;
};

export const techStackMap: Record<string, TechStackMeta> = {
    "Spring Boot": {
        label: "Spring Boot",
        shortLabel: "SB",
        tone: "spring",
        iconSrc: "/images/tech/spring.svg",
    },
    "Java": {
        label: "Java",
        shortLabel: "JV",
        tone: "language",
        iconSrc: "/images/tech/java.svg",
    },
    "Docker": {
        label: "Docker",
        shortLabel: "DK",
        tone: "infra",
        iconSrc: "/images/tech/docker.svg",
    },
    "JPA": {
        label: "JPA",
        shortLabel: "JP",
        tone: "database",
        iconSrc: "/images/tech/hibernate.svg",
    },
    "Redis": {
        label: "Redis",
        shortLabel: "RD",
        tone: "cache",
        iconSrc: "/images/tech/redis.svg",
    },
    "S3": {
        label: "S3",
        shortLabel: "S3",
        tone: "storage",
    },
    "Kafka": {
        label: "Kafka",
        shortLabel: "KF",
        tone: "event",
        iconSrc: "/images/tech/kafka.svg",
    },
    "k3s": {
        label: "k3s",
        shortLabel: "K3",
        tone: "infra",
        iconSrc: "/images/tech/kubernetes.svg",
    },
    "MariaDB": {
        label: "MariaDB",
        shortLabel: "DB",
        tone: "database",
        iconSrc: "/images/tech/mariadb.svg",
    },
    "QueryDSL": {
        label: "QueryDSL",
        shortLabel: "QD",
        tone: "query",
    },
    "React": {
        label: "React",
        shortLabel: "RX",
        tone: "frontend",
        iconSrc: "/images/tech/react.svg",
    },
    "TypeScript": {
        label: "TypeScript",
        shortLabel: "TS",
        tone: "language",
        iconSrc: "/images/tech/typescript.svg",
    },
    "Jenkins": {
        label: "Jenkins",
        shortLabel: "JK",
        tone: "pipeline",
        iconSrc: "/images/tech/jenkins.svg",
        iconClassName: "tech-stack-logo-portrait",
    },
    "IntelliJ IDEA": {
        label: "IntelliJ IDEA",
        shortLabel: "IJ",
        tone: "ide",
        iconSrc: "/images/tech/intellij.svg",
    },
    "VS Code": {
        label: "VS Code",
        shortLabel: "VS",
        tone: "ide",
        iconSrc: "/images/tech/vscode.svg",
    },
};

export function getTechStackMeta(item: string): TechStackMeta {
    return techStackMap[item] ?? {
        label: item,
        shortLabel: item.slice(0, 2).toUpperCase(),
        tone: "default",
    };
}
