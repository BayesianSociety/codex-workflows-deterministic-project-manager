# Bug Busters Release Runbook

## Purpose & Scope
This runbook explains how to ship the Bug Busters single-screen browser game described in `REQUIREMENTS.md` and validated through `TEST.md`/`tests/TEST_PLAN.md`. Follow these steps to spin up the backend leaderboard API, serve the frontend, run the automated smoke tests, and complete the manual QA pass expected by the tester role.

## Repository Map
- `frontend/` – Vanilla HTML/CSS/JS game (entry point `index.html`, logic in `game.js`).
- `backend/` – Node + Express leaderboard API defined in `server.js` with `package.json` for dependencies.
- `tests/` – `test.sh` curl script plus the detailed manual test plan in `TEST_PLAN.md`.
- `design/` & `plan/` – Reference artifacts for UI and scope; keep them unchanged for release tagging.

## Prerequisites
1. Node.js 18+ and npm installed (needed for backend dependencies).
2. Bash-compatible shell, `curl`, and `mktemp` (used by `tests/test.sh`).
3. Modern desktop browser (Chrome/Edge/Firefox) for manual gameplay checks.
4. Optional: lightweight static server such as `npx http-server` if you want the frontend served over HTTP instead of `file://`.

## Backend Setup & Operation
1. Install dependencies once per environment:
   ```bash
   cd backend
   npm install
   ```
2. Start the API (default port 3001) from the `backend/` directory:
   ```bash
   npm start
   # or PORT=4000 npm start
   ```
   - Routes (see `backend/server.js`): `GET /health`, `GET /scores`, `POST /scores`.
   - Data is stored in-memory; restarting the process clears the leaderboard.
3. Health expectations: console prints `Bug Busters backend running on http://localhost:<PORT>` and `/health` returns `{ "status": "ok" }`.

## Frontend Run Options
1. **Offline/Timer Only**: Open `frontend/index.html` directly in a browser. Gameplay (bug movement, scoring, timer) works even if leaderboard fetches fail, and the UI falls back to local storage scores.
2. **Integrated with Backend**: Serve the frontend over HTTP and proxy `/scores` to the backend so relative fetches work.
   ```bash
   # terminal 1
   cd backend
   npm start
   # terminal 2
   cd frontend
   npx http-server -p 4173 --proxy http://localhost:3001?
   ```
   Visit `http://localhost:4173` and confirm the `Community Scores` panel flips to “Online”. Any static server with proxy support (e.g., `vite preview --proxy`) is acceptable as long as `/scores` hits the backend host.

## Automated Verification (Tester Handoff)
1. Ensure the backend is running (adjust `BASE_URL` if not using `http://localhost:3001`).
2. Execute the smoke script from the repo root:
   ```bash
   BASE_URL=http://localhost:3001 bash tests/test.sh
   ```
3. The script logs each request/response to stderr and exits 0 on success. Failures stop the script and print which route failed; gather backend logs for debugging.

## Manual QA Checklist
Execute these steps after the automated script passes (mirrors `TEST.md` and `tests/TEST_PLAN.md`).
- Load the frontend and verify the layout matches the design: header with score/timer pills, play area, leaderboard stub, and footer guidance.
- Start a round via “Start Round”/“Replay Round”. Click the moving bug repeatedly; `Score: <n>` must increment by exactly 1 per hit.
- Observe the timer counts down from 20 seconds and locks the stage at 0: gameplay stops, final score panel shows, and replay button re-enables.
- Submit a score when the backend is online: enter nickname, send, and confirm leaderboard refreshes while keeping ≤10 rows sorted highest-first.
- Toggle offline behavior by stopping the backend; the badge should switch to “Offline mode”, submissions are stored locally, and rows show cached/local entries without blocking gameplay.

## Release Checklist
- [ ] `REQUIREMENTS.md`, `TEST.md`, and `plan/overview.md` remain unchanged since the last approved handoff (PM responsibility).
- [ ] Backend server is running on the intended host with correct `PORT` (default 3001) and logs clean of unexpected 5xx errors.
- [ ] `tests/test.sh` executed successfully against the deployed backend (attach output to release notes).
- [ ] Manual QA checklist completed on the target browsers; document any anomalies with reproduction steps.
- [ ] Archive/export frontend `frontend/` and backend `backend/` directories (or deploy artifacts) per release process, noting the leaderboard is in-memory only.

## Troubleshooting & Notes
- If `tests/test.sh` cannot reach the API, verify `BASE_URL` and that CORS is enabled (it is by default via `cors` middleware).
- `EADDRINUSE` on backend start indicates the port is busy; stop the existing service or set `PORT` to another value.
- Frontend fetches use relative paths. When hosting the frontend separately from the backend, ensure your static server proxies `/scores` requests; otherwise, the UI will stay in offline mode by design.
- Because scores reset on server restart, announce maintenance windows if running a live leaderboard.
