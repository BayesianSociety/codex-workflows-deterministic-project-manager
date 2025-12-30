# Bug Busters Test Plan

## Objectives
- Validate the full Bug Busters experience: gameplay timing, scoring, issuer data panel, leaderboard submission, and backend routes.
- Confirm data integration from `data/issuers_index.json` stays accurate even when infotable sources are missing/malformed.
- Provide lightweight automation to guard core API availability.

## Test Environment
- Local development machine running the backend server (Node/Express-like) and static frontend.
- Issuer data sourced from `Unified_ver1/data` via generated `data/issuers_index.json`.

## Manual Test Suites
### Gameplay Flow
1. Load the page; ensure the timer shows 20 seconds and the bug appears within the play area.
2. Click the moving bug repeatedly; verify score increments per click and bug relocates randomly while staying on screen.
3. Let the timer expire at exactly 20 seconds; check that the final score message appears and clicking no longer increases the score.
4. Attempt to restart or resubmit after the timer (if UX allows) to ensure state resets cleanly.

### Data Panel & Issuers
1. Confirm the right panel lists each period folder name; expanding/scrolling reveals corresponding issuer names.
2. Cross-check a sample issuer manually by opening its infotable.xml to ensure grouping accuracy.
3. Temporarily rename one infotable.xml to simulate missing data; rerun the scanner and verify the panel surfaces fallback messaging without crashing.

### Leaderboard & Backend
1. With backend running, finish a game and submit the score; expect a success confirmation and leaderboard refresh showing up to ten entries.
2. POST multiple scores with varying values; confirm sorting (highest first) and clipping to top 10.
3. Stop the backend and attempt submission; UI should inform the user of the failure without breaking gameplay and allow retry once backend returns.

### Documentation & Scanner Deliverables
1. Review `docs/project_overview.md`, `docs/task_breakdown.md`, and `docs/requirements_checklist.md` to ensure gameplay, timing, leaderboard, data panel, backend routes, and storage strategy are fully captured.
2. Validate `design/ui_spec.md` and `design/wireframe.png` cover layout, interactions, and beginner styling hints.
3. Inspect `data/scan_plan.md` for folder coverage/parsing strategy and check `data/issuers_index.json` groups issuers by period; confirm malformed XML handling instructions.

### Backend CLI Script Verification
- Run `tests/check_routes.sh` while the backend server is up. The script must:
  - Call `GET /health` and ensure a 200 response with status payload.
  - Call `GET /scores` and confirm JSON array/top-10 structure.
  - Optionally POST a sample score (if included) and re-fetch to confirm persistence in memory.

## Negative & Edge Cases
- Submit scores faster than leaderboard refresh to ensure deduping or proper ordering.
- Attempt to load `data/issuers_index.json` before the Data Scanner runs; frontend should handle fetch errors gracefully.
- Validate behavior when issuers_index.json omits a period (e.g., due to malformed XML) and ensure UI states the data is incomplete.

## Acceptance Checklist
- Gameplay loop: random bug movement, scoring, timer end, final score display.
- Data integration: issuer panel populated from Data Scanner output with friendly failures.
- Leaderboard: GET/POST flows operational, top-10 enforced, backend `/health` accessible.
- Documentation/design/data/test artifacts match deliverables outlined in the project plan.
- Automation: `tests/check_routes.sh` verifies `/health` and `/scores` endpoints before builds/releases.
