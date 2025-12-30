# Plan Overview: Bug Busters Game

## Restated Requirements
- Build a single-screen game named "Bug Busters" where players click a moving bug to earn points.
- Gameplay lasts exactly 20 seconds, after which the final score is shown and replay can be offered.
- Provide optional integration with a lightweight backend leaderboard (top 10 scores stored in memory) without requiring it for core play.
- Deliverables are organized per role and folder: design specs and wireframe, frontend HTML/CSS/JS implementation, backend Node/Express server, and testing artifacts.
- Maintain beginner-friendly approaches (vanilla stack, clear instructions, no external database).

## Role Dependencies
1. **Designer → Frontend Developer**
   - Frontend waits on `design/ui-spec.md` and `design/wireframe.png` to finalize layout, styling, and interactions.
2. **Frontend Developer ↔ Backend Developer**
   - Frontend needs API contract for `/scores` routes; Backend needs knowledge of payload structure and fetch cadence to validate requests.
   - Leaderboard integration is optional but should degrade gracefully when backend offline.
3. **Backend Developer → Tester**
   - Tester requires backend run instructions and sample payloads to complete `tests/route-check.sh` and the broader test plan.
4. **Frontend Developer → Tester**
   - Manual gameplay checks in `tests/test-plan.md` depend on a working frontend build with clear scoring/timer behavior.
5. **Project Manager ↔ All Roles**
   - PM ensures requirements stay synchronized, resolves blockers, and confirms each handoff meets the success checks defined in the plan JSON.

## Execution Notes
- Work in parallel where possible: Designer drafts assets while Backend scaffolds API; Frontend can stub leaderboard hooks until backend is ready.
- Schedule integration checkpoints: (a) Design sign-off, (b) Frontend gameplay demo, (c) Backend API smoke test, (d) Combined leaderboard test, (e) Final QA run.
- Document all run/test instructions in the respective folders to keep the experience accessible to newcomers.
