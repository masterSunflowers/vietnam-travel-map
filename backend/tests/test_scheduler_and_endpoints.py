import unittest
from unittest.mock import MagicMock, patch

from app.core.scheduler import (
    get_scheduler_status,
    start_scheduler,
    stop_scheduler,
)
from app.crawler.auto_sync import AutoSyncResult, SyncDeltaReport
from app.main import get_admin_sync_status, trigger_admin_auto_sync


class TestAdminEndpoints(unittest.TestCase):
    def setUp(self):
        self.mock_session = MagicMock()

    @patch("app.main.get_scheduler_status")
    @patch("app.main.evaluate_sync_delta")
    def test_get_admin_sync_status(self, mock_eval_delta, mock_sched_status):
        mock_eval_delta.return_value = SyncDeltaReport(
            has_update=False,
            db_latest_date="2026-10-31",
            online_latest_date="2026-10-31",
            target_year=2026,
            target_month=10,
            online_title="Thông tin du lịch nổi bật tháng 10/2026",
            online_report_url="https://vietnamtourism.gov.vn/post/68718",
            online_source="VNAT",
            growth_rate=13.8,
            difference_days=0,
            checked_at="2026-11-22T14:00:00",
        )
        mock_sched_status.return_value = {
            "enabled": True,
            "running": True,
            "interval_hours": 6,
            "last_run_at": "2026-11-22T12:00:00",
            "last_result": None,
        }

        resp = get_admin_sync_status(session=self.mock_session)
        self.assertFalse(resp.delta.has_update)
        self.assertEqual(resp.delta.db_latest_date, "2026-10-31")
        self.assertEqual(resp.scheduler["interval_hours"], 6)

    @patch("app.main.execute_auto_sync")
    def test_trigger_admin_auto_sync(self, mock_exec_sync):
        mock_exec_sync.return_value = AutoSyncResult(
            status="up_to_date",
            action_taken="SKIPPED",
            records_ingested=0,
            target_record_date="2026-10-31",
            message="Database is up to date.",
        )

        resp = trigger_admin_auto_sync(
            force=False,
            dry_run=False,
            session=self.mock_session,
        )
        self.assertEqual(resp.status, "up_to_date")
        self.assertEqual(resp.action_taken, "SKIPPED")
        mock_exec_sync.assert_called_once_with(
            session=self.mock_session, force=False, dry_run=False
        )


class TestSchedulerManagement(unittest.TestCase):
    def tearDown(self):
        stop_scheduler()

    def test_get_scheduler_status(self):
        status = get_scheduler_status()
        self.assertIn("enabled", status)
        self.assertIn("running", status)
        self.assertIn("interval_hours", status)
        self.assertFalse(status["running"])

    @patch("asyncio.get_running_loop")
    def test_start_and_stop_scheduler(self, mock_get_loop):
        mock_loop = MagicMock()
        mock_task = MagicMock()
        mock_task.done.return_value = False

        def fake_create_task(coro):
            coro.close()
            return mock_task

        mock_loop.create_task.side_effect = fake_create_task
        mock_get_loop.return_value = mock_loop

        start_scheduler(initial_delay=3600.0)
        self.assertTrue(get_scheduler_status()["running"])
        mock_loop.create_task.assert_called_once()

        stop_scheduler()
        mock_task.cancel.assert_called_once()
        self.assertFalse(get_scheduler_status()["running"])

    @patch("app.core.config.settings.AUTO_CRAWL_ENABLED", False)
    @patch("asyncio.get_running_loop")
    def test_start_scheduler_disabled(self, mock_get_loop):
        start_scheduler()
        mock_get_loop.assert_not_called()
        self.assertFalse(get_scheduler_status()["running"])


if __name__ == "__main__":
    unittest.main()
