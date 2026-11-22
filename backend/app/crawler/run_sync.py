"""
CLI tool to trigger tourism statistics sync pipeline manually.
Usage:
    python -m app.crawler.run_sync [--no-growth] [--date YYYY-MM-DD]
"""

import argparse
from datetime import date
import logging
import sys

from app.db.database import engine
from sqlmodel import Session
from app.crawler.sync import run_sync_pipeline

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)


def main():
    parser = argparse.ArgumentParser(description="Synchronize Vietnam tourism statistics.")
    parser.add_argument(
        "--date",
        type=str,
        default=None,
        help="Target record date (YYYY-MM-DD). Defaults to today.",
    )
    parser.add_argument(
        "--no-growth",
        action="store_true",
        help="Disable applying VNAT dynamic growth multiplier.",
    )

    args = parser.parse_args()

    target_date = None
    if args.date:
        try:
            target_date = date.fromisoformat(args.date)
        except ValueError:
            print(f"Error: Invalid date format '{args.date}'. Expected YYYY-MM-DD.", file=sys.stderr)
            sys.exit(1)

    print("=================================================================")
    print("  TRAVEL VIEW - OFFICIAL TOURISM DATA CRAWLER & SYNCHRONIZER     ")
    print("  Sources: GSO (Tổng cục Thống kê) & VNAT (Cục Du lịch QG VN)   ")
    print("=================================================================")

    with Session(engine) as session:
        result = run_sync_pipeline(
            session=session,
            target_date=target_date,
            apply_growth=not args.no_growth,
        )

    print("\n-----------------------------------------------------------------")
    print(" Synchronization Summary:")
    print(f" - Status:               {result['status'].upper()}")
    print(f" - Target Record Date:   {result['target_date']}")
    print(f" - Source:               {result['vnat_source']}")
    print(f" - VNAT Channel Status:  {result['vnat_status'].upper()}")
    print(f" - Latest Official Pub:  {result['latest_report_title']}")
    if result.get("latest_report_date"):
        print(f" - Publication Date:     {result['latest_report_date']}")
    if result.get("growth_rate_applied"):
        print(f" - Growth Rate Applied:  +{result['growth_rate_applied']}%")
    print(f" - Total Provinces:      {result['total_provinces']}")
    print(f" - Records Created:      {result['created_records']}")
    print(f" - Records Updated:      {result['updated_records']}")
    print("=================================================================\n")


if __name__ == "__main__":
    main()
