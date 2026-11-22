# Automated Crawler Sync Job Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Xây dựng tiến trình tự động so sánh mốc số liệu du lịch mới nhất trên các cổng công bố chính thức (VNAT) với mốc số liệu mới nhất hiện có trong PostgreSQL (`travel_view.statistic`), tự động crawl và nạp (upsert) bản ghi mới vào cơ sở dữ liệu khi trên mạng có cập nhật mới.

**Architecture:** Kết hợp module phân tích mốc online (`online_checker.py`), bộ kiểm tra cơ sở dữ liệu (`db_state.py`), động cơ điều phối (`auto_sync.py`), cùng background scheduler chạy ngầm trong FastAPI lifespan và các REST API admin endpoints.

**Tech Stack:** Python 3.11, FastAPI Lifespan, SQLModel/SQLAlchemy, VNAT Public API, Redis, PostgreSQL.

---

### Task 1: Xây dựng module phân tích mốc công bố online (`backend/app/crawler/online_checker.py`)

**Files:**
- Create: `backend/app/crawler/online_checker.py`
- Test: `backend/tests/test_online_checker.py`

**Step 1: Viết test cho logic bóc tách tháng/năm từ tiêu đề và văn bản VNAT**
- Test nhận diện: "Thông tin du lịch nổi bật tháng 10/2026" -> `target_month=10`, `target_year=2026`, `record_date=date(2026, 10, 31)`.
- Test nhận diện: "10 tháng đầu năm 2026" -> `target_month=10`, `target_year=2026`.
- Test bóc tách tỷ lệ tăng trưởng: "tăng 13,8%" -> `13.8`.

**Step 2: Thực thi module `online_checker.py`**
- Hàm `parse_vnat_publication_meta(raw_item: dict)`
- Hàm `fetch_online_latest_milestone(timeout: int = 15)`
- Trả về đối tượng `OnlineMilestoneInfo` chuẩn hóa.

**Step 3: Chạy test kiểm chứng**
- Xác nhận test pass 100%.

---

### Task 2: Xây dựng động cơ so sánh và điều phối đồng bộ (`backend/app/crawler/auto_sync.py`)

**Files:**
- Create: `backend/app/crawler/auto_sync.py`
- Test: `backend/tests/test_auto_sync.py`

**Step 1: Viết test cho logic so sánh online vs DB**
- Case 1: `online_date == db_date` -> `has_update=False`, `action="SKIPPED"`.
- Case 2: `online_date > db_date` -> `has_update=True`, `action="SYNCED"`.
- Case 3: `force=True` -> `action="SYNCED"`.

**Step 2: Thực thi module `auto_sync.py`**
- `get_db_latest_record_date(session: Session) -> date | None`
- `check_and_sync(session: Session, force: bool = False, dry_run: bool = False) -> AutoSyncResult`
- Tự động nạp dữ liệu vào DB qua `resolve_to_database_locations`.
- Cập nhật danh sách mốc thời gian động và làm mới cache Redis.
- CLI argument parser (`--interval`, `--run-once`, `--force`, `--dry-run`).

**Step 3: Chạy test kiểm chứng**
- Xác nhận test pass 100%.

---

### Task 3: Tích hợp Background Scheduler & Admin API Endpoints

**Files:**
- Create: `backend/app/core/scheduler.py`
- Modify: `backend/app/main.py`
- Modify: `backend/app/core/config.py`
- Modify: `.env.example`

**Step 1: Cấu hình biến môi trường**
- Thêm `AUTO_CRAWL_ENABLED`, `AUTO_CRAWL_INTERVAL_HOURS`, `VNAT_API_TIMEOUT` vào `Settings`.

**Step 2: Xây dựng background task định kỳ trong `scheduler.py`**
- Chạy vòng lặp nền bất đồng bộ (`asyncio.sleep(interval_seconds)`).
- Gắn vào FastAPI lifespan: khởi chạy khi server start, dừng êm khi server shutdown.

**Step 3: Thêm các endpoint quản trị trong `main.py`**
- `GET /admin/sync/status`: Xem chi tiết trạng thái so sánh mốc online vs database.
- `POST /admin/sync/auto`: Kích hoạt kiểm tra và tự động crawl nếu có dữ liệu mới.

---

### Task 4: Kiểm thử toàn diện & Hoàn thiện tài liệu

**Files:**
- Modify: `README.md`
- Modify: `README.en.md`

**Step 1: Kiểm thử linter và biên dịch**
- `uv run python -m compileall backend\app`
- `ruff check app` & `mypy app`

**Step 2: Kiểm thử end-to-end trên Docker**
- Gọi `GET http://localhost:8000/admin/sync/status`
- Gọi `POST http://localhost:8000/admin/sync/auto`
- Kiểm tra dữ liệu và giao diện frontend phản hồi đồng bộ.
