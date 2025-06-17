#!/bin/bash

# 로컬 빌드 스크립트
set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

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

# 환경 변수 설정
IMAGE_NAME="woori-zip"
DOCKERFILE="Dockerfile"

# 사용법 출력
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo "Options:"
    echo "  -t, --tag TAG        Docker image tag (default: latest)"
    echo "  -d, --dev            Use development Dockerfile"
    echo "  -n, --no-cache       Build without cache"
    echo "  -h, --help           Show this help message"
    exit 1
}

# 기본값 설정
TAG="latest"
NO_CACHE=""
DEV_MODE=false

# 명령행 인수 파싱
while [[ $# -gt 0 ]]; do
    case $1 in
        -t|--tag)
            TAG="$2"
            shift 2
            ;;
        -d|--dev)
            DEV_MODE=true
            DOCKERFILE="Dockerfile.dev"
            shift
            ;;
        -n|--no-cache)
            NO_CACHE="--no-cache"
            shift
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

if [ "$DEV_MODE" = true ]; then
    IMAGE_NAME="$IMAGE_NAME-dev"
    log_info "Building development image..."
else
    log_info "Building production image..."
fi

log_info "Image name: $IMAGE_NAME:$TAG"
log_info "Dockerfile: $DOCKERFILE"

# Docker 빌드 실행
log_info "Starting Docker build..."
docker build $NO_CACHE -f $DOCKERFILE -t $IMAGE_NAME:$TAG .

if [ $? -eq 0 ]; then
    log_info "Build completed successfully!"
    log_info "Image: $IMAGE_NAME:$TAG"
    
    # 이미지 크기 출력
    SIZE=$(docker images --format "table {{.Size}}" $IMAGE_NAME:$TAG | tail -n 1)
    log_info "Image size: $SIZE"
    
    if [ "$DEV_MODE" = false ]; then
        log_info "To run the container: docker run -p 3000:80 $IMAGE_NAME:$TAG"
    else
        log_info "To run the dev container: docker run -p 5173:5173 -v \$(pwd):/app $IMAGE_NAME:$TAG"
    fi
else
    log_error "Build failed!"
    exit 1
fi
