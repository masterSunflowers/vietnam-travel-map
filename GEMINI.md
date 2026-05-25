# Travel View Project Context

For the current, agent-focused project guide, read `AGENT.md` first.

## Current State

Travel View is a full-stack tourism dashboard for Vietnam. The current UI runs
at route `/`, renders a D3/SVG Vietnam map, fetches latest province statistics
from FastAPI, and opens a detail panel when a province is selected.

## Stack

- Frontend: Next.js 14 App Router, React 18, TypeScript, D3, Tailwind/CSS custom.
- Backend: FastAPI, SQLModel, Pydantic.
- Database: PostgreSQL schema `travel_view`; migrations via Alembic.
- Services: Redis and PostgreSQL in Docker Compose.
- Map data: GeoJSON files in `frontend/public/data/`.

## Source Of Truth

- Main page: `frontend/src/app/page.tsx`.
- Active map component: `frontend/src/components/VietnamMapD3.tsx`.
- Frontend API client: `frontend/src/lib/provinceApi.ts`.
- Legacy/mock data: `frontend/src/lib/provinceData.ts`.
- API entrypoint: `backend/app/main.py`.
- Domain models: `backend/app/models/domain.py`.
- Migration: `backend/alembic/versions/20260424_0001_initial_schema.py`.
- Seed SQL: `supabase/snippets/travel-view.sql`.

## Commands

```powershell
docker compose up --build
```

```powershell
cd backend
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

```powershell
cd frontend
npm install
npm run dev
```

## API Contract

Frontend calls:

```text
GET /provinces/stats/latest
```

Base URL comes from `NEXT_PUBLIC_API_URL`, defaulting to
`http://localhost:8000`.

The backend also exposes:

```text
GET /
GET /health
```

## Development Notes

- Do not assume `/map`, `/api/v1`, auth routes, or admin routes exist; they are
  not present in the current code.
- The active map is D3, not Highcharts. Treat `VietnamMap.tsx` and older
  Highcharts docs as legacy unless the user asks to revive them.
- Keep GeoJSON `properties["hc-key"]`, backend `Location.hc_key`, and frontend
  `ProvinceData.hcKeys` aligned.
- Preserve the visible Hoàng Sa and Trường Sa map insets when editing map UI.
