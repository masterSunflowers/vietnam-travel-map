# Travel View — Vietnam Tourism Data GIS Dashboard

<p align="center">
  <a href="README.md"><b>🇻🇳 Tiếng Việt</b></a> &nbsp;|&nbsp; <a href="README.en.md"><b>🇬🇧 English</b></a>
</p>

---

**Travel View** is a modern, full-stack GIS dashboard designed to visualize tourism statistics across Vietnam's 34 reorganized provinces on an interactive map. The application features a comprehensive 2-tab architecture, integrating interactive spatial GIS visualization with an official verification table powered by real monthly releases from the Vietnam National Authority of Tourism (VNAT) and the General Statistics Office (GSO).

If you are an AI agent or software engineer, please refer to the agent architecture guide in [`GEMINI.md`](GEMINI.md).

---

## Core Features

### 1. Tab 1: Interactive GIS Tourism Map
- **34 Reorganized Provinces Boundary**: Accurately mapped using D3-compatible GeoJSON data with standardized `hc-key` identifiers.
- **Dynamic Multi-Metric Choropleth Visualization**: Real-time thematic rendering across 6 core tourism indicators:
  - Total Tourists (`tourists_total`)
  - Domestic Tourists (`tourists_domestic`)
  - International Tourists (`tourists_international`)
  - Overnight Stays (`overnight_stays_total`)
  - Hotel Establishments (`hotels_count`)
  - Total Hotel Rooms (`hotel_rooms_total`)
- **Fluid D3 Zoom & Pan Controls (`d3.zoom()`)**:
  - Smooth mouse wheel scrolling and touchscreen pinch-to-zoom gestures.
  - Floating glassmorphism quick controls: `[+]` Zoom In, `[−]` Zoom Out, `[⟲]` Reset National Overview.
- **Zero-Scroll Viewport Confinement (Fit Layout)**: Viewport-aware layout calculation ensures the entire S-shaped nation—from northern Ha Giang down to Ca Mau Cape and Phu Quoc Island—fits within the screen without vertical page scrolling or clipped boundaries.
- **Maritime Sovereignty Preservation**: Adaptive inset containers for the **Paracel Islands (Hoang Sa)** (administered under Da Nang) and **Spratly Islands (Truong Sa)** (administered under Khanh Hoa) dynamically scale to preserve national territorial integrity without occluding the central mainland coastline.
- **Rich Province Detail Panel (`ProvinceDetail`)**: Instant flyout drawer displaying provincial breakdown, historical landmarks, cultural attractions, and contributing constituent provinces.

### 2. Tab 2: Official Data Verification View
- **Standardized 11-Column Audit Table**:
  - `No.`, `Province / City`, `Constituent Merged Entities`, `Total Tourists`, `Domestic Tourists`, `International Tourists`, `Intl. Ratio (%)`, `Overnight Stays`, `Hotels`, `Rooms`, `Official Source Citation`.
- **Freeze Columns (Sticky Headers & Columns)**: The `No.` and `Province Name` columns remain pinned to the left (`position: sticky`) during horizontal scrolling, facilitating side-by-side data auditing.
- **Instant Multi-Field Search**: Real-time filtering by province name, constituent units, or geographic regions (e.g., searching "Ha Tay", "Ba Ria", or "Red River Delta").
- **National Overview Ribbon**: Instant summary badges aggregating total visitors, domestic travelers, international arrivals, and available accommodation rooms nationwide.
- **Official Citation Banner & Outbound Audit Links**: Displays publishing authority (VNAT), official publication title, release date, and direct `🔗 Verify` links to the original government report articles.

### 3. Multi-Functional Shared Header
- **10-Month Milestone Filter**: Dropdown allowing seamless historical traversal from January 2026 through October 2026.
- **Dynamic Perspective Toggle**:
  - **Cumulative View (`cumulative`)**: Year-to-date aggregated statistics up to the chosen milestone.
  - **Monthly View (`monthly`)**: Discrete numbers generated solely within that specific month.
- **Complete Bilingual Support (VI / EN)**: Full localization in Vietnamese and English with automatic preference persistence in `localStorage`.

---

## Tech Stack

| Component | Technology | Description |
|---|---|---|
| **Frontend** | Next.js 16 (App Router), React 18, TypeScript | High-performance standalone build with Turbopack |
| **Map Engine** | D3.js (v7) + Vector SVG | Primary component: `VietnamMapD3.tsx` |
| **Styling** | Tailwind CSS + Custom Dark Glassmorphism | Stylesheet defined in `globals.css` |
| **Backend** | FastAPI, SQLModel (SQLAlchemy), Pydantic v2 | Python 3.11+ asynchronous API architecture |
| **Data Ingestion** | Python Crawler Pipeline (`backend/app/crawler/`) | Ingests 10 monthly VNAT milestones, 63-to-34 province reconciliation |
| **Database** | PostgreSQL | Isolated schema `travel_view` |
| **Migration** | Alembic | Database migrations under `backend/alembic/` |
| **Cache & Bus** | Redis | In-memory cache managed in Docker Compose |
| **Orchestration** | Docker Compose | Complete containerized environment (Frontend, Backend, DB, Redis) |

---

## Project Structure

```text
travel-view/
├── .env.example                               # Environment template with conflict-safe ports
├── docker-compose.yml                         # Full-stack multi-container specification
├── CONTRIBUTING.md                            # Contribution and code quality guidelines
├── GEMINI.md                                  # Autonomous agent reference & rules
├── README.md                                  # Vietnamese project documentation
├── README.en.md                               # English project documentation
├── k8s/                                       # Production Kubernetes deployment manifests
│   └── manifests.yaml
├── supabase/snippets/
│   └── travel-view.sql                        # UTF-8 encoded seed SQL data
├── backend/
│   ├── Dockerfile                             # Backend container configuration
│   ├── requirements.txt                       # Python dependencies
│   ├── alembic/                               # Database migration scripts
│   ├── tests/                                 # Automated test suite (offline & mock-enabled)
│   └── app/
│       ├── main.py                            # FastAPI entrypoint, lifespan scheduler, and routes
│       ├── core/
│       │   ├── config.py                      # Pydantic Settings configuration
│       │   └── scheduler.py                   # Periodic background sync scheduler
│       ├── db/database.py                     # Database engine initialization
│       ├── models/domain.py                   # Domain models: Location, Statistic, Landmark
│       └── crawler/                           # Official VNAT crawler and data reconciliation
│           ├── online_checker.py              # Online release milestone detector
│           ├── auto_sync.py                   # Delta comparator & automated sync engine
│           ├── monthly_dataset.py             # 10 monthly milestones and publication metadata
│           ├── official_dataset.py            # Normalized baseline tourism metrics
│           ├── province_mapping.py            # 63-to-34 province administrative mapping
│           ├── resolver.py                    # GeoJSON hc-key aggregation engine
│           ├── sync.py                        # Ingestion and upsert logic
│           └── ingest_months.py               # Batch ingestion CLI utility
└── frontend/
    ├── Dockerfile                             # Multi-stage container build (Non-Root UID 1001)
    ├── package.json                           # Node.js dependencies
    ├── public/data/
    │   └── vietnam-34-provinces.geojson       # Standardized 34-province GeoJSON geometry
    └── src/
        ├── app/
        │   ├── layout.tsx                     # Next.js root layout
        │   ├── page.tsx                       # Main dashboard view orchestrating 2 tabs
        │   └── globals.css                    # Unified Dark Neumorphic & Responsive CSS
        ├── components/
        │   ├── Header.tsx                     # Shared header with tabs, date picker, language
        │   ├── VietnamMapD3.tsx               # D3 zoom/pan interactive GIS map
        │   ├── MetricSelector.tsx             # 6-metric selection ribbon
        │   ├── ProvinceDetail.tsx             # Provincial drawer panel
        │   └── VerificationView.tsx           # Official audit data table view
        └── lib/
            ├── i18n.tsx                       # Bilingual context and translations (VI/EN)
            └── provinceApi.ts                 # Type-safe API client
```

---

## Quick Start (Docker Compose)

### 1. Setup Environment Configuration
Copy `.env.example` to `.env`:

```powershell
Copy-Item .env.example .env
```

> **Port Conflict Avoidance**: `.env.example` defaults the host PostgreSQL port to `TRAVEL_VIEW_POSTGRES_PORT=5433` and Redis to `TRAVEL_VIEW_REDIS_PORT=6380`. This avoids port collisions if your host machine already runs PostgreSQL on port 5432 or Redis on port 6379. Docker container-to-container internal networking continues using default port 5432 seamlessly.

### 2. Launch the Application Stack
Start all 4 services (`postgres`, `redis`, `backend`, `frontend`):

```powershell
docker compose up --build
```

### 3. Seed Sample Data (Preserving UTF-8 Vietnamese Characters)
To avoid character encoding corruption (where Vietnamese accents convert into `?` marks under legacy PowerShell pipelines), execute the seed script directly from the mounted container path:

```powershell
docker compose exec -T postgres psql -U postgres -d travel_view -f /snippets/travel-view.sql
```

### 4. Access the Services
- **Web Frontend**: `http://localhost:3000`
- **FastAPI Backend**: `http://localhost:8000`
- **Interactive OpenAPI Documentation (Swagger UI)**: `http://localhost:8000/docs`
- **Service Health Check**: `http://localhost:8000/health`

---

## Local Development Setup

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

The frontend automatically resolves the API base URL from `NEXT_PUBLIC_API_URL` (defaults to `http://127.0.0.1:8000`).

---

## API Reference

### 1. Available Endpoints

```text
GET /                                                -> {"message": "Welcome to Travel View API"}
GET /health                                          -> {"status": "ok"}
GET /provinces/stats/latest?view_mode=...&date=...    -> Real-time provincial statistics for 34 provinces
GET /provinces/stats/dates?view_mode=...             -> List of monthly publication milestones and metadata
GET /admin/sync/status                               -> Check delta between online releases vs DB & scheduler state
POST /admin/sync/auto?force=...&dry_run=...          -> Trigger automated sync when online updates are detected
```

### 2. Contract Schemas

#### `GET /provinces/stats/latest`
```typescript
interface ProvinceData {
  id: string;                               // Unique province identifier (e.g. "vn-sg")
  hcKeys: string[];                         // GeoJSON hc-keys (e.g. ["VN-SG", "VN-43"])
  name: string;                             // Province name
  region: string;                           // Socio-economic region
  merged_from?: string;                     // Constituent provinces prior to merger
  record_date?: string;                     // Reporting period date (YYYY-MM-DD)
  citation_url?: string;                    // Direct URL to official government publication
  hasData?: boolean;                        // Availability status
  tourists_total: number;                   // Total tourist count
  tourists_domestic: number;                // Domestic tourist count
  tourists_international: number;           // International tourist count
  overnight_stays_total: number;            // Total overnight visitor stays
  hotels_count: number;                     // Total accommodation establishments
  hotel_rooms_total: number;                // Total available hotel rooms
  landmarks: {                              // Curated attractions and landmarks
    name: string;
    type: "nature" | "culture" | "beach" | "city" | "heritage" | "other";
    description: string;
  }[];
}
```

#### `GET /provinces/stats/dates`
```typescript
interface DateOptionResponse {
  date: string;                             // Milestone date (YYYY-MM-DD)
  label_vi: string;                         // Vietnamese cumulative label
  label_short_vi: string;                   // Concise Vietnamese label (Tháng MM/YYYY)
  label_monthly_vi: string;                 // Vietnamese monthly perspective label
  label_en: string;                         // English cumulative label
  label_short_en: string;                   // Concise English label (MMM YYYY)
  label_monthly_en: string;                 // English monthly perspective label
  is_latest: boolean;                       // Indicates the latest reporting date
  source: string;                           // Issuing agency (e.g. "VNAT")
  source_url: string;                       // Official portal URL
  publication_title: string;                // Official release headline
  publication_date: string;                 // Publication release date
  report_url: string;                       // Detailed article report link
}
```

---

## Automated Data Crawling & Sync Job

Travel View features an automated background worker that compares online tourism releases (Vietnam National Authority of Tourism - VNAT) against the latest milestone stored in PostgreSQL:

1. **How It Works**:
   - Inspects VNAT official release feed (`https://public.vietnamtourism.gov.vn/cat/71?type=1`).
   - Extracts target reporting period (month/year, end-of-month date, international growth rate).
   - Compares against `MAX(record_date)` in `travel_view.statistic`.
   - **Smart Ingestion Trigger**: Automatically ingests and reconciles data into the 34 merged provinces only when online data is strictly newer than the database (or when `--force` is specified).

2. **CLI Runner**:
   ```powershell
   cd backend
   # Inspect comparison delta between DB and online release
   python -m app.crawler.auto_sync --check-only

   # Run a single sync cycle (triggers ingestion if newer data is available)
   python -m app.crawler.auto_sync --run-once

   # Simulate ingestion without writing to the database
   python -m app.crawler.auto_sync --run-once --dry-run

   # Run continuous background daemon (default interval: 6 hours = 21600s)
   python -m app.crawler.auto_sync --interval 21600
   ```

3. **FastAPI Lifespan Scheduler**:
   - Runs automatically as an asynchronous background task within the FastAPI app.
   - Configured via `.env`: `AUTO_CRAWL_ENABLED=true`, `AUTO_CRAWL_INTERVAL_HOURS=6`.
   - Monitored via admin endpoints: `GET /admin/sync/status` and `POST /admin/sync/auto`.

---

## Troubleshooting Guide

### 1. Provincial names showing question marks `?` in database
- **Root Cause**: Windows PowerShell's default pipeline encoding converts Unicode text to ASCII when piping via `Get-Content | ...`.
- **Solution**: Execute the seed script directly from the mounted container filesystem:
  ```powershell
  docker compose exec -T postgres psql -U postgres -d travel_view -f /snippets/travel-view.sql
  ```

### 2. Port conflict: `Bind for 0.0.0.0:5432 failed: port is already allocated`
- **Root Cause**: Another PostgreSQL instance on your host machine is occupying port 5432.
- **Solution**: Open `.env` and configure a distinct host port:
  ```env
  TRAVEL_VIEW_POSTGRES_PORT=5433
  ```
  Then restart with `docker compose up --build`.

### 3. Redis port conflict: `Bind for 0.0.0.0:6379 failed`
- **Solution**: Reassign the Redis host port in `.env`:
  ```env
  TRAVEL_VIEW_REDIS_PORT=6380
  ```

---

## Verification & Code Quality

Before submitting a Pull Request, run the validation suite:

```powershell
# Backend compilation check
uv run python -m compileall backend\app

# Frontend code quality and type check
cd frontend
npm run lint
npm run build
npm audit --audit-level=high

# Docker Compose configuration validation
docker compose config
```

---

## License & Sovereignty

Distributed under the MIT License. Administrative boundaries and spatial data strictly adhere to the official cartographic standards of Vietnam.
