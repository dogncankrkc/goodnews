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
  reaction_promising INT DEFAULT 0,
  report_count INT DEFAULT 0
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

-- RPC Function for Toggling News Reports
CREATE OR REPLACE FUNCTION report_news(p_news_id UUID, p_is_reporting BOOLEAN)
RETURNS void AS $$
BEGIN
  IF p_is_reporting THEN
    UPDATE news SET report_count = COALESCE(report_count, 0) + 1 WHERE id = p_news_id;
  ELSE
    UPDATE news SET report_count = GREATEST(0, COALESCE(report_count, 0) - 1) WHERE id = p_news_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- --------------------------------------------------------
-- Global Stats Table (For PositiveStatsBar)
-- Stores the latest fetched stats from external APIs
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS global_stats (
  id INT DEFAULT 1 PRIMARY KEY,
  trees BIGINT NOT NULL DEFAULT 0,
  energy BIGINT NOT NULL DEFAULT 0,
  pets BIGINT NOT NULL DEFAULT 0,
  plastic BIGINT NOT NULL DEFAULT 0,
  meals BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for global_stats
ALTER TABLE global_stats ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access on global_stats" ON global_stats
  FOR SELECT USING (true);

-- Allow service role full access on global_stats
CREATE POLICY "Allow service role full access on global_stats" ON global_stats
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- --------------------------------------------------------
-- Daily Stats Table (For CollectiveGoodnessCounter Hybrid Architecture)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS daily_stats (
  date DATE PRIMARY KEY DEFAULT CURRENT_DATE,
  total_reads INT NOT NULL DEFAULT 0
);

ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on daily_stats" ON daily_stats
  FOR SELECT USING (true);

-- RPC for incrementing safely (Race condition safe)
CREATE OR REPLACE FUNCTION increment_daily_read()
RETURNS void AS $$
BEGIN
  INSERT INTO daily_stats (date, total_reads)
  VALUES (CURRENT_DATE, 1)
  ON CONFLICT (date)
  DO UPDATE SET total_reads = daily_stats.total_reads + 1;
END;
$$ LANGUAGE plpgsql;
