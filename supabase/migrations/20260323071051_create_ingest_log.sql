CREATE TABLE _ingest_log (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    original_body TEXT,
    unwrapped_number TEXT,
    unwrapped_nickname TEXT,
    unwrapped_game_title TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
