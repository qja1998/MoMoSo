# frontend/Dockerfile
FROM node:18-alpine
# FROM ci_cd_test-frontend

# 작업 디렉토리 설정
WORKDIR /app

# package.json과 package-lock.json을 먼저 복사
COPY package*.json .

# 의존성 설치
RUN npm install webpack@5 --save-dev

# 나머지 애플리케이션 소스 코드 복사
COPY . .

# 필요에 따라 환경 변수 설정 (선택 사항)
# ENV NODE_ENV=production

# 컨테이너가 시작될 때 실행될 명령어 설정
# CMD ["tail", "-f", "/dev/null"]
CMD ["npm", "start"]