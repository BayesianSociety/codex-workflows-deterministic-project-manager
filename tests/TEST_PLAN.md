# Bug Busters Test Plan

## Test Environment
- Run `node backend/server.js` from the project root; expose the API at `http://localhost:3001` or adjust curl targets accordingly.
- Serve `frontend/` via a static file server or open `frontend/index.html` directly in a modern desktop browser (Chrome, Edge, Firefox).

## Manual checks
- GET /health: With the backend running, `GET http://localhost:3001/health` must return status 200 and a JSON payload shaped like `{ "status": "ok" }`; confirm no extra error fields.
- GET /scores behavior: Trigger `GET http://localhost:3001/scores` and expect status 200 plus `{ "scores": [...] }` where the array contains at most the top 10 entries sorted highest score first (tie-break by earlier submission as per backend logic).
- POST /scores validation: Submit `POST http://localhost:3001/scores` with `{"name":"Tester","score":7}` (JSON) and expect 201 plus the updated leaderboard; retry with invalid payloads such as missing `name` or a negative `score` to verify 400 responses with validation errors.
- Frontend leaderboard fetch: Load the leaderboard view, toggle backend integration if necessary, and confirm the frontend uses fetch to pull `/scores`, handles loading states, and renders the returned top 10 without blocking the rest of the UI.

## Automated checks
- Run `bash tests/test.sh` after the backend starts; it smokes `GET /health`, `GET /scores`, and `POST /scores` with sample data, failing fast on non-200/201 responses.

## Reporting
- Capture browser console logs plus backend server output for any failure and note whether the issue is frontend-only, backend-only, or integration-related.
