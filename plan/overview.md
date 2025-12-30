# Bug Busters Plan Overview

## Requirements Recap
- Single-screen "Bug Busters" game where a moving bug awards points per click and stops exactly at 20 seconds with a final score display.
- Data Scanner must traverse `Unified_ver1/data/<CIK>/<PERIOD>/infotable.xml`, extract every `<nameOfIssuer>`, and publish `data/issuers_index.json` grouped by period folders plus a documented scan plan.
- Frontend loads `issuers_index.json`, renders the issuer groups in a right-side panel, runs the bug game loop, and hooks leaderboard UI to backend endpoints.
- Backend (Express-like) keeps memory-only scores and serves `GET /health`, `GET /scores`, and `POST /scores` with CORS/static support so the frontend can interact locally.
- Designer supplies a UI spec and wireframe describing layout (game area, timers, issuers, leaderboard) and interaction/visual cues for beginners.
- Tester prepares a comprehensive test plan and `tests/check_routes.sh` covering gameplay, issuer panel, leaderboard, and API health.
- All documentation (docs/, design/, data/, frontend/, backend/, tests/) must stay concise, framework-free, and aligned with the JSON plan deliverables and success checks.

## Role Dependency Map
- **Project Manager → All**: Requirements, task breakdown, and checklist inform Designer, Data Scanner, Frontend, Backend, and Tester deliverables.
- **Designer → Frontend Developer**: UI spec and wireframe dictate layout, interactions, and styling used by the frontend build.
- **Data Scanner → Frontend Developer & Tester**: `data/issuers_index.json` feeds the issuer panel; scan instructions guide Tester in validating data coverage and error handling.
- **Backend Developer ↔ Frontend Developer**: Frontend relies on `/health` and `/scores` contracts; backend depends on frontend feedback to finalize payload formats.
- **Backend Developer → Tester**: Tester’s script and manual checks require stable endpoints and documented data shapes.
- **Frontend Developer → Tester**: Tester validates gameplay, issuer panel rendering, and leaderboard UX; any UI changes must be communicated.
- **All → Tester**: Final acceptance depends on Tester consuming documentation, scanner output, frontend assets, and backend server.

## Suggested Execution Order
1. Project Manager finalizes docs to lock requirements and success criteria.
2. Designer drafts UI spec/wireframe while Data Scanner begins crawling infotable sources.
3. Backend Developer scaffolds server routes concurrently so contract details are ready early.
4. Frontend Developer integrates design guidance, issuer JSON, and backend endpoints once upstream artifacts exist.
5. Tester iteratively reviews docs, reruns `tests/check_routes.sh`, and executes manual scenarios, flagging gaps before release.
