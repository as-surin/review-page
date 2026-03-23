# REVIEW_PAGE 진행 기록

### 2026-03-23 세션 마무리

**완료한 작업**:
- Google Sheets → Supabase 데이터 마이그레이션 완료 (197건 리뷰, 10개 게임)
- Supabase 테이블 설계: reviews, game_settings (RLS 읽기 정책 적용)
- upsert_review SQL 함수: game_id + number 기준 자동 병합 (빈 필드만 채움)
- game_settings 자동 추가 + template_ids 배열 관리
- 프론트엔드를 Supabase REST API로 연결 (Google Apps Script 제거)
- Edge Function (ingest-review) 생성 및 배포: 쏘빅툴 데이터 수신 + Slack 알림
- Slack Block Kit 메시지 포맷 구현 (제목/플레이어정보/피드백 1열 레이아웃)
- GitHub push + Vercel 배포 완료
- neofrigate@gmail.com GitHub collaborator 초대

**진행 중 (미완료)**:
- Slack 알림에서 항상 Player 1 데이터만 표시되는 문제 — 쏘빅툴이 트리거 시 Player 1 데이터를 보내는 것으로 보임. 쏘빅툴 매크로의 플레이어 필터 조건 확인 필요
- 쏘빅툴에서 2번째 응답 시 "현재 플레이어를 찾을 수 없습니다" 에러 — 우리 API는 정상 동작 확인됨. 쏘빅툴 측 게임 세션 상태 문제로 추정
- Supabase Edge Function Secrets에 SLACK_WEBHOOK_URL 미설정 — 현재 코드 내 인코딩된 fallback으로 동작 중. 대시보드에서 설정하면 더 안전

**다음 세션에서 할 일**:
- 쏘빅툴 매크로 플레이어 필터 조건 확인 (조원철님과 협의)
- Slack 알림 정확성 검증 (새 게임에서 여러 플레이어 테스트)
- _ingest_log 테이블 정리 (디버깅용으로 만들었으나 불필요 시 삭제)
- git commit + push (최신 Edge Function 코드)

**관련 파일**:
- `supabase/functions/ingest-review/index.ts` — Edge Function (데이터 수신 + Slack)
- `supabase/migrations/` — 4개 마이그레이션 파일
- `public/index.html` — 프론트엔드 (Supabase 연결)
- `scripts/sync-full.mjs` — Google Sheets → Supabase 동기화 스크립트 (.gitignore)
