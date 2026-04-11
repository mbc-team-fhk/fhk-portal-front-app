FROM nginx:alpine

# Vite 빌드 결과
COPY ./dist /usr/share/nginx/html

# nginx 설정 (현재 파일 기준이 아니라 build context 기준 경로)
COPY ./infra/docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

# todo
# 향후 Jenkins에서 VITE 빌드하는 부분을
# 도커파일에서 하도록 수정하여
# CI 서버 의존성을 줄이자