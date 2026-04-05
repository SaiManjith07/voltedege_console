# voltedege_console

VoltEdge Retail **operations console** — Vite + React + TypeScript SPA: landing page, JWT auth, store dashboard, POS demo, offline sale queue (IndexedDB), and BI snippets. Talks to the FastAPI gateway (default `http://localhost:8000`).

## Quick start

```bash
npm install
cp .env.example .env.development   # or set VITE_API_BASE_URL
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Sign-in routes to `/app` after login.

## Scripts

| Command        | Description        |
| -------------- | ------------------ |
| `npm run dev`  | Vite dev server    |
| `npm run build`| Production build   |
| `npm run preview` | Preview `dist`  |

## Environment

- `VITE_API_BASE_URL` — API gateway base URL (no trailing slash).
