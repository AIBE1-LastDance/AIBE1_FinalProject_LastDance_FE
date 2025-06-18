# 🚀 배포 가이드: GitHub Actions → AWS ECR → Render

이 가이드는 리액트 프로젝트를 GitHub Actions를 통해 Docker 이미지로 빌드하여 AWS ECR에 푸시하고, ECR 이미지를 Render에 배포하는 과정을 설명합니다.

## 📋 필요한 준비사항

### 1. AWS ECR 설정

#### ECR 리포지토리 생성
```bash
# AWS CLI로 ECR 리포지토리 생성
aws ecr create-repository \
    --repository-name lastdance-frontend \
    --region ap-northeast-2
```

#### IAM 사용자 및 권한 설정
ECR 푸시를 위한 IAM 사용자를 생성하고 다음 권한을 부여하세요:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ecr:GetAuthorizationToken",
                "ecr:BatchCheckLayerAvailability",
                "ecr:GetDownloadUrlForLayer",
                "ecr:BatchGetImage",
                "ecr:InitiateLayerUpload",
                "ecr:UploadLayerPart",
                "ecr:CompleteLayerUpload",
                "ecr:PutImage"
            ],
            "Resource": "*"
        }
    ]
}
```

### 2. GitHub Secrets 설정

GitHub 리포지토리의 Settings > Secrets and variables > Actions에서 다음 secrets를 추가하세요:

```
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
RENDER_SERVICE_ID=your_render_service_id
RENDER_API_KEY=your_render_api_key
```

### 3. Render 서비스 설정

#### 옵션 1: Docker 이미지를 직접 Render에 배포
1. Render 대시보드에서 "New Web Service" 생성
2. "Deploy an existing image from a registry" 선택
3. ECR 이미지 URL 입력: `<your-account-id>.dkr.ecr.ap-northeast-2.amazonaws.com/lastdance-frontend:latest`
4. AWS 자격 증명 설정 (Render에서 ECR 접근을 위해)

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
4. AWS ECR에 이미지 푸시
5. Render에 배포 트리거

### 수동 배포
```bash
# 1. Docker 이미지 빌드
docker build -t lastdance-frontend .

# 2. ECR에 로그인
aws ecr get-login-password --region ap-northeast-2 | docker login --username AWS --password-stdin <your-account-id>.dkr.ecr.ap-northeast-2.amazonaws.com

# 3. 이미지 태그 지정
docker tag lastdance-frontend:latest <your-account-id>.dkr.ecr.ap-northeast-2.amazonaws.com/lastdance-frontend:latest

# 4. ECR에 푸시
docker push <your-account-id>.dkr.ecr.ap-northeast-2.amazonaws.com/lastdance-frontend:latest
```

## 🔍 환경별 배포

### 개발환경 (develop 브랜치)
- ECR에 `develop-<commit-sha>` 태그로 푸시
- 자동 배포는 하지 않음

### 프로덕션환경 (main 브랜치)
- ECR에 `latest` 태그로 푸시
- Render에 자동 배포

## 📊 모니터링

### GitHub Actions
- Actions 탭에서 빌드 상태 확인
- 각 step별 로그 확인 가능

### AWS ECR
- ECR 콘솔에서 이미지 업로드 상태 확인
- 이미지 태그별 관리

### Render
- Render 대시보드에서 배포 상태 확인
- 로그 및 메트릭 모니터링

## 🛠️ 트러블슈팅

### 자주 발생하는 문제들

#### 1. ECR 푸시 권한 오류
```bash
# IAM 권한 확인
aws iam get-user-policy --user-name your-user --policy-name ECRFullAccess
```

#### 2. Render 배포 실패
- ECR 이미지 URL이 올바른지 확인
- Render에서 AWS 자격 증명이 올바르게 설정되었는지 확인

#### 3. Docker 빌드 실패
- Dockerfile의 경로와 명령어 확인
- 빌드 컨텍스트에 필요한 파일들이 포함되어 있는지 확인

## 📈 최적화 팁

### 1. Docker 이미지 크기 최적화
- Multi-stage build 사용 (이미 적용됨)
- `.dockerignore` 파일 활용
- Alpine 베이스 이미지 사용

### 2. 빌드 시간 단축
- Docker layer 캐싱 활용
- 의존성 변경이 적은 레이어를 먼저 빌드

### 3. 비용 최적화 (프리티어 500MB 한도 관리)
- **ECR Lifecycle Policy**: 최신 3개 이미지만 보관
- **자동 정리**: GitHub Actions에서 7일 이상 된 이미지 삭제
- **용량 모니터링**: AWS 콘솔에서 주기적 확인

#### ECR 용량 관리 설정
```bash
# 1. AWS 콘솔에서 ECR 리포지토리 먼저 생성
#    - Repository name: lastdance-frontend
#    - Visibility: Private

# 2. Lifecycle Policy 적용 (용량 절약)
chmod +x setup-ecr.sh
./setup-ecr.sh

# 3. 수동 정리 (필요시)
aws ecr describe-images --repository-name lastdance-frontend --region ap-northeast-2
aws ecr batch-delete-image --repository-name lastdance-frontend --image-ids imageDigest=<digest>
```

#### 예상 용량 사용량
```
- 리액트 이미지 크기: ~50MB
- 보관 이미지 수: 3개 (latest + 2개 백업)
- 총 사용량: ~150MB (프리티어 한도의 30%)
```

## 📞 지원

문제가 발생하면 다음을 확인하세요:
1. GitHub Actions 로그
2. AWS CloudTrail (ECR 관련)
3. Render 배포 로그
4. 이 문서의 트러블슈팅 섹션
