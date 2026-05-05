// netlify/functions/scrape.js
// Proxies scrape requests from the frontend to the EC2 backend
// The backend URL and secret never get exposed to the browser

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const BACKEND_URL = process.env.CAMP8_BACKEND_URL;
  const API_SECRET  = process.env.CAMP8_API_SECRET;

  if (!BACKEND_URL || !API_SECRET) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Backend not configured' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { type, url, athleteId } = body;

  // Only allow maxpreps scraping for now
  const allowedTypes = ['maxpreps'];
  if (!allowedTypes.includes(type)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid scrape type' }) };
  }

  if (!url) {
    return { statusCode: 400, body: JSON.stringify({ error: 'URL required' }) };
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/scrape/${type}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-camp8-secret': API_SECRET
      },
      body: JSON.stringify({ url, athleteId })
    });

    const data = await response.json();

    return {
      statusCode: response.status,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Backend unreachable', detail: err.message })
    };
  }
};
