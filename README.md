# Bug Busters

Bug Busters is a single-screen, beginner-friendly browser game where players tap a moving bug for points during a 20-second round. The project pairs a vanilla HTML/CSS/JS frontend with an optional Node/Express backend that holds the top 10 leaderboard entries, plus design and testing artifacts to keep every role aligned.

## Quick Start

### 1) Backend (leaderboard API, optional for core play)
1. `cd backend`
2. `npm install`
3. `npm start` → serves on `http://localhost:3001`

Routes:
- `GET /health` → `{ "status": "ok" }`
- `GET /scores` → `{ "scores": [ ...top 10 entries... ] }`
- `POST /scores` with `{"name":"Player","score":7}` (non-negative integer) stores the score, trims to 10 entries, and returns the updated list.

### 2) Frontend (gameplay)
1. Open `frontend/index.html` directly in a modern browser for offline play, **or**
2. Serve the `frontend/` folder with any static server (e.g., `npx serve frontend`, `python -m http.server 8080 -d frontend`).  
   - To enable API calls, host the frontend on the same origin as the backend or configure your static server to proxy `/scores` and `/health` to `http://localhost:3001`. Without that setup the leaderboard gracefully falls back to offline/local storage mode, but the core gameplay still works.

### 3) Smoke Tests
1. Start the backend.
2. Run `bash tests/test.sh` from the repo root. The script curls `/health`, `/scores`, and `POST /scores` and fails fast if any route is unhealthy.

For deeper manual coverage, follow `tests/TEST_PLAN.md`.

## Repository Layout
- `frontend/` – Vanilla HTML (`index.html`), CSS (`styles.css` with design tokens), and JS (`game.js`) implementing the timer, bug movement, scoring, cue messages, and leaderboard hooks.
- `backend/` – Minimal Express server (`server.js`) plus `package.json`. Stores leaderboard data in memory only.
- `design/` – UI specification and text wireframe that describe layout, colors, responsive treatment, and interactions for the single-page experience.
- `plan/overview.md` – Project workflow summary and role dependencies.
- `tests/` – Manual test plan and `test.sh` backend smoke script.

## Frontend Highlights
- Fixed header strip with SVG logo, countdown pill (`data-role="timer"`), and live score (`data-role="score"`); timer defaults to 20 seconds.
- Game stage (`data-role="stage"`) animates a circular bug button every 800 ms, tracks clicks for +1 point, shows encouragement cues, and reveals a centered final score card when time expires.
- Replay button resets the round, and the leaderboard panel displays fetched or locally cached scores. When the backend is unreachable, the badge switches to “Offline mode”, score submissions are saved to `localStorage`, and form hints explain the state.
- Accessibility considerations: `aria-live` regions for timer/score, ≥48 px targets, keyboard focus styles, and instructions that stay on screen.

## Backend API
- Dependencies: Express 4.19.x + CORS 2.8.x (see `backend/package.json`).
- Data model: `{ name: string, score: number, submittedAt: ISO8601 }`. Scores are sorted high-to-low, with earlier submissions winning ties, and trimmed to 10 entries.
- Validation: rejects missing/blank names, non-numeric scores, or negative values with HTTP 400.
- Logging: on boot it prints the port and a sample `POST /scores` payload to send.

## Testing & QA
- Automated: `tests/test.sh` (requires backend running). Export `BASE_URL` to hit a non-default host/port if needed.
- Manual: `tests/TEST_PLAN.md` outlines gameplay checks, API validation steps, and reporting expectations (capture console/server logs on failure).
- Designers and frontend devs can cross-check visuals against `design/design_spec.md` and `design/wireframe.md` to confirm spacing, responsive behavior, and copy.

## Additional Notes
- Gameplay does not depend on the backend; when the API is offline the leaderboard area becomes a teaching surface, but rounds can still start instantly.
- Folder boundaries (`frontend/`, `backend/`, `design/`, `tests/`) match the requirements so each role can work independently while sharing the same single-page goal.
