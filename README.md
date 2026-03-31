# PlantBee

> A smart plant monitoring system that connects ESP32 soil-moisture sensors to a Go backend, stores readings in PostgreSQL, and provides a REST API for plant management — with 42 Intra OAuth for authentication.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [1 · 42 OAuth App Setup](#1--42-oauth-app-setup)
- [2 · Environment Variables](#2--environment-variables)
- [3 · Running the Stack](#3--running-the-stack)
- [4 · Development Mode](#4--development-mode)
- [5 · Service Map](#5--service-map)
- [6 · API Reference](#6--api-reference)
- [7 · Database Schema](#7--database-schema)
- [8 · Dev Tooling](#8--dev-tooling)
- [9 · Project Structure](#9--project-structure)

All services are orchestrated with a single `docker-compose.yml` at the project root.

---

## Prerequisites
Docker and Docker Compose are required to run the stack.

> **No Go or Node.js installation is required on your machine** to run the stack. If you want to use the local lint/format tasks, you also need `Go` and `Task`.

---

## 1 · 42 OAuth App Setup

Since the backend uses 42 Intra OAuth2 to authenticate users, you need to create an OAuth app in your 42 Intra account.

1. Log in to [profile.intra.42.fr](https://profile.intra.42.fr)
2. Go to **Settings → API → Register a new app**
3. Fill in:
   - **Name:** `PlantBee Local` (or any name)
   - **Redirect URI:** `http://localhost:8080/auth/callback` 
4. Submit — copy the generated **UID** (`CLIENT_ID`) and **Secret** (`CLIENT_SECRET`) 

---

## 2 · Environment Variables

Create the file `backend/server/.env` (already in `.gitignore` — **never commit it**):

```bash
# 42 OAuth credentials (from step 1)
CLIENT_ID=u-s4t2ud-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLIENT_SECRET=s-s4t2ud-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
REDIRECT_URI=http://localhost:8080/auth/callback

# Server
PORT=8080
SESSION_SECRET=change-me-to-something-random

# Database — copy this exactly, it works for everyone locally
DATABASE_URL=postgres://postgres:postgres@db:5432/plantbee?sslmode=disable
```

> The `db` hostname works inside Docker because Compose creates an internal network linking all containers. **Do not change it to `localhost`.**

---

## 3 · Running the Stack

```bash
# From the repository root:
docker-compose up --build
```

To **rebuild from scratch** (e.g. after pulling new changes):
```bash
docker-compose down -v          # removes containers AND database volume
docker-compose up --build
```

To stop without deleting data:
```bash
docker-compose down
```

---

## 4 · Development Mode

`docker compose up --build` runs the stack in development mode:

- The backend uses `air` for hot reload inside the container
- The frontend uses the Vite dev server with the source directory mounted into the container
- File changes in `backend/server` restart the Go server automatically
- File changes in `client` are reflected immediately by Vite

Development URLs:

- Client: http://localhost:5173
- Backend: http://localhost:8080
- Adminer: http://localhost:8081

For production-style image validation, CI builds:

- the backend final Docker image
- the client `production` Docker target, which serves the built app through Nginx

---

## 5 · Service Map

| Container | URL | Description |
|-----------|-----|-------------|
| `plantbee-client` | http://localhost:5173 | Vite client dev server |
| `plantbee-app` | http://localhost:8080 | Go REST API |
| `plantbee-db` | `localhost:5432` | PostgreSQL 15 (internal only) |
| `plantbee-adminer` | http://localhost:8081 | Database browser UI |

### Adminer Login

Navigate to http://localhost:8081 and use:

| Field | Value |
|-------|-------|
| System | PostgreSQL |
| Server | `db` |
| Username | `postgres` |
| Password | `postgres` |
| Database | `plantbee` |

---

## 6 · API Reference

### `POST /plants/add` — Create a plant

**Request fields** (only `name` is required):

| Field | Type | Example |
|-------|------|---------|
| `name` ⚠️ | string | `"Office Monstera"` |
| `species` | string | `"Monstera deliciosa"` |
| `category` | string | `"Tropical"` |
| `pot_volume_l` | float | `3.0` |
| `light_need` | string | `"Low"` / `"Medium"` / `"High"` |
| `target_moisture` | int | `60` (default: 50) |
| `sensor_id` | string | `"sensor_01"` |
| `image_url` | string | `"https://..."` |

**Responses:**

| Status | When | Body |
|--------|------|------|
| `201 Created` | Plant saved successfully | Full plant object (see below) |
| `400 Bad Request` | Body is not valid JSON | `{"error": "Invalid JSON payload"}` |
| `400 Bad Request` | `name` field is missing or empty | `{"error": "Plant name is required"}` |
| `405 Method Not Allowed` | Request is not POST | `{"error": "Method not allowed"}` |
| `503 Service Unavailable` | Backend started without a database | `{"error": "Database not available"}` |
| `500 Internal Server Error` | DB insert failed (e.g. duplicate `sensor_id`) | `{"error": "Failed to save plant"}` |

On `201`, the body is the full saved plant object:
```json
{ "id": 1, "name": "Office Monstera", "created_at": "2026-03-06T12:00:00Z", ... }
```
> Fields you didn't send come back with zero/default values (`0`, `""`, `50` for moisture).

**Quick test:**
```bash
curl -X POST http://localhost:8080/plants/add \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Plant", "pot_volume_l": 2.5}'
```

---

### `POST /api/reading` — Ingest a sensor reading (ESP32)

```bash
curl -X POST http://localhost:8080/api/reading \
  -H "Content-Type: application/json" \
  -d '{"sensor_id": "sensor_01", "moisture": 42, "wake_time": 1.3}'
```

---

### Auth endpoints

| Endpoint | What it does |
|----------|-------------|
| `GET /auth/login` | Redirects to 42 Intra login page |
| `GET /auth/callback` | Handles OAuth return, saves user to DB, sets session cookie |
| `GET /auth/me` | Validate auth token from client |

---

### Task endpoints

| Endpoint | What it does |
|----------|-------------|
| `POST /api/tasks/accept` | Accepts a task for a plant |
| `POST /api/tasks/cancel` | Cancels an accepted task |

---

## 7 · Database Schema

### `users`
| Column | Type | Notes |
|--------|------|-------|
| `id` | SERIAL PK | |
| `intra_id` | VARCHAR(50) UNIQUE | 42 login ID |
| `email` | VARCHAR(100) UNIQUE | |
| `login` | VARCHAR(50) | 42 username |
| `image_url` | TEXT | 42 profile picture |
| `intend_to_help` | BOOLEAN | volunteer flag |
| `first_visit` | BOOLEAN | tracks if user has completed welcome flow |
| `water_count` | INTEGER | tracks number of completed watering tasks |
| `created_at` | TIMESTAMPTZ | |

### `plants`
| Column | Type | Notes |
|--------|------|-------|
| `id` | SERIAL PK | |
| `name` | VARCHAR(100) NOT NULL | |
| `species` | VARCHAR(100) | |
| `category` | VARCHAR(50) | |
| `pot_volume_liters` | FLOAT | |
| `light_need` | VARCHAR(50) | Low / Medium / High |
| `target_moisture` | INTEGER | default 50 |
| `current_moisture` | INTEGER | updated by sensor |
| `owner_id` | INTEGER | FK → `users.id` |
| `sensor_id` | VARCHAR(50) UNIQUE | |
| `image_url` | TEXT | |
| `created_at` | TIMESTAMPTZ | |

### `sensor_readings`
| Column | Type | Notes |
|--------|------|-------|
| `id` | SERIAL PK | |
| `sensor_id` | VARCHAR(50) | links to a plant |
| `moisture` | INTEGER | |
| `wake_time` | FLOAT | seconds the ESP32 was awake |
| `recorded_at` | TIMESTAMPTZ | |

### `tasks`
| Column | Type | Notes |
|--------|------|-------|
| `id` | SERIAL PK | |
| `plant_id` | INTEGER | FK → `plants.id` |
| `type` | VARCHAR(50) | `water` or `error` |
| `water_amount` | INTEGER | amount in ml |
| `status` | VARCHAR(50) | `open`, `in_progress`, or `completed` |
| `volentee_id` | INTEGER | FK → `users.id` |
| `scheduled_at` | TIMESTAMPTZ | |
| `completed_at` | TIMESTAMPTZ | |

---

## 8 · Dev Tooling

The repository now includes:

- `Taskfile.yml` at the root for repeatable development commands
- `backend/server/.golangci.yml` for linting and formatting rules
- GitHub Actions CI that runs backend lint/test/build, frontend checks, and Docker checks

Available commands from the repository root:

```bash
task tools:install   # installs golangci-lint into ./.bin
task fmt             # formats Go code with gofumpt + goimports
task lint            # runs errcheck, govet, ineffassign, unused
task test            # runs go test ./...
task build           # runs go build ./...
task ci              # runs lint, test, and build
```

> The runtime Docker images in this repo do not include the Go toolchain, so these tasks should run on a machine or container that has `Go` and `Task` installed.

---

## 9 · Project Structure

```
plantbee_repo/
├── docker-compose.yml          # Orchestrates all services
├── Taskfile.yml                # Common lint/test/build commands
├── client/
│   ├── package.json            # Node dependencies and scripts
│   ├── vite.config.ts          # Vite bundler and proxy config
│   ├── index.html              # Client entry point
│   └── src/                    # React source code (pages, routing, components)
└── backend/
    └── server/
        ├── Dockerfile          # Multi-stage build (Compiles React + Runs Go)
        ├── .env                # ⚠️ You must create this (see §2)
        ├── go.mod
        ├── cmd/server/
        │   └── main.go         # Entry point — registers routes
        └── internal/
            ├── config/         # Loads env vars
            ├── handlers/       # HTTP handlers (auth, plants, ingest, tasks, user)
            ├── models/         # Go structs (Plant, User, Task, etc.)
            ├── services/       # Business logic (Auth, Tasks, etc.)
            └── storage/        # PostgreSQL queries & schema
```
