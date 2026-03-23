-- 게임 설정 테이블
CREATE TABLE game_settings (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    players TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0
);

-- 리뷰 데이터 테이블
CREATE TABLE reviews (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    uuid TEXT UNIQUE NOT NULL,
    game_id TEXT NOT NULL,
    template_id TEXT,
    sent_time TIMESTAMPTZ NOT NULL,
    game_title TEXT NOT NULL,
    original_game_title TEXT,
    number INTEGER,
    team TEXT,
    zone TEXT,
    role TEXT,
    nickname TEXT,
    satisfaction TEXT,
    play_experience TEXT,
    inflow_source TEXT,
    recommendation_target TEXT,
    sequel_interest TEXT,
    additional_comment TEXT,
    ending_data TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_reviews_game_title ON reviews (game_title);
CREATE INDEX idx_reviews_sent_time ON reviews (sent_time);
CREATE INDEX idx_reviews_game_id ON reviews (game_id);

-- RLS 활성화
ALTER TABLE game_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- 읽기 전용 공개 정책 (anon key로 읽기 가능)
CREATE POLICY "Allow public read on game_settings" ON game_settings
    FOR SELECT USING (true);

CREATE POLICY "Allow public read on reviews" ON reviews
    FOR SELECT USING (true);
