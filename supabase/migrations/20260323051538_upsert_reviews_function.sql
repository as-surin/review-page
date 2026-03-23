-- game_id + number 복합 유니크 제약조건 추가
-- 같은 게임의 같은 번호 = 같은 플레이어
ALTER TABLE reviews ADD CONSTRAINT uq_reviews_game_number UNIQUE (game_id, number);

-- upsert 함수: 새 데이터가 들어오면 기존 빈 필드만 채움
CREATE OR REPLACE FUNCTION upsert_review(r jsonb)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    existing reviews%ROWTYPE;
BEGIN
    SELECT * INTO existing FROM reviews
    WHERE game_id = r->>'game_id' AND number = (r->>'number')::int;

    IF NOT FOUND THEN
        INSERT INTO reviews (
            uuid, game_id, template_id, sent_time, game_title,
            original_game_title, number, team, zone, role, nickname,
            satisfaction, play_experience, inflow_source,
            recommendation_target, sequel_interest, additional_comment, ending_data
        ) VALUES (
            r->>'uuid', r->>'game_id', r->>'template_id',
            (r->>'sent_time')::timestamptz, r->>'game_title',
            r->>'original_game_title', (r->>'number')::int,
            r->>'team', r->>'zone', r->>'role', r->>'nickname',
            r->>'satisfaction', r->>'play_experience', r->>'inflow_source',
            r->>'recommendation_target', r->>'sequel_interest',
            r->>'additional_comment', r->>'ending_data'
        );
    ELSE
        UPDATE reviews SET
            sent_time = GREATEST(existing.sent_time, (r->>'sent_time')::timestamptz),
            zone = COALESCE(NULLIF(r->>'zone', ''), existing.zone),
            role = COALESCE(NULLIF(r->>'role', ''), existing.role),
            nickname = COALESCE(NULLIF(r->>'nickname', ''), existing.nickname),
            satisfaction = COALESCE(NULLIF(r->>'satisfaction', ''), existing.satisfaction),
            play_experience = COALESCE(NULLIF(r->>'play_experience', ''), existing.play_experience),
            inflow_source = COALESCE(NULLIF(r->>'inflow_source', ''), existing.inflow_source),
            recommendation_target = COALESCE(NULLIF(r->>'recommendation_target', ''), existing.recommendation_target),
            sequel_interest = COALESCE(NULLIF(r->>'sequel_interest', ''), existing.sequel_interest),
            additional_comment = COALESCE(NULLIF(r->>'additional_comment', ''), existing.additional_comment),
            ending_data = COALESCE(NULLIF(r->>'ending_data', ''), existing.ending_data)
        WHERE id = existing.id;
    END IF;
END;
$$;

-- 배치 upsert 함수
CREATE OR REPLACE FUNCTION upsert_reviews(reviews jsonb)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    r jsonb;
BEGIN
    FOR r IN SELECT * FROM jsonb_array_elements(reviews)
    LOOP
        PERFORM upsert_review(r);
    END LOOP;
END;
$$;
