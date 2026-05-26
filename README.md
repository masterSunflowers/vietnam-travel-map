# Travel View

Travel View là dashboard full-stack để xem dữ liệu du lịch Việt Nam theo
tỉnh/thành trên bản đồ tương tác. Ứng dụng hiện tập trung vào màn hình bản đồ
quốc gia, bộ chọn metric, thống kê tổng quan và panel chi tiết tỉnh/thành.

Nếu bạn là agent/coding assistant, đọc thêm `AGENT.md` trước khi sửa dự án.

## Tech Stack

| Phần | Công nghệ | Ghi chú |
|---|---|---|
| Frontend | Next.js 16, React 18, TypeScript | App Router, route chính `/` |
| Map | D3 + SVG | Component đang dùng: `VietnamMapD3.tsx` |
| Styling | Tailwind CSS + CSS custom | Style chính nằm trong `globals.css` |
| Backend | FastAPI, SQLModel, Pydantic | Route đang nằm trực tiếp trong `app/main.py` |
| Database | PostgreSQL | Schema `travel_view` |
| Migration | Alembic | Migration chính trong `backend/alembic/versions/` |
| Cache/service phụ | Redis | Có trong Docker Compose |
| Local orchestration | Docker Compose | PostgreSQL, Redis, backend, frontend |

## Cấu Trúc Dự Án

```text
travel-view/
├── AGENT.md
├── CONTRIBUTING.md
├── README.md
├── docker-compose.yml
├── .env.example
├── supabase/snippets/travel-view.sql
├── backend/
│   ├── app/main.py
│   ├── app/core/config.py
│   ├── app/db/database.py
│   ├── app/models/domain.py
│   ├── alembic/
│   └── requirements.txt
└── frontend/
    ├── src/app/page.tsx
    ├── src/components/VietnamMapD3.tsx
    ├── src/components/MetricSelector.tsx
    ├── src/components/ProvinceDetail.tsx
    ├── src/lib/provinceApi.ts
    └── public/data/
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

Seed dữ liệu mẫu:

```powershell
Get-Content -Raw supabase/snippets/travel-view.sql | docker compose exec -T postgres psql -U postgres -d travel_view
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
npm ci
npm run dev
```

Frontend đọc API từ `NEXT_PUBLIC_API_URL`. Nếu không đặt biến này, code dùng
mặc định `http://127.0.0.1:8000`.

## API Hiện Có

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
  hasData?: boolean;
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

- `Location`: vùng/tỉnh/thành, có `level`, `parent_id`, `slug`, `hc_key`.
- `Statistic`: dữ liệu thời gian theo `location_id` và `record_date`.
- `Landmark`: địa danh theo `location_id`, có category dạng enum.

Migration tạo schema `travel_view`, bảng `location`, `statistic`, `landmark`,
enum `landmarkcategory` và index `ix_stat_loc_date`.

Seed mẫu nằm trong `supabase/snippets/travel-view.sql`.

## Map Data

Map đang render từ:

```text
frontend/public/data/vietnam-34-provinces.geojson
```

`VietnamMapD3.tsx` đọc GeoJSON từ `/data/vietnam-34-provinces.geojson`.
Mỗi feature cần có `properties["hc-key"]`. Key này phải khớp với `hc_key` trong
bảng `travel_view.location`.

Khi sửa bản đồ Việt Nam, giữ phần thể hiện Hoàng Sa và Trường Sa trong UI.
Hiện `VietnamMapD3.tsx` có hai inset: `QD. Hoang Sa` gắn với Đà Nẵng (`VN48`)
và `QD. Truong Sa` gắn với Khánh Hòa (`VN56`).

## Kubernetes

`k8s/manifests.yaml` là manifest mẫu. Trước khi apply, tạo secret triển khai:

```powershell
kubectl create secret generic travel-view-secrets `
  --from-literal=POSTGRES_PASSWORD="<strong-password>" `
  --from-literal=DATABASE_URL="postgresql+psycopg://postgres:<strong-password>@postgres:5432/travel_view"
```

Sau đó cập nhật image registry trong manifest rồi chạy:

```powershell
kubectl apply -f k8s/manifests.yaml
```

## Kiểm Tra

Backend compile:

```powershell
uv run python -m compileall backend\app
```

Frontend:

```powershell
cd frontend
npm run lint
npm run build
npm audit --audit-level=high
```

Docker config:

```powershell
docker compose config
```

## Contribution

1. Tạo branch nhỏ cho từng nhóm thay đổi.
2. Không commit `.env`, secret thật, `node_modules/`, `.next/`, `.venv/`, cache.
3. Giữ commit nhỏ theo module: backend, frontend, data, infra, docs.
4. Trước khi mở PR, chạy các lệnh kiểm tra ở trên và cập nhật tài liệu nếu đổi
   API, seed, map key hoặc lệnh setup.

## Ghi Chú Cho Phát Triển Tiếp

- Chưa có auth/admin route trong backend.
- Chưa có router module riêng; mọi endpoint đang nằm trong `backend/app/main.py`.
- `frontend/src/lib/provinceData.ts` là mock/legacy data và không được page chính
  import trực tiếp.
- `VietnamMap.tsx` có thể là hướng Highcharts cũ; màn hình chính dùng
  `VietnamMapD3.tsx`.
