# Bug Busters Testing Summary

## Scope
Covers verification activities for both the frontend gameplay loop and the optional backend leaderboard API so every role understands required checks.

## Manual Frontend Checks
1. Load `frontend/index.html` in a modern browser; confirm the UI matches the single-screen wireframe (score, timer, bug play area, leaderboard stub).
2. Start the game and click the moving bug multiple times:
   - Score increments exactly once per click.
   - Bug continues to move or respawn to keep play active.
3. Observe the 20-second countdown:
   - Timer starts at 20s, decrements each second, and reaches 0 in roughly 20s.
   - When the timer hits 0, gameplay stops, the final score appears, and replay/reset controls show.
4. When backend integration is enabled, trigger a score submission and ensure the leaderboard list refreshes with at most 10 entries.

## Backend Route Verification
Run `node backend/server.js` (or documented command), then execute `tests/route-check.sh`.
The script must:
- `GET /health` and confirm a 200 response with simple status payload.
- `GET /scores` and ensure it returns a JSON array with <=10 entries sorted highest-first.
- `POST /scores` with a valid payload (e.g., `{ "name": "Test", "score": 5 }`), expect 201/200.
- Follow up with `GET /scores` to confirm the new entry appears and excess entries are trimmed to 10.

## Acceptance Criteria
- All manual steps succeed without errors on current browsers.
- Automated route check exits 0 and prints responses for audit.
- Known limitations (e.g., backend optional) are documented in `tests/test-plan.md`.
