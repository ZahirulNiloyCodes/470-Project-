-- EduStream Supabase Database Schema
-- Run this script in the Supabase SQL Editor if you want to use live Supabase tables.

-- 1. Users table (if not using auth.users directly)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE,
    full_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default dev user
INSERT INTO users (id, email, full_name)
VALUES ('11111111-1111-4111-a111-111111111111', 'dev@edustream.local', 'Developer (Host)')
ON CONFLICT (id) DO NOTHING;

-- 2. FR1: Study Rooms
CREATE TABLE IF NOT EXISTS study_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    host_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    is_private BOOLEAN DEFAULT FALSE,
    access_code TEXT,
    tags TEXT[] DEFAULT '{}',
    max_participants INT DEFAULT 10,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. FR9: Flashcard Decks
CREATE TABLE IF NOT EXISTS flashcard_decks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    room_id UUID,
    title TEXT NOT NULL,
    cards JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. FR13: Peer Ratings
CREATE TABLE IF NOT EXISTS peer_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id TEXT NOT NULL,
    rater_id TEXT NOT NULL,
    ratee_id TEXT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_room_rater_ratee UNIQUE (room_id, rater_id, ratee_id)
);

-- Row Level Security (RLS) policies - Enable public access for local development
ALTER TABLE study_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcard_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE peer_ratings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Allow all for study_rooms" ON study_rooms;
    CREATE POLICY "Allow all for study_rooms" ON study_rooms FOR ALL USING (true) WITH CHECK (true);
    
    DROP POLICY IF EXISTS "Allow all for flashcard_decks" ON flashcard_decks;
    CREATE POLICY "Allow all for flashcard_decks" ON flashcard_decks FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow all for peer_ratings" ON peer_ratings;
    CREATE POLICY "Allow all for peer_ratings" ON peer_ratings FOR ALL USING (true) WITH CHECK (true);
END $$;
