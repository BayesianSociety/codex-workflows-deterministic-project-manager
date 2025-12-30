# Bug Busters Release Runbook

## 1. Scope & References
- **Goal**: Ship the Bug Busters single-screen browser game (gameplay, issuer data panel, leaderboard) together with its in-memory backend (`backend/server.js`) and embedded issuer data block sourced from `plan/issuers_index.json`.
- **Sources of truth**: `REQUIREMENTS.md` (functional scope), `AGENT_TASKS.md` (role deliverables), `TEST.md` & `tests/TEST_PLAN.md` (acceptance), `README.md` (architecture), `design/design_spec.md` + `design/wireframe.md` (UI contract), `plan/overview.md` (dependencies).

## 2. Environment & Dependencies
- Node.js 18+ with npm (needed for the backend Express dependency declared in `backend/package.json`).
- Access to the repo root containing `frontend/`, `backend/`, `plan/`, and `Unified_ver1/`.
- If issuer filings change, regenerate `plan/issuers_index.json` using the Data Scanner workflow (see `plan/overview.md`) and paste the new JSON into the `<script type="application/json" id="issuer-data">` block inside `frontend/index.html`.
- No external databases; leaderboard state is memory-only and resets whenever the backend restarts.

## 3. Artifact Inventory
| Component | Location | Notes |
| --- | --- | --- |
| Frontend UI & logic | `frontend/index.html`, `frontend/styles.css`, `frontend/main.js` | Implements gameplay loop, overlays, issuer panel renderer, leaderboard interactions, backend health polling. |
| Embedded issuer data | `plan/issuers_index.json` mirrored in `frontend/index.html` (`#issuer-data` script tag) | Contains `items[]` (per-period issuers) plus `errors[]`. Update both files together to stay in sync with `Unified_ver1/data`. |
| Backend API | `backend/server.js` | Express app with `/health`, `GET/POST /scores`, static hosting of `frontend/`, permissive CORS, in-memory top-10 clamp. |
| Backend metadata | `backend/package.json` | `npm start` entry; only dependency is `express@^4.19.2`. |
| Tests | `tests/test.sh`, `tests/TEST_PLAN.md` | Curl smoke for `/health` + `/scores` and manual acceptance guide aligned with `TEST.md`. |

## 4. Pre-Release Checklist
1. **Issuer data freshness**  
   - Confirm `plan/issuers_index.json` timestamp (`generated_at_utc`) reflects the SEC data snapshot you want to ship.  
   - Run the Data Scanner if filings changed; ensure the resulting JSON validates (`items` array present, issuer counts populated) and update the `#issuer-data` blob in `frontend/index.html`.
2. **Frontend audit**  
   - Spot-check `frontend/main.js` for the 20s timer constant (`timeLeft = 20`) and health/leaderboard fetch logic; ensure no uncommitted changes remain.
3. **Backend audit**  
   - Review `backend/server.js` for MAX_SCORES (10) and memory-only operation; confirm `/health` and `/scores` routes still match README contracts.
4. **Documentation**  
   - Verify README plus design/spec assets still reflect the UI & API being released.
5. **Versioning/tagging**  
   - Tag the repo commit for release (e.g., `git tag bug-busters-vX.Y`) before copying artifacts to the target environment.

## 5. Release Procedure
1. **Install backend deps**
   ```bash
   cd backend
   npm install --production    # or npm ci if package-lock.json exists
   ```
2. **Configure runtime**
   - Default port is `3000`. Override with `PORT=<value>` if needed.  
   - Ensure the process user can read the repo root so static frontend files load.
3. **Start backend + static host**
   ```bash
   PORT=3000 npm start
   ```
   - Expect log: `Bug Busters backend listening on port <PORT>`.
4. **Serve frontend**
   - The backend already exposes `frontend/`; browse `http://<host>:<PORT>/` to access the game.
   - If hosting behind a reverse proxy/CDN, proxy `/`, `/health`, and `/scores` to the backend instance.
5. **Data validation**
   - Visit the Issuer panel and ensure period counts align with `plan/issuers_index.json`.
   - Trigger the reload button to confirm the cached JSON renders correctly even after manual refresh.

## 6. Verification Steps
- **Automated smoke (`tests/test.sh`)**
  ```bash
  ./tests/test.sh http://localhost:3000
  ```
  - Confirms `GET /health` 200, `GET /scores` 200, and `POST /scores` returns 200/201.
- **Manual gameplay checks (per `tests/TEST_PLAN.md` & `TEST.md`)**
  - Run a full round: timer starts at 20s, bug moves every ~0.6–0.9 s, clicks increment score, overlay appears at time-up, further clicks disabled.
  - Submit initials after a round; expect leaderboard refresh with sorted entries and backend status chip showing “Online”.
  - Stop the backend to verify offline messaging across leaderboard submit, refresh, and issuer panel resilience.
  - Validate issuer grouping: sample a period from the UI, open the matching `Unified_ver1/data/<CIK>/<PERIOD>/infotable.xml`, and confirm issuers match.
  - Review documentation deliverables (README, design specs) for completeness.

## 7. Monitoring & Ops
- Backend exposes `/health`; use it for uptime monitors. The frontend polls every 10 s and surfaces status in the header chip.
- Tail the Node process logs for unexpected errors (the Express error handler logs stack traces before replying with HTTP 500).
- Leaderboard data lives in RAM; expect it to clear on restart. Communicate this behavior externally if persistence is needed.

## 8. Rollback & Troubleshooting
- **Rollback**: stop the new Node process, redeploy the prior tagged commit, and restart with its previously saved `plan/issuers_index.json`. Because state is ephemeral, no data migration/restore is required.
- **Common issues**
  - *Frontend 404s*: confirm the working directory when launching (`backend/server.js` serves `../frontend` relative to itself).
  - *Issuer panel empty/error*: ensure the JSON embedded in `frontend/index.html` exactly matches the structure from `plan/issuers_index.json` (includes `items` array). Rebuild if SEC data changed or the script tag was truncated.
  - *CORS failures*: backend already sets `Access-Control-Allow-Origin: *`; if front/back run on different hosts, ensure network paths aren’t blocked by proxies.
  - *Tests failing POST /scores*: backend validates trimmed non-empty names and non-negative numeric scores. Adjust payload or inspect logs for validation errors.

Follow this runbook for every release to keep gameplay behavior, issuer data, and backend contracts aligned with the documented requirements and deterministic workflow expectations.
