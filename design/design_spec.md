# Bug Busters UI Specification

## 1. Experience Goals
- Single-screen game that communicates gameplay, scoring, issuer insights, and leaderboard without navigation.
- Beginner-friendly interactions: obvious call-to-action buttons, large tap targets, and clear messaging for timers, score submission, and data availability.
- Visual hierarchy keeps the game canvas dominant while still surfacing issuer data and leaderboard status.

## 2. Layout Overview
```
+-------------------------------------------------------------+
| Header row: title, short instructions, backend status chip  |
+----------------------+----------------------+---------------+
|   Main Game Stage    |   Sidebar Panel      | Leaderboard   |
|   (left ~55%)        |   (center ~25%)      |   (right ~20%)|
+----------------------+----------------------+---------------+
| Footer: controls (Start/Submit/Refresh), timer, status text |
+-------------------------------------------------------------+
```
- **Main Game Stage**: hosts moving bug target, score readout, subtle background grid to imply motion.
- **Sidebar (Issuer Panel)**: scrollable list grouped by filing period headings with issuer chips beneath.
- **Leaderboard Column**: compact list showing rank, player initials, and score plus error messaging.
- **Footer Control Bar**: sticky row containing timer countdown, start/restart button, submit score form (name + button), and refresh leaderboard button.

## 3. Key Components
### 3.1 Header
- Contains game logo text ("Bug Busters") and single-sentence instructions (“Click the bug for 20 seconds”).
- Include a pill-shaped backend status indicator that can show “Online” (green) or “Offline” (red) based on `/health` polling.

### 3.2 Game Stage
- **Score Display**: large numeric value positioned top-left inside the stage; label “Score”.
- **Timer Badge**: circular badge top-right showing countdown from 20 to 0; color transitions from green (>10s) to amber (10–4s) to red (<=3s).
- **Bug Target**: 60–80px circular element with bug icon or simple emoji; moves randomly every 600–900ms and after clicks; keep inside stage padding.
- **Play Field**: 4:3 rectangle with light shadow, minimum height 320px; even spacing to prevent overlap with scoreboard overlays.
- **End State Overlay**: semi-transparent layer that appears when timer hits 0 with message “Time’s up! Final Score: X”.

### 3.3 Issuer Panel
- Title “Issuer Data (auto from SEC filings)” with miniature refresh/retry icon.
- Each period folder renders as accordion-like block:
  - Period heading (e.g., `000110465925072098`) styled with monospace label showing total issuers count.
  - Under heading, stacked list of issuer names; show placeholder text when the array is empty.
- Error handling: display alert-styled card (“Issuer list unavailable. Showing cached data.”) when fetch fails.
- Panel should be scrollable independently to keep layout stable during long lists.

### 3.4 Leaderboard
- Section title plus subtitle “Top 10 latest submissions”.
- List rows contain rank number, player initials input, and score.
- Disabled state overlays the list if backend is offline, with instructions to retry refresh.
- Include placeholder row text (“No scores yet. Play to set the record!”) when list is empty.

### 3.5 Controls & Forms
- Start button toggles between “Start Game” and “Play Again”; disabled while timer is running.
- Submit score form: small text input for initials (max 3 chars) and submit button; form is enabled only when a final score exists.
- Refresh button triggers `GET /scores`; show spinner inline within button label when loading.
- Status text area communicates last action (e.g., “Score submitted” or “Backend unreachable”).

## 4. Interaction Notes
1. **Game Start**: clicking Start sets score=0, timer=20, enables bug movement, disables submit until round completes.
2. **Bug Click**: increments score, triggers quick scale animation, and repositions bug to a new random coordinate.
3. **Timer End**: stops movement, disables bug clicks, enables submit form, surfaces overlay message, and auto-focuses initials field.
4. **Leaderboard Submit**: POSTs `{ name, score }`; on success, clear input and refresh leaderboard list. On failure, show inline error and keep score available for retry.
5. **Issuer Panel Load**: fetch at startup; if JSON missing or malformed, fall back to a friendly error with retry option.

## 5. Styling Guidance
- Color palette: light background (#f5f7fb), accent orange for bug (#ff9f43), greens for success (#4caf50), reds for warnings (#f44336).
- Typography: system sans-serif (e.g., `font-family: 'Segoe UI', sans-serif`); emphasize headings with 700 weight.
- Buttons: rounded 6px corners, subtle drop shadow when active.
- Motion: bug movement uses CSS transition for smooth repositioning; clicks trigger scale/opacity effect lasting <200ms.
- Shadows: apply soft shadow to cards/panels to create separation between main stage, issuer panel, and leaderboard.

## 6. Responsiveness & Accessibility
- Breakpoint at 768px: stack panels vertically -> Game Stage top, Leaderboard next, Issuer panel last; keep controls sticky at bottom.
- Ensure bug target meets 44px minimum tap size for touch devices.
- Provide `aria-live="polite"` region for status messages (timer end, submission result).
- High-contrast text for readability; avoid relying solely on color (e.g., timer badge also shows textual warning “3s left”).

## 7. Data & Backend Integration Prompts
- Issuer panel fetch path: `./data/issuers_index.json`; handle promise rejection with fallback text.
- Leaderboard endpoints: `GET /scores` populates list, `POST /scores` triggered from submit form, `GET /health` to update header chip.
- Maintain in-memory state only; reset expectations communicated in status text (“Scores clear when server restarts”).

## 8. Assets & Icons
- Bug graphic can be simple SVG or emoji (🪲) to keep scope small.
- Use inline SVG icons for refresh/retry to avoid extra asset loading.
