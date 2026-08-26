# JanSeva AI — Backend (Phase 1)

Core grievance-management loop: citizen registers/logs in, submits a complaint,
officer views and updates it, citizen tracks status. No AI yet — that's Phase 2.

## 1. Install dependencies

```bash
npm install
```

## 2. Set up PostgreSQL

Use a real PostgreSQL instance; do not replace it with SQLite or JSON storage.

### Option A: local Docker PostgreSQL (recommended)

```bash
cp .env.example .env
npm run db:up
```

This starts PostgreSQL on `localhost:5432` with:

- database: `janseva`
- username: `janseva`
- password: `janseva`

The container also runs the canonical schema files automatically on first start:

- `db/schema.sql`
- `db/schema_phase2.sql`
- `db/schema_phase3_gis.sql`
- `db/schema_ai_processing.sql`
- `db/schema_phase4_security.sql`

### Option B: local installed PostgreSQL

Create a database:

```bash
createdb janseva
```

Then run the schema file against it:

```bash
psql postgresql://janseva:janseva@localhost:5432/janseva < db/schema.sql
psql postgresql://janseva:janseva@localhost:5432/janseva < db/schema_phase2.sql
psql postgresql://janseva:janseva@localhost:5432/janseva < db/schema_phase3_gis.sql
psql postgresql://janseva:janseva@localhost:5432/janseva < db/schema_ai_processing.sql
psql postgresql://janseva:janseva@localhost:5432/janseva < db/schema_phase4_security.sql
```

This creates the canonical complaint + AI tables and seeds a few departments/categories so you have something to test against immediately.

## 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in:
- `DATABASE_URL` — your Postgres connection string
- `JWT_SECRET` — any long random string (used to sign login tokens)

## 4. Run the server

```bash
node server.js
```

You should see: `JanSeva AI backend listening on http://localhost:5000`

Test it's alive: open `http://localhost:5000/api/health` in a browser — you
should see `{"status":"ok", ...}`.

## API Endpoints

### Auth
| Method | Endpoint | Body | Notes |
|---|---|---|---|
| POST | `/api/auth/register` | `{ name, email, phone, password, role }` | `role` is `citizen` or `officer` |
| POST | `/api/auth/login` | `{ email, password }` | Returns a JWT token |

Every complaint route below requires the JWT in the header:
`Authorization: Bearer <token>`

### Complaints
| Method | Endpoint | Who | Notes |
|---|---|---|---|
| POST | `/api/complaints` | citizen | `{ title, description, category_id, latitude, longitude }` |
| GET | `/api/complaints` | citizen (own) / officer (all) | optional `?status=` `?department_id=` filters |
| GET | `/api/complaints/:id` | citizen (own) / officer | returns complaint + attached media |
| PUT | `/api/complaints/:id/status` | officer only | `{ status }` — one of `submitted, in_progress, resolved, reopened, closed` |
| POST | `/api/complaints/:id/media` | citizen or officer | `{ file_url, type }` — for an already-hosted file (S3/Cloudinary URL etc). `type` is `image, video, audio` |
| POST | `/api/complaints/:id/media/upload` | citizen or officer | multipart/form-data, field name `file` — direct upload, stored to local disk (`/uploads`), served statically. 25MB limit, validates mime type. See "File uploads" below. |

## Testing the full loop with Postman/curl

```bash
# 1. Register a citizen
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Citizen","email":"citizen@test.com","password":"pass123","role":"citizen"}'

# 2. Register an officer
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Officer","email":"officer@test.com","password":"pass123","role":"officer"}'

# 3. Log in as citizen, save the token, then submit a complaint
curl -X POST http://localhost:5000/api/complaints \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <citizen_token>" \
  -d '{"title":"No water supply","description":"3 days no water in our area"}'

# 4. Log in as officer, save the token, then list all complaints
curl http://localhost:5000/api/complaints \
  -H "Authorization: Bearer <officer_token>"
```

## GIS (Phase 3)

Added `db/schema_phase3_gis.sql` (index migration — run after schema.sql and
schema_phase2.sql) and `/api/gis/*`:

| Method | Endpoint | Notes |
|---|---|---|
| GET | `/api/gis/hotspots?precision=3&status=&department_id=&category_id=&from=&to=` | Grid-clustered complaint counts + avg severity per cluster, for the officer dashboard map. `precision` = decimal places (3 ≈ 110m cells); adjacent-cell fragments are merged server-side. |
| GET | `/api/gis/points?status=&department_id=&category_id=&from=&to=&limit=2000` | Raw lat/long + severity points, capped, for a client-side heatmap layer (e.g. Leaflet.heat) |
| GET | `/api/gis/nearby?lat=&lng=&radius_meters=500&limit=20&status=&...` | Complaints within a radius, nearest-first — usable both by officers investigating an area and citizens checking "already reported nearby" at submission time |

All three tested live against a real Postgres instance with clustered seed
data (verified hotspot merging, severity aggregation, and every filter).

## AI Service (FastAPI)

A Python FastAPI service exists in `ai-service/` and exposes AI endpoints for
classification, summary generation, severity analysis, duplicate detection, and
routing recommendations. The Node backend uses it when configured; otherwise it
falls back to the deterministic in-process engine so complaint intake remains
robust.

Canonical backend AI API routes:

- GET `/api/ai/health`
- POST `/api/ai/analyze` with a complaint payload and JWT

The Python service itself exposes:

- GET `/health`
- POST `/classify`
- POST `/summary`
- POST `/severity`
- POST `/duplicates`
- POST `/route`
- POST `/analyze`

These are modular and can be tested independently. The provider is configured
through environment variables, not by hardcoding a single vendor.

Run it locally:

```bash
cd ai-service
python -m venv .venv
. .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Set your environment variables for the provider:

```env
AI_PROVIDER=openai_compatible
AI_MODEL=gpt-4o-mini
AI_BASE_URL=https://api.openai.com/v1
AI_API_KEY=your_provider_key
AI_SERVICE_API_KEY=replace_with_a_long_random_service_key
AI_SERVICE_URL=http://localhost:8000
```

If `AI_PROVIDER` is set to `mock`, or if no real provider key is configured,
the service returns mock structured output marked as non-production and the
Node backend continues to use the fallback engine safely.

## Database changes

The canonical PostgreSQL backend includes the standard complaint schema plus the
AI-related pipeline tables. The new processing tracking table lives in
`db/schema_ai_processing.sql` and records job state (`PENDING`, `PROCESSING`,
`COMPLETED`, `FAILED`, `REVIEW_REQUIRED`) for complaint AI work.

This keeps AI work observable and auditable even when the AI service is slow or
temporarily unavailable.

## File uploads (Phase 3.5)

`POST /api/complaints/:id/media/upload` accepts a real multipart file
upload (field name `file`) instead of a pre-hosted URL — this is the direct
upload handling referenced below as "not built". Implementation:

- `middleware/upload.js` — multer config, disk storage under `/uploads`,
  validates mime type (jpeg/png/webp/gif, mp4/mov/webm, mp3/wav/ogg) and
  caps size at 25MB. Files are named `<timestamp>-<random>.<ext>` to avoid
  collisions.
- Files are served back at `/uploads/<filename>` (static middleware in
  `server.js`).
- Rejected uploads (bad mime type, oversized) never touch disk. A
  nonexistent complaint id is checked *after* multer saves the file (multer
  runs before the route handler), so that case is explicitly cleaned up —
  verified live, no orphaned files left behind either way.

This stores to local disk, which is fine for a hackathon demo but won't
survive a redeploy/restart in production — swap `storage` in
`middleware/upload.js` for a `multer-s3` or Cloudinary storage engine when
you're ready; the route and controller don't need to change, since they
only touch `req.file`.

Test it:
```bash
curl -X POST http://localhost:5000/api/complaints/<id>/media/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@photo.jpg"
```

## What's still NOT here

- Multilingual/voice input (BHASHINI integration)
- Routing/SLA auto-assignment logic (which officer gets what, and turning `priority_label` into an SLA deadline) — the endpoints exist, the policy decision doesn't yet

## Note for your frontend teammate

Base URL: `http://localhost:5000/api`
CORS is already enabled for all origins so the React app can call this
directly during development.
