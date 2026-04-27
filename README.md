# voltedge-console

**VoltEdge Retail — operations console** (frontend only). A **Vite + React + TypeScript** SPA for a regional **electronics retail** operations demo: marketing **landing page**, **JWT** sign-in, **role-based** dashboard, **POS** checkout demo, **offline sale queue** (IndexedDB + sync), and **BI** snippets (margin, shrinkage, campaigns, regional). It talks to the VoltEdge **API gateway** over HTTPS/fetch (default `http://localhost:8000`).

---

## Requirements

| Requirement | Notes |
|-------------|--------|
| **Node.js** | **v18.18+** or **v20 LTS** (recommended). Vite 5 + modern browsers. |
| **npm** | **v9+** (ships with Node). Use `npm install` in this folder. |
| **Backend (optional)** | For **login**, **dashboard**, **POS**, and **sync**, run the **VoltEdge `retail-platform`** stack so the gateway is reachable at the URL in `.env.development`. The UI will load without it, but API calls will fail. |
| **Browser** | Current **Chrome**, **Edge**, or **Firefox**; **mobile** layouts supported (responsive CSS, 44px tap targets). |

---

## What this app includes

- **Landing** (`/`) — product story, capabilities, roles, CTAs.
- **Auth** (`/login` → `/app`) — access + refresh tokens in `localStorage`; `/auth/me` on load.
- **Dashboard** (`/app`) — store metrics, alerts, **BI** blocks by role (HQ / regional / supervisor).
- **POS demo** — checkout or **offline** queue; **Sync offline sales** → `POST /orders/sync` with `client_mutation_id`.
- **Theming** — OLED-style dark UI, electric blue + amber accents (electronics retail).

---

## Install & run (development)

### macOS / Linux

```bash
git clone https://github.com/SaiManjith07/voltedege_console.git
cd voltedege_console
npm install
cp .env.example .env.development
npm run dev
```

### Windows (PowerShell)

```powershell
git clone https://github.com/SaiManjith07/voltedege_console.git
cd voltedege_console
npm install
Copy-Item .env.example .env.development
npm run dev
```

Open **http://localhost:5173** (Vite default).  
If the API runs elsewhere, edit `.env.development` and set `VITE_API_BASE_URL` (no trailing slash), then restart `npm run dev`.

---

## Production build

```bash
npm install
npm run build
```

| Step | What happens |
|------|----------------|
| `tsc --noEmit` | TypeScript typecheck (must pass). |
| `vite build` | Optimized bundle written to **`dist/`**. |

Preview the build locally:

```bash
npm run preview
```

Serve **`dist/`** with any static host (nginx, S3 + CloudFront, Azure Static Web Apps, Netlify, Vercel, etc.). Set **`VITE_API_BASE_URL`** at **build time** for the correct API origin (Vite inlines `import.meta.env`).

**Example build with API URL:**

```bash
# Linux/macOS
VITE_API_BASE_URL=https://api.yourdomain.com npm run build
```

```powershell
# Windows PowerShell
$env:VITE_API_BASE_URL="https://api.yourdomain.com"; npm run build
```

---

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_BASE_URL` | Yes for real data | Base URL of the **API gateway** (e.g. `http://localhost:8000`). **No** trailing slash. |

Copy **`.env.example`** → **`.env.development`** for local dev. Do **not** commit `.env.development` (see `.gitignore`).

---

## Backend (full stack)

This repository is **frontend only**. To run **auth**, **inventory**, **sales**, **analytics**, etc.:

1. Clone the full **VoltEdge Retail** repo that contains **`retail-platform/`** (Docker Compose + PostgreSQL + gateway + services), **or** point `VITE_API_BASE_URL` at a deployed gateway.
2. Start the stack (example from monorepo root):

   ```powershell
   cd retail-platform
   Copy-Item .env.example .env
   docker compose up --build
   ```

3. Confirm gateway: **http://localhost:8000/health**

---

## Demo sign-in (seed backend)

If your backend uses the standard VoltEdge seed, all accounts share password **`Password123!`**:

| Email | Role |
|-------|------|
| `admin@voltedge.retail` | Headquarters Admin |
| `regional@voltedge.retail` | Regional Manager |
| `supervisor@voltedge.retail` | Store Supervisor |
| `sales@voltedge.retail` | Sales Associate |

---

## NPM scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server (HMR). |
| `npm run build` | Typecheck + production build → `dist/`. |
| `npm run preview` | Serve `dist/` locally for smoke-testing the build. |

---

## Git workflow (update your code)

Use this flow when you are ready to sync your local updates to GitHub:

```bash
# 1) Get latest changes from remote
git pull origin main

# 2) Check what changed locally
git status

# 3) Stage changes
git add .

# 4) Commit with a clear message
git commit -m "docs: update README"

# 5) Push to GitHub
git push origin main
```

If you use feature branches, replace `main` with your branch name.

---

## Project layout

```
voltedege_console/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── .env.example          # template for VITE_API_BASE_URL
├── src/
│   ├── main.tsx
│   ├── App.tsx           # routes: /, /login, /app
│   ├── LandingPage.tsx
│   ├── index.css         # theme tokens + landing styles
│   ├── context/AuthContext.tsx
│   └── lib/
│       ├── api.ts
│       └── offlineOrderQueue.ts
└── README.md
```

---

## Troubleshooting

| Issue | What to check |
|-------|----------------|
| **Login / API errors** | Gateway up? `VITE_API_BASE_URL` correct? No trailing slash. Restart dev server after env changes. |
| **CORS** | Gateway must allow your dev origin (e.g. `http://localhost:5173`). Configure on **API gateway**, not only on services. |
| **`npm run build` fails** | Run `npm install` again; ensure Node **18+**. Fix TypeScript errors reported by `tsc`. |
| **Blank page after deploy** | Set base path in `vite.config.ts` if app is not hosted at domain root (`base: '/repo-name/'`). |

---

## Tech stack

- **React 18**, **TypeScript**, **Vite 5**, **React Router 6**, **TanStack Query 5**

---

## License

Private project — **VoltEdge Retail** demo / case study.
