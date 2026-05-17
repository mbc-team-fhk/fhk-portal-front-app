Tech stack icon assets live here.

To replace an icon, keep the same filename and overwrite the SVG file:

- `spring.svg` for Spring Boot
- `kubernetes.svg` for k3s / Kubernetes
- `jenkins.svg` for Jenkins
- `redis.svg` for Redis
- `react.svg` for React
- `typescript.svg` for TypeScript
- `mariadb.svg` for MariaDB
- `kafka.svg` for Kafka
- `hibernate.svg` for JPA
- `java.svg` for Java
- `docker.svg` for Docker
- `intellij.svg` for IntelliJ IDEA
- `vscode.svg` for VS Code

The mapping is managed in `src/data/techStackMap.ts`.
If a technology has no logo file, the UI falls back to the short label from that map.

Java, Docker, IntelliJ IDEA, and VS Code icons were added from the official Devicon repository:
https://github.com/devicons/devicon
