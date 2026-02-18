#!/usr/bin/env python3
"""
One-off script to populate company logo_url fields.

Uses the Google Favicon API to get high-quality favicons (128x128)
for each company based on their website domain.
"""

from __future__ import annotations

import os
import sys
from urllib.parse import urlparse

import httpx
from supabase import create_client

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

# Manual domain overrides for companies without a website or with tricky domains
DOMAIN_OVERRIDES = {
    "auditchain-labs": "auditchain.finance",
    "mathrix": "mathrix.ai",
}


def get_domain(website: str) -> str | None:
    """Extract domain from a website URL."""
    if not website:
        return None
    parsed = urlparse(website if "://" in website else f"https://{website}")
    return parsed.netloc or parsed.path.split("/")[0]


def favicon_url(domain: str) -> str:
    """Build a Google Favicon API URL for a domain."""
    return f"https://www.google.com/s2/favicons?domain={domain}&sz=128"


def verify_favicon(client: httpx.Client, domain: str) -> str | None:
    """Check the favicon URL returns a valid image. Returns the URL or None."""
    url = favicon_url(domain)
    try:
        resp = client.get(url, follow_redirects=True)
        content_type = resp.headers.get("content-type", "")
        if resp.status_code == 200 and "image" in content_type:
            return url
    except httpx.HTTPError as e:
        print(f"  HTTP error for {domain}: {e}")
    return None


def main():
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("Error: Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY")
        sys.exit(1)

    sb = create_client(SUPABASE_URL, SUPABASE_KEY)
    http = httpx.Client(timeout=10)

    # Fetch all companies
    result = sb.table("companies").select("id, name, slug, website, logo_url").execute()
    companies = result.data
    print(f"Found {len(companies)} companies\n")

    updated = 0
    skipped = 0
    failed = 0

    for co in companies:
        name = co["name"]
        slug = co["slug"]

        if co.get("logo_url"):
            print(f"  SKIP  {name} — already has logo")
            skipped += 1
            continue

        # Get domain from override or website
        domain = DOMAIN_OVERRIDES.get(slug) or get_domain(co.get("website"))
        if not domain:
            print(f"  FAIL  {name} — no website or override")
            failed += 1
            continue

        # Verify the favicon is reachable
        url = verify_favicon(http, domain)
        if not url:
            print(f"  FAIL  {name} — no valid favicon for {domain}")
            failed += 1
            continue

        # Update in database
        sb.table("companies").update({"logo_url": url}).eq("id", co["id"]).execute()
        print(f"  OK    {name} — {url}")
        updated += 1

    print(f"\nDone: {updated} updated, {skipped} skipped, {failed} failed")
    http.close()


if __name__ == "__main__":
    main()
