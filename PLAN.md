# REVIEW_PAGE 작업 계획

## DB 마이그레이션 (Google Sheets → Supabase)
- [x] Supabase 테이블 생성 (reviews, game_settings)
- [x] 기존 데이터 마이그레이션 (353행 → 197건 병합)
- [x] upsert_review 함수 (game_id + number 기준 병합)
- [x] game_settings 자동 추가 + template_ids 관리
- [x] 프론트엔드 Supabase 연결

## Edge Function (ingest-review)
- [x] 쏘빅툴 POST 데이터 수신 → Supabase 저장
- [x] Slack Block Kit 알림 전송
- [~] Slack 알림에 트리거한 플레이어 정보 정확히 표시 — 쏘빅툴 매크로 확인 필요

## 배포
- [x] GitHub push + Vercel 자동 배포
- [x] Edge Function 배포 (--no-verify-jwt)
- [ ] SLACK_WEBHOOK_URL을 Supabase Secrets로 이전
