# Bug Busters Requirements

## Project Goal
- Deliver a beginner-friendly, single-screen browser game called "Bug Busters" that demonstrates a multi-agent build with clear documentation, data integration, and lightweight backend support.
- Showcase the full workflow from planning through frontend, backend, and QA, using only plain HTML/CSS/JS and in-memory storage.

## Functional Requirements
### Gameplay Loop
- Player clicks a moving bug to earn one point per successful click.
- Bug position must move randomly often enough to feel active while remaining on screen.
- A single 20-second timer starts when the game begins and ends the round automatically, showing the final score.
- After the timer expires, disable further clicks and allow the player to view (and optionally submit) their score.

### Leaderboard & Backend Interaction
- Provide UI controls that call backend endpoints to submit the final score and refresh the top-10 leaderboard.
- Backend must expose `GET /health` for status and `GET /scores` + `POST /scores` for leaderboard management; storage remains in-memory.
- Leaderboard shows up to ten entries and refreshes when new scores arrive; mention backend unavailability gracefully.

### Data Panel Integration
- Use the provided `Unified_ver1/data/<CIK>/<PERIOD>/infotable.xml` files as the single source of issuer data.
- Data Scanner extracts every `<nameOfIssuer>` per infotable and writes `data/issuers_index.json` with issuer names grouped by their period folder.
- Frontend loads `issuers_index.json` at runtime and renders a right-side panel listing each period followed by the issuers it contains; handle missing/malformed data with friendly messaging.

## Role Deliverables & Expectations
### Project Manager
- Produce `docs/project_overview.md`, `docs/task_breakdown.md`, and `docs/requirements_checklist.md` documenting gameplay, timing, leaderboard, data panel, backend routes, and storage strategy.
- Requirements checklist must cover QA of data integration and gameplay flow.
- Task breakdown assigns Designer, Data Scanner, Frontend Developer, Backend Developer, and Tester work products clearly.

### Designer
- Create `design/ui_spec.md` detailing layout: game area, score display, 20s timer, issuer panel, leaderboard slot.
- Provide `design/wireframe.png` illustrating bug target, leaderboard placeholder, and issuer panel interactions plus styling tips for beginners.

### Data Scanner
- Author `data/scan_plan.md` listing folders to crawl and parsing strategy per infotable XML, including error handling steps.
- Generate `data/issuers_index.json` grouping issuer names by period folder for every infotable in `Unified_ver1/data`; skip malformed files gracefully and log omissions.

### Frontend Developer
- Implement `frontend/index.html`, `frontend/styles.css`, and `frontend/game.js` composing the single-screen experience.
- Ensure game logic supports random bug movement, score increment per click, and 20-second session end with final score messaging.
- Integrate issuer panel by fetching `data/issuers_index.json` and grouping issuers by period; tie leaderboard UI to backend `GET/POST /scores` endpoints.

### Backend Developer
- Build `backend/server.js` (Express-style) with CORS/static support so the frontend can call APIs locally.
- Provide `backend/README.md` describing start instructions, endpoint contracts, request/response body shapes, and memory-only top-10 leaderboard constraints.

### Tester
- Write `tests/test_plan.md` covering manual checks for gameplay, data panel behavior, leaderboard submissions, and error states.
- Supply `tests/check_routes.sh` that pings `/health` and `/scores` endpoints, verifying successful responses; include notes on how to detect issuer load failures.

## Success Criteria (Derived from Plan)
- Documentation explicitly captures gameplay, timing, leaderboard behavior, data panel, backend routes, and storage strategy.
- Requirements checklist covers QA on data integration and gameplay flow.
- Task breakdown names Designer, Data Scanner, Frontend, Backend, and Tester responsibilities.
- Designer outputs explain layout, wireframe interactions (bug target, leaderboard placeholder, issuer panel), and beginner-friendly styling tips.
- Data Scanner plan enumerates folders and parsing approach; issuers index groups names by period and gracefully handles missing/malformed XML.
- Frontend ensures random bug movement, clickable scoring, 20-second game session, issuer panel populated from JSON, and leaderboard UI wired to backend APIs.
- Backend provides Express-like server with `/health`, `/scores` (GET/POST), CORS/static config, and documentation of usage/data shapes.
- Tester’s artifacts verify gameplay, data panel, leaderboard, API routes, and issuer index failure states.

## Global Constraints
- Keep every file concise; rely on plain HTML/CSS/JavaScript without additional frameworks.
- Store leaderboard data in memory only; no external databases.
- Use repo-relative folder organization per role (design/, data/, frontend/, backend/, tests/).
- Ensure the game lasts exactly 20 seconds before displaying the final score.
- Frontend must load `data/issuers_index.json` and show issuer names grouped by their period folders.
