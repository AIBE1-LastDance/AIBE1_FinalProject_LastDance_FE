# 웹 애플리케이션 업데이트 문제 해결

## 문제 설명
GitHub Actions를 통해 GHCR에 Docker 이미지를 빌드하고 Render에 배포했으나, 웹페이지가 업데이트되지 않는 문제가 발생했습니다.

## 해결 방법
다음과 같은 변경사항을 적용하여 문제를 해결했습니다:

### 1. 캐싱 전략 개선
- `nginx.conf` 파일에서 정적 자산의 캐싱 전략을 변경했습니다:
  - 기존: 1년 캐싱 (`expires 1y; add_header Cache-Control "public, immutable";`)
  - 변경: 1일 캐싱 (`expires 1d; add_header Cache-Control "public, max-age=86400, must-revalidate";`)
- `index.html` 파일에 대한 별도의 캐싱 설정을 추가하여 항상 서버에서 가져오도록 했습니다:
  ```
  location = /index.html {
      add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0";
      expires off;
  }
  ```

### 2. 자산 해싱 명시적 활성화
- `vite.config.ts` 파일에 자산 해싱을 명시적으로 활성화하는 설정을 추가했습니다:
  ```typescript
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
      },
    },
    assetsInlineLimit: 0,
  }
  ```

### 3. 버전 표시기 추가
- 애플리케이션에 버전 표시기를 추가하여 업데이트가 적용되었는지 확인할 수 있도록 했습니다:
  - `src/version.ts` 파일 생성
  - `App.tsx`에 버전 정보 표시
  - `Dockerfile`에 빌드 시간 환경 변수 설정

## 배포 방법
1. 변경사항을 GitHub 저장소에 푸시합니다.
2. GitHub Actions가 자동으로 Docker 이미지를 빌드하고 GHCR에 푸시합니다.
3. Render에서 새 이미지를 사용하여 서비스를 재배포합니다.

## 업데이트 확인 방법
웹페이지 우측 하단에 표시되는 버전 정보를 확인하여 업데이트가 적용되었는지 확인할 수 있습니다.