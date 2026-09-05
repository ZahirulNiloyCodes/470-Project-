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

-- 5. Member 2: Whiteboard Canvas Records
CREATE TABLE IF NOT EXISTS canvas_records (
    id TEXT PRIMARY KEY,
    room_id TEXT NOT NULL,
    record_id TEXT NOT NULL,
    record_data JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_room_record UNIQUE (room_id, record_id)
);

-- 6. Member 2: Chat Messages
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    username TEXT NOT NULL,
    content TEXT NOT NULL,
    is_edited BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Member 2: Anonymous Q&A Queue
CREATE TABLE IF NOT EXISTS anonymous_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id TEXT NOT NULL,
    participant_id TEXT,
    question TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'answered', 'dismissed')),
    answer TEXT,
    answered_at TIMESTAMPTZ,
    dismissed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Member 2: Screen Sharing Sessions
CREATE TABLE IF NOT EXISTS screenshare_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id TEXT NOT NULL,
    participant_id TEXT NOT NULL,
    participant_name TEXT NOT NULL,
    is_sharing BOOLEAN DEFAULT TRUE,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ
);

-- 9. Member 3: Kanban Tasks
CREATE TABLE IF NOT EXISTS room_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id TEXT NOT NULL,
    title TEXT NOT NULL,
    status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Member 3: Study Session Logs
CREATE TABLE IF NOT EXISTS study_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    room_id TEXT,
    duration_minutes INT NOT NULL DEFAULT 25,
    session_date TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Member 3: Resource Hub
CREATE TABLE IF NOT EXISTS room_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    resource_type TEXT NOT NULL CHECK (resource_type IN ('link', 'file')),
    url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) policies - Enable public access for development
ALTER TABLE study_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcard_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE peer_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE anonymous_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE screenshare_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_resources ENABLE ROW LEVEL SECURITY;

DO $$ 
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY[
        'study_rooms', 'flashcard_decks', 'peer_ratings',
        'canvas_records', 'chat_messages', 'anonymous_questions',
        'screenshare_sessions', 'room_tasks', 'study_logs', 'room_resources'
    ]) LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Allow all for %I" ON %I;', tbl, tbl);
        EXECUTE format('CREATE POLICY "Allow all for %I" ON %I FOR ALL USING (true) WITH CHECK (true);', tbl, tbl);
    END LOOP;
END $$;
