-- ============================================
-- Camp 8 — Supabase Database Schema
-- Run this entire file in:
-- Supabase Dashboard → SQL Editor → New Query → Run
-- ============================================

-- ---- ATHLETES (user profiles) ----
CREATE TABLE IF NOT EXISTS athletes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  position TEXT,
  graduation_year INTEGER,
  state TEXT,
  city TEXT,
  school TEXT,
  height TEXT,
  weight INTEGER,
  forty_time DECIMAL(4,2),
  vertical INTEGER,
  stars INTEGER DEFAULT 0,
  offers_count INTEGER DEFAULT 0,
  instagram TEXT,
  twitter TEXT,
  tiktok TEXT,
  hudl_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---- ATHLETE COMBINE SCORES (history) ----
CREATE TABLE IF NOT EXISTS athlete_combine_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
  pos TEXT,
  forty DECIMAL(4,2),
  vertical DECIMAL(4,1),
  broad INTEGER,
  shuttle DECIMAL(4,2),
  cone DECIMAL(4,2),
  bench INTEGER,
  overall_grade TEXT,
  score_data JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---- ATHLETE NIL SCORES (history) ----
CREATE TABLE IF NOT EXISTS athlete_nil_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
  score INTEGER,
  grade TEXT,
  breakdown JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---- ATHLETE STARRED CAMPS ----
CREATE TABLE IF NOT EXISTS athlete_starred_camps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
  camp_id TEXT,
  camp_name TEXT,
  camp_city TEXT,
  camp_state TEXT,
  camp_dates TEXT,
  camp_tier INTEGER,
  status TEXT DEFAULT 'interested', -- interested | planning | registered | attended
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---- ATHLETE OFFERS ----
CREATE TABLE IF NOT EXISTS athlete_offers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
  college TEXT NOT NULL,
  division TEXT,
  conference TEXT,
  offer_type TEXT DEFAULT 'Scholarship', -- Scholarship | Walk-On | Preferred Walk-On
  offer_date DATE,
  status TEXT DEFAULT 'Active', -- Active | Declined | Committed
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---- ATHLETE GOALS ----
CREATE TABLE IF NOT EXISTS athlete_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'general', -- combine | nil | recruiting | academic | camp
  target_value TEXT,
  current_value TEXT,
  target_date DATE,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---- CAMPS (admin-managed) ----
CREATE TABLE IF NOT EXISTS camps_admin (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  host TEXT,
  city TEXT,
  state TEXT,
  state_abbrev TEXT,
  dates TEXT,
  tier INTEGER DEFAULT 3,
  tier_label TEXT DEFAULT 'Regional',
  invite_only BOOLEAN DEFAULT FALSE,
  registration_url TEXT,
  description TEXT,
  lat DECIMAL(9,6),
  lng DECIMAL(9,6),
  source_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---- COMMITMENTS (admin-managed) ----
CREATE TABLE IF NOT EXISTS commitments_admin (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  athlete TEXT NOT NULL,
  pos TEXT,
  stars INTEGER DEFAULT 0,
  school TEXT,
  city TEXT,
  state TEXT,
  class_year INTEGER,
  committed_to TEXT,
  conference TEXT,
  status TEXT DEFAULT 'Committed',
  announcement_date DATE,
  source_url TEXT,
  source_name TEXT,
  verified BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---- NIL DEALS (admin-managed) ----
CREATE TABLE IF NOT EXISTS nil_deals_admin (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  athlete TEXT NOT NULL,
  school TEXT,
  city TEXT,
  state TEXT,
  pos TEXT,
  stars INTEGER DEFAULT 0,
  deal TEXT,
  brand TEXT,
  value TEXT DEFAULT 'Undisclosed',
  deal_date DATE,
  source_url TEXT,
  source_name TEXT,
  verified BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---- PENDING NEWS (AI extraction queue) ----
CREATE TABLE IF NOT EXISTS pending_news (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL, -- commitment | nil_deal | camp
  extracted_data JSONB,
  source_url TEXT,
  source_name TEXT,
  headline TEXT,
  confidence DECIMAL(3,2), -- 0.0 to 1.0
  status TEXT DEFAULT 'pending', -- pending | approved | rejected | duplicate
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---- ROW LEVEL SECURITY ----
-- Athletes can only see/edit their own data
ALTER TABLE athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE athlete_combine_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE athlete_nil_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE athlete_starred_camps ENABLE ROW LEVEL SECURITY;
ALTER TABLE athlete_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE athlete_goals ENABLE ROW LEVEL SECURITY;

-- Athletes table policies
CREATE POLICY "Athletes can view own profile" ON athletes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Athletes can update own profile" ON athletes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Athletes can insert own profile" ON athletes FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Combine scores
CREATE POLICY "Athletes can view own combine scores" ON athlete_combine_scores FOR SELECT USING (athlete_id IN (SELECT id FROM athletes WHERE user_id = auth.uid()));
CREATE POLICY "Athletes can insert own combine scores" ON athlete_combine_scores FOR INSERT WITH CHECK (athlete_id IN (SELECT id FROM athletes WHERE user_id = auth.uid()));

-- NIL scores
CREATE POLICY "Athletes can view own NIL scores" ON athlete_nil_scores FOR SELECT USING (athlete_id IN (SELECT id FROM athletes WHERE user_id = auth.uid()));
CREATE POLICY "Athletes can insert own NIL scores" ON athlete_nil_scores FOR INSERT WITH CHECK (athlete_id IN (SELECT id FROM athletes WHERE user_id = auth.uid()));

-- Starred camps
CREATE POLICY "Athletes can manage own starred camps" ON athlete_starred_camps FOR ALL USING (athlete_id IN (SELECT id FROM athletes WHERE user_id = auth.uid()));

-- Offers
CREATE POLICY "Athletes can manage own offers" ON athlete_offers FOR ALL USING (athlete_id IN (SELECT id FROM athletes WHERE user_id = auth.uid()));

-- Goals
CREATE POLICY "Athletes can manage own goals" ON athlete_goals FOR ALL USING (athlete_id IN (SELECT id FROM athletes WHERE user_id = auth.uid()));

-- Public read on admin tables (so the site can display camps/commitments)
ALTER TABLE camps_admin ENABLE ROW LEVEL SECURITY;
ALTER TABLE commitments_admin ENABLE ROW LEVEL SECURITY;
ALTER TABLE nil_deals_admin ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read camps" ON camps_admin FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public can read commitments" ON commitments_admin FOR SELECT USING (verified = TRUE);
CREATE POLICY "Public can read nil deals" ON nil_deals_admin FOR SELECT USING (verified = TRUE);

-- ============================================
-- Run this and you're done!
-- ============================================

-- ---- COACHES (admin-managed, supplements coaches-data.js) ----
CREATE TABLE IF NOT EXISTS coaches_admin (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school TEXT NOT NULL,
  nickname TEXT,
  division TEXT,
  conference TEXT,
  state TEXT,
  city TEXT,
  head_coach TEXT,
  oc TEXT,
  dc TEXT,
  recruiting_coord TEXT,
  staff_page TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE coaches_admin ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read coaches" ON coaches_admin FOR SELECT USING (auth.role() = 'authenticated');
