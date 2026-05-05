// ============================================
// Camp 8 — Daily News Scanner
// Netlify Scheduled Function (runs daily)
// Scans news for commitments + NIL deals
// Extracts data with AI → pending review queue
//
// Schedule: Add to netlify.toml:
// [functions."news-scanner"]
//   schedule = "0 8 * * *"  (8am daily)
// ============================================

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL     = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY; // service role key (not anon)
const ANTHROPIC_KEY    = process.env.ANTHROPIC_API_KEY;
const RSS2JSON         = 'https://api.rss2json.com/v1/api.json?rss_url=';

const NEWS_FEEDS = [
  // Commitments
  'https://news.google.com/rss/search?q=high+school+football+committed+2026+2027+stars&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=football+recruit+commits+Georgia+Florida+Texas+California&hl=en-US&gl=US&ceid=US:en',
  // NIL deals
  'https://news.google.com/rss/search?q=high+school+football+NIL+deal+signs&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=high+school+athlete+NIL+endorsement+2026&hl=en-US&gl=US&ceid=US:en',
];

exports.handler = async function(event, context) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !ANTHROPIC_KEY) {
    console.error('Missing environment variables');
    return { statusCode: 500, body: 'Missing env vars' };
  }

  const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  let processed = 0, added = 0;

  try {
    // Fetch all news feeds
    const allItems = [];
    for (const feed of NEWS_FEEDS) {
      try {
        const res = await fetch(RSS2JSON + encodeURIComponent(feed) + '&count=20');
        const data = await res.json();
        if (data.items) allItems.push(...data.items);
      } catch (e) {
        console.error('Feed error:', e.message);
      }
    }

    // Dedupe by title
    const seen = new Set();
    const unique = allItems.filter(item => {
      const k = (item.title || '').slice(0, 80);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });

    // Check which we've already processed
    const { data: existingPending } = await sb
      .from('pending_news')
      .select('headline')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    const existingHeadlines = new Set((existingPending || []).map(p => p.headline?.slice(0, 80)));

    // Filter to new items only
    const newItems = unique.filter(item => {
      const headline = (item.title || '').slice(0, 80);
      return !existingHeadlines.has(headline);
    });

    console.log(`Found ${newItems.length} new items to process`);

    // Process each item with AI
    for (const item of newItems.slice(0, 15)) { // Max 15 per run
      processed++;
      try {
        const result = await extractWithAI(item.title, item.description, item.link);
        if (!result) continue;

        // Insert into pending_news
        const { error } = await sb.from('pending_news').insert({
          type: result.type,
          extracted_data: result.data,
          source_url: item.link,
          source_name: extractDomain(item.link),
          headline: item.title,
          confidence: result.confidence,
          status: 'pending',
        });

        if (!error) added++;
      } catch (e) {
        console.error('Item processing error:', e.message);
      }
    }

    console.log(`Processed: ${processed}, Added to queue: ${added}`);
    return {
      statusCode: 200,
      body: JSON.stringify({ processed, added }),
    };
  } catch (err) {
    console.error('Scanner error:', err);
    return { statusCode: 500, body: err.message };
  }
};

async function extractWithAI(title, description, url) {
  const text = `${title}\n${description || ''}`;

  // Quick filter — skip if not relevant
  const lower = text.toLowerCase();
  const isCommitment = lower.includes('commit') || lower.includes('verbally') || lower.includes('pledges');
  const isNIL = lower.includes('nil') || lower.includes('endorsement') || lower.includes('deal') || lower.includes('sponsor');

  if (!isCommitment && !isNIL) return null;

  const type = isCommitment ? 'commitment' : 'nil_deal';

  const prompt = type === 'commitment'
    ? `Extract recruiting commitment data from this news text. Return ONLY valid JSON, no other text.

Text: "${text}"

Return this exact structure:
{
  "athlete": "full name or null",
  "pos": "position abbreviation or null",
  "stars": number 3-5 or 0,
  "school": "high school name or null",
  "city": "city or null",
  "state": "2-letter state or null",
  "class_year": 4-digit year or null,
  "committed_to": "college name or null",
  "conference": "conference or null",
  "confidence": 0.0-1.0
}`
    : `Extract NIL deal data from this news text. Return ONLY valid JSON, no other text.

Text: "${text}"

Return this exact structure:
{
  "athlete": "full name or null",
  "pos": "position or null",
  "stars": number 3-5 or 0,
  "school": "high school name or null",
  "state": "2-letter state or null",
  "deal": "description of deal or null",
  "brand": "brand/company name or null",
  "value": "dollar amount or Undisclosed",
  "confidence": 0.0-1.0
}`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001', // Fast + cheap for extraction
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await res.json();
    const rawText = data.content?.[0]?.text || '';

    // Parse JSON safely
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const extracted = JSON.parse(jsonMatch[0]);
    const confidence = extracted.confidence || 0;

    // Only queue if confidence is reasonable
    if (confidence < 0.5) return null;
    if (!extracted.athlete) return null;

    return { type, data: extracted, confidence };
  } catch (e) {
    console.error('AI extraction error:', e.message);
    return null;
  }
}

function extractDomain(url) {
  try { return new URL(url).hostname.replace('www.', ''); }
  catch { return 'unknown'; }
}
