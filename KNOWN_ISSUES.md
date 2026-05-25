# Known Issues

Last reviewed: 2026-05-25

This file classifies the issues found before publishing the current Travel View
version. The first group must be fixed before publishing; the second group can
be scheduled after the release.

## Need Instantly Fix

All issues in this group have been fixed in the current working tree.

### 1. Local env and secret hygiene

- **Status:** Fixed.
- **Fix:** Added `.gitignore` entries for local env files, generated folders,
  virtualenvs, build output, and Python caches. `.env.example` is now kept as a
  committed template, and the local `.env` no longer contains the previous
  `sb_secret_...` value.
- **Why instant:** Publishing local credentials or generated dependency folders
  would be a release-blocking security and repository hygiene issue.

### 2. Docker Compose host/container mismatch

- **Status:** Fixed.
- **Fix:** Backend Compose env now uses service DNS names and container ports:
  `postgres:5432` and `redis:6379`. Postgres and Redis healthchecks were added,
  and backend waits for healthy dependencies.
- **Why instant:** The previous config resolved local Supabase host ports inside
  the backend container, which can break `docker compose up`.

### 3. Seed SQL enum schema mismatch

- **Status:** Fixed.
- **Fix:** Landmark category casts now use `travel_view.landmarkcategory`, which
  matches the Alembic schema.
- **Why instant:** A clean database initialized by migrations must be seedable
  for release and CI setup.

### 4. Tooltip XSS risk from `innerHTML`

- **Status:** Fixed.
- **Fix:** `VietnamMapD3.tsx` now renders tooltip content through React state and
  JSX instead of assigning interpolated database/GeoJSON values to `innerHTML`.
- **Why instant:** Tooltip content can include imported or database-backed text,
  so direct HTML interpolation is unsafe for a published UI.

### 5. Open CORS with credentials

- **Status:** Fixed.
- **Fix:** CORS origins now come from `CORS_ORIGINS`, and credentials are not
  enabled for the public API surface.
- **Why instant:** Wildcard origins plus credential support is too permissive
  and can produce unsafe or confusing browser behavior.

### 6. Backend startup race and production reload mode

- **Status:** Fixed.
- **Fix:** Added a database wait script before Alembic migrations and removed
  Uvicorn `--reload` from the backend image command.
- **Why instant:** Cold starts should not race Postgres readiness, and release
  images should not run development file watchers.

### 7. Frontend public API URL in Docker builds

- **Status:** Fixed.
- **Fix:** `frontend/Dockerfile` now accepts `NEXT_PUBLIC_API_URL` and Supabase
  public values as build args before `next build`; Compose passes those args.
- **Why instant:** `NEXT_PUBLIC_*` values are inlined at build time, so release
  images must be built with the intended public API endpoint.

### 8. Frontend lint and reproducible Docker installs

- **Status:** Fixed.
- **Fix:** Added committed ESLint flat config for Next 16. Docker builds now
  copy `package-lock.json` and use `npm ci`.
- **Why instant:** CI/release checks should not hang on interactive lint setup,
  and container dependency resolution should be lockfile-based.

### 9. High-severity frontend dependency advisories

- **Status:** Fixed.
- **Fix:** Upgraded `next`, `eslint-config-next`, and `eslint` to versions that
  clear the high-severity audit findings. The lint script now uses `eslint .`
  because newer Next versions no longer rely on `next lint`.
- **Why instant:** High-severity dependency advisories should be cleared before
  publishing when a compatible upgrade path exists.

## May Be Later

These issues do not block publishing the current version, but they should be
tracked for the next hardening pass.

### 1. Missing-data provinces are hoverable but not detail-clickable

- **Status:** Open.
- **Evidence:** Fallback province data is created for hover, but the click
  handler still opens details only for API-backed provinces.
- **Impact:** If the API becomes incomplete again, users may see a hover tooltip
  but clicking the same province does nothing.
- **Suggested fix:** Either open a fallback detail panel or use a non-click
  cursor for fallback-only provinces.

### 2. Seed file has redundant first-pass sample data

- **Status:** Open.
- **Evidence:** The seed inserts fixed sample stats/landmarks, commits, then
  deletes/replaces generated stats/landmarks for all provinces.
- **Impact:** The final result is usable, but the script is harder to reason
  about and failures midway are noisier.
- **Suggested fix:** Collapse the seed into one idempotent flow that inserts all
  34 provinces and replaces generated stats/landmarks once.

### 3. Release verification is still mostly smoke checks

- **Status:** Open.
- **Evidence:** There are no committed backend/frontend automated tests for the
  map fallback, API shape, seed completeness, or Docker boot behavior.
- **Impact:** Important release behavior can regress without automated coverage.
- **Suggested fix:** Add smoke tests for `/health`, `/provinces/stats/latest`,
  GeoJSON/API coverage, frontend build, lint, and Docker boot.

### 4. Legacy files can confuse contributors

- **Status:** Open.
- **Evidence:** The active app uses `VietnamMapD3.tsx`, but legacy map/mock data
  and multiple migration folders remain in the repository.
- **Impact:** Future contributors may edit the wrong implementation path.
- **Suggested fix:** Remove unused files or document them as archived or
  experimental.

### 5. Moderate transitive PostCSS advisory remains in `next`

- **Status:** Open.
- **Evidence:** `npm.cmd audit --audit-level=high` exits successfully after the
  Next 16 upgrade, but still reports a moderate PostCSS advisory under Next's
  transitive dependency tree. `npm audit fix --force` currently suggests a
  breaking downgrade path, so it was not applied.
- **Impact:** This is not a high-severity publish blocker after the current
  upgrade, but it should be revisited when Next publishes a clean patched path.
- **Suggested fix:** Re-run audit during the next dependency refresh and update
  Next/PostCSS when npm exposes a non-regressive fix.

## Current Checks

Latest verification run:

- `npm.cmd run build` in `frontend/`: passed on Next 16.2.6.
- `npm.cmd run lint` in `frontend/`: passed with no output.
- `npm.cmd audit --audit-level=high` in `frontend/`: passed; only moderate
  transitive PostCSS advisory remains.
- `docker compose config`: passed; backend resolves to `postgres:5432` and
  `redis:6379`. Docker still warns that `C:\Users\Admin\.docker\config.json`
  is not readable in this shell, but the Compose config is produced.
- Static scan for `sb_secret`, `innerHTML`, wildcard CORS, `--reload`,
  `next lint`, and `public.landmarkcategory`: no matches.
- Local API smoke check: `/provinces/stats/latest` returned 34 records.
