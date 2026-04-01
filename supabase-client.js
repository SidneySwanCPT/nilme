// ============================================
// Camp 8 — Supabase Client
// Shared across all pages that need auth/data
// ============================================

// Load Supabase from CDN
const SUPABASE_URL = 'https://afikpptrkkfpoatadhyg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmaWtwcHRya2tmcG9hdGFkaHlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwMDM4MjIsImV4cCI6MjA5MDU3OTgyMn0.fSpFH4kP_iyDAptTlTIQLL5tjhzjFe6PWFDMdWV55uI';

// Initialize client (loaded via CDN script tag)
let _supabase = null;

function getSupabase() {
  if (_supabase) return _supabase;
  if (typeof window !== 'undefined' && window.supabase) {
    _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return _supabase;
  }
  console.error('Supabase SDK not loaded');
  return null;
}

// ---- Auth helpers ----
async function getCurrentUser() {
  const sb = getSupabase();
  if (!sb) return null;
  const { data: { user } } = await sb.auth.getUser();
  return user;
}

async function getAthleteProfile(userId) {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb
    .from('athletes')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error && error.code !== 'PGRST116') console.error('Profile fetch error:', error);
  return data;
}

async function upsertAthleteProfile(userId, profile) {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb
    .from('athletes')
    .upsert({ user_id: userId, ...profile, updated_at: new Date().toISOString() })
    .select()
    .single();
  if (error) console.error('Profile upsert error:', error);
  return data;
}

// ---- Sign in / Sign up ----
async function signUp(email, password) {
  const sb = getSupabase();
  return await sb.auth.signUp({ email, password });
}

async function signIn(email, password) {
  const sb = getSupabase();
  return await sb.auth.signInWithPassword({ email, password });
}

async function signOut() {
  const sb = getSupabase();
  await sb.auth.signOut();
  window.location.href = 'index.html';
}

// ---- Session listener ----
function onAuthStateChange(callback) {
  const sb = getSupabase();
  if (!sb) return;
  sb.auth.onAuthStateChange((event, session) => {
    callback(event, session?.user || null);
  });
}

// ---- Combine scores ----
async function saveCombineScore(athleteId, scoreData) {
  const sb = getSupabase();
  const { data, error } = await sb
    .from('athlete_combine_scores')
    .insert({ athlete_id: athleteId, ...scoreData })
    .select().single();
  if (error) console.error('Combine save error:', error);
  return data;
}

async function getCombineHistory(athleteId, limit = 10) {
  const sb = getSupabase();
  const { data } = await sb
    .from('athlete_combine_scores')
    .select('*')
    .eq('athlete_id', athleteId)
    .order('created_at', { ascending: false })
    .limit(limit);
  return data || [];
}

// ---- NIL scores ----
async function saveNilScore(athleteId, scoreData) {
  const sb = getSupabase();
  const { data, error } = await sb
    .from('athlete_nil_scores')
    .insert({ athlete_id: athleteId, ...scoreData })
    .select().single();
  if (error) console.error('NIL save error:', error);
  return data;
}

async function getNilHistory(athleteId, limit = 10) {
  const sb = getSupabase();
  const { data } = await sb
    .from('athlete_nil_scores')
    .select('*')
    .eq('athlete_id', athleteId)
    .order('created_at', { ascending: false })
    .limit(limit);
  return data || [];
}

// ---- Starred camps ----
async function starCamp(athleteId, campData) {
  const sb = getSupabase();
  // Check for duplicate
  const { data: existing } = await sb
    .from('athlete_starred_camps')
    .select('id')
    .eq('athlete_id', athleteId)
    .eq('camp_id', campData.camp_id)
    .single();
  if (existing) return { duplicate: true, data: existing };
  const { data, error } = await sb
    .from('athlete_starred_camps')
    .insert({ athlete_id: athleteId, ...campData })
    .select().single();
  if (error) console.error('Star camp error:', error);
  return { data };
}

async function unstarCamp(athleteId, campId) {
  const sb = getSupabase();
  await sb.from('athlete_starred_camps').delete()
    .eq('athlete_id', athleteId).eq('camp_id', campId);
}

async function getStarredCamps(athleteId) {
  const sb = getSupabase();
  const { data } = await sb
    .from('athlete_starred_camps')
    .select('*')
    .eq('athlete_id', athleteId)
    .order('camp_dates', { ascending: true });
  return data || [];
}

// ---- Offers ----
async function addOffer(athleteId, offerData) {
  const sb = getSupabase();
  const { data, error } = await sb
    .from('athlete_offers')
    .insert({ athlete_id: athleteId, ...offerData })
    .select().single();
  if (error) console.error('Offer add error:', error);
  return data;
}

async function getOffers(athleteId) {
  const sb = getSupabase();
  const { data } = await sb
    .from('athlete_offers')
    .select('*')
    .eq('athlete_id', athleteId)
    .order('offer_date', { ascending: false });
  return data || [];
}

async function deleteOffer(offerId) {
  const sb = getSupabase();
  await sb.from('athlete_offers').delete().eq('id', offerId);
}

// ---- Goals ----
async function addGoal(athleteId, goalData) {
  const sb = getSupabase();
  const { data, error } = await sb
    .from('athlete_goals')
    .insert({ athlete_id: athleteId, ...goalData })
    .select().single();
  if (error) console.error('Goal add error:', error);
  return data;
}

async function getGoals(athleteId) {
  const sb = getSupabase();
  const { data } = await sb
    .from('athlete_goals')
    .select('*')
    .eq('athlete_id', athleteId)
    .order('created_at', { ascending: false });
  return data || [];
}

async function toggleGoal(goalId, completed) {
  const sb = getSupabase();
  await sb.from('athlete_goals').update({
    completed,
    completed_at: completed ? new Date().toISOString() : null
  }).eq('id', goalId);
}

async function deleteGoal(goalId) {
  const sb = getSupabase();
  await sb.from('athlete_goals').delete().eq('id', goalId);
}
