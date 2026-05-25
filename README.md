# Travel View

Travel View là dashboard full-stack để xem dữ liệu du lịch Việt Nam theo
tỉnh/thành trên bản đồ tương tác. Ứng dụng hiện tập trung vào màn hình bản đồ
quốc gia, metric selector, thống kê tổng quan, và panel chi tiết tỉnh/thành.

Nếu bạn là agent/coding assistant, hãy đọc thêm `AGENT.md` trước khi sửa dự án.

## Tech Stack

| Phần | Công nghệ | Ghi chú |
|---|---|---|
| Frontend | Next.js 14, React 18, TypeScript | App Router, route chính `/` |
| Map | D3 + SVG | Component đang dùng: `VietnamMapD3.tsx` |
| Styling | Tailwind CSS + CSS custom | Style chính nằm trong `globals.css` |
| Backend | FastAPI, SQLModel, Pydantic | Route đang nằm trực tiếp trong `app/main.py` |
| Database | PostgreSQL | Schema `travel_view` |
| Migration | Alembic | Migration chính trong `backend/alembic/versions/` |
| Cache/service phụ | Redis | Có trong Docker Compose, chưa có service cache riêng |
| Local orchestration | Docker Compose | PostgreSQL, Redis, backend, frontend |

## Cấu Trúc Dự Án

```text
travel-view/
├── AGENT.md                         # Hướng dẫn ngắn cho agent
├── README.md                        # Tài liệu vận hành dự án
├── docker-compose.yml               # Full local stack
├── .env.example                     # Biến môi trường mẫu cho Docker/local
├── generate_map.py                  # Tạo GeoJSON từ boundary/point data
├── merge_old_map.py                 # Merge map cũ thành 34 tỉnh/thành
├── test_map.py                      # Kiểm tra bounding box GeoJSON
├── supabase/snippets/travel-view.sql# Seed dữ liệu mẫu
├── backend/
│   ├── app/main.py                  # FastAPI app, CORS, endpoints
│   ├── app/core/config.py           # Settings, đọc ../.env khi chạy từ backend/
│   ├── app/db/database.py           # SQLModel engine/session
│   ├── app/models/domain.py         # Location, Statistic, Landmark
│   ├── alembic/                     # Migration schema travel_view
│   └── requirements.txt
└── frontend/
    ├── src/app/page.tsx             # Dashboard chính
    ├── src/components/VietnamMapD3.tsx
    ├── src/components/MetricSelector.tsx
    ├── src/components/ProvinceDetail.tsx
    ├── src/lib/provinceApi.ts       # Contract frontend-backend
    ├── src/lib/provinceData.ts      # Mock/legacy data
    └── public/data/                 # GeoJSON map data
```

## Chạy Bằng Docker

Tạo `.env` từ file mẫu:

```powershell
Copy-Item .env.example .env
```

Khởi động stack:

```powershell
docker compose up --build
```

Sau khi chạy:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- Swagger/OpenAPI: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

## Chạy Local Từng Phần

Backend:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

Frontend:

```powershell
cd frontend
npm install
npm run dev
```

Frontend đọc API từ `NEXT_PUBLIC_API_URL`. Nếu không đặt biến này, code dùng
mặc định `http://localhost:8000`.

## API Hiện Có

Backend hiện có các route:

```text
GET /                         -> {"message": "Welcome to Travel View API"}
GET /health                   -> {"status": "ok"}
GET /provinces/stats/latest   -> danh sách thống kê mới nhất theo tỉnh/thành
```

`GET /provinces/stats/latest` trả về danh sách:

```ts
interface ProvinceData {
  id: string;
  hcKeys: string[];
  name: string;
  region: string;
  tourists_total: number;
  tourists_domestic: number;
  tourists_international: number;
  overnight_stays_total: number;
  hotels_count: number;
  hotel_rooms_total: number;
  landmarks: {
    name: string;
    type: "nature" | "culture" | "beach" | "city" | "heritage" | "other";
    description: string;
  }[];
}
```

Frontend dùng contract này trong `frontend/src/lib/provinceApi.ts`.

## Data Model

Model chính nằm trong `backend/app/models/domain.py`:

- `Location`: vùng/tỉnh/thành, có `level`, `parent_id`, `slug`, `hc_key`.
- `Statistic`: dữ liệu thời gian theo `location_id` và `record_date`.
- `Landmark`: địa danh theo `location_id`, có category dạng enum.

Migration tạo schema `travel_view`, bảng `location`, `statistic`, `landmark`,
enum `landmarkcategory`, và index `ix_stat_loc_date`.

Seed mẫu nằm trong `supabase/snippets/travel-view.sql`.

## Map Data

Map đang render từ:

```text
frontend/public/data/vietnam-34-provinces.geojson
```

`VietnamMapD3.tsx` đọc GeoJSON này từ `/data/vietnam-34-provinces.geojson`.
Mỗi feature cần có `properties["hc-key"]`. Key này phải khớp với `hc_key` trong
bảng `travel_view.location`.

Các script hỗ trợ:

```powershell
python merge_old_map.py
python generate_map.py
python test_map.py
```

Khi sửa bản đồ Việt Nam, giữ phần thể hiện Hoàng Sa và Trường Sa trong UI.
Hiện `VietnamMapD3.tsx` có hai inset: `QD. Hoang Sa` gắn với Đà Nẵng (`VN48`)
và `QD. Truong Sa` gắn với Khánh Hòa (`VN56`).

## Kiểm Tra

Kiểm tra backend compile:

```powershell
cd backend
python -m compileall app
```

Kiểm tra frontend build:

```powershell
cd frontend
npm run build
```

Lint script hiện là:

```powershell
cd frontend
npm run lint
```

Nếu lệnh lint lỗi do cấu hình Next/ESLint version, ưu tiên ghi lại lỗi cụ thể
thay vì đoán.

## Ghi Chú Cho Phát Triển Tiếp

- README cũ từng mô tả nhiều route/chức năng chưa tồn tại. Tài liệu hiện tại
  phản ánh code đang có.
- Chưa có auth/admin route trong backend.
- Chưa có router module riêng; mọi endpoint đang nằm trong `backend/app/main.py`.
- `frontend/src/lib/provinceData.ts` là mock/legacy data và không được page chính
  import trực tiếp.
- `VietnamMap.tsx` có thể là hướng Highcharts cũ; màn hình chính dùng
  `VietnamMapD3.tsx`.
