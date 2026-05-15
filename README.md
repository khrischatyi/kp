# Atelier Kitchens — Portfolio

A premium, cinematic portfolio site for a custom kitchen cabinetry studio.
Built as a production-ready, container-first stack: **FastAPI · React (Vite) ·
Caddy · PostgreSQL**, orchestrated by **Docker Compose**, and managed through a
single `Makefile`.

---

## Stack at a glance

| Layer        | Tech                                              |
| ------------ | ------------------------------------------------- |
| Frontend     | React 18, Vite 6, TypeScript, Tailwind, Framer Motion |
| Backend      | FastAPI, Pydantic 2, SQLAlchemy 2, Alembic, Pillow |
| Database     | PostgreSQL 16                                     |
| Reverse proxy| Caddy 2 (HTTP/2, HTTPS-ready, compression, security headers) |
| Container    | Docker, Docker Compose                            |
| Dep mgmt     | `pyproject.toml` (uv-resolved), npm              |

---

## Directory layout

```
kitchen-portfolio/
├── .env                       # ONE shared env file for dev/prod
├── Makefile                   # Single entry point for every operation
├── docker-compose.dev.yml
├── docker-compose.prod.yml
├── docker/                    # All Dockerfiles
├── caddy/                     # Caddy config (dev + prod)
├── backend/                   # FastAPI service
│   ├── pyproject.toml
│   ├── alembic/               # Alembic migrations
│   └── app/
│       ├── core/              # settings, db, logging
│       ├── api/v1/routes/     # health, gallery, contact
│       ├── models/            # SQLAlchemy models
│       ├── schemas/           # Pydantic DTOs
│       └── services/          # photo loader + gallery service
├── frontend/                  # React app
│   └── src/
│       ├── components/        # ui/, layout/, home/, gallery/, shared/
│       ├── pages/             # Home, Kitchens, Galleries, Contacts
│       ├── hooks/             # useGallery, useInfiniteSentinel
│       └── lib/               # api client, utils
└── photos/                    # Source-of-truth gallery (ordered folders)
```

---

## Quick start

```bash
# 1. Copy the example env (or use the included .env)
cp .env.example .env

# 2. Boot the development stack (DB → backend → frontend → Caddy)
make dev
```

Open **http://localhost:8080**.

| URL                                  | What                          |
| ------------------------------------ | ----------------------------- |
| http://localhost:8080                | React app (via Caddy)         |
| http://localhost:8080/api/docs       | FastAPI interactive docs      |
| http://localhost:8080/api/v1/health  | Service healthcheck           |
| http://localhost:8080/photos/...     | Static photo files            |

---

## Make targets

```text
make dev               # Start the dev stack with hot reload
make prod              # Build + start the production stack
make build             # Build production images
make down              # Stop dev and prod stacks
make logs              # Tail all logs (dev)
make restart           # down + dev-detached
make backend           # Shell into the backend container
make frontend          # Shell into the frontend container
make db                # psql shell on the database
make migrate           # Apply latest Alembic migrations
make makemigrations msg="add x"  # Generate a new revision
make clean             # Stop everything, remove images and volumes
```

Run `make help` for the full list.

---

## How the gallery works

The `photos/` directory is the **source of truth**.

* Numbered folders (`0 smith tower`, `1 mcneely`, …) become projects.
* The leading number is the display order; the rest is the project name.
* Loose images at the root collapse into a "Featured Pieces" collection.
* Files inside each folder are sorted naturally (`mcneely1.jpg`, `mcneely2.jpg`, …).

The backend's `PhotoLoader` walks the directory at startup and exposes the
metadata under `/api/v1/gallery/projects` (paginated for infinite scroll) and
`/api/v1/gallery/projects/all` (everything at once).

Caddy serves `/photos/*` directly from the same volume — the frontend never
reads files via the API, so image delivery is fast and cache-friendly.

If you add or remove photos at runtime, POST to `/api/v1/gallery/refresh` to
invalidate the in-memory cache.

---

## Theme

A custom React context-based theme provider (`src/components/shared/ThemeProvider.tsx`)
backs the `ToggleTheme` component. It supports `light` / `dark` / `system`,
persists to `localStorage`, animates the active pill via Framer Motion's
shared layout transitions, and primes the right class on `<html>` before
React mounts to avoid FOUC.

---

## Environment variables

All services read from the **single shared `.env`**. Key variables:

| Variable                     | Purpose                                |
| ---------------------------- | -------------------------------------- |
| `APP_ENV`                    | `development` or `production`          |
| `APP_DOMAIN`                 | Hostname used by Caddy in prod         |
| `BACKEND_*`                  | FastAPI host, port, workers, log level |
| `VITE_API_BASE_URL`          | Frontend → backend API base path       |
| `VITE_PHOTOS_BASE_URL`       | Frontend → photo file base path        |
| `CADDY_HTTP_PORT`            | Public dev port (default `8080`)       |
| `POSTGRES_*` / `DATABASE_URL`| Database connection                    |
| `PHOTOS_DIR`                 | In-container path to the photo source  |

`docker-compose.dev.yml` and `docker-compose.prod.yml` consume them identically.

---

## Production notes

* `make prod` builds optimized images:
  * Frontend: multi-stage build, hashed assets, immutable cache headers.
  * Backend: builder + slim runtime, non-root user, healthcheck.
* Caddy's production `Caddyfile` enables HSTS, CSP, X-Content-Type-Options,
  X-Frame-Options, Referrer-Policy, and zstd/gzip compression.
* Set `APP_DOMAIN` to your real hostname and Caddy will fetch a Let's Encrypt
  certificate automatically.

---

## License

Built for Atelier Kitchens.
