#!/usr/bin/env python3
"""
CryptoValley.jobs — Daily job scraper

Fetches job listings from crypto company career pages and inserts
them into Supabase as "pending" for admin review.

Sources are configured in sources.json. Three strategies:
  1. Greenhouse / Lever / Ashby → public JSON APIs (free, reliable)
  2. Generic career pages → crawl4ai + LLM extraction
  3. LinkedIn company pages → crawl4ai + LLM extraction
"""

import asyncio
import json
import logging
import os
import re
import sys
import time
from html import unescape
from pathlib import Path

import httpx
from supabase import create_client

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
)
log = logging.getLogger("scraper")

# ── Config ──────────────────────────────────────────────────────────

SCRIPT_DIR = Path(__file__).parent
SOURCES = json.loads((SCRIPT_DIR / "sources.json").read_text())

supabase = create_client(
    os.environ["NEXT_PUBLIC_SUPABASE_URL"],
    os.environ["SUPABASE_SERVICE_ROLE_KEY"],
)


# ── Helpers ─────────────────────────────────────────────────────────

def slugify(text: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return f"{slug}-{int(time.time()):x}"


def strip_html(html: str) -> str:
    text = re.sub(r"<[^>]+>", " ", html)
    text = unescape(text)
    return re.sub(r"\s+", " ", text).strip()


def normalize_job_type(raw: str | None) -> str:
    if not raw:
        return "full-time"
    raw = raw.lower()
    if "part" in raw:
        return "part-time"
    if "contract" in raw or "freelance" in raw:
        return "contract"
    if "intern" in raw:
        return "internship"
    return "full-time"


def normalize_location_type(raw: str | None) -> str:
    if not raw:
        return "hybrid"
    raw = raw.lower()
    if "remote" in raw:
        return "remote"
    if "onsite" in raw or "on-site" in raw or "office" in raw:
        return "onsite"
    return "hybrid"


SWISS_KEYWORDS = [
    "switzerland", "swiss", "schweiz", "suisse", "svizzera",
    "zurich", "zürich", "zug", "geneva", "genève", "geneve",
    "basel", "bern", "lausanne", "lugano", "winterthur",
    "st. gallen", "st gallen", "lucerne", "luzern", "biel",
    "thun", "köniz", "aarau", "chur", "neuchâtel", "neuchatel",
    "schaffhausen", "fribourg", "crypto valley",
]


def is_swiss_or_remote(job: dict) -> bool:
    """Return True if the job is based in Switzerland or is remote."""
    loc_type = (
        job.get("location_type")
        or job.get("location_type_hint")
        or ""
    ).lower()
    if "remote" in loc_type:
        return True

    location = (job.get("location") or "").lower()
    if "remote" in location:
        return True

    for kw in SWISS_KEYWORDS:
        if kw in location:
            return True

    return False


# ── API-based fetchers (free, no LLM needed) ───────────────────────

async def fetch_greenhouse(client: httpx.AsyncClient, source: dict) -> list[dict]:
    board = source["board"]
    url = f"https://boards-api.greenhouse.io/v1/boards/{board}/jobs?content=true"
    resp = await client.get(url)
    resp.raise_for_status()
    jobs = []
    for j in resp.json().get("jobs", []):
        loc = j.get("location", {})
        jobs.append({
            "title": j["title"],
            "location": loc.get("name") if loc else None,
            "description": strip_html(j.get("content", ""))[:2000],
            "apply_url": j.get("absolute_url", ""),
        })
    return jobs


async def fetch_lever(client: httpx.AsyncClient, source: dict) -> list[dict]:
    board = source["board"]
    resp = await client.get(f"https://api.lever.co/v0/postings/{board}")
    resp.raise_for_status()
    data = resp.json()
    if isinstance(data, dict):
        data = [data]
    jobs = []
    for j in data:
        cats = j.get("categories", {})
        desc = j.get("descriptionPlain", "") or ""
        jobs.append({
            "title": j["text"],
            "location": cats.get("location"),
            "description": desc[:2000],
            "apply_url": j.get("hostedUrl", ""),
            "job_type_hint": cats.get("commitment"),
            "location_type_hint": cats.get("workplaceType"),
        })
    return jobs


async def fetch_ashby(client: httpx.AsyncClient, source: dict) -> list[dict]:
    board = source["board"]
    resp = await client.get(f"https://api.ashbyhq.com/posting-api/job-board/{board}")
    resp.raise_for_status()
    data = resp.json()
    jobs = []
    for j in data.get("jobs", []):
        jobs.append({
            "title": j.get("title", ""),
            "location": j.get("location", ""),
            "description": strip_html(j.get("descriptionHtml", ""))[:2000] if j.get("descriptionHtml") else "",
            "apply_url": j.get("jobUrl", j.get("applyUrl", "")),
        })
    return jobs


# ── crawl4ai-based fetcher (for generic pages & LinkedIn) ──────────

async def fetch_with_crawl4ai(crawler, source: dict) -> list[dict]:
    from crawl4ai import CrawlerRunConfig, LLMConfig
    from crawl4ai.extraction_strategy import LLMExtractionStrategy

    strategy = LLMExtractionStrategy(
        llm_config=LLMConfig(
            provider="openai/gpt-4o-mini",
            api_token=os.environ.get("OPENAI_API_KEY", ""),
        ),
        instruction="""Extract ALL job/position listings from this career page.
For each job, provide:
- title: The exact job title (required). Do NOT return headings, button labels, or placeholder text.
- location: Job location including city AND country (e.g. "Zug, Switzerland"). Be specific. Return null only if truly not listed.
- job_type: One of "full-time", "part-time", "contract", "internship" (best guess, default "full-time")
- location_type: One of "remote", "onsite", "hybrid" (best guess, default "hybrid")
- apply_url: Full URL to apply for this specific job, or null
- description: 1-2 sentence summary of the role, or null

Return a JSON array of objects. If no actual job listings are found, return an empty array [].
Do NOT extract navigation links, page headings, or references to external job boards.""",
        extraction_type="schema",
        schema={
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "title": {"type": "string"},
                    "location": {"type": ["string", "null"]},
                    "job_type": {"type": "string"},
                    "location_type": {"type": "string"},
                    "apply_url": {"type": ["string", "null"]},
                    "description": {"type": ["string", "null"]},
                },
                "required": ["title"],
            },
        },
    )

    config = CrawlerRunConfig(
        extraction_strategy=strategy,
        wait_until="domcontentloaded",
    )
    result = await crawler.arun(url=source["url"], config=config)

    if not result.extracted_content:
        return []

    parsed = json.loads(result.extracted_content)
    if isinstance(parsed, dict):
        parsed = [parsed]
    return parsed


# ── Database operations ─────────────────────────────────────────────

def get_existing_apply_urls() -> set[str]:
    result = supabase.table("jobs").select("apply_url").execute()
    return {r["apply_url"] for r in result.data if r.get("apply_url")}


def get_or_create_company(name: str, website: str | None = None) -> dict:
    result = supabase.table("companies").select("*").ilike("name", name).execute()
    if result.data:
        return result.data[0]

    result = (
        supabase.table("companies")
        .insert({"name": name, "slug": slugify(name), "website": website})
        .execute()
    )
    log.info(f"  Created company: {name}")
    return result.data[0]


def insert_job(job: dict, company_id: str) -> None:
    supabase.table("jobs").insert({
        "title": job["title"],
        "slug": slugify(job["title"]),
        "description": (job.get("description") or "See job posting for details.")[:5000],
        "company_id": company_id,
        "job_type": normalize_job_type(
            job.get("job_type") or job.get("job_type_hint")
        ),
        "location_type": normalize_location_type(
            job.get("location_type") or job.get("location_type_hint")
        ),
        "location": job.get("location"),
        "apply_url": job["apply_url"],
        "salary_currency": "CHF",
        "tags": [],
        "status": "pending",
    }).execute()


# ── Main ────────────────────────────────────────────────────────────

API_FETCHERS = {
    "greenhouse": fetch_greenhouse,
    "lever": fetch_lever,
    "ashby": fetch_ashby,
}


async def main():
    dry_run = "--dry-run" in sys.argv
    if dry_run:
        log.info("DRY RUN — no database writes")

    existing_urls = get_existing_apply_urls()
    log.info(f"Found {len(existing_urls)} existing jobs in database")

    # Set up crawl4ai for generic/linkedin sources
    crawler = None
    needs_crawler = any(s["type"] in ("generic", "linkedin") for s in SOURCES)
    if needs_crawler:
        try:
            from crawl4ai import AsyncWebCrawler, BrowserConfig

            browser_config = BrowserConfig(headless=True)
            crawler = AsyncWebCrawler(config=browser_config)
            await crawler.__aenter__()
            log.info("crawl4ai browser ready")
        except ImportError:
            log.warning(
                "crawl4ai not installed — skipping generic/linkedin sources. "
                "Install with: pip install 'crawl4ai[all]'"
            )

    inserted = 0
    errors = 0

    try:
        async with httpx.AsyncClient(
            timeout=30, follow_redirects=True
        ) as client:
            for source in SOURCES:
                source_type = source["type"]
                company_name = source["company"]

                try:
                    # Fetch jobs from this source
                    if source_type in API_FETCHERS:
                        jobs = await API_FETCHERS[source_type](client, source)
                    elif source_type in ("generic", "linkedin") and crawler:
                        jobs = await fetch_with_crawl4ai(crawler, source)
                    else:
                        log.warning(f"  Skipping {company_name} (no handler)")
                        continue

                    new_count = 0
                    for job in jobs:
                        apply_url = job.get("apply_url")
                        if not apply_url:
                            # Use source URL as fallback
                            apply_url = source["url"]
                            job["apply_url"] = apply_url

                        if apply_url in existing_urls:
                            continue

                        if not is_swiss_or_remote(job):
                            log.info(f"  ~ skipped (not Swiss/remote): {job.get('title')}")
                            continue

                        if not dry_run:
                            company = get_or_create_company(
                                company_name, source.get("website")
                            )
                            insert_job(job, company["id"])

                        existing_urls.add(apply_url)
                        inserted += 1
                        new_count += 1
                        log.info(f"  + {job['title']}")

                    log.info(
                        f"{'[OK]':>6} {company_name}: "
                        f"{len(jobs)} found, {new_count} new"
                    )

                except Exception as e:
                    log.error(f"{'[ERR]':>6} {company_name}: {e}")
                    errors += 1

    finally:
        if crawler:
            await crawler.__aexit__(None, None, None)

    log.info(f"\nDone: {inserted} new jobs inserted, {errors} source errors")


if __name__ == "__main__":
    asyncio.run(main())
