import unittest
from datetime import date

from app.crawler.online_checker import (
    OnlineMilestoneInfo,
    parse_milestone_from_text,
    parse_vnat_item,
)


class TestOnlineChecker(unittest.TestCase):
    def test_parse_milestone_month_slash_year(self):
        title = "Thông tin du lịch nổi bật tháng 10/2026"
        summary = "Cung cấp bức tranh toàn cảnh về hoạt động của ngành trong tháng..."
        year, month, rec_date = parse_milestone_from_text(title, summary)
        self.assertEqual(year, 2026)
        self.assertEqual(month, 10)
        self.assertEqual(rec_date, date(2026, 10, 31))

    def test_parse_milestone_n_months_beginning_of_year(self):
        title = "Khách quốc tế đến Việt Nam tăng 13,8%, đạt 19,5 triệu lượt trong 10 tháng đầu năm 2026"
        summary = "Tổng cục Thống kê và Cục Du lịch Quốc gia công bố số liệu 10 tháng đầu năm 2026"
        year, month, rec_date = parse_milestone_from_text(title, summary)
        self.assertEqual(year, 2026)
        self.assertEqual(month, 10)
        self.assertEqual(rec_date, date(2026, 10, 31))

    def test_parse_milestone_month_11(self):
        title = "Thông tin du lịch nổi bật tháng 11/2026: Lượng khách quốc tế tiếp tục tăng trưởng mạnh"
        summary = "Báo cáo du lịch tháng 11 năm 2026"
        year, month, rec_date = parse_milestone_from_text(title, summary)
        self.assertEqual(year, 2026)
        self.assertEqual(month, 11)
        self.assertEqual(rec_date, date(2026, 11, 30))

    def test_parse_milestone_february_leap_year(self):
        title = "Báo cáo tình hình du lịch tháng 02/2024"
        year, month, rec_date = parse_milestone_from_text(title, "")
        self.assertEqual(year, 2024)
        self.assertEqual(month, 2)
        self.assertEqual(rec_date, date(2024, 2, 29))

    def test_parse_vnat_item_full(self):
        raw = {
            "id": 68718,
            "title": "Thông tin du lịch nổi bật tháng 10/2026",
            "dateedit": "2026-11-09 11:39:24",
            "summary": "Tăng 13,8% khách quốc tế trong 10 tháng đầu năm.",
        }
        info = parse_vnat_item(raw)
        self.assertIsInstance(info, OnlineMilestoneInfo)
        self.assertEqual(info.publication_id, 68718)
        self.assertEqual(info.target_year, 2026)
        self.assertEqual(info.target_month, 10)
        self.assertEqual(info.target_record_date, date(2026, 10, 31))
        self.assertEqual(info.international_growth_rate, 13.8)
        self.assertEqual(info.report_url, "https://vietnamtourism.gov.vn/post/68718")


if __name__ == "__main__":
    unittest.main()
