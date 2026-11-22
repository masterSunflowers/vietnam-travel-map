# Travel View — Bản Đồ Dữ Liệu Du Lịch Việt Nam

<p align="center">
  <a href="README.md"><b>🇻🇳 Tiếng Việt</b></a> &nbsp;|&nbsp; <a href="README.en.md"><b>🇬🇧 English</b></a>
</p>

---

**Travel View** là dashboard GIS full-stack hiện đại để trực quan hóa dữ liệu du lịch Việt Nam theo 34 tỉnh/thành phố (sau sáp nhập) trên bản đồ tương tác. Ứng dụng cung cấp kiến trúc web 2 tab chuyên sâu, kết hợp giữa trực quan hóa không gian GIS và bảng dữ liệu đối chứng chính thức từ Cục Du lịch Quốc gia Việt Nam (VNAT) và Tổng cục Thống kê (GSO).

Nếu bạn là AI agent hoặc nhà phát triển phần mềm, vui lòng đọc thêm hướng dẫn phát triển tại [`GEMINI.md`](GEMINI.md).

---

## Tính Năng Nổi Bật

### 1. Tab 1: Bản Đồ Du Lịch GIS Tương Tác (Interactive GIS Map)
- **Phân bổ địa giới 34 tỉnh/thành phố sáp nhập mới**: Dựa trên bản đồ GeoJSON chuẩn hóa `hc-key` tương thích D3.
- **Bản đồ nhiệt Choropleth đa chỉ tiêu**: Hỗ trợ 6 chỉ tiêu du lịch cốt lõi:
  - Tổng lượt khách (`tourists_total`)
  - Khách nội địa (`tourists_domestic`)
  - Khách quốc tế (`tourists_international`)
  - Lượt khách lưu trú (`overnight_stays_total`)
  - Số lượng cơ sở lưu trú / khách sạn (`hotels_count`)
  - Tổng số phòng khách sạn (`hotel_rooms_total`)
- **Bộ điều khiển Zoom & Pan mượt mà (`d3.zoom()`)**:
  - Hỗ trợ cuộn chuột hoặc cử chỉ cảm ứng phóng to / thu nhỏ linh hoạt.
  - Cụm nút bấm nổi thủy tinh mờ (Glassmorphism): `[+]` Phóng to, `[−]` Thu nhỏ, `[⟲]` Xem toàn cảnh toàn quốc.
- **Bố cục màn hình thích ứng (Zero-Scroll Fit Layout)**: Tự động tính toán padding theo khung nhìn, hiển thị trọn vẹn dải đất hình chữ S từ Hà Giang đến Mũi Cà Mau và đảo Phú Quốc mà không bị xén lề.
- **Bảo tồn chủ quyền biển đảo**: Tích hợp hai khung đảo inset cho **Quần đảo Hoàng Sa** (gắn với Đà Nẵng) và **Quần đảo Trường Sa** (gắn với Khánh Hòa) tự động co giãn, đảm bảo chủ quyền thiêng liêng mà không che lấp đất liền miền Trung.
- **Panel chi tiết tỉnh/thành (`ProvinceDetail`)**: Mở nhanh khi nhấp chọn tỉnh/thành, hiển thị danh mục địa phương sáp nhập cấu thành, thống kê tổng hợp và danh lam thắng cảnh, di tích lịch sử nổi bật.

### 2. Tab 2: Tài Liệu Đối Chứng Số Liệu Chính Thức (Official Data Verification View)
- **Bảng số liệu đối chứng 11 cột chuẩn hóa**:
  - `STT`, `Tỉnh / Thành phố mới`, `Đơn vị sáp nhập cấu thành`, `Tổng lượt khách`, `Khách nội địa`, `Khách quốc tế`, `Tỷ lệ khách quốc tế (%)`, `Lượt lưu trú`, `Số khách sạn`, `Số phòng`, `Minh chứng nguồn`.
- **Cố định 2 cột đầu (Freeze Columns)**: Cột `STT` và `Tên tỉnh/thành` được cố định (`position: sticky`) khi cuộn ngang, giúp tra cứu số liệu ở các cột sau cực kỳ thuận tiện.
- **Tìm kiếm tức thì đa trường**: Tìm kiếm theo tên tỉnh, tên đơn vị sáp nhập (ví dụ: gõ "Hà Tây", "Bà Rịa" hoặc "Đồng bằng sông Hồng").
- **Dải băng tóm tắt toàn quốc (Overview Ribbon)**: Tổng hợp nhanh tổng số lượt khách, khách nội địa, quốc tế và số lượng phòng trên phạm vi cả nước.
- **Banner trích dẫn nguồn công bố chính thức**: Hiển thị tên cơ quan công bố (VNAT), tên ấn phẩm báo cáo, ngày phát hành và liên kết tra cứu trực tiếp `🔗 Kiểm chứng` tới từng văn bản báo cáo gốc.

### 3. Header Điều Khiển Dùng Chung Đa Năng
- **Bộ lọc mốc thời gian 10 tháng**: Chọn xem báo cáo từ Tháng 01/2026 đến Tháng 10/2026.
- **Công tắc chuyển đổi góc nhìn thống kê**:
  - **Lũy kế (`cumulative`)**: Tổng số liệu tính từ đầu năm đến mốc thời gian đã chọn.
  - **Riêng trong tháng (`monthly`)**: Số liệu phát sinh riêng trong tháng đó.
- **Chuyển đổi song ngữ toàn diện (VI / EN)**: Hỗ trợ 100% tiếng Việt và tiếng Anh, tự động lưu lựa chọn vào `localStorage`.

---

## Tech Stack

| Thành Phần | Công Nghệ | Ghi Chú |
|---|---|---|
| **Frontend** | Next.js 16 (App Router), React 18, TypeScript | Render tối ưu với Turbopack, chạy standalone |
| **Map Engine** | D3.js (v7) + SVG Vector | Component chính: `VietnamMapD3.tsx` |
| **Giao Diện** | Tailwind CSS + Custom Dark Glassmorphism | Bố cục tại `globals.css`, tối ưu thích ứng mọi thiết bị |
| **Backend** | FastAPI, SQLModel (SQLAlchemy), Pydantic v2 | Python 3.11+, kiến trúc bất đồng bộ |
| **Data Crawler** | Python Crawler Pipeline (`backend/app/crawler/`) | Nạp 10 tháng dữ liệu VNAT, thuật toán quy đổi 63 -> 34 tỉnh |
| **Database** | PostgreSQL | Schema riêng biệt `travel_view` |
| **Migration** | Alembic | Quản lý lịch sử schema tại `backend/alembic/` |
| **Cache & Bus** | Redis | Định tuyến bộ nhớ đệm qua Docker Compose |
| **Orchestration**| Docker Compose | Môi trường container hóa trọn gói (Frontend, Backend, DB, Redis)|

---

## Cấu Trúc Dự Án

```text
travel-view/
├── .env.example                               # File mẫu cấu hình môi trường
├── docker-compose.yml                         # Cấu hình container toàn bộ stack
├── CONTRIBUTING.md                            # Quy chuẩn đóng góp mã nguồn
├── GEMINI.md                                  # Bản đồ chỉ dẫn dành riêng cho AI Agent
├── README.md                                  # Hướng dẫn dự án tiếng Việt
├── README.en.md                               # Hướng dẫn dự án tiếng Anh
├── k8s/                                       # Manifests mẫu triển khai Kubernetes
│   └── manifests.yaml
├── supabase/snippets/
│   └── travel-view.sql                        # Script seed dữ liệu UTF-8
├── backend/
│   ├── Dockerfile                             # Container build cho backend
│   ├── requirements.txt                       # Thư viện phụ thuộc Python
│   ├── alembic/                               # Migration schema cơ sở dữ liệu
│   ├── tests/                                 # Unit tests hệ thống (offline, mockable)
│   └── app/
│       ├── main.py                            # FastAPI app, lifespan scheduler và API routes
│       ├── core/
│       │   ├── config.py                      # Quản lý cấu hình Settings
│       │   └── scheduler.py                   # Background scheduler định kỳ kiểm tra cập nhật
│       ├── db/database.py                     # Khởi tạo kết nối SQLModel Engine
│       ├── models/domain.py                   # Model thực thể: Location, Statistic, Landmark
│       └── crawler/                           # Pipeline crawler & bộ nạp dữ liệu VNAT
│           ├── online_checker.py              # Kiểm tra mốc phát hành trực tuyến mới nhất
│           ├── auto_sync.py                   # Động cơ tự động so sánh mốc và đồng bộ DB
│           ├── monthly_dataset.py             # Metadata 10 mốc thời gian công bố VNAT
│           ├── official_dataset.py            # Số liệu du lịch chính thức
│           ├── province_mapping.py            # Quy đổi địa giới 63 sang 34 tỉnh/thành
│           ├── resolver.py                    # Thuật toán tổng hợp chỉ tiêu số liệu
│           ├── sync.py                        # Cơ chế đồng bộ vào DB
│           └── ingest_months.py               # Lệnh nạp hàng loạt dữ liệu 10 tháng
└── frontend/
    ├── Dockerfile                             # Multi-stage container build (Non-Root)
    ├── package.json                           # Cấu hình phụ thuộc Node.js
    ├── public/data/
    │   └── vietnam-34-provinces.geojson       # Bản đồ GeoJSON 34 tỉnh/thành
    └── src/
        ├── app/
        │   ├── layout.tsx                     # Root layout Next.js
        │   ├── page.tsx                       # Màn hình chính điều phối 2 tab
        │   └── globals.css                    # Toàn bộ CSS hệ thống & Dark Theme
        ├── components/
        │   ├── Header.tsx                     # Header dùng chung (Tabs, Filter, Song ngữ)
        │   ├── VietnamMapD3.tsx               # Bản đồ tương tác D3 Zoom/Pan
        │   ├── MetricSelector.tsx             # Thanh chọn 6 chỉ tiêu thống kê
        │   ├── ProvinceDetail.tsx             # Panel chi tiết tỉnh/thành khi chọn
        │   └── VerificationView.tsx           # Tab đối chứng số liệu chính thức
        └── lib/
            ├── i18n.tsx                       # Context quản lý đa ngôn ngữ VI/EN
            └── provinceApi.ts                 # Client gọi API backend
```

---

## Hướng Dẫn Khởi Chạy Nhanh (Docker Compose)

### 1. Thiết lập biến môi trường
Sao chép file mẫu `.env.example` thành `.env`:

```powershell
Copy-Item .env.example .env
```

> **Lưu ý chống xung đột cổng:** File `.env.example` mặc định ánh xạ cổng PostgreSQL host là `TRAVEL_VIEW_POSTGRES_PORT=5433` và Redis host là `TRAVEL_VIEW_REDIS_PORT=6380`. Điều này giúp bạn không bị lỗi trùng cổng nếu trên máy tính đã cài sẵn PostgreSQL (5432) hoặc Redis (6379). Mạng nội bộ giữa các container Docker vẫn giao tiếp an toàn qua cổng chuẩn `5432`.

### 2. Khởi động toàn bộ hệ thống
Khởi động 4 dịch vụ (`postgres`, `redis`, `backend`, `frontend`):

```powershell
docker compose up --build
```

### 3. Seed dữ liệu mẫu (Giữ nguyên chuẩn UTF-8 Tiếng Việt)
Để tránh lỗi biến đổi font tiếng Việt thành dấu `?` do thiết lập encoding của PowerShell, hãy chạy lệnh seed trực tiếp từ file được mount bên trong container:

```powershell
docker compose exec -T postgres psql -U postgres -d travel_view -f /snippets/travel-view.sql
```

### 4. Truy cập ứng dụng
- **Giao diện Web Frontend**: `http://localhost:3000`
- **FastAPI Backend**: `http://localhost:8000`
- **Tài liệu API tương tác (Swagger UI)**: `http://localhost:8000/docs`
- **Health check**: `http://localhost:8000/health`

---

## Khởi Chạy Local Dành Cho Nhà Phát Triển

### Backend (Python 3.11+)

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

### Frontend (Next.js & Node.js 18+)

```powershell
cd frontend
npm ci
npm run dev
```

Frontend tự động đọc biến `NEXT_PUBLIC_API_URL` từ file môi trường (mặc định trỏ về `http://127.0.0.1:8000`).

---

## Đặc Tả API (API Reference)

### 1. Danh sách điểm cuối (Endpoints)

```text
GET /                                                -> {"message": "Welcome to Travel View API"}
GET /health                                          -> {"status": "ok"}
GET /provinces/stats/latest?view_mode=...&date=...    -> Danh sách thống kê du lịch 34 tỉnh/thành
GET /provinces/stats/dates?view_mode=...             -> Danh sách các mốc thời gian kèm metadata VNAT
GET /admin/sync/status                               -> Kiểm tra độ lệch mốc online vs DB & trạng thái scheduler
POST /admin/sync/auto?force=...&dry_run=...          -> Kích hoạt đồng bộ tự động thông minh khi có dữ liệu mới
```

### 2. Cấu trúc dữ liệu phản hồi

#### `GET /provinces/stats/latest`
```typescript
interface ProvinceData {
  id: string;                               // Mã định danh tỉnh (vd: "vn-sg")
  hcKeys: string[];                         // Danh sách hc-key GeoJSON (vd: ["VN-SG", "VN-43"])
  name: string;                             // Tên tỉnh/thành phố mới
  region: string;                           // Vùng kinh tế - xã hội
  merged_from?: string;                     // Danh sách tỉnh cấu thành trước sáp nhập
  record_date?: string;                     // Ngày chốt số liệu (YYYY-MM-DD)
  citation_url?: string;                    // Đường dẫn văn bản báo cáo gốc VNAT
  hasData?: boolean;                        // Trạng thái có số liệu hay không
  tourists_total: number;                   // Tổng lượt khách
  tourists_domestic: number;                // Khách nội địa
  tourists_international: number;           // Khách quốc tế
  overnight_stays_total: number;            // Lượt lưu trú
  hotels_count: number;                     // Số lượng khách sạn
  hotel_rooms_total: number;                // Số phòng khách sạn
  landmarks: {                              // Danh lam thắng cảnh, di tích tiêu biểu
    name: string;
    type: "nature" | "culture" | "beach" | "city" | "heritage" | "other";
    description: string;
  }[];
}
```

#### `GET /provinces/stats/dates`
```typescript
interface DateOptionResponse {
  date: string;                             // Ngày ghi nhận (YYYY-MM-DD)
  label_vi: string;                         // Nhãn hiển thị tiếng Việt (Lũy kế)
  label_short_vi: string;                   // Nhãn rút gọn (Tháng MM/YYYY)
  label_monthly_vi: string;                 // Nhãn chế độ xem riêng trong tháng
  label_en: string;                         // Nhãn hiển thị tiếng Anh (Cumulative)
  label_short_en: string;                   // Nhãn rút gọn tiếng Anh
  label_monthly_en: string;                 // Nhãn tháng tiếng Anh
  is_latest: boolean;                       // Có phải mốc mới nhất hay không
  source: string;                           // Cơ quan công bố (VNAT)
  source_url: string;                       // Cổng dữ liệu VNAT
  publication_title: string;                // Tiêu đề thông cáo báo chí
  publication_date: string;                 // Ngày phát hành
  report_url: string;                       // Đường dẫn bài báo cáo chi tiết
}
```

---

## Tự Động Hóa Đồng Bộ Dữ Liệu (Automated Crawling & Sync Job)

Hệ thống tích hợp tiến trình nền tự động so sánh mốc dữ liệu mới nhất trực tuyến (Cục Du lịch Quốc gia Việt Nam - VNAT) với mốc dữ liệu hiện có trong PostgreSQL:

1. **Cơ chế hoạt động**:
   - Quét danh mục thông cáo báo chí VNAT (`https://public.vietnamtourism.gov.vn/cat/71?type=1`).
   - Bóc tách kỳ báo cáo (tháng/năm, ngày chốt cuối tháng, tỷ lệ tăng trưởng khách quốc tế).
   - So sánh với `MAX(record_date)` trong bảng `travel_view.statistic`.
   - **Tự động kích hoạt crawl & upsert**: Chỉ khi phát hiện mốc trực tuyến mới hơn cơ sở dữ liệu hiện tại (hoặc khi được yêu cầu bắt buộc qua cờ `--force`).

2. **Chạy qua CLI**:
   ```powershell
   cd backend
   # Kiểm tra độ lệch mốc online vs database
   python -m app.crawler.auto_sync --check-only

   # Chạy 1 chu kỳ kiểm tra và đồng bộ (nếu có dữ liệu mới)
   python -m app.crawler.auto_sync --run-once

   # Chạy giả lập (Dry run) không ghi vào database
   python -m app.crawler.auto_sync --run-once --dry-run

   # Chạy daemon lặp lại định kỳ (mặc định mỗi 6 giờ = 21600s)
   python -m app.crawler.auto_sync --interval 21600
   ```

3. **Background Scheduler trong FastAPI**:
   - Tự động kích hoạt theo vòng đời (lifespan) của FastAPI app.
   - Cấu hình qua `.env`: `AUTO_CRAWL_ENABLED=true`, `AUTO_CRAWL_INTERVAL_HOURS=6`.
   - Quản trị qua API: `GET /admin/sync/status` và `POST /admin/sync/auto`.

---

## Xử Lý Sự Cố Thường Gặp (Troubleshooting)

### 1. Tên tỉnh/thành hiển thị dấu hỏi `?` trong database
- **Nguyên nhân**: Dùng lệnh gõ `Get-Content | ...` trong PowerShell cũ khiến bảng mã đầu ra bị ép về US-ASCII trước khi pipe sang container PostgreSQL.
- **Khắc phục**: Chạy lệnh seed trực tiếp từ file mount:
  ```powershell
  docker compose exec -T postgres psql -U postgres -d travel_view -f /snippets/travel-view.sql
  ```

### 2. Xung đột cổng `Bind for 0.0.0.0:5432 failed: port is already allocated`
- **Nguyên nhân**: Máy tính của bạn đang chạy một PostgreSQL service khác trên cổng mặc định 5432.
- **Khắc phục**: Mở file `.env`, điều chỉnh:
  ```env
  TRAVEL_VIEW_POSTGRES_PORT=5433
  ```
  Sau đó khởi động lại bằng `docker compose up --build`.

### 3. Xung đột cổng Redis `Bind for 0.0.0.0:6379 failed`
- **Khắc phục**: Đổi sang cổng khác trong `.env`:
  ```env
  TRAVEL_VIEW_REDIS_PORT=6380
  ```

---

## Kiểm Tra Chất Lượng Mã Nguồn

Trước khi tạo pull request hoặc kết luận thay đổi:

```powershell
# Kiểm tra cú pháp backend
uv run python -m compileall backend\app

# Kiểm tra lint và build frontend
cd frontend
npm run lint
npm run build
npm audit --audit-level=high

# Kiểm tra cấu hình Docker Compose
docker compose config
```

---

## Bản Quyền & Giấy Phép

Dự án được phân phối theo giấy phép mã nguồn mở MIT License. Dữ liệu địa giới hành chính và ranh giới không gian tuân thủ quy chuẩn số liệu bản đồ quốc gia Việt Nam.
