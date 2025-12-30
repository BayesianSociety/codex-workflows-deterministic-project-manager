# Bug Busters Wireframe

```
┌────────────────────────────────────────────────────────────┐
│ Bug Busters                         Backend: ● Online      │
│ "Click the bug before time runs out"                      │
├───────────────────────┬──────────────────────┬──────────────┤
│  MAIN GAME STAGE      │  ISSUER PANEL        │ LEADERBOARD  │
│  ┌─────────────────┐  │  Issuer Data        │  Top Scores  │
│  │ Score: 000      │  │  Period P1 (3)      │  1. --- 000  │
│  │ Timer: 20s      │  │   • Issuer name     │  2. --- 000  │
│  ├─────────────────┤  │   • Issuer name     │  3. --- 000  │
│  │                 │  │  Period P2 (2)      │  ...         │
│  │     🪲 BUG       │  │   • Issuer name     │              │
│  │   (moves)       │  │   • Issuer name     │  [Offline msg│
│  │                 │  │  [Error alert box]  │   overlay]   │
│  └─────────────────┘  │                      │              │
│  [Overlay: Time's up!]│                      │              │
├───────────────────────┴──────────────────────┴──────────────┤
│ Controls: [Start/Play Again] [Initials __] [Submit Score]   │
│           [Refresh Leaderboard] Status: text area           │
└────────────────────────────────────────────────────────────┘
```

## Notes & Interactions
- **Bug Stage**: bug graphic jumps to random coordinates within the bordered field every 0.6–0.9s and on each click; overlay appears at 0 seconds with final score messaging.
- **Score/Timer**: counters pinned within the stage so they remain visible on mobile; timer badge changes color as time drains.
- **Issuer Panel**: vertically scrollable; each period heading shows issuer count; display error card when fetch fails and keep retry icon near heading.
- **Leaderboard**: ranks up to 10 entries, grayed-out overlay when backend offline; empty-state copy encourages first submission.
- **Controls**: start button disables while timer runs; Submit Score enabled post-game with initials input capped at 3 characters; refresh button triggers `/scores` GET and shows spinner.
- **Status Text**: `aria-live` region communicating events like “Score submitted” or backend failures.
- **Responsive Behavior**: below 768px, stack sections vertically in the same order and keep controls sticky at bottom to retain easy reach.
