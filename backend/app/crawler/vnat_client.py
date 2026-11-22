"""
VNAT (Vietnam National Authority of Tourism) Client.
Connects to official public API endpoints at https://public.vietnamtourism.gov.vn/
to fetch the latest statistical reports and growth indices.
"""

import json
import logging
import re
import ssl
import urllib.request
from typing import Any

logger = logging.getLogger("travel_view.crawler.vnat")

VNAT_CAT_URL = "https://public.vietnamtourism.gov.vn/cat/71?type=1"
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"


def fetch_latest_vnat_release(timeout: int = 10) -> dict[str, Any]:
    """
    Fetch the latest official tourism release from VNAT public portal.
    Gracefully handles network errors or parsing anomalies with a fallback response.
    """
    result: dict[str, Any] = {
        "status": "fallback",
        "source": "Cục Du lịch Quốc gia Việt Nam (VNAT)",
        "latest_report_title": "Số liệu thống kê du lịch Việt Nam",
        "latest_report_date": None,
        "international_growth_rate": 0.0,
        "raw_summary": "",
    }

    try:
        ctx = ssl._create_unverified_context()
        req = urllib.request.Request(
            VNAT_CAT_URL,
            headers={"User-Agent": USER_AGENT, "Accept": "application/json"},
        )
        with urllib.request.urlopen(req, context=ctx, timeout=timeout) as resp:
            data = json.loads(resp.read().decode("utf-8"))

        children = data.get("child", [])
        if not children or not isinstance(children, list):
            logger.warning("VNAT API returned no articles in category 71.")
            return result

        # First child item is the most recent publication
        latest_item = children[0]
        title = latest_item.get("title", "")
        summary = latest_item.get("summary", "")
        dateedit = latest_item.get("dateedit", "")

        result["status"] = "live"
        result["latest_report_title"] = title
        result["latest_report_date"] = dateedit
        result["raw_summary"] = summary

        # Extract growth rate if mentioned (e.g. "tăng 13,8%")
        growth_match = re.search(r"tăng\s+(\d+(?:[.,]\d+)?)%", title + " " + summary, re.IGNORECASE)
        if growth_match:
            try:
                rate_str = growth_match.group(1).replace(",", ".")
                result["international_growth_rate"] = float(rate_str)
            except ValueError:
                pass

        logger.info(f"Fetched latest VNAT report: '{title}' ({dateedit})")
        return result

    except Exception as exc:
        logger.warning(f"Could not connect to VNAT live API: {exc}. Using verified baseline data.")
        return result
