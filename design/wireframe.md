# Bug Busters Wireframe (Text)

```
┌───────────────────────────────────────────────────────────────┐
│ Bug Busters 🐞        TIMER [00:20]        SCORE [000]        │  Header strip
└───────────────────────────────────────────────────────────────┘
┌───────────────────────────────────────────────────────────────┐
│ ℹ Tap the bug to earn points before the 20-second timer ends. │  Instruction banner
└───────────────────────────────────────────────────────────────┘
┌───────────────────────────────┬───────────────────────────────┐
│                               │ Community Scores              │
│          GAME STAGE           │ ┌───────────────┬───────────┐ │
│  · light grid background      │ │ Rank | Name   | Score     │ │
│  · moving bug sprite          │ │  1   | —      | —         │ │
│  · floating feedback chips    │ │  2   | —      | —         │ │
│                               │ │  3   | —      | —         │ │
│                               │ └───────────────┴───────────┘ │
│  [Start / Replay Button]      │ Status: ● Online / Offline    │
│  Final score card overlay     │ Nickname [__________]         │
│  appears centered at end      │ [Submit Score]                │
└───────────────────────────────┴───────────────────────────────┘
┌───────────────────────────────────────────────────────────────┐
│ Helper text: 20-second rounds · Works offline · Tap replay    │  Footer hints
└───────────────────────────────────────────────────────────────┘
```

## Notes
- Game Stage occupies roughly 70% width on desktop; panels stack vertically on mobile.
- Replay button stays anchored in the lower-right corner of the stage until the round ends.
- Leaderboard area doubles as an instruction space when the backend is offline (“Waiting for scores…” placeholder).
