-- 사용자 정보 컬럼 추가
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS raw_data JSONB;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS sex TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS age TEXT;

-- upsert_review 함수 업데이트 (새 필드 포함)
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
            recommendation_target, sequel_interest, additional_comment, ending_data,
            raw_data, sex, name, phone_number, email, age
        ) VALUES (
            r->>'uuid', r->>'game_id', r->>'template_id',
            (r->>'sent_time')::timestamptz, r->>'game_title',
            r->>'original_game_title', (r->>'number')::int,
            r->>'team', r->>'zone', r->>'role', r->>'nickname',
            r->>'satisfaction', r->>'play_experience', r->>'inflow_source',
            r->>'recommendation_target', r->>'sequel_interest',
            r->>'additional_comment', r->>'ending_data',
            CASE WHEN r->>'raw_data' IS NOT NULL THEN (r->>'raw_data')::jsonb ELSE NULL END,
            r->>'sex', r->>'name', r->>'phone_number', r->>'email', r->>'age'
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
            ending_data = COALESCE(NULLIF(r->>'ending_data', ''), existing.ending_data),
            raw_data = COALESCE(
                CASE WHEN r->>'raw_data' IS NOT NULL THEN (r->>'raw_data')::jsonb ELSE NULL END,
                existing.raw_data
            ),
            sex = COALESCE(NULLIF(r->>'sex', ''), existing.sex),
            name = COALESCE(NULLIF(r->>'name', ''), existing.name),
            phone_number = COALESCE(NULLIF(r->>'phone_number', ''), existing.phone_number),
            email = COALESCE(NULLIF(r->>'email', ''), existing.email),
            age = COALESCE(NULLIF(r->>'age', ''), existing.age)
        WHERE id = existing.id;
    END IF;
END;
$$;
