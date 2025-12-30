# Bug Busters

## Project Overview
- **Bug Busters** is a beginner-friendly, single-screen browser game where players click a randomly moving bug for 20 seconds to earn points. Once the countdown hits zero, the round locks, the final score is announced, and players can submit it to the leaderboard or start over.
- The UI is split into three columns: the game stage (score/timer/bug + overlay), a scrollable issuer data panel populated from SEC infotable filings, and a live leaderboard backed by an in-memory Node/Express service.
- A backend health badge, contextual status bar, and resilient error handling guide players when the API or issuer data becomes unavailable.

## Repository Layout
| Path | Purpose |
| --- | --- |
| `frontend/` | Static assets (`index.html`, `styles.css`, `main.js`) that implement the gameplay loop, issuer panel render logic, leaderboard UI, and accessibility affordances. |
| `backend/` | Minimal Express server (`server.js`, `package.json`) exposing `/health`, `/scores` (GET/POST), serving static frontend files, and keeping the top-10 leaderboard in memory. |
| `design/` | Designer outputs: `design_spec.md` with layout/interaction guidance and `wireframe.md` illustrating the single-screen arrangement. |
| `plan/` | Planning artifacts including `overview.md` plus `issuers_index.json` (Data Scanner output grouped by period with issuer arrays and error entries). |
| `Unified_ver1/` | Source SEC infotable XML/CSV folders that feed the issuer index artifact. |
| `tests/` | QA resources: CLI smoke script `test.sh` and the comprehensive `TEST_PLAN.md`. |
| `REQUIREMENTS.md`, `AGENT_TASKS.md`, `TEST.md` | Authoritative scope, role expectations, and acceptance criteria for the multi-agent workflow. |

## Prerequisites
- Node.js 18+ (Express 4.19 is declared in `backend/package.json`).
- npm (bundled with Node) for installing backend dependencies.
- A modern browser for running the frontend (served by the backend).

## Run the App Locally
1. **Install dependencies**  
   ```bash
   cd backend
   npm install
   ```
2. **Start the backend + static host**  
   ```bash
   npm start
   ```
   - The server listens on `http://localhost:3000` (override with `PORT`).
   - It serves the frontend from `frontend/` and exposes the leaderboard API with CORS enabled.
3. **Open the game**  
   - Visit `http://localhost:3000` in your browser.  
   - Click “Start Game” to enable bug movement and the 20-second timer.  
   - After each round, enter up to three initials and submit to `/scores`; click “Refresh Leaderboard” anytime to re-fetch results.

## Gameplay & UI Behavior
- **Timer & Score**: `main.js` resets score/timer at start, moves the bug every 600–900 ms while ensuring it stays on screen, and freezes inputs right at 20 seconds. The overlay displays `Final Score` and re-enables the submit form.
- **Leaderboard**: `GET /scores` populates a ranked list (empty-state copy appears when no data exists). Submissions POST `{ name, score }`, the backend clamps to top 10, and failures show inline status messages without clearing the player’s result.
- **Backend Status**: `/health` is polled every 10 s to color the header chip green (“Online”) or red (“Offline”).
- **Issuer Panel**: A `<script type="application/json" id="issuer-data">` blob (sourced from `plan/issuers_index.json`) is parsed at load and rendered as grouped sections per `period`. Reloading the panel clears the cache and re-renders; malformed/missing data triggers a friendly “Issuer list unavailable” message.
- **Accessibility hints**: Buttons announce status via an `aria-live` region, timers change color near expiry, and controls disable/enable to prevent invalid actions.

## Backend API
| Endpoint | Method | Description |
| --- | --- | --- |
| `/health` | GET | Returns `{ status: "ok", uptime: <seconds> }` so the UI can show backend availability. |
| `/scores` | GET | Responds with `{ scores: [...] }`, where each entry includes `name`, `score`, and `submittedAt`. Results are already sorted highest-first by the server. |
| `/scores` | POST | Accepts JSON `{ "name": "ABC", "score": 42 }`. Validates presence of `name`, a non-negative `score`, floors numeric input, keeps only the latest top 10, and echoes the updated list. Errors return `400` with `{ error: "…" }`. |

Scores live only in memory; restarting the backend clears the leaderboard. Frontend fetches endpoints relative to the same origin, so no proxy configuration is required when both run on port 3000.

## Issuer Data Pipeline
- Raw infotable XML plus helper CSV/JSON live under `Unified_ver1/data/<CIK>/<PERIOD>/`.
- The Data Scanner output (`plan/issuers_index.json`) captures:
  ```json
  {
    "data_root": "Unified_ver1/data",
    "generated_at_utc": "...",
    "items": [
      {
        "cik": "0001029160",
        "period": "000090266425003648",
        "infotable_relpath": "Unified_ver1/data/0001029160/000090266425003648/infotable.xml",
        "issuers": ["...", "..."],
        "issuer_count": 167
      }
    ],
    "errors": []
  }
  ```
- `frontend/index.html` embeds the entire JSON so it can render instantly without an additional HTTP round trip. When the SEC source data changes, regenerate the JSON (following the Data Scanner task in `AGENT_TASKS.md`) and replace the script block payload to keep the UI in sync.
- Each rendered issuer block shows the period identifier and issuer count; empty arrays or parse errors fall back to placeholder messages to satisfy the resilience requirements in `REQUIREMENTS.md` and `tests/TEST_PLAN.md`.

## Testing & QA
- **Automated smoke**: Run `tests/test.sh` (optionally pass a base URL) to curl `/health`, `/scores`, and a POST `/scores`, verifying HTTP 200/201 responses.
  ```bash
  ./tests/test.sh            # defaults to http://localhost:3000
  ./tests/test.sh http://127.0.0.1:4000  # custom base URL
  ```
- **Manual coverage**: Follow `tests/TEST_PLAN.md` for the full checklist spanning gameplay timing, issuer panel robustness, leaderboard flows, backend outage handling, and documentation verification.
- Because leaderboard data is in-memory, restart the backend between manual runs when you need a clean slate.

## Reference Documents
- `REQUIREMENTS.md` – master scope for gameplay, backend contracts, and data expectations.
- `AGENT_TASKS.md` – deliverable list per role (Project Manager, Designer, Data Scanner, Frontend, Backend, Tester).
- `plan/overview.md` – execution order and dependency map.
- `design/design_spec.md` & `design/wireframe.md` – layout, breakpoints, and styling cues mirrored in `styles.css`.
- `tests/TEST_PLAN.md` – QA procedures and risk notes.

With these artifacts plus the running backend/frontend, you can demo Bug Busters end-to-end, regenerate issuer data as the filings evolve, and extend the project while keeping the determinism guarantees intact.
