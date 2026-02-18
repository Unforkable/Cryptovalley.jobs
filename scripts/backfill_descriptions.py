#!/usr/bin/env python3
"""
One-off script to backfill job descriptions.

Visits each job's apply_url using crawl4ai + LLM to extract the full
job description, then updates the database.
"""

from __future__ import annotations

import asyncio
import json
import logging
import os
import sys

from supabase import create_client

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("backfill")

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
OPENAI_KEY = os.environ.get("OPENAI_API_KEY", "")

PLACEHOLDER = "See job posting for details."


async def extract_description(crawler, url: str) -> str | None:
    """Visit a job page and extract the full description."""
    from crawl4ai import CrawlerRunConfig, LLMConfig
    from crawl4ai.extraction_strategy import LLMExtractionStrategy

    strategy = LLMExtractionStrategy(
        llm_config=LLMConfig(
            provider="openai/gpt-4o-mini",
            api_token=OPENAI_KEY,
        ),
        instruction="""Extract the FULL job description from this job posting page.
Include:
- Role summary / overview
- Responsibilities and duties
- Requirements and qualifications
- Nice-to-haves (if listed)
- Benefits and perks (if listed)

Return a JSON object with a single key "description" containing the complete
job description as clean text (no HTML). Preserve paragraph breaks with newlines.
If no job description is found, return {"description": null}.""",
        extraction_type="schema",
        schema={
            "type": "object",
            "properties": {
                "description": {"type": ["string", "null"]},
            },
        },
    )

    config = CrawlerRunConfig(
        extraction_strategy=strategy,
        wait_until="domcontentloaded",
    )

    try:
        result = await crawler.arun(url=url, config=config)
        if not result.extracted_content:
            return None
        parsed = json.loads(result.extracted_content)
        if isinstance(parsed, list):
            parsed = parsed[0] if parsed else {}
        desc = parsed.get("description")
        if desc and len(desc.strip()) > 30:
            return desc.strip()[:10000]
    except Exception as e:
        log.warning(f"  Extraction failed: {e}")
    return None


async def main():
    if not SUPABASE_URL or not SUPABASE_KEY:
        sys.exit("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY")
    if not OPENAI_KEY:
        sys.exit("Set OPENAI_API_KEY")

    sb = create_client(SUPABASE_URL, SUPABASE_KEY)

    # Find jobs needing descriptions
    result = (
        sb.table("jobs")
        .select("id, title, apply_url, description, company:companies(name)")
        .or_(f"description.eq.{PLACEHOLDER},description.eq.,description.is.null")
        .execute()
    )
    jobs = result.data
    log.info(f"Found {len(jobs)} jobs needing descriptions")

    if not jobs:
        return

    # Set up crawl4ai
    from crawl4ai import AsyncWebCrawler, BrowserConfig

    browser_config = BrowserConfig(headless=True)
    crawler = AsyncWebCrawler(config=browser_config)
    await crawler.__aenter__()
    log.info("Browser ready")

    updated = 0
    failed = 0

    try:
        for i, job in enumerate(jobs, 1):
            company = job.get("company", {}).get("name", "?")
            title = job["title"]
            url = job["apply_url"]
            log.info(f"[{i}/{len(jobs)}] {company}: {title}")

            desc = await extract_description(crawler, url)
            if desc:
                sb.table("jobs").update({"description": desc}).eq("id", job["id"]).execute()
                log.info(f"  OK ({len(desc)} chars)")
                updated += 1
            else:
                log.warning(f"  SKIP — no description extracted")
                failed += 1
    finally:
        await crawler.__aexit__(None, None, None)

    log.info(f"\nDone: {updated} updated, {failed} failed")


if __name__ == "__main__":
    asyncio.run(main())
