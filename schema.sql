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

-- ---- ATHLETE ACTION PLAN (AI-recommended next steps) ----
CREATE TABLE IF NOT EXISTS athlete_actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  detail TEXT,
  category TEXT DEFAULT 'general', -- recruiting | nil | training | camp | academic | profile | general
  priority INTEGER DEFAULT 2,      -- 1 high, 2 normal, 3 low
  due_date DATE,
  related_camp_id UUID REFERENCES athlete_starred_camps(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'open',      -- open | snoozed | completed | dismissed
  snoozed_until DATE,
  completed_at TIMESTAMPTZ,
  source TEXT DEFAULT 'ai',        -- ai | user | system
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_actions_athlete ON athlete_actions(athlete_id, status);
CREATE INDEX IF NOT EXISTS idx_actions_due ON athlete_actions(athlete_id, due_date);
ALTER TABLE athlete_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Athletes manage own actions" ON athlete_actions FOR ALL
  USING (athlete_id IN (SELECT id FROM athletes WHERE user_id = auth.uid()));

-- ---- RATING SNAPSHOTS (historical 8-factor radar data) ----
CREATE TABLE IF NOT EXISTS athlete_rating_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
  overall INTEGER,
  grade TEXT,
  factors JSONB, -- { combine, production, offers, stars, social, academics, position, engagement } all 0-10
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_snapshots_athlete ON athlete_rating_snapshots(athlete_id, created_at DESC);
ALTER TABLE athlete_rating_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Athletes manage own rating snapshots" ON athlete_rating_snapshots FOR ALL
  USING (athlete_id IN (SELECT id FROM athletes WHERE user_id = auth.uid()));

-- ============================================
-- CAMP 8 SCORING ENGINE (deterministic, versioned, continuously-learnable)
-- The runtime reads weights/modifiers/trends from these tables on every calc.
-- Weights are NEVER hardcoded in netlify/functions/score.js.
-- ============================================

-- Formula version (one active at a time)
CREATE TABLE IF NOT EXISTS scoring_formula_versions (
  version TEXT PRIMARY KEY,
  description TEXT,
  active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- The 8 factors per formula version (max_points summing to 770 for v1.0.0)
CREATE TABLE IF NOT EXISTS scoring_factors (
  id SERIAL PRIMARY KEY,
  formula_version TEXT NOT NULL REFERENCES scoring_formula_versions(version) ON DELETE CASCADE,
  key TEXT NOT NULL,
  label TEXT NOT NULL,
  max_points INTEGER NOT NULL,
  sort_order INTEGER DEFAULT 0,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(formula_version, key)
);

-- Modifier version (profile-driven weight adjustments)
CREATE TABLE IF NOT EXISTS scoring_modifier_versions (
  version TEXT PRIMARY KEY,
  description TEXT,
  active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- A modifier fires when trigger_expr evaluates true against the athlete's
-- profile context; it then scales specific factor weights and/or applies a
-- confidence multiplier to the total. See score.js evalTrigger().
CREATE TABLE IF NOT EXISTS scoring_modifiers (
  id SERIAL PRIMARY KEY,
  modifier_version TEXT NOT NULL REFERENCES scoring_modifier_versions(version) ON DELETE CASCADE,
  key TEXT NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  trigger_expr JSONB NOT NULL,            -- { field, op, value } OR { all:[...] } OR { any:[...] }
  weight_adjustments JSONB NOT NULL,      -- { <factor_key>: <multiplier>, ... }
  confidence_multiplier NUMERIC(5,3),     -- applied to total points if set
  active BOOLEAN DEFAULT TRUE,
  priority INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(modifier_version, key)
);

-- Market trend multipliers, updated weekly by data ingestion layer.
CREATE TABLE IF NOT EXISTS trend_weights (
  id SERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  label TEXT,
  target_factor TEXT,                     -- matches scoring_factors.key; NULL = global
  multiplier NUMERIC(5,3) DEFAULT 1.000,
  scope JSONB,                            -- e.g. { "position":["QB"], "state":["GA"] }
  source TEXT,
  notes TEXT,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_trend_weights_factor ON trend_weights(target_factor);

-- Every score calculation — full audit trail.
CREATE TABLE IF NOT EXISTS score_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,                 -- 300-850
  raw_points NUMERIC(8,2),
  max_points INTEGER,                     -- 770 for v1.0.0
  formula_version TEXT NOT NULL,
  modifier_version TEXT NOT NULL,
  trend_snapshot_ts TIMESTAMPTZ,
  factor_breakdown JSONB NOT NULL,        -- per-factor raw/modified/contribution/modifiers/trend_multiplier
  applied_modifiers JSONB,
  applied_trends JSONB,
  what_drives_up JSONB,
  what_holds_back JSONB,
  top_3_actions JSONB,
  explanation TEXT,
  inputs_hash TEXT,                       -- sha256 of canonical inputs — determinism check
  trigger_source TEXT,                    -- user | signal-ingest | pattern-detect | scheduled
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_score_calc_athlete ON score_calculations(athlete_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_score_calc_hash ON score_calculations(athlete_id, inputs_hash);

-- Raw signals ingested by EC2 signal processor.
CREATE TABLE IF NOT EXISTS signal_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
  signal_type TEXT NOT NULL,              -- offer_received | combine_update | social_jump | ...
  payload JSONB,
  source TEXT,
  observed_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  score_calc_id UUID REFERENCES score_calculations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_signal_events_athlete ON signal_events(athlete_id, observed_at DESC);
CREATE INDEX IF NOT EXISTS idx_signal_events_unprocessed ON signal_events(processed_at) WHERE processed_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_signal_events_type ON signal_events(signal_type, observed_at DESC);

-- Output of the weekly pattern-detect job — always reviewed before applied.
CREATE TABLE IF NOT EXISTS detected_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_type TEXT NOT NULL,             -- signal_outcome_correlation | factor_decay | modifier_opportunity
  description TEXT,
  evidence JSONB,
  suggested_change JSONB,
  status TEXT DEFAULT 'pending',          -- pending | approved | rejected | applied
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  applied_to_version TEXT,
  run_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_detected_patterns_status ON detected_patterns(status, created_at DESC);

-- RLS: athletes see their own score_calcs + signals; scoring internals are server-only.
ALTER TABLE score_calculations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Athletes read own scores" ON score_calculations FOR SELECT
  USING (athlete_id IN (SELECT id FROM athletes WHERE user_id = auth.uid()));

ALTER TABLE signal_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Athletes read own signals" ON signal_events FOR SELECT
  USING (athlete_id IN (SELECT id FROM athletes WHERE user_id = auth.uid()));

ALTER TABLE scoring_formula_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scoring_factors ENABLE ROW LEVEL SECURITY;
ALTER TABLE scoring_modifier_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scoring_modifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE trend_weights ENABLE ROW LEVEL SECURITY;
ALTER TABLE detected_patterns ENABLE ROW LEVEL SECURITY;

-- Factors + formula versions are public so the UI can render the legend.
CREATE POLICY "Public read factors" ON scoring_factors FOR SELECT USING (TRUE);
CREATE POLICY "Public read formula versions" ON scoring_formula_versions FOR SELECT USING (TRUE);
-- Modifiers / trend_weights / detected_patterns have NO public policy — server-only.
