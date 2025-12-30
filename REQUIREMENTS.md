# Bug Busters Game Requirements

## Project Overview
- Create a beginner-friendly, single-screen browser game called "Bug Busters" where players click a moving bug to earn points.
- Each round lasts 20 seconds and ends with a prominent final score display.
- An optional backend leaderboard keeps the top 10 scores in memory and can be toggled without breaking the core game loop.

## Functional Requirements
1. **Gameplay Loop**
   - Display one moving bug that can be clicked/tapped for +1 point per hit.
   - Track and show the live score and a 20-second countdown timer during play.
   - When the timer expires, freeze gameplay, show the final score, and offer a replay option.
2. **Frontend Structure**
   - Vanilla HTML/CSS/JS only; files live under `frontend/` per plan.
   - Layout must reserve areas for score, timer, game area, and leaderboard stub.
   - Include hooks for optional backend integration (fetch/post leaderboard) without external frameworks.
3. **Backend API (optional but planned)**
   - Node/Express-style `backend/server.js` with in-memory storage (no external DB).
   - Routes: `GET /health` (returns status), `GET /scores` (top 10 sorted), `POST /scores` (validated payload).
   - Provide lightweight run instructions for starting the server.
4. **Design Assets**
   - `design/ui-spec.md` detailing layout, colors, typography, and interactions tailored to beginners.
   - `design/wireframe.png` showing a single-screen view with score, timer, game area, and leaderboard section.
5. **Testing Assets**
   - `tests/test-plan.md` covering gameplay basics and backend API expectations.
   - `tests/route-check.sh` hitting `/health` and `/scores` endpoints after the backend starts.

## Global Constraints
- Maintain one-page game experience; no navigation or multi-screen flows.
- Keep implementation approachable for beginners: clear naming, inline guidance, and no heavy frameworks.
- Do not use external databases; store leaderboard data in memory (cap at top 10 entries).
- Organize assets into the prescribed folders: `design/`, `frontend/`, `backend/`, `tests/`.
- Ensure the frontend can run independently when the backend is unavailable.

## Success Criteria (per role)
- **Project Manager**: Outline workflow, deliverables, responsibilities, and frontend/backend dependencies (this document plus planning files).
- **Designer**: Provide clear UI spec and wireframe emphasizing simplicity and instructions for new players.
- **Frontend Developer**: Deliver functional gameplay (moving bug, scoring, 20-second timer) with leaderboard hooks and vanilla stack.
- **Backend Developer**: Supply working API with `/health` and `/scores` routes, validation, and instructions.
- **Tester**: Document UI/API tests and provide a shell script verifying backend routes once the server runs.
