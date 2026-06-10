#!/usr/bin/env python3
"""
CryptoValley.jobs — Job alert emails

Sends a digest of newly published jobs to confirmed email subscribers.
Runs after the daily scraper in GitHub Actions.

Jobs are deduplicated via the jobs.alerted_at column: only active,
unexpired jobs with alerted_at IS NULL are candidates. Jobs published
more than RECENT_DAYS ago are marked as alerted without being sent, so
a gap in workflow runs never floods subscribers with stale listings.

Usage:
  python scripts/send_alerts.py            # send for real (needs RESEND_API_KEY)
  python scripts/send_alerts.py --dry-run  # print what would be sent
"""

import logging
import os
import sys
from datetime import datetime, timedelta, timezone

import httpx
from supabase import create_client

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
)
log = logging.getLogger("alerts")

# ── Config ──────────────────────────────────────────────────────────

RECENT_DAYS = 3
MAX_JOBS_IN_EMAIL = 20
RESEND_BATCH_SIZE = 100

_url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "")
_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
if not _url or not _key:
    missing = [v for v, val in [("NEXT_PUBLIC_SUPABASE_URL", _url), ("SUPABASE_SERVICE_ROLE_KEY", _key)] if not val]
    sys.exit(f"ERROR: Missing required env vars: {', '.join(missing)}. Add them as GitHub Actions secrets.")

RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
APP_URL = os.environ.get("APP_URL", "https://cryptovalley.jobs").rstrip("/")
FROM_EMAIL = os.environ.get("ALERT_FROM_EMAIL", "CryptoValley.jobs <alerts@cryptovalley.jobs>")
DRY_RUN = "--dry-run" in sys.argv

supabase = create_client(_url, _key)


# ── Data access ─────────────────────────────────────────────────────

def fetch_unalerted_jobs() -> list[dict]:
    now = datetime.now(timezone.utc).isoformat()
    try:
        res = (
            supabase.table("jobs")
            .select(
                "id, title, slug, location, location_type, job_type, "
                "salary_min, salary_max, salary_currency, tags, published_at, "
                "company:companies(name)"
            )
            .eq("status", "active")
            .is_("alerted_at", "null")
            .not_.is_("published_at", "null")
            .or_(f"expires_at.is.null,expires_at.gt.{now}")
            .order("published_at", desc=True)
            .execute()
        )
    except Exception as e:
        if "alerted_at" in str(e):
            sys.exit(
                "ERROR: jobs.alerted_at column is missing. "
                "Run supabase/migrations/20260610_add_job_alerts.sql in the Supabase SQL editor."
            )
        raise
    return res.data or []


def fetch_subscribers() -> list[dict]:
    res = (
        supabase.table("email_subscriptions")
        .select("email, confirmation_token, tags, job_types, location_types")
        .eq("confirmed", True)
        .execute()
    )
    return res.data or []


def mark_alerted(job_ids: list[str]) -> None:
    if not job_ids:
        return
    now = datetime.now(timezone.utc).isoformat()
    supabase.table("jobs").update({"alerted_at": now}).in_("id", job_ids).execute()


# ── Matching ────────────────────────────────────────────────────────

def matches_preferences(job: dict, sub: dict) -> bool:
    """Empty preference arrays mean 'everything'."""
    if sub.get("job_types") and job["job_type"] not in sub["job_types"]:
        return False
    if sub.get("location_types") and job["location_type"] not in sub["location_types"]:
        return False
    if sub.get("tags"):
        job_tags = {t.lower() for t in (job.get("tags") or [])}
        if not job_tags & {t.lower() for t in sub["tags"]}:
            return False
    return True


# ── Email rendering ─────────────────────────────────────────────────

def format_salary(job: dict) -> str | None:
    lo, hi, cur = job.get("salary_min"), job.get("salary_max"), job.get("salary_currency") or "CHF"
    fmt = lambda n: f"{round(n / 1000)}k" if n >= 1000 else str(n)
    if lo and hi:
        return f"{cur} {fmt(lo)}–{fmt(hi)}"
    if lo:
        return f"{cur} {fmt(lo)}+"
    if hi:
        return f"Up to {cur} {fmt(hi)}"
    return None


def render_job_html(job: dict) -> str:
    company = (job.get("company") or {}).get("name", "")
    facts = [job["job_type"], job.get("location") or job["location_type"]]
    salary = format_salary(job)
    if salary:
        facts.append(salary)
    return f"""
    <div style="padding:14px 0;border-bottom:1px solid #e2e8f0;">
      <a href="{APP_URL}/jobs/{job['slug']}"
         style="font-size:16px;font-weight:600;color:#4338ca;text-decoration:none;">{job['title']}</a>
      <div style="margin-top:3px;font-size:13px;color:#64748b;">{company} &middot; {" &middot; ".join(facts)}</div>
    </div>"""


def render_digest_html(jobs: list[dict], unsubscribe_url: str) -> str:
    shown = jobs[:MAX_JOBS_IN_EMAIL]
    more = len(jobs) - len(shown)
    more_html = (
        f'<p style="margin-top:14px;font-size:14px;"><a href="{APP_URL}/jobs" style="color:#4338ca;">'
        f"+ {more} more new {'job' if more == 1 else 'jobs'} on CryptoValley.jobs &rarr;</a></p>"
        if more > 0
        else ""
    )
    count = len(jobs)
    return f"""<!doctype html>
<html><body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
    <div style="font-size:18px;font-weight:800;margin-bottom:6px;">
      <span style="color:#4f46e5;">Crypto</span>Valley<span style="color:#64748b;">.jobs</span>
    </div>
    <h1 style="font-size:20px;margin:14px 0 4px;">{count} new crypto {'job' if count == 1 else 'jobs'} in Switzerland</h1>
    <p style="margin:0 0 10px;font-size:14px;color:#64748b;">Fresh openings from Crypto Valley companies.</p>
    {"".join(render_job_html(j) for j in shown)}
    {more_html}
    <p style="margin-top:28px;font-size:12px;color:#94a3b8;">
      You get these alerts because you subscribed on CryptoValley.jobs.<br/>
      <a href="{unsubscribe_url}" style="color:#94a3b8;">Unsubscribe</a>
    </p>
  </div>
</body></html>"""


def render_digest_text(jobs: list[dict], unsubscribe_url: str) -> str:
    lines = [f"{len(jobs)} new crypto jobs in Switzerland", ""]
    for job in jobs[:MAX_JOBS_IN_EMAIL]:
        company = (job.get("company") or {}).get("name", "")
        lines.append(f"- {job['title']} at {company}: {APP_URL}/jobs/{job['slug']}")
    lines += ["", f"All jobs: {APP_URL}/jobs", f"Unsubscribe: {unsubscribe_url}"]
    return "\n".join(lines)


# ── Sending ─────────────────────────────────────────────────────────

def build_emails(jobs: list[dict], subscribers: list[dict]) -> list[dict]:
    emails = []
    for sub in subscribers:
        matched = [j for j in jobs if matches_preferences(j, sub)]
        if not matched:
            continue
        token = sub["confirmation_token"]
        # Human-facing link goes via a confirmation page; the header URL
        # receives RFC 8058 one-click POSTs from mail providers.
        unsubscribe_page = f"{APP_URL}/subscription/unsubscribe?token={token}"
        unsubscribe_api = f"{APP_URL}/api/unsubscribe?token={token}"
        count = len(matched)
        emails.append({
            "from": FROM_EMAIL,
            "to": [sub["email"]],
            "subject": f"{count} new crypto {'job' if count == 1 else 'jobs'} in Switzerland",
            "html": render_digest_html(matched, unsubscribe_page),
            "text": render_digest_text(matched, unsubscribe_page),
            "headers": {
                "List-Unsubscribe": f"<{unsubscribe_api}>",
                "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
            },
        })
    return emails


def send_batch(emails: list[dict]) -> int:
    """Send emails via Resend's batch endpoint. Returns count sent."""
    sent = 0
    with httpx.Client(timeout=30) as client:
        for i in range(0, len(emails), RESEND_BATCH_SIZE):
            chunk = emails[i : i + RESEND_BATCH_SIZE]
            res = client.post(
                "https://api.resend.com/emails/batch",
                headers={"Authorization": f"Bearer {RESEND_API_KEY}"},
                json=chunk,
            )
            if res.status_code >= 400:
                log.error(f"Resend batch failed ({res.status_code}): {res.text[:500]}")
                continue
            sent += len(chunk)
    return sent


# ── Main ────────────────────────────────────────────────────────────

def main() -> None:
    jobs = fetch_unalerted_jobs()
    if not jobs:
        log.info("No unalerted jobs. Done.")
        return

    cutoff = datetime.now(timezone.utc) - timedelta(days=RECENT_DAYS)
    recent, stale = [], []
    for job in jobs:
        published = datetime.fromisoformat(job["published_at"].replace("Z", "+00:00"))
        (recent if published >= cutoff else stale).append(job)

    log.info(f"{len(recent)} recent jobs to alert, {len(stale)} stale jobs to skip")

    if not RESEND_API_KEY and not DRY_RUN:
        log.warning("RESEND_API_KEY not set — skipping alerts (jobs stay unalerted for the next run).")
        return

    subscribers = fetch_subscribers()
    log.info(f"{len(subscribers)} confirmed subscribers")

    emails = build_emails(recent, subscribers) if recent else []

    if DRY_RUN:
        for email in emails:
            log.info(f"[dry-run] would send to {email['to'][0]}: {email['subject']}")
        log.info(f"[dry-run] {len(emails)} emails total; would mark {len(jobs)} jobs alerted")
        return

    if emails:
        sent = send_batch(emails)
        log.info(f"Sent {sent}/{len(emails)} alert emails")
        if sent == 0:
            sys.exit("ERROR: All sends failed; leaving jobs unalerted so the next run retries.")
    else:
        log.info("No subscriber matches any new job.")

    # Mark both sent and skipped jobs so the backlog never grows.
    mark_alerted([j["id"] for j in jobs])
    log.info(f"Marked {len(jobs)} jobs as alerted")


if __name__ == "__main__":
    main()
