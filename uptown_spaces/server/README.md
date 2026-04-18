# Uptown Spaces — Lead Management (Mini CRM)

**Backend:** REST API for a real-estate lead pipeline: capture leads, list/search/filter/sort, detail + notes, status updates, soft delete, and dashboard metrics. Uses **Node.js**, **Express**, **MongoDB** (Mongoose), and **JWT** auth.

**Frontend:** **Vite + React + TypeScript** SPA in `client/` with **Tailwind CSS** (dashboard, lead table with search/filters/sort, lead detail with notes and status, auth). Set `VITE_API_BASE_URL` to your API origin (default `http://localhost:5003`).

---

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

---

## Setup

1. **Install dependencies**

   ```bash
   cd uptown_spaces
   npm install
   ```

2. **Environment variables**

   Create a `.env` file in the project root:

   ```env
   MONGO_CONNECTION_URL=mongodb://127.0.0.1:27017/uptown_spaces
   JWT_SECRET=your-long-random-secret
   JWT_EXPIRES_IN=1d
   ```

   - `MONGO_CONNECTION_URL` — MongoDB connection string (required for persistence).
   - `JWT_SECRET` — secret used to sign and verify access tokens (use a strong value in production).
   - `JWT_EXPIRES_IN` — optional JWT lifetime (default in code: `1d` if unset).

3. **Run**

   ```bash
   npm run dev
   ```

   Server listens on **http://localhost:5003** (see `src/index.ts`).

4. **Production build**

   ```bash
   npm run build
   npm start
   ```

### Frontend (`client/`)

1. **Install and configure**

   ```bash
   cd client
   npm install
   cp .env.example .env
   ```

   Edit `client/.env` if the API is not on `http://localhost:5003`:

   ```env
   VITE_API_BASE_URL=http://localhost:5003
   ```

2. **Run the dev server**

   ```bash
   npm run dev
   ```

   Open the URL Vite prints (usually **http://localhost:5173**). **Sign up** a user, then **log in** to use leads and the dashboard.

3. **Production build**

   ```bash
   npm run build
   npm run preview
   ```

   Serve the `client/dist` folder with any static host, with API URL set at build time via `VITE_API_BASE_URL`.

> **Note:** The API applies a global rate limit on `/` (see `src/index.ts`). If the UI hits **429** during local testing, raise the limit or narrow the middleware scope for development.

---

## Auth

Sign up or log in, then send the JWT on protected routes:

```http
Authorization: Bearer <access_token>
```

| Method | Path | Auth |
|--------|------|------|
| POST | `/user/signup` | No |
| POST | `/user/login` | No |
| * | other lead routes below | Yes |

---

## Lead API

Base path: **`/leads`**

### Create lead

`POST /leads/create`

Body (JSON):

| Field | Type | Description |
|-------|------|-------------|
| name | string | Required |
| phoneNumber | string | Required |
| email | string | Required, valid email |
| budget | number | Required, &gt; 0 |
| location | string | Required |
| propertyType | string | e.g. `2 BHK`, `Plot` |
| leadSource | string | e.g. `Facebook`, `Google`, `Referral` |

Response: `201` with created lead document (`data` in `ResponseHandler`).

### List leads (table + search / filter / sort)

`GET /leads`

Query parameters:

| Param | Description |
|-------|-------------|
| search | Matches **name** or **phone** (case-insensitive) |
| leadSource | Exact match on `leadSource` |
| status | One of: `NEW`, `CONTACTED`, `SITE_VISITED`, `CLOSED` |
| sortBy | `date` (default) or `budget` |
| sortOrder | `asc` or `desc` (default `desc`) |
| page | Page number (default `1`) |
| limit | Page size, max `100` (default `20`) |

Response includes `items`, `total`, `page`, `limit`, `totalPages`.

### Dashboard metrics

`GET /leads/dashboard`

Returns:

- `totalLeads` — non-deleted leads
- `conversionRate` — `CLOSED` count ÷ total × 100 (0 if no leads)
- `leadsBySource` — counts grouped by `leadSource`
- `statusDistribution` — counts per status

### Lead detail

`GET /leads/:id`

Returns one lead or `404` if missing or soft-deleted.

### Update status / replace comments

`PUT /leads/:id`

Send at least one of:

- `status` — `NEW` | `CONTACTED` | `SITE_VISITED` | `CLOSED`
- `comments` — string or string array (replaces the `comments` array)
- `comment` — single string (alias for one-line replace into array)

### Append a note (history-friendly)

`POST /leads/:id/notes`

Body: `{ "note": "Called — follow up Monday" }`  
Appends to the `comments` array without removing previous entries.

### Soft delete

`DELETE /leads/:id`

Sets `isDeleted: true`; lead is excluded from listings and dashboard.

---

## Response shape

Success responses use `ResponseHandler`:

```json
{ "data": { ... }, "error": null }
```

Errors use HTTP status and `error` populated (see `src/middleware/errorHandler.ts`).

---

## Health

`GET /health` — no auth (excluded in `src/routes/routes.data.ts`).

---

## Project structure (high level)

- `src/index.ts` — app entry
- `src/routes/` — route registration
- `src/module/leads/` — leads schema, service, validation, routes
- `src/module/user/` — signup / login, JWT issuance
- `src/middleware/token.validate.ts` — Bearer JWT validation

---

## Assignment alignment

| Requirement | Implementation |
|-------------|----------------|
| Lead capture fields | `POST /leads/create` + Mongoose schema |
| Listing + search / filter / sort | `GET /leads` with query params |
| Detail + notes + status | `GET /leads/:id`, `PUT /leads/:id`, `POST /leads/:id/notes` |
| Dashboard metrics | `GET /leads/dashboard` |
| CRUD + REST | Create, read (list/detail), update, soft delete |
| Validation / errors | Zod on create, list query, append note; centralized error handler |

---

## Rate limiting

`src/index.ts` applies a global rate limiter (5 requests per minute per IP) to `/`. Adjust for local development if needed.
