# Bug Busters Role Breakdown

## Project Manager
- Maintain REQUIREMENTS.md, TEST.md, and plan/overview.md so every role shares the same scope.
- Facilitate handoffs: Designer → Frontend → Backend ↔ Tester alignment.
- Track milestone dates (Design spec, Frontend prototype, Backend API, Test completion) and unblock issues quickly.

## Designer
- Deliver `design/ui-spec.md` describing layout, colors, typography, and interactions for the Bug Busters single-screen view.
- Produce `design/wireframe.png` that highlights score, timer, play area, and leaderboard regions.
- Emphasize instructions and clarity for beginner users.

## Frontend Developer
- Build `frontend/index.html`, `frontend/styles.css`, and `frontend/game.js` implementing a moving bug, score tracking, and 20-second timer.
- Integrate optional leaderboard hooks that POST/GET scores when the backend is online while gracefully degrading when offline.
- Keep code vanilla and well-commented for readability.

## Backend Developer
- Implement `backend/server.js` exposing `GET /health`, `GET /scores`, and `POST /scores` endpoints with validation.
- Use an in-memory store limited to the top 10 scores; no external database or heavy stack.
- Document run instructions so Tester can execute route checks.

## Tester
- Write `tests/test-plan.md` covering UI/gameplay verification steps and backend route expectations.
- Create `tests/route-check.sh` to curl `/health` and `/scores` endpoints (including POST) once the backend server is up.
- Coordinate with Frontend and Backend developers to reproduce bugs and confirm fixes.
