# 🎭 LastDance Frontend

> **AIBE1 Final Project** - 공동생활을 위한 종합 생활관리 플랫폼

[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.x-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker)](https://www.docker.com/)
[![Deploy](https://img.shields.io/badge/Deploy-Render-46E3B7?style=flat-square&logo=render)](https://render.com/)

## 🏠 프로젝트 소개

**LastDance**는 자취생, 룸메이트, 신혼부부 등 **공동생활을 하는 모든 사람들**을 위한 종합 생활관리 플랫폼입니다. 
일정 관리, 생활비 정산, 집안일 분담, 갈등 중재 등 공동생활에서 발생하는 모든 문제를 하나의 서비스로 해결합니다.

### 🎯 핵심 가치

- **🤝 투명성**: 모든 생활비와 집안일을 투명하게 공유
- **⚖️ 공정성**: AI 기반 중재를 통한 객관적 갈등 해결  
- **🎪 편의성**: 흩어진 관리 도구들을 하나로 통합
- **👥 커뮤니티**: 같은 고민을 가진 사람들과의 정보 공유

### 🎨 슬로건
> **"우리의 하루를, 우리.zip에 담다"**

---

## 📊 배경 및 문제 정의

### 🏘️ 시장 현황
- **1인 가구 증가**: 2025년 기준 전체 가구의 **35.1%**가 1인 가구 (역대 최고)
- **공동주거 확산**: 서울시 코리빙 하우스 **9년 만에 4.7배 성장**
- **임대수요 급증**: 최근 3년간 연평균 **22% 증가**
- **타겟 시장**: 20~30대 공동생활자 **250만 명 이상** 추정

### 😤 현재 문제점

| 문제 | 현재 상황 | 영향 |
|------|-----------|------|
| **관리 도구 분산** | 카톡, 캘린더, 엑셀 등 파편화 | 효율성 저하, 정보 유실 |
| **갈등 빈발** | 집안일, 공과금 분담 트러블 | 관계 악화, 스트레스 증가 |
| **투명성 부족** | 지출 내역 불분명 | 불신, 불공정 감정 |
| **정보 부족** | 생활 노하우 공유 어려움 | 시행착오 반복 |

---

## ✨ 주요 기능

### 🏠 생활 관리 시스템
- **📅 공유 캘린더**: 팀원들의 일정을 한눈에, 반복 일정 자동 설정
- **✅ 생활 체크리스트**: 개인/공용 할 일 관리 및 진행률 추적
- **🧹 집안일 분담표**: 공정한 역할 순환 시스템
- **📸 상태 기록**: 입주/퇴거 시 집 상태 사진 기록

### 💰 금융 관리 기능  
- **💳 생활비 기록**: 카테고리별 지출 내역 자동 분류
- **📊 소비 분석**: 인터랙티브 차트로 지출 패턴 시각화
- **🧮 공동 정산**: 공과금, 생필품 등 자동 분할 계산
- **🔔 납부 알림**: 중요한 납부일 사전 알림 시스템

### 🤖 AI 특화 기능
- **⚖️ 갈등 중재 시스템**: LLM 기반 객관적 분쟁 해결 지원
- **🎲 랜덤 배정**: 공정한 역할 분담을 위한 랜덤 시스템
- **📈 패턴 분석**: 생활 패턴 학습을 통한 맞춤 제안

### 👥 커뮤니티 기능
- **💬 정보 공유 게시판**: 생활 팁, 노하우 교환
- **🛒 공동구매 모집**: 생필품 등 공동 구매 조직
- **🏠 하우스메이트 매칭**: 지역/조건별 룸메이트 찾기

---

## 🛠️ 기술 스택

### **Frontend Framework**
- **⚛️ React 18.x**: 컴포넌트 기반 모던 UI 프레임워크
- **🔷 TypeScript 5.x**: 타입 안전성과 개발 생산성 확보
- **⚡ Vite 5.x**: 빠른 개발 서버와 최적화된 빌드

### **UI/UX & Styling**
- **🎨 Tailwind CSS 3.x**: 유틸리티 우선 CSS 프레임워크
- **📊 Victory Charts**: 데이터 시각화를 위한 차트 라이브러리
- **✂️ React-Beautiful-DnD**: 직관적인 드래그 앤 드롭 기능
- **🎭 React-Transition-Group**: 부드러운 애니메이션 효과

### **State & Data Management**
- **🗃️ Redux Toolkit**: 예측 가능한 상태 관리
- **🔄 React-Redux**: React와 Redux 연결
- **📝 React-Quill**: 풍부한 텍스트 편집 기능

### **Development Tools**
- **🔍 ESLint**: 코드 품질 및 일관성 관리
- **📦 PostCSS**: CSS 후처리 및 최적화
- **🔧 TypeScript ESLint**: TypeScript 전용 린팅

### **Deployment & Infrastructure**
- **🐳 Docker + Nginx**: 컨테이너화된 프로덕션 환경
- **🚀 GitHub Actions**: 자동화된 CI/CD 파이프라인
- **☁️ Render.com**: 클라우드 호스팅 플랫폼

---

## 🚀 빠른 시작

### 📋 필수 요구사항
- **Node.js**: 18.0.0 이상
- **npm**: 8.0.0 이상  
- **Git**: 최신 버전

### ⚡ 1분 안에 실행하기

```bash
# 1️⃣ 저장소 클론
git clone https://github.com/prgrms-aibe-devcourse/AIBE1_FinalProject_LastDance_FE.git
cd AIBE1_FinalProject_LastDance_FE

# 2️⃣ 의존성 설치
npm install

# 3️⃣ 개발 서버 실행
npm run dev

# 🎉 브라우저에서 http://localhost:5173 접속!
```

---

## 📦 개발 환경 설정

### 🛠️ 사용 가능한 스크립트

```bash
# 🔥 개발 서버 실행 (Hot Reload)
npm run dev

# 🏗️ 프로덕션 빌드
npm run build

# 👀 빌드 결과 미리보기
npm run preview

# 🔍 ESLint 코드 검사
npm run lint

# 📏 TypeScript 타입 검사
npm run type-check
```

### 🌍 환경 변수 설정

```bash
# .env.local 파일 생성 (예시)
VITE_API_URL=http://localhost:8080/api
VITE_APP_NAME=LastDance
VITE_APP_VERSION=1.0.0
VITE_KAKAO_APP_KEY=your_kakao_app_key
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

---

## 🐳 Docker로 실행

### 🏠 로컬 Docker 실행

```bash
# Docker 이미지 빌드
docker build -t lastdance-frontend .

# 컨테이너 실행
docker run -p 8080:80 lastdance-frontend

# 🌐 브라우저에서 http://localhost:8080 접속
```

### 🔄 Docker Compose (개발용)

```bash
# 개발 환경 시작
docker-compose up -d

# 📋 로그 확인
docker-compose logs -f

# 🛑 서비스 종료
docker-compose down
```

---

## 📁 프로젝트 구조

```
LastDance-Frontend/
├── 📁 public/                    # 정적 파일
│   ├── 🖼️ vite.svg              
│   └── 📁 image/                 # 이미지 리소스
├── 📁 src/                       # 소스 코드
│   ├── 📁 components/            # 재사용 컴포넌트
│   │   ├── 📁 common/            # 공통 UI 컴포넌트
│   │   ├── 📁 calendar/          # 캘린더 관련 컴포넌트
│   │   ├── 📁 finance/           # 금융 관리 컴포넌트
│   │   └── 📁 community/         # 커뮤니티 컴포넌트
│   ├── 📁 hooks/                 # 커스텀 React 훅
│   │   ├── 🔗 useAuth.ts         # 인증 관련 훅
│   │   ├── 💰 useFinance.ts      # 금융 관리 훅
│   │   └── 📅 useCalendar.ts     # 캘린더 관련 훅
│   ├── 📁 store/                 # Redux 상태 관리
│   │   ├── 🗃️ authSlice.ts       # 인증 상태
│   │   ├── 🏠 teamSlice.ts       # 팀 관리 상태
│   │   └── 💰 financeSlice.ts    # 금융 상태
│   ├── 📁 types/                 # TypeScript 타입 정의
│   │   ├── 👤 user.types.ts      # 사용자 타입
│   │   ├── 🏠 team.types.ts      # 팀 관련 타입
│   │   └── 💰 finance.types.ts   # 금융 관련 타입
│   ├── 📁 utils/                 # 유틸리티 함수
│   │   ├── 🔧 api.ts             # API 호출 함수
│   │   ├── 📊 chartHelpers.ts    # 차트 헬퍼 함수
│   │   └── 💰 financeUtils.ts    # 금융 계산 유틸
│   ├── 🎨 index.css              # 전역 스타일
│   ├── ⚛️ App.tsx                # 메인 앱 컴포넌트
│   ├── 🚀 main.tsx               # 앱 진입점
│   └── 🔧 vite-env.d.ts          # Vite 타입 정의
├── 📁 .github/workflows/         # GitHub Actions
├── 🐳 Dockerfile                 # Docker 설정
├── 🌐 nginx.conf                 # Nginx 설정  
├── ⚙️ vite.config.ts             # Vite 설정
├── 📦 package.json               # 프로젝트 의존성
├── 🎨 tailwind.config.js         # Tailwind 설정
├── 📝 tsconfig.json              # TypeScript 설정
└── 📖 README.md                  # 프로젝트 문서
```

---

## 🎯 타겟 사용자

| 👥 사용자 그룹 | 📝 설명 | ✨ 특징 | 🎯 주요 니즈 |
|----------------|---------|---------|---------------|
| **🎓 대학생/취준생** | 자취, 하우스메이트 생활자 | 예산 민감, 디지털 네이티브 | 비용 절약, 간편 관리 |
| **💼 20-30대 직장인** | 공동생활 중인 직장인 | 시간 부족, 효율성 중시 | 자동화, 갈등 최소화 |
| **💒 신혼 부부** | 처음 동거하는 부부 | 관계 초기, 합의 필요 | 공정한 역할 분담 |
| **👥 쉐어하우스** | 3명 이상 공동생활자 | 복잡한 관계, 체계 필요 | 투명한 관리, 소통 |

---

## 🏗️ 개발 로드맵

### 🚀 1단계: MVP (3-4개월)
- ✅ 소셜 로그인 (카카오/구글) 
- ✅ 팀 생성 및 참여 시스템
- ✅ 공유 캘린더 
- ✅ 생활비 기록 및 정산
- ✅ 기본 체크리스트

### 🎯 2단계: 고도화 (6-8개월)  
- 🤖 AI 갈등 중재 시스템
- 📊 고급 데이터 분석 
- 💬 실시간 채팅
- 🛒 공동구매 게시판

### 📱 3단계: 확장 (1년)
- 📱 모바일 앱 (React Native)
- 💳 외부 결제 API 연동
- 🏢 B2B 기능 (쉐어하우스 운영자)

### 🌐 4단계: 플랫폼화 (1.5-2년)
- 🔗 제휴사 API 연동
- 💰 프리미엄 구독 모델
- 🏗️ 개발자 API 제공

---

## 💰 비즈니스 모델

### 🎯 수익 모델

| 📊 모델 | 💡 내용 | 🎯 타겟 |
|---------|---------|---------|
| **🌟 프리미엄 구독** | 고급 분석, 자동화 도구 | 파워 유저 |
| **📺 광고 수익** | 생활용품, 배달앱 광고 | 일반 유저 |
| **🤝 제휴 수수료** | 공동구매 할인 제휴 | 전체 유저 |
| **🏢 B2B 라이선스** | 쉐어하우스 운영 도구 | 사업자 |

### 📈 수익화 전략
- **0-6개월**: 🆓 무료 서비스로 사용자 확보
- **6개월-1년**: 💎 프리미엄 기능 유료화  
- **1-2년**: 📺 광고 및 제휴 수익 확대
- **2년+**: 🏢 B2B 시장 진출

---

## 🔥 경쟁 우위

### 🎯 차별화 포인트

| 🏆 우리의 강점 | 🤷 기존 서비스 한계 | 💡 해결 방안 |
|----------------|---------------------|---------------|
| **🤖 AI 갈등 중재** | 감정적 해결, 주관적 판단 | 데이터 기반 객관적 중재 |
| **🎪 통합 플랫폼** | 여러 앱 분산 사용 | 원스톱 솔루션 |
| **🏠 공동생활 특화** | 일반적인 가계부/캘린더 | 타겟 맞춤 기능 |
| **⚖️ 투명성 & 공정성** | 불투명한 정산 방식 | 모든 활동 기록/공유 |

---

## 🤝 기여하기

### 🔄 개발 프로세스

1. **🍴 Fork** 이 저장소
2. **🌿 Branch** 생성 (`git checkout -b feature/amazing-feature`)
3. **💾 Commit** 변경사항 (`git commit -m 'feat: Add amazing feature'`)
4. **📤 Push** 브랜치에 (`git push origin feature/amazing-feature`)
5. **🔀 Pull Request** 생성

### 📏 코딩 컨벤션

```bash
# 커밋 메시지 (Conventional Commits)
feat: 새로운 기능 추가
fix: 버그 수정  
docs: 문서 수정
style: 코드 포맷팅
refactor: 코드 리팩토링
test: 테스트 추가/수정
chore: 빌드 설정 등 기타

# 브랜치 네이밍
feature/사용자-인증-구현
bugfix/정산-계산-오류-수정
hotfix/긴급-보안-패치
```

---

## 📚 관련 문서

- **🏗️ [DEPLOYMENT.md](DEPLOYMENT.md)**: 배포 가이드
- **🐛 [Issues](https://github.com/prgrms-aibe-devcourse/AIBE1_FinalProject_LastDance_FE/issues)**: 버그 신고 & 기능 요청
- **💬 [Discussions](https://github.com/prgrms-aibe-devcourse/AIBE1_FinalProject_LastDance_FE/discussions)**: 아이디어 토론
- **📖 [Wiki](https://github.com/prgrms-aibe-devcourse/AIBE1_FinalProject_LastDance_FE/wiki)**: 상세 개발 문서

---

## 🎉 팀 정보

### 🌟 AIBE1 Final Project Team

> **"조금 덜 싸우고, 많이 웃을 수 있는 공동생활"**을 만들어가는 팀입니다.

- **🔗 프로젝트 관리**: [GitHub Issues](https://github.com/prgrms-aibe-devcourse/AIBE1_FinalProject_LastDance_FE/issues)
- **💬 팀 소통**: [GitHub Discussions](https://github.com/prgrms-aibe-devcourse/AIBE1_FinalProject_LastDance_FE/discussions)  
- **📧 문의**: [새 이슈 생성](https://github.com/prgrms-aibe-devcourse/AIBE1_FinalProject_LastDance_FE/issues/new)

---

## 📄 라이선스

이 프로젝트는 **MIT License** 하에 배포됩니다.  
자세한 내용은 [LICENSE](LICENSE) 파일을 참고하세요.

---

<div align="center">

### 🌟 LastDance와 함께 더 나은 공동생활을 시작하세요!

**⭐ 이 프로젝트가 도움이 되었다면 별표를 눌러주세요! ⭐**

[![GitHub stars](https://img.shields.io/github/stars/prgrms-aibe-devcourse/AIBE1_FinalProject_LastDance_FE.svg?style=social&label=Star)](https://github.com/prgrms-aibe-devcourse/AIBE1_FinalProject_LastDance_FE)
[![GitHub forks](https://img.shields.io/github/forks/prgrms-aibe-devcourse/AIBE1_FinalProject_LastDance_FE.svg?style=social&label=Fork)](https://github.com/prgrms-aibe-devcourse/AIBE1_FinalProject_LastDance_FE/fork)

---

**Made with ❤️ by AIBE1 Team | 2025**

*"우리의 하루를, LastDance에 담다"*

</div>
