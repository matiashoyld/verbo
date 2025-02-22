-- Create enum types
CREATE TYPE user_role AS ENUM ('RECRUITER', 'CANDIDATE');
CREATE TYPE submission_status AS ENUM ('IN_PROGRESS', 'COMPLETED', 'FAILED');

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS "User" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    role user_role DEFAULT 'CANDIDATE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create skills table
CREATE TABLE IF NOT EXISTS "Skill" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create challenges table
CREATE TABLE IF NOT EXISTS "Challenge" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    instructions TEXT NOT NULL,
    time_limit INTEGER,
    creator_id UUID NOT NULL REFERENCES "User"(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create challenge_skills junction table
CREATE TABLE IF NOT EXISTS "ChallengeSkill" (
    challenge_id UUID REFERENCES "Challenge"(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES "Skill"(id) ON DELETE CASCADE,
    PRIMARY KEY (challenge_id, skill_id)
);

-- Create submissions table
CREATE TABLE IF NOT EXISTS "Submission" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    challenge_id UUID NOT NULL REFERENCES "Challenge"(id),
    candidate_id UUID NOT NULL REFERENCES "User"(id),
    audio_url TEXT,
    screen_url TEXT,
    transcript TEXT,
    feedback JSONB,
    status submission_status DEFAULT 'IN_PROGRESS',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create RLS policies
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Skill" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Challenge" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ChallengeSkill" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Submission" ENABLE ROW LEVEL SECURITY;

-- User policies
CREATE POLICY "Users can view their own data"
    ON "User"
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
    ON "User"
    FOR UPDATE
    USING (auth.uid() = id);

-- Skill policies (publicly readable)
CREATE POLICY "Skills are publicly readable"
    ON "Skill"
    FOR SELECT
    TO PUBLIC
    USING (true);

-- Challenge policies
CREATE POLICY "Challenges are publicly readable"
    ON "Challenge"
    FOR SELECT
    TO PUBLIC
    USING (true);

CREATE POLICY "Recruiters can create challenges"
    ON "Challenge"
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM "User"
            WHERE id = auth.uid()
            AND role = 'RECRUITER'
        )
    );

-- Submission policies
CREATE POLICY "Users can view their own submissions"
    ON "Submission"
    FOR SELECT
    USING (
        auth.uid() = candidate_id OR
        EXISTS (
            SELECT 1 FROM "Challenge"
            WHERE id = challenge_id
            AND creator_id = auth.uid()
        )
    );

CREATE POLICY "Users can create their own submissions"
    ON "Submission"
    FOR INSERT
    WITH CHECK (auth.uid() = candidate_id);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO "User" (id, email, name, role)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'name', new.email),
        (new.raw_user_meta_data->>'role')::user_role
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user(); 