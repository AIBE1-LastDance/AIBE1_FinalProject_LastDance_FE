# 🚀 배포 가이드: GitHub Actions → Docker Hub → Render

이 가이드는 리액트 프로젝트를 GitHub Actions를 통해 Docker 이미지로 빌드하여 Docker Hub에 푸시하고, Docker Hub 이미지를 Render에 배포하는 과정을 설명합니다.

## 📋 필요한 준비사항

### 1. Docker Hub 설정

#### Docker Hub 계정 및 리포지토리 생성
1. [Docker Hub](https://hub.docker.com/) 계정 생성 또는 로그인
2. "Create Repository" 클릭
3. Repository 정보 설정:
   - **Repository Name**: `lastdance-frontend`
   - **Visibility**: Public (무료) 또는 Private (유료)
   - **Description**: LastDance Frontend Application

#### Access Token 생성
1. Docker Hub → Account Settings → Security
2. "New Access Token" 클릭
3. Token Name: `github-actions-lastdance`
4. Permissions: `Read, Write, Delete`
5. 생성된 토큰을 안전하게 보관

### 2. GitHub Secrets 설정

GitHub 리포지토리의 Settings > Secrets and variables > Actions에서 다음 secrets를 추가하세요:

```
DOCKER_HUB_USERNAME=your_dockerhub_username
DOCKER_HUB_ACCESS_TOKEN=your_dockerhub_access_token
RENDER_SERVICE_ID=your_render_service_id
RENDER_API_KEY=your_render_api_key
```

### 3. Render 서비스 설정

#### 옵션 1: Docker Hub 이미지를 직접 Render에 배포
1. Render 대시보드에서 "New Web Service" 생성
2. "Deploy an existing image from a registry" 선택
3. Docker Hub 이미지 URL 입력: `your_username/lastdance-frontend:latest`
4. Port: `80` (Nginx 포트)

#### 옵션 2: Render에서 GitHub 연동으로 빌드
1. Render 대시보드에서 "New Web Service" 생성
2. GitHub 리포지토리 연결
3. Environment: Docker
4. Dockerfile Path: `./Dockerfile`

## 🔧 설정 파일 구조

```
프로젝트/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions 워크플로우
├── Dockerfile                  # Docker 빌드 설정
├── nginx.conf                  # Nginx 설정
├── render.yaml                 # Render 배포 설정 (선택사항)
└── DEPLOYMENT.md              # 이 파일
```

## 🚀 배포 프로세스

### 자동 배포 (GitHub Actions)
1. `main` 브랜치에 코드 푸시
2. GitHub Actions가 자동으로 트리거됨
3. Docker 이미지 빌드
4. Docker Hub에 이미지 푸시
5. Render에 배포 트리거

### 수동 배포
```bash
# 1. Docker 이미지 빌드
docker build -t lastdance-frontend .

# 2. Docker Hub에 로그인
docker login -u your_username

# 3. 이미지 태그 지정
docker tag lastdance-frontend:latest your_username/lastdance-frontend:latest

# 4. Docker Hub에 푸시
docker push your_username/lastdance-frontend:latest
```

## 🔍 환경별 배포

### 개발환경 (develop 브랜치)
- Docker Hub에 `your_username/lastdance-frontend:develop-<commit-sha>` 태그로 푸시
- 자동 배포는 하지 않음

### 프로덕션환경 (main 브랜치)
- Docker Hub에 `your_username/lastdance-frontend:latest` 태그로 푸시
- Render에 자동 배포

## 📊 모니터링

### GitHub Actions
- Actions 탭에서 빌드 상태 확인
- 각 step별 로그 확인 가능

### Docker Hub
- Docker Hub 대시보드에서 이미지 업로드 상태 확인
- 이미지 태그별 관리 및 다운로드 통계

### Render
- Render 대시보드에서 배포 상태 확인
- 로그 및 메트릭 모니터링

## 🛠️ 트러블슈팅

### 자주 발생하는 문제들

#### 1. Docker Hub 푸시 권한 오류
```bash
# Docker Hub 로그인 상태 확인
docker info

# 다시 로그인
docker logout
docker login -u your_username
```

#### 2. Render 배포 실패
- Docker Hub 이미지 URL이 올바른지 확인: `your_username/lastdance-frontend:latest`
- 이미지가 Public으로 설정되어 있는지 확인
- Render 서비스 설정에서 포트가 80으로 설정되어 있는지 확인

#### 3. Docker 빌드 실패
- Dockerfile의 경로와 명령어 확인
- 빌드 컨텍스트에 필요한 파일들이 포함되어 있는지 확인
- `.dockerignore` 파일 확인

#### 4. GitHub Actions 실패
- GitHub Secrets가 올바르게 설정되어 있는지 확인
- Docker Hub Access Token이 유효한지 확인
- Workflow 파일의 문법 오류 확인

## 📈 최적화 팁

### 1. Docker 이미지 크기 최적화
- Multi-stage build 사용 (이미 적용됨)
- `.dockerignore` 파일 활용
- Alpine 베이스 이미지 사용
- 불필요한 파일 제거

```dockerfile
# .dockerignore 예시
node_modules
npm-debug.log
Dockerfile*
.dockerignore
.git
.gitignore
README.md
.env
.nyc_output
coverage
.cache
dist
```

### 2. 빌드 시간 단축
- Docker layer 캐싱 활용
- 의존성 변경이 적은 레이어를 먼저 빌드
- GitHub Actions에서 Docker Buildx 캐싱 사용

### 3. 비용 최적화
- **이미지 태그 관리**: 오래된 태그 정기적으로 정리
- **Pull 횟수 제한**: 필요한 경우에만 새 이미지 배포
- **이미지 크기 모니터링**: 정기적으로 이미지 크기 확인

#### Docker Hub 리포지토리 관리
```bash
# 1. 로컬에서 불필요한 이미지 정리
docker image prune -f

# 2. Docker Hub에서 오래된 태그 확인
# (Docker Hub 웹 인터페이스에서 수동으로 삭제)

# 3. 이미지 크기 확인
docker images your_username/lastdance-frontend
```

#### 예상 리소스 사용량
```
- 리액트 빌드 이미지 크기: ~50MB (최적화 후)
- 월간 Pull 횟수: ~1,000회 (프리 플랜 한도 내)
- 저장 용량: 1개 latest + 2개 백업 태그
```

## 🔄 GitHub Actions Workflow 예시

```yaml
name: Deploy to Docker Hub and Render

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3
    
    - name: Login to Docker Hub
      uses: docker/login-action@v3
      with:
        username: ${{ secrets.DOCKER_HUB_USERNAME }}
        password: ${{ secrets.DOCKER_HUB_ACCESS_TOKEN }}
    
    - name: Build and push
      uses: docker/build-push-action@v5
      with:
        context: .
        push: true
        tags: ${{ secrets.DOCKER_HUB_USERNAME }}/lastdance-frontend:latest
        cache-from: type=gha
        cache-to: type=gha,mode=max
    
    - name: Deploy to Render
      run: |
        curl -X POST "https://api.render.com/deploy/${{ secrets.RENDER_SERVICE_ID }}" \
          -H "Authorization: Bearer ${{ secrets.RENDER_API_KEY }}"
```

## 🌐 배포 URL 및 환경

### 프로덕션 환경
- **Frontend URL**: `https://lastdance-frontend.onrender.com`
- **Docker Hub**: `https://hub.docker.com/r/your_username/lastdance-frontend`
- **GitHub Actions**: Repository Actions 탭에서 확인

### 모니터링 대시보드
- **Render 대시보드**: 실시간 로그 및 메트릭
- **Docker Hub 통계**: Pull 횟수 및 이미지 크기
- **GitHub Actions**: 빌드 히스토리 및 로그

## 📞 지원

문제가 발생하면 다음을 확인하세요:

1. **GitHub Actions 로그**: Repository > Actions 탭
2. **Docker Hub 상태**: [Docker Hub Status](https://status.docker.com/)
3. **Render 배포 로그**: Render 대시보드 > Service > Logs
4. **이 문서의 트러블슈팅 섹션**

### 유용한 명령어
```bash
# Docker 상태 확인
docker --version
docker info

# 로컬 테스트
docker run -p 8080:80 your_username/lastdance-frontend:latest

# 로그 확인
docker logs container_name
```

---

## 🎯 체크리스트

배포 전 다음 항목들을 확인하세요:

- [ ] Docker Hub 계정 및 리포지토리 생성
- [ ] GitHub Secrets 설정 완료
- [ ] Dockerfile 최적화
- [ ] nginx.conf 설정 확인
- [ ] GitHub Actions workflow 테스트
- [ ] Render 서비스 설정 완료
- [ ] 배포 후 기능 테스트
