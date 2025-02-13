#!/bin/bash

set -e  # 에러 발생 시 즉시 종료

echo "🚀 Starting local GitLab CI/CD pipeline test..."

export $(grep -v '^#' .env | xargs)

# 1️⃣ GitLab Runner 환경과 동일하게 Docker 컨테이너 내부에서 실행
docker run --rm -it \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v "$(pwd)":/workspace \
  -w /workspace \
  --env DOCKER_USERNAME="$DOCKER_USERNAME" \
  --env DOCKER_PASSWORD="$DOCKER_PASSWORD" \
  --env DEPLOY_SSH_PRIVATE_KEY="$DEPLOY_SSH_PRIVATE_KEY" \
  docker:latest sh -c '
    set -e
    apk add --no-cache docker-compose
    

    # 2️⃣ Docker 로그인
    echo "🔑 Logging in to Docker..."
    echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin

    # 3️⃣ Backend 빌드 및 푸시
    echo "🏗  Building Backend..."
    docker build -t kwon0528/b106-backend:local-test -f Backend/Dockerfile.dev ./Backend
    docker push kwon0528/b106-backend:local-test

    # 4️⃣ Frontend 빌드 및 푸시
    echo "🎨 Building Frontend..."
    docker build -t kwon0528/b106-frontend:local-test -f Frontend/Dockerfile.dev ./Frontend
    docker push kwon0528/b106-frontend:local-test

    # 5️⃣ 컨테이너 실행
    echo "🧪 Running Tests..."
    docker-compose -f docker-compose.yml up -d backend
    sleep 5  # ✅ 컨테이너가 완전히 준비될 때까지 대기
    docker-compose -f docker-compose.yml exec backend bash -c "ls -R /app"
    
    docker-compose -f docker-compose.yml exec backend bash -c "
        cd /app &&
        uvicorn main:app --host 0.0.0.0 --port 8000 --reload --proxy-headers --forwarded-allow-ips='*'
      "

    docker-compose -f docker-compose.yml exec frontend npm run dev

    # 6️⃣ 컨테이너 정리
    echo "🛑 Stopping Docker containers..."
    docker-compose down

    # 7️⃣ 배포 테스트 (실제 서버 배포 X)
    echo "🚀 Simulating Deployment..."
    docker-compose -f docker-compose.yml up -d
  '

echo "✅ Local CI/CD pipeline test completed successfully!"
