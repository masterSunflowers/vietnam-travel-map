"""
Online Milestone Checker for Vietnam Tourism Data (VNAT & GSO).
Inspects official public endpoints to detect the latest released milestones.
"""

import calendar
import json
import logging
import re
import ssl
import urllib.request
from datetime import date
from typing import Any

from pydantic import BaseModel

from app.crawler.monthly_dataset import MONTHLY_MILESTONES

logger = logging.getLogger("travel_view.crawler.online_checker")

VNAT_CAT_71_URL = "https://public.vietnamtourism.gov.vn/cat/71?type=1"
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)


class OnlineMilestoneInfo(BaseModel):
    source: str = "Cục Du lịch Quốc gia Việt Nam (VNAT)"
    publication_id: int | None = None
    publication_title: str
    publication_date: str | None = None
    report_url: str
    target_year: int
    target_month: int
    target_record_date: date
    international_growth_rate: float = 0.0
    is_live: bool = True
    raw_summary: str = ""


def get_month_end_date(year: int, month: int) -> date:
    """Returns the last calendar date for the given year and month."""
    last_day = calendar.monthrange(year, month)[1]
    return date(year, month, last_day)


def parse_milestone_from_text(title: str, summary: str = "") -> tuple[int, int, date]:
    """
    Extracts the reporting target year, month, and end-of-month record date
    from article title and summary.
    Examples:
        - 'Thông tin du lịch nổi bật tháng 10/2026' -> (2026, 10, date(2026, 10, 31))
        - 'Khách quốc tế ... 10 tháng đầu năm 2026' -> (2026, 10, date(2026, 10, 31))
    """
    full_text = f"{title} {summary}".strip()

    # Pattern 1: 'tháng MM/YYYY' or 'thang MM/YYYY' or 'tháng MM-YYYY'
    p1 = re.search(r"(?:tháng|thang)\s*(\d{1,2})[/-](\d{4})", full_text, re.IGNORECASE)
    if p1:
        month = int(p1.group(1))
        year = int(p1.group(2))
        if 1 <= month <= 12 and 2000 <= year <= 2100:
            return year, month, get_month_end_date(year, month)

    # Pattern 2: 'MM tháng đầu năm YYYY'
    p2 = re.search(r"(\d{1,2})\s*tháng\s+đầu\s+năm\s+(\d{4})", full_text, re.IGNORECASE)
    if p2:
        month = int(p2.group(1))
        year = int(p2.group(2))
        if 1 <= month <= 12 and 2000 <= year <= 2100:
            return year, month, get_month_end_date(year, month)

    # Pattern 3: 'tháng MM năm YYYY'
    p3 = re.search(r"(?:tháng|thang)\s*(\d{1,2})\s+năm\s+(\d{4})", full_text, re.IGNORECASE)
    if p3:
        month = int(p3.group(1))
        year = int(p3.group(2))
        if 1 <= month <= 12 and 2000 <= year <= 2100:
            return year, month, get_month_end_date(year, month)

    # Fallback to current year & month
    today = date.today()
    return today.year, today.month, get_month_end_date(today.year, today.month)


def parse_growth_rate(text: str) -> float:
    """Extracts international growth percentage (e.g. 'tăng 13,8%' -> 13.8)."""
    match = re.search(r"tăng\s+(\d+(?:[.,]\d+)?)%", text, re.IGNORECASE)
    if match:
        try:
            return float(match.group(1).replace(",", "."))
        except ValueError:
            pass
    return 0.0


def parse_vnat_item(item: dict[str, Any]) -> OnlineMilestoneInfo:
    """Parses a raw VNAT category item into an OnlineMilestoneInfo object."""
    pub_id = item.get("id")
    title = str(item.get("title", "Số liệu thống kê du lịch Việt Nam")).strip()
    summary = str(item.get("summary", "")).strip()
    dateedit = item.get("dateedit")
    if dateedit and len(str(dateedit)) >= 10:
        pub_date = str(dateedit)[:10]
    else:
        pub_date = date.today().isoformat()

    year, month, rec_date = parse_milestone_from_text(title, summary)
    growth_rate = parse_growth_rate(f"{title} {summary}")

    report_url = (
        f"https://vietnamtourism.gov.vn/post/{pub_id}"
        if pub_id
        else "https://vietnamtourism.gov.vn/statistic"
    )

    return OnlineMilestoneInfo(
        source="Cục Du lịch Quốc gia Việt Nam (VNAT)",
        publication_id=pub_id,
        publication_title=title,
        publication_date=pub_date,
        report_url=report_url,
        target_year=year,
        target_month=month,
        target_record_date=rec_date,
        international_growth_rate=growth_rate,
        is_live=True,
        raw_summary=summary,
    )


def fetch_online_latest_milestone(timeout: int = 15) -> OnlineMilestoneInfo:
    """
    Connects to official VNAT public endpoint to inspect the latest publication.
    Returns OnlineMilestoneInfo. Gracefully falls back to baseline data if offline.
    """
    try:
        ctx = ssl._create_unverified_context()
        req = urllib.request.Request(
            VNAT_CAT_71_URL,
            headers={"User-Agent": USER_AGENT, "Accept": "application/json"},
        )
        with urllib.request.urlopen(req, context=ctx, timeout=timeout) as resp:
            data = json.loads(resp.read().decode("utf-8"))

        children = data.get("child", [])
        if isinstance(children, list) and len(children) > 0:
            # Check the first items for statistical publication
            for item in children[:5]:
                parsed = parse_vnat_item(item)
                # Verify that it detected a valid month
                if parsed.target_month > 0:
                    logger.info(
                        f"Online milestone detected: {parsed.target_record_date} "
                        f"('{parsed.publication_title}')"
                    )
                    return parsed

        logger.warning("VNAT API returned no matching child articles. Using verified baseline.")
    except Exception as exc:
        logger.warning(f"Could not reach VNAT live API: {exc}. Using verified baseline.")

    # Fallback to the latest verified milestone in database registry
    baseline = MONTHLY_MILESTONES[0]
    rec_date = date.fromisoformat(baseline["record_date"])
    return OnlineMilestoneInfo(
        source=baseline["source"],
        publication_id=68700,
        publication_title=baseline["publication_title"],
        publication_date=baseline["publication_date"],
        report_url=baseline["report_url"],
        target_year=rec_date.year,
        target_month=rec_date.month,
        target_record_date=rec_date,
        international_growth_rate=13.8,
        is_live=False,
        raw_summary=baseline["publication_title"],
    )
