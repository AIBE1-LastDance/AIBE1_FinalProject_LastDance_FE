#!/bin/bash

# 배포 스크립트
set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 환경 변수 설정
REGISTRY="ghcr.io"
IMAGE_NAME="woori-zip"
CONTAINER_NAME="woori-zip-app"

# 함수 정의
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 사용법 출력
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo "Options:"
    echo "  -t, --tag TAG        Docker image tag (default: latest)"
    echo "  -p, --port PORT      Port to run container on (default: 3000)"
    echo "  -h, --help           Show this help message"
    exit 1
}

# 기본값 설정
TAG="latest"
PORT="3000"

# 명령행 인수 파싱
while [[ $# -gt 0 ]]; do
    case $1 in
        -t|--tag)
            TAG="$2"
            shift 2
            ;;
        -p|--port)
            PORT="$2"
            shift 2
            ;;
        -h|--help)
            usage
            ;;
        *)
            log_error "Unknown option: $1"
            usage
            ;;
    esac
done

log_info "Starting deployment..."
log_info "Image tag: $TAG"
log_info "Port: $PORT"

# 기존 컨테이너 정리
if docker ps -a --format 'table {{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    log_warn "Stopping and removing existing container..."
    docker stop $CONTAINER_NAME || true
    docker rm $CONTAINER_NAME || true
fi

# 새 이미지 pull
log_info "Pulling new image..."
docker pull $REGISTRY/$IMAGE_NAME:$TAG

# 새 컨테이너 실행
log_info "Starting new container..."
docker run -d \
    --name $CONTAINER_NAME \
    --restart unless-stopped \
    -p $PORT:80 \
    $REGISTRY/$IMAGE_NAME:$TAG

# 컨테이너 상태 확인
sleep 5
if docker ps --format 'table {{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    log_info "Deployment successful! Container is running on port $PORT"
    log_info "Access the application at: http://localhost:$PORT"
else
    log_error "Deployment failed! Container is not running"
    docker logs $CONTAINER_NAME
    exit 1
fi

# 사용하지 않는 이미지 정리
log_info "Cleaning up unused images..."
docker image prune -f

log_info "Deployment completed successfully!"
