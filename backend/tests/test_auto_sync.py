import unittest
from datetime import date
from unittest.mock import MagicMock, patch

from app.crawler.auto_sync import evaluate_sync_delta, execute_auto_sync
from app.crawler.online_checker import OnlineMilestoneInfo


class TestAutoSync(unittest.TestCase):
    def setUp(self):
        self.mock_session = MagicMock()

    def test_evaluate_sync_delta_when_up_to_date(self):
        online = OnlineMilestoneInfo(
            source="VNAT",
            publication_id=68718,
            publication_title="Thông tin du lịch nổi bật tháng 10/2026",
            publication_date="2026-11-09",
            report_url="https://vietnamtourism.gov.vn/post/68718",
            target_year=2026,
            target_month=10,
            target_record_date=date(2026, 10, 31),
            international_growth_rate=13.8,
            is_live=True,
        )
        # Mock DB returning same date
        delta = evaluate_sync_delta(
            session=self.mock_session,
            db_date_override=date(2026, 10, 31),
            online_info_override=online,
        )
        self.assertFalse(delta.has_update)
        self.assertEqual(delta.db_latest_date, "2026-10-31")
        self.assertEqual(delta.online_latest_date, "2026-10-31")

    def test_evaluate_sync_delta_when_online_is_newer(self):
        online = OnlineMilestoneInfo(
            source="VNAT",
            publication_id=68900,
            publication_title="Thông tin du lịch nổi bật tháng 11/2026",
            publication_date="2026-12-05",
            report_url="https://vietnamtourism.gov.vn/post/68900",
            target_year=2026,
            target_month=11,
            target_record_date=date(2026, 11, 30),
            international_growth_rate=14.5,
            is_live=True,
        )
        # Mock DB having older date (Month 10)
        delta = evaluate_sync_delta(
            session=self.mock_session,
            db_date_override=date(2026, 10, 31),
            online_info_override=online,
        )
        self.assertTrue(delta.has_update)
        self.assertEqual(delta.db_latest_date, "2026-10-31")
        self.assertEqual(delta.online_latest_date, "2026-11-30")

    def test_execute_auto_sync_skips_when_no_update(self):
        online = OnlineMilestoneInfo(
            source="VNAT",
            publication_id=68718,
            publication_title="Thông tin du lịch nổi bật tháng 10/2026",
            publication_date="2026-11-09",
            report_url="https://vietnamtourism.gov.vn/post/68718",
            target_year=2026,
            target_month=10,
            target_record_date=date(2026, 10, 31),
            international_growth_rate=13.8,
            is_live=True,
        )
        result = execute_auto_sync(
            session=self.mock_session,
            db_date_override=date(2026, 10, 31),
            online_info_override=online,
            force=False,
        )
        self.assertEqual(result.status, "up_to_date")
        self.assertEqual(result.action_taken, "SKIPPED")
        self.assertEqual(result.records_ingested, 0)

    def test_execute_auto_sync_dry_run_when_update_available(self):
        online = OnlineMilestoneInfo(
            source="VNAT",
            publication_id=68900,
            publication_title="Thông tin du lịch nổi bật tháng 11/2026",
            publication_date="2026-12-05",
            report_url="https://vietnamtourism.gov.vn/post/68900",
            target_year=2026,
            target_month=11,
            target_record_date=date(2026, 11, 30),
            international_growth_rate=14.5,
            is_live=True,
        )
        result = execute_auto_sync(
            session=self.mock_session,
            db_date_override=date(2026, 10, 31),
            online_info_override=online,
            dry_run=True,
        )
        self.assertEqual(result.status, "dry_run")
        self.assertEqual(result.action_taken, "WOULD_SYNC")
        self.assertEqual(result.target_record_date, "2026-11-30")

    @patch("app.crawler.auto_sync.resolve_to_database_locations")
    def test_execute_auto_sync_runs_when_newer(self, mock_resolve):
        mock_resolve.return_value = [
            {
                "location_id": 1,
                "tourists_total": 500000,
                "tourists_domestic": 300000,
                "tourists_international": 200000,
                "overnight_stays_total": 400000,
                "hotels_count": 100,
                "hotel_rooms_total": 5000,
            }
        ]
        # Mock session.exec(statement).first() returning None (new record)
        self.mock_session.exec.return_value.first.return_value = None

        online = OnlineMilestoneInfo(
            source="VNAT",
            publication_id=68900,
            publication_title="Thông tin du lịch tháng 11/2026",
            publication_date="2026-12-05",
            report_url="https://vietnamtourism.gov.vn/post/68900",
            target_year=2026,
            target_month=11,
            target_record_date=date(2026, 11, 30),
            international_growth_rate=14.5,
            is_live=True,
        )

        result = execute_auto_sync(
            session=self.mock_session,
            db_date_override=date(2026, 10, 31),
            online_info_override=online,
            force=False,
        )
        self.assertEqual(result.status, "success")
        self.assertEqual(result.action_taken, "SYNCED")
        self.assertEqual(result.records_ingested, 1)
        self.assertEqual(result.created_records, 1)
        self.assertEqual(result.updated_records, 0)
        self.mock_session.commit.assert_called_once()

    @patch("app.crawler.auto_sync.resolve_to_database_locations")
    def test_execute_auto_sync_force(self, mock_resolve):
        mock_resolve.return_value = [
            {
                "location_id": 1,
                "tourists_total": 500000,
                "tourists_domestic": 300000,
                "tourists_international": 200000,
                "overnight_stays_total": 400000,
                "hotels_count": 100,
                "hotel_rooms_total": 5000,
            }
        ]
        # Mock session.exec(statement).first() returning an existing record
        mock_existing = MagicMock()
        self.mock_session.exec.return_value.first.return_value = mock_existing

        online = OnlineMilestoneInfo(
            source="VNAT",
            publication_id=68718,
            publication_title="Thông tin du lịch nổi bật tháng 10/2026",
            publication_date="2026-11-09",
            report_url="https://vietnamtourism.gov.vn/post/68718",
            target_year=2026,
            target_month=10,
            target_record_date=date(2026, 10, 31),
            international_growth_rate=13.8,
            is_live=True,
        )

        result = execute_auto_sync(
            session=self.mock_session,
            db_date_override=date(2026, 10, 31),
            online_info_override=online,
            force=True,
        )
        self.assertEqual(result.status, "success")
        self.assertEqual(result.action_taken, "SYNCED")
        self.assertEqual(result.records_ingested, 1)
        self.assertEqual(result.created_records, 0)
        self.assertEqual(result.updated_records, 1)


if __name__ == "__main__":
    unittest.main()
