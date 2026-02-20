# 게임 리뷰 대시보드

게임 리뷰 데이터를 시각화하는 대시보드 및 요약 통계 페이지입니다.

## 페이지 구성

- **dashboard.html**: 메인 대시보드 페이지
- **summary.html**: 게임별 요약 통계 페이지

## 로컬 개발

이 프로젝트는 정적 HTML 파일로 구성되어 있습니다. 로컬에서 실행하려면:

1. 간단한 HTTP 서버를 실행하세요:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # 또는 Node.js (http-server 설치 필요)
   npx http-server -p 8000
   ```

2. 브라우저에서 `http://localhost:8000` 접속

## Vercel 배포

이 프로젝트는 Vercel을 통해 배포할 수 있습니다.

### 배포 방법

1. GitHub에 저장소를 푸시합니다
2. [Vercel](https://vercel.com)에 로그인
3. "New Project" 클릭
4. GitHub 저장소 선택
5. 자동으로 배포 설정이 감지됩니다
6. "Deploy" 클릭

### 환경 변수

Google Sheets API를 사용하는 경우, 환경 변수를 Vercel 대시보드에서 설정하세요.

## 기술 스택

- HTML5
- CSS3
- JavaScript
- Chart.js
- Font Awesome
