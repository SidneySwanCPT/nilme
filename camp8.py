#!/usr/bin/env python3
"""
CAMP 8 — Cyber Analytics Mission Platform
Daily Intelligence Digest Agent v1.0

Pulls live RSS feeds across cyber intel, AI, emerging tech,
defense/gov tech, and tech trends. Filters for relevance,
generates a structured digest, and emails it to you daily.

Setup:
    pip install anthropic feedparser schedule requests

Run:
    python camp8.py
"""

import anthropic
import feedparser
import schedule
import smtplib
import time
import requests
from datetime import datetime, timedelta
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase

# ============================================================
#  CREDENTIAL LOADER — reads from encrypted camp8.enc file
# ============================================================

import json, os, getpass as _gp
from cryptography.fernet import Fernet

def load_credentials():
    """Load and decrypt credentials from camp8.enc using camp8.key."""
    # Look for .enc file next to this script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    enc_path   = os.path.join(script_dir, 'camp8.enc')

    if not os.path.exists(enc_path):
        print("ERROR: camp8.enc not found. Run camp8_setup.py first.")
        exit(1)

    # Look for key file — check same folder first, then ask user
    key_path = os.path.join(script_dir, 'camp8.key')
    if not os.path.exists(key_path):
        print("camp8.key not found in script folder.")
        key_path = input("Enter full path to your camp8.key file: ").strip().strip('"')

    if not os.path.exists(key_path):
        print(f"ERROR: Key file not found at {key_path}")
        exit(1)

    try:
        with open(key_path, 'rb') as kf:
            key = kf.read()
        with open(enc_path, 'rb') as cf:
            encrypted = cf.read()
        decrypted = Fernet(key).decrypt(encrypted)
        return json.loads(decrypted.decode())
    except Exception as e:
        print(f"ERROR: Failed to decrypt credentials — {e}")
        print("Make sure you are using the correct camp8.key file.")
        exit(1)

# Load credentials at startup
print("Loading encrypted credentials...")
_creds = load_credentials()
print("Credentials decrypted successfully.")

ANTHROPIC_KEY = _creds['ANTHROPIC_KEY']
SMTP_HOST     = "smtp.gmail.com"
SMTP_PORT     = 587
SMTP_USER     = _creds['SMTP_USER']
SMTP_PASS     = _creds['SMTP_PASS']
REPORT_TO     = _creds['REPORT_TO']
SEND_TIME     = _creds.get('SEND_TIME', '06:00')

# Your analyst profile — used to filter what's relevant
ANALYST_CONTEXT = """
Federal civilian / DoD environment analyst.
Focus: Cyber threat intelligence, APT tracking, ransomware, critical infrastructure,
Federal/DoD networks, emerging technology relevant to national security and defense,
AI developments relevant to cybersecurity and government operations.
Tracked threat actors: APT29, Volt Typhoon, Lazarus Group, BlackCat, LockBit, Scattered Spider, APT41, Sandworm.
Technologies of interest: Active Directory, Azure/AWS, SCADA/ICS, zero trust architecture,
AI/ML in security operations, quantum computing implications.
"""

# ============================================================
#  RSS FEED SOURCES — organized by category
# ============================================================

FEEDS = {

    "cyber_intel": [
        ("CISA Advisories",        "https://www.cisa.gov/cybersecurity-advisories/all.xml"),
        ("Bleeping Computer",      "https://www.bleepingcomputer.com/feed/"),
        ("Krebs on Security",      "https://krebsonsecurity.com/feed/"),
        ("The DFIR Report",        "https://thedfirreport.com/feed/"),
        ("Unit 42 Palo Alto",      "https://unit42.paloaltonetworks.com/feed/"),
        ("Recorded Future",        "https://www.recordedfuture.com/feed"),
        ("Secureworks CTU",        "https://www.secureworks.com/rss/blog"),
        ("Malwarebytes Labs",      "https://www.malwarebytes.com/blog/feed/"),
        ("ThreatPost",             "https://threatpost.com/feed/"),
        ("Dark Reading",           "https://www.darkreading.com/rss.xml"),
        ("SC Magazine",            "https://www.scmagazine.com/rss"),
        ("Infosecurity Magazine",  "https://www.infosecurity-magazine.com/rss/news/"),
    ],

    "ai_emerging_tech": [
        ("MIT Technology Review",  "https://www.technologyreview.com/feed/"),
        ("Wired",                  "https://www.wired.com/feed/rss"),
        ("Ars Technica",           "https://feeds.arstechnica.com/arstechnica/index"),
        ("VentureBeat AI",         "https://venturebeat.com/category/ai/feed/"),
        ("The Verge",              "https://www.theverge.com/rss/index.xml"),
        ("Anthropic Blog",         "https://www.anthropic.com/rss.xml"),
        ("Google DeepMind",        "https://deepmind.google/blog/rss.xml"),
        ("Hugging Face Blog",      "https://huggingface.co/blog/feed.xml"),
        ("TechCrunch AI",          "https://techcrunch.com/category/artificial-intelligence/feed/"),
        ("IEEE Spectrum",          "https://spectrum.ieee.org/feeds/feed.rss"),
    ],

    "defense_gov_tech": [
        ("Defense One",            "https://www.defenseone.com/rss/all/"),
        ("C4ISRNET",               "https://www.c4isrnet.com/arc/outboundfeeds/rss/"),
        ("FedScoop",               "https://fedscoop.com/feed/"),
        ("NextGov",                "https://www.nextgov.com/rss/all/"),
        ("Breaking Defense",       "https://breakingdefense.com/feed/"),
        ("FCW",                    "https://fcw.com/rss-feeds/all.aspx"),
        ("GCN",                    "https://gcn.com/rss-feeds/all.aspx"),
    ],

    "tech_trends": [
        ("Hacker News",            "https://hnrss.org/frontpage"),
        ("TechCrunch",             "https://techcrunch.com/feed/"),
        ("Axios Login",            "https://www.axios.com/feeds/feed.rss"),
        ("The Register",           "https://www.theregister.com/headlines.atom"),
        ("ZDNet",                  "https://www.zdnet.com/news/rss.xml"),
    ],

}

# ============================================================
#  RSS FEED PULLER
# ============================================================

def fetch_feed(name, url, max_items=5, max_age_hours=26):
    """Pull a single RSS feed, return recent items."""
    items = []
    cutoff = datetime.now() - timedelta(hours=max_age_hours)
    try:
        feed = feedparser.parse(url)
        for entry in feed.entries[:max_items]:
            # Try to get publish date
            pub = None
            if hasattr(entry, 'published_parsed') and entry.published_parsed:
                pub = datetime(*entry.published_parsed[:6])
            elif hasattr(entry, 'updated_parsed') and entry.updated_parsed:
                pub = datetime(*entry.updated_parsed[:6])

            # Skip if too old (only enforce if we got a date)
            if pub and pub < cutoff:
                continue

            title   = getattr(entry, 'title', 'No title')
            summary = getattr(entry, 'summary', getattr(entry, 'description', ''))
            link    = getattr(entry, 'link', '')

            # Clean up summary — strip HTML tags roughly
            import re
            summary = re.sub(r'<[^>]+>', ' ', summary)
            summary = re.sub(r'\s+', ' ', summary).strip()
            summary = summary[:400] + '...' if len(summary) > 400 else summary

            items.append({
                'source': name,
                'title':  title,
                'summary': summary,
                'link':   link,
                'date':   pub.strftime('%Y-%m-%d %H:%M') if pub else 'Unknown date'
            })
    except Exception as e:
        print(f"  [WARN] Failed to fetch {name}: {e}")
    return items


def fetch_all_feeds():
    """Pull all feeds across all categories."""
    print("Pulling RSS feeds...")
    results = {}
    for category, feeds in FEEDS.items():
        results[category] = []
        for name, url in feeds:
            print(f"  Fetching {name}...")
            items = fetch_feed(name, url)
            results[category].extend(items)
            time.sleep(0.5)  # polite delay
        print(f"  [{category}] {len(results[category])} items collected")
    return results


def format_feed_data(feed_data):
    """Format feed data into a readable string for the prompt."""
    sections = {
        'cyber_intel':      'CYBER INTELLIGENCE FEEDS',
        'ai_emerging_tech': 'AI & EMERGING TECHNOLOGY FEEDS',
        'defense_gov_tech': 'DEFENSE & GOVERNMENT TECHNOLOGY FEEDS',
        'tech_trends':      'TECH TRENDS & INDUSTRY FEEDS',
    }
    out = []
    for key, label in sections.items():
        items = feed_data.get(key, [])
        if not items:
            out.append(f"\n--- {label} ---\n[No items retrieved]")
            continue
        out.append(f"\n--- {label} ({len(items)} items) ---")
        for item in items:
            out.append(f"\nSOURCE: {item['source']} | DATE: {item['date']}")
            out.append(f"TITLE: {item['title']}")
            if item['summary']:
                out.append(f"SUMMARY: {item['summary']}")
    return '\n'.join(out)

# ============================================================
#  REPORT GENERATOR
# ============================================================

def generate_report(feed_data):
    """Send feed data to Claude and get back a structured report."""
    print("Generating report with Claude...")
    client = anthropic.Anthropic(api_key=ANTHROPIC_KEY)

    feed_text = format_feed_data(feed_data)
    today = datetime.now().strftime('%A, %B %d, %Y')

    prompt = f"""You are a senior intelligence analyst producing a daily briefing digest for {today}.

ANALYST PROFILE:
{ANALYST_CONTEXT}

Below is today's raw feed data pulled from live RSS sources across cyber intelligence,
AI/emerging tech, defense/gov tech, and tech trends. Read all of it, then produce a
structured daily digest that surfaces what is most significant and relevant to this analyst.

--- RAW FEED DATA START ---
{feed_text}
--- RAW FEED DATA END ---

Produce the following sections. Be specific, reference actual articles from the feed data above,
and filter ruthlessly — only include what genuinely matters to this analyst's profile.

=== CRITICAL CYBER ALERTS ===
Top 3-5 most urgent cyber threats, vulnerabilities, or incidents from today's feeds.
For each: what it is, who's affected, severity (CRITICAL/HIGH/MEDIUM), and what to watch.
Include CVE IDs and MITRE ATT&CK technique IDs where relevant.
If nothing critical today, say so clearly.

=== THREAT INTEL DIGEST ===
Key threat actor activity, malware campaigns, IOC highlights, and TTPs from today's feeds.
Focus on actors and tactics relevant to Federal/DoD environments.
Include any new IOCs (IPs, domains, hashes) mentioned in the feeds.

=== AI & EMERGING TECH ===
3-5 most significant AI and emerging technology developments from today's feeds.
Focus on developments relevant to cybersecurity, defense, or government operations.
Note implications for the analyst's work where relevant.

=== DEFENSE & GOV TECH ===
3-5 key stories from defense and government technology feeds.
Focus on policy, procurement, new capabilities, or operational developments.

=== TECH TRENDS & INDUSTRY ===
2-3 broader technology trends worth tracking this week.
What's gaining momentum, what's shifting, what to keep an eye on.

=== ANALYST NOTES ===
2-3 sentences: What is the single most important thing from today's digest,
and what should this analyst be paying closest attention to this week?

Keep each section tight and actionable. Reference source names where helpful.
Do not pad with generic filler — if a section has nothing significant today, say so briefly."""

    msg = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4000,
        messages=[{"role": "user", "content": prompt}]
    )
    return msg.content[0].text

# ============================================================
#  EMAIL SENDER
# ============================================================

def send_email(report_text):
    """Send the report via email."""
    today = datetime.now().strftime('%Y-%m-%d')
    subject = f"CAMP 8 // Daily Intel Digest — {today}"

    # Plain text version
    plain = report_text

    # HTML version — basic formatting for readability
    html_body = report_text
    html_body = html_body.replace('=== ', '<h2 style="color:#0088aa;border-bottom:1px solid #ccc;padding-bottom:4px;font-family:monospace;letter-spacing:2px;">')
    html_body = html_body.replace(' ===', '</h2>')
    html_body = html_body.replace('\n', '<br>')

    html = f"""
    <html><body style="background:#f4f6f8;padding:20px;font-family:monospace;">
    <div style="max-width:800px;margin:0 auto;background:#fff;padding:28px;border:1px solid #ddd;">
      <div style="background:#080c10;padding:16px 20px;margin-bottom:24px;">
        <span style="color:#00d4ff;font-size:20px;letter-spacing:4px;font-weight:bold;">CAMP 8</span>
        <span style="color:#4a6a7a;font-size:11px;margin-left:12px;letter-spacing:2px;">CYBER ANALYTICS MISSION PLATFORM</span>
      </div>
      <div style="color:#222;font-size:13px;line-height:1.8;">
        {html_body}
      </div>
      <div style="margin-top:24px;padding-top:12px;border-top:1px solid #eee;color:#999;font-size:10px;letter-spacing:1px;">
        CAMP 8 DAILY DIGEST // {today} // POWERED BY CLAUDE + LIVE RSS FEEDS
      </div>
    </div>
    </body></html>
    """

    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From']    = SMTP_USER
    msg['To']      = REPORT_TO
    msg.attach(MIMEText(plain, 'plain'))
    msg.attach(MIMEText(html,  'html'))

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as s:
        s.starttls()
        s.login(SMTP_USER, SMTP_PASS)
        s.sendmail(SMTP_USER, REPORT_TO, msg.as_string())

    print(f"Report sent to {REPORT_TO}")

# ============================================================
#  MAIN RUN FUNCTION
# ============================================================

def run():
    print(f"\n{'='*50}")
    print(f"CAMP 8 AGENT STARTING — {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print(f"{'='*50}")
    try:
        feed_data  = fetch_all_feeds()
        report     = generate_report(feed_data)
        send_email(report)
        print("Done.")
    except Exception as e:
        print(f"ERROR: {e}")
        # Send error notification so you know something went wrong
        try:
            msg = MIMEMultipart()
            msg['Subject'] = "CAMP 8 // ERROR — Report Failed"
            msg['From']    = SMTP_USER
            msg['To']      = REPORT_TO
            msg.attach(MIMEText(f"CAMP 8 failed to generate today's report.\n\nError: {str(e)}", 'plain'))
            with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as s:
                s.starttls()
                s.login(SMTP_USER, SMTP_PASS)
                s.sendmail(SMTP_USER, REPORT_TO, msg.as_string())
        except:
            pass

# ============================================================
#  SCHEDULER
# ============================================================

if __name__ == '__main__':
    print(f"CAMP 8 Agent initialized.")
    print(f"Daily report scheduled at {SEND_TIME}.")
    print(f"Sending to: {REPORT_TO}")
    print(f"Monitoring {sum(len(v) for v in FEEDS.values())} RSS feeds across {len(FEEDS)} categories.")
    print(f"\nType Ctrl+C to stop.\n")

    # Run immediately on start so you can test it
    print("Running initial report now...")
    run()

    # Then schedule daily
    schedule.every().day.at(SEND_TIME).do(run)
    while True:
        schedule.run_pending()
        time.sleep(60)
