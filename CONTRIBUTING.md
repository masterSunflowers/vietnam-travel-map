# Contributing

## Setup

1. Copy `.env.example` to `.env` for local development. Nếu cổng `5432` hoặc `6379` trên máy của bạn đã được dùng bởi service khác, điều chỉnh `TRAVEL_VIEW_POSTGRES_PORT` (vd: `5433`) hoặc `TRAVEL_VIEW_REDIS_PORT` trong file `.env`.
2. Start the stack:

```powershell
docker compose up --build
```

3. Seed the sample tourism data:

```powershell
docker compose exec -T postgres psql -U postgres -d travel_view -f /snippets/travel-view.sql
```


4. Open the app at `http://localhost:3000`.

## Local Development

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

## Checks Before PR

```powershell
uv run python -m compileall backend\app
```

```powershell
cd frontend
npm run lint
npm run build
npm audit --audit-level=high
```

## Commit Scope

Keep commits small and reviewable:

- backend API/model/migration changes
- frontend UI/API-client changes
- map or seed data changes
- infra/deployment changes
- docs-only changes

Never commit `.env`, real credentials, `node_modules/`, `.next/`, `.venv/`, or
generated cache files.
