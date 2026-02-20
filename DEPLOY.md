# 배포 가이드

## 1. GitHub 저장소 생성 및 푸시

### 단계별 가이드

1. **Git 저장소 초기화**
   ```bash
   cd "/Users/surin/Library/Mobile Documents/com~apple~CloudDocs/PROJECT/REVIEW_PAGE"
   git init
   ```

2. **파일 추가 및 커밋**
   ```bash
   git add .
   git commit -m "Initial commit: Review dashboard and summary pages"
   ```

3. **GitHub에서 새 저장소 생성**
   - [GitHub](https://github.com/new)에 접속
   - 저장소 이름 입력 (예: `review-page`)
   - Public 또는 Private 선택
   - "Create repository" 클릭
   - **중요**: README, .gitignore, license는 추가하지 마세요 (이미 프로젝트에 있음)

4. **로컬 저장소를 GitHub에 연결**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/review-page.git
   # YOUR_USERNAME을 본인의 GitHub 사용자명으로 변경하세요
   
   git branch -M main
   git push -u origin main
   ```

## 2. Vercel 배포

### 방법 1: Vercel 웹 대시보드 사용 (권장)

1. **Vercel 계정 생성**
   - [Vercel](https://vercel.com) 접속
   - "Sign Up" 클릭
   - GitHub 계정으로 로그인 (권장)

2. **프로젝트 가져오기**
   - 대시보드에서 "Add New..." → "Project" 클릭
   - "Import Git Repository" 선택
   - 방금 만든 GitHub 저장소 선택
   - "Import" 클릭

3. **배포 설정**
   - Framework Preset: "Other" 또는 자동 감지
   - Root Directory: `./` (기본값)
   - Build Command: 비워두기 (정적 사이트)
   - Output Directory: 비워두기
   - Install Command: 비워두기

4. **환경 변수 설정 (필요한 경우)**
   - Google Sheets API 키 등이 필요한 경우
   - "Environment Variables" 섹션에서 추가

5. **배포 실행**
   - "Deploy" 버튼 클릭
   - 배포 완료 후 URL이 생성됩니다

### 방법 2: Vercel CLI 사용

1. **Vercel CLI 설치**
   ```bash
   npm install -g vercel
   ```

2. **로그인**
   ```bash
   vercel login
   ```

3. **배포**
   ```bash
   cd "/Users/surin/Library/Mobile Documents/com~apple~CloudDocs/PROJECT/REVIEW_PAGE"
   vercel
   ```

4. **프로덕션 배포**
   ```bash
   vercel --prod
   ```

## 3. 배포 후 확인

- Vercel이 제공하는 URL로 접속하여 사이트가 정상 작동하는지 확인
- `https://your-project-name.vercel.app` 형식의 URL이 생성됩니다

## 4. 커스텀 도메인 설정 (선택사항)

1. Vercel 대시보드에서 프로젝트 선택
2. "Settings" → "Domains" 이동
3. 도메인 추가 및 DNS 설정

## 문제 해결

### 배포 오류 발생 시
- Vercel 대시보드의 "Deployments" 탭에서 로그 확인
- `vercel.json` 파일이 올바르게 설정되었는지 확인

### 파일이 업데이트되지 않을 때
- GitHub에 변경사항 푸시
- Vercel이 자동으로 재배포합니다 (GitHub 연동 시)
