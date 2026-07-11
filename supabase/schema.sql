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
  author TEXT DEFAULT 'Haber Merkezi',
  is_breaking BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
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
