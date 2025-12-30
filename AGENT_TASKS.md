# Agent Task Breakdown

| Role | Required Outputs | Key Responsibilities | Dependencies |
| --- | --- | --- | --- |
| Project Manager | `docs/project_overview.md`, `docs/task_breakdown.md`, `docs/requirements_checklist.md` | Capture gameplay, timer, leaderboard, data panel, backend routes, and storage strategy; maintain requirements checklist covering QA for gameplay/data integration; define tasks for all roles. | Needs input from stakeholders for priorities; informs all other roles via docs. |
| Designer | `design/ui_spec.md`, `design/wireframe.png` | Describe screen layout (game area, score/timer, issuer panel, leaderboard), illustrate interactions (moving bug target, leaderboard placeholder, issuers panel), and add beginner-friendly styling guidance. | Relies on PM requirements; outputs consumed by Frontend Developer. |
| Data Scanner | `data/scan_plan.md`, `data/issuers_index.json` | Enumerate folders under `Unified_ver1/data`, define parsing/validation approach, extract `<nameOfIssuer>` values per period, handle missing/malformed XML gracefully, and produce grouped issuer data JSON. | Needs raw SEC data; outputs consumed by Frontend Developer and Tester. |
| Frontend Developer | `frontend/index.html`, `frontend/styles.css`, `frontend/game.js` | Implement the Bug Busters UI, random bug movement, click scoring, 20-second timer, final score display, issuer panel fed by `data/issuers_index.json`, and leaderboard UI interacting with backend `/scores` endpoints. | Depends on Designer specs, Data Scanner JSON, and Backend API availability. |
| Backend Developer | `backend/server.js`, `backend/README.md` | Provide Express-like server with CORS/static support, memory-only leaderboard, `GET /health`, `GET/POST /scores` endpoints, and documentation covering start steps plus request/response shapes. | Coordinates with Frontend Developer (API contract) and Tester (route validation). |
| Tester | `tests/test_plan.md`, `tests/check_routes.sh` | Outline manual checks for gameplay, data panel, leaderboard, and documentation; script verifying `/health` and `/scores`; include notes on issuer index failure handling. | Requires artifacts from every other role to validate end-to-end behavior. |

## Coordination Notes
- PM delivers planning docs first so Designer, Data Scanner, and Developers have explicit requirements.
- Designer and Data Scanner progress in parallel; Frontend integrates both design direction and issuer JSON once ready.
- Backend API must stabilize before Frontend leaderboard integration and before Tester finalizes automation.
- Tester engages throughout to review docs and rerun `tests/check_routes.sh` whenever backend changes.
