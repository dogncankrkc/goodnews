-- Good News Platform — Supabase Schema (v2)
-- Single row per news item with both TR and EN content.
-- Run this SQL in the Supabase SQL Editor.

-- Drop old table if migrating
-- DROP TABLE IF EXISTS news;

CREATE TABLE IF NOT EXISTS news (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tr_title TEXT NOT NULL,
  tr_content TEXT NOT NULL,
  en_title TEXT NOT NULL,
  en_content TEXT NOT NULL,
  image_url TEXT,
  source_url TEXT,
  category TEXT DEFAULT 'general',
  audience_type TEXT DEFAULT 'UNIVERSAL',
  author TEXT DEFAULT 'Haber Merkezi',
  is_breaking BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  reaction_inspiring INT DEFAULT 0,
  reaction_innovative INT DEFAULT 0,
  reaction_heartwarming INT DEFAULT 0,
  reaction_promising INT DEFAULT 0
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_news_created_at ON news(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_category ON news(category);
CREATE INDEX IF NOT EXISTS idx_news_source_url ON news(source_url);

-- Enable Row Level Security
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON news
  FOR SELECT
  USING (true);

-- Allow service role full access (for cron job inserts)
CREATE POLICY "Allow service role full access" ON news
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Drop old functions
DROP FUNCTION IF EXISTS increment_reaction(INT, TEXT);
DROP FUNCTION IF EXISTS increment_reaction(UUID, TEXT);
DROP FUNCTION IF EXISTS increment_reaction;

-- RPC Function for Handling Reactions (Toggle and Swap support)
CREATE OR REPLACE FUNCTION handle_reaction(p_news_id UUID, p_old_reaction TEXT, p_new_reaction TEXT)
RETURNS void AS $$
BEGIN
  -- Revert old reaction if exists
  IF p_old_reaction = 'inspiring' THEN
    UPDATE news SET reaction_inspiring = GREATEST(0, COALESCE(reaction_inspiring, 0) - 1) WHERE id = p_news_id;
  ELSIF p_old_reaction = 'innovative' THEN
    UPDATE news SET reaction_innovative = GREATEST(0, COALESCE(reaction_innovative, 0) - 1) WHERE id = p_news_id;
  ELSIF p_old_reaction = 'heartwarming' THEN
    UPDATE news SET reaction_heartwarming = GREATEST(0, COALESCE(reaction_heartwarming, 0) - 1) WHERE id = p_news_id;
  ELSIF p_old_reaction = 'promising' THEN
    UPDATE news SET reaction_promising = GREATEST(0, COALESCE(reaction_promising, 0) - 1) WHERE id = p_news_id;
  END IF;

  -- Apply new reaction if exists
  IF p_new_reaction = 'inspiring' THEN
    UPDATE news SET reaction_inspiring = COALESCE(reaction_inspiring, 0) + 1 WHERE id = p_news_id;
  ELSIF p_new_reaction = 'innovative' THEN
    UPDATE news SET reaction_innovative = COALESCE(reaction_innovative, 0) + 1 WHERE id = p_news_id;
  ELSIF p_new_reaction = 'heartwarming' THEN
    UPDATE news SET reaction_heartwarming = COALESCE(reaction_heartwarming, 0) + 1 WHERE id = p_news_id;
  ELSIF p_new_reaction = 'promising' THEN
    UPDATE news SET reaction_promising = COALESCE(reaction_promising, 0) + 1 WHERE id = p_news_id;
  END IF;
END;
$$ LANGUAGE plpgsql;
