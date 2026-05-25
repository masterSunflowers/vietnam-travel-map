# Travel View Agent Guide

Tài liệu này là bản đồ nhanh cho agent khi làm việc trong dự án `travel-view`.
Đọc file này trước khi sửa code hoặc tài liệu.

## Mục Tiêu Dự Án

Travel View là dashboard web hiển thị dữ liệu du lịch Việt Nam theo tỉnh/thành.
Frontend vẽ bản đồ Việt Nam bằng D3/SVG, lấy thống kê mới nhất từ FastAPI, và mở
panel chi tiết khi chọn một tỉnh/thành.

Trạng thái hiện tại là một prototype full-stack:
- Frontend: Next.js App Router, TypeScript, Tailwind/CSS custom, D3.
- Backend: FastAPI, SQLModel, PostgreSQL schema `travel_view`.
- Database/local services: PostgreSQL và Redis qua Docker Compose.
- Map data: GeoJSON trong `frontend/public/data/`.

## Cấu Trúc Quan Trọng

- `frontend/src/app/page.tsx`: màn hình chính tại route `/`.
- `frontend/src/components/VietnamMapD3.tsx`: bản đồ D3 hiện đang được dùng.
- `frontend/src/components/MetricSelector.tsx`: chọn metric hiển thị.
- `frontend/src/components/ProvinceDetail.tsx`: panel chi tiết tỉnh/thành.
- `frontend/src/lib/provinceApi.ts`: contract API frontend đang dùng.
- `frontend/src/lib/provinceData.ts`: dữ liệu mock cũ, hiện không phải nguồn chính.
- `frontend/public/data/vietnam-34-provinces.geojson`: GeoJSON bản đồ 34 tỉnh/thành.
- `backend/app/models/domain.py`: SQLModel cho `Location`, `Statistic`, `Landmark`.
- `backend/app/main.py`: FastAPI app và route hiện có.
- `backend/alembic/versions/20260424_0001_initial_schema.py`: migration schema chính.
- `supabase/snippets/travel-view.sql`: seed dữ liệu mẫu.
- `docker-compose.yml`: PostgreSQL, Redis, backend, frontend.

## Runtime Contract

Frontend gọi backend qua:

```text
GET /provinces/stats/latest
```

Base URL lấy từ `NEXT_PUBLIC_API_URL`, mặc định trong code là
`http://localhost:8000`.

Response chính của endpoint:

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
  landmarks: ProvinceLandmark[];
}
```

`hcKeys` phải khớp với `properties["hc-key"]` trong GeoJSON. Backend lưu `hc_key`
dưới dạng chuỗi và tách nhiều key bằng dấu phẩy.

## Lệnh Chạy

Chạy toàn bộ stack bằng Docker:

```powershell
docker compose up --build
```

Chạy backend local:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

Chạy frontend local:

```powershell
cd frontend
npm install
npm run dev
```

Mở UI tại `http://localhost:3000`. API docs nằm tại
`http://localhost:8000/docs`.

## Quy Ước Khi Sửa

- Không đọc hoặc sửa `node_modules/`, `frontend/node_modules/`, `__pycache__/`,
  hoặc `frontend/tsconfig.tsbuildinfo` nếu không có lý do rõ ràng.
- Nếu sửa contract API, cập nhật đồng thời `backend/app/main.py` và
  `frontend/src/lib/provinceApi.ts`.
- Nếu sửa map, kiểm tra cả GeoJSON key, `hc_key` trong DB/seed, và logic hover
  trong `VietnamMapD3.tsx`.
- `VietnamMapD3.tsx` là map đang dùng. `VietnamMap.tsx` và nội dung Highcharts
  trong tài liệu cũ chỉ nên coi là legacy/ý tưởng cũ cho tới khi được xác nhận.
- Giữ dữ liệu Hoàng Sa và Trường Sa hiển thị trong UI/map inset khi thay đổi bản
  đồ Việt Nam.
- Backend hiện chưa chia router riêng; route đang nằm trực tiếp trong
  `backend/app/main.py`. Nếu tách router, cập nhật README và file này.
- Migration dùng schema `travel_view`; model cũng khai báo `__table_args__`
  cùng schema này.

## Kiểm Tra Trước Khi Kết Luận

Tối thiểu chạy các lệnh phù hợp với phần đã sửa:

```powershell
cd backend
python -m compileall app
```

```powershell
cd frontend
npm run build
```

Nếu chỉ sửa tài liệu, kiểm tra lại các path/lệnh được nhắc tới có tồn tại trong
repo hiện tại.
