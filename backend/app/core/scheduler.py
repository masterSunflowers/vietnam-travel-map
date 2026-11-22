"""
Background scheduler for automated data crawling and synchronization.
Runs periodic checks during FastAPI application lifespan.
"""

import asyncio
import logging
from datetime import datetime
from typing import Any

from sqlmodel import Session

from app.core.config import settings
from app.crawler.auto_sync import execute_auto_sync
from app.db.database import engine

logger = logging.getLogger("travel_view.core.scheduler")

_scheduler_task: asyncio.Task[None] | None = None
_last_run_at: str | None = None
_last_result: dict[str, Any] | None = None


def _sync_worker_job() -> dict[str, Any]:
    with Session(engine) as session:
        result = execute_auto_sync(session)
        return result.model_dump()


async def auto_crawl_worker(initial_delay: float = 5.0) -> None:
    global _last_run_at, _last_result
    interval_seconds = max(60, settings.AUTO_CRAWL_INTERVAL_HOURS * 3600)
    logger.info(
        f"Auto-crawl worker initialized. Interval: {settings.AUTO_CRAWL_INTERVAL_HOURS}h ({interval_seconds}s)."
    )

    try:
        # Initial short delay so server startup is not blocked
        if initial_delay > 0:
            await asyncio.sleep(initial_delay)

        while True:
            try:
                logger.info("Executing scheduled auto-crawl check...")
                _last_run_at = datetime.now().isoformat()
                loop = asyncio.get_running_loop()
                res_dict = await loop.run_in_executor(None, _sync_worker_job)
                _last_result = res_dict
                logger.info(
                    f"Scheduled auto-crawl complete: {res_dict.get('status')} ({res_dict.get('action_taken')})"
                )
            except Exception as exc:
                logger.error(f"Error during scheduled auto-crawl: {exc}", exc_info=True)

            await asyncio.sleep(interval_seconds)
    except asyncio.CancelledError:
        logger.info("Auto-crawl worker task cancelled.")


def start_scheduler(initial_delay: float = 5.0) -> None:
    global _scheduler_task
    if not settings.AUTO_CRAWL_ENABLED:
        logger.info("Auto-crawl scheduler is disabled in settings.")
        return
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        logger.warning("No running asyncio event loop; background scheduler not started.")
        return

    if _scheduler_task is None or _scheduler_task.done():
        _scheduler_task = loop.create_task(auto_crawl_worker(initial_delay=initial_delay))
        logger.info("Auto-crawl background scheduler started.")


def stop_scheduler() -> None:
    global _scheduler_task
    if _scheduler_task and not _scheduler_task.done():
        _scheduler_task.cancel()
        logger.info("Auto-crawl background scheduler stopped.")
    _scheduler_task = None


def get_scheduler_status() -> dict[str, Any]:
    is_running = _scheduler_task is not None and not _scheduler_task.done()
    return {
        "enabled": settings.AUTO_CRAWL_ENABLED,
        "running": is_running,
        "interval_hours": settings.AUTO_CRAWL_INTERVAL_HOURS,
        "last_run_at": _last_run_at,
        "last_result": _last_result,
    }
