FROM nginx:alpine

# Vite 빌드 결과
COPY ./dist /usr/share/nginx/html

# nginx 설정 (현재 파일 기준이 아니라 build context 기준 경로)
COPY ./infra/docker/nginx.conf /etc/nginx/conf.d/default.conf

ARG VITE_APP_VERSION=dev
ENV VITE_APP_VERSION=${VITE_APP_VERSION}

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]