-- Create the recording_metadata table for storing information about candidate recordings
CREATE TABLE IF NOT EXISTS recording_metadata (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  candidate_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  position_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  duration_seconds FLOAT,
  processed BOOLEAN DEFAULT FALSE
);

-- Create indexes for common query patterns
CREATE INDEX IF NOT EXISTS recording_metadata_candidate_position_idx 
  ON recording_metadata(candidate_id, position_id);
CREATE INDEX IF NOT EXISTS recording_metadata_question_idx 
  ON recording_metadata(question_id);

-- Enable Row Level Security
ALTER TABLE recording_metadata ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing user's own recordings
CREATE POLICY "Users can view their own recordings"
  ON recording_metadata
  FOR SELECT
  USING (auth.uid() = candidate_id);

-- Create policy for inserting recordings
CREATE POLICY "Users can insert their own recordings"
  ON recording_metadata
  FOR INSERT
  WITH CHECK (auth.uid() = candidate_id);

-- Create policy for updating recordings
CREATE POLICY "Users can update their own recordings"
  ON recording_metadata
  FOR UPDATE
  USING (auth.uid() = candidate_id); 