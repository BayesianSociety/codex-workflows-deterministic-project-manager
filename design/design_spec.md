# Bug Busters UI Specification

## Objective & Audience
- **Goal:** Provide a single-screen game interface where beginners can instantly understand how to start, play, and read their score within 20 seconds of landing on the page.
- **Players:** Novice web users (children or new coders) who need large tap targets, plain language, and forgiving feedback.
- **Constraints:** Vanilla HTML/CSS/JS, responsive to small laptops/tablets, and resilient even if the optional leaderboard API is offline.

## Layout Overview
All regions sit inside a centered 960 px max-width container with 24 px gutters and a soft card background. Minimum spacing between sections: 16 px.

1. **Header Strip (72 px height)**
   - Left: Bug Busters logo (stylized text + bug icon).
   - Center: 20 second timer pill (`00:20` default) with live countdown.
   - Right: Score pill showing `Score: 0`.
   - Entire strip stays fixed at the top on larger screens; on mobile it becomes a stacked block (logo, timer, score).

2. **Instruction Banner (full-width, 56 px height)**
   - Concise message: “Tap the bug to earn points before the timer hits zero. Replay to beat your best!”
   - Includes a subtle info icon and uses a contrasting pastel background.

3. **Game Stage (primary focal card, 540 px height)**
   - Light grid backdrop for depth.
   - Bug sprite (circular button, ~56 px) moves within this area.
   - Bottom-left overlay hosts contextual cues such as “Great hit!” for 800 ms.
   - Bottom-right overlay hosts the Replay button (disabled until the round ends).

4. **Leaderboard & Guidance Panel (right column on desktop, stacked below on mobile)**
   - Section title “Community Scores” with API status badge (e.g., “Offline mode”).
   - Table stub with three rows and placeholder text (“Waiting for scores…”).
   - Beneath table: form stub for player name input (max 12 chars) and “Submit Score” button (disabled until final score exists).

5. **Footer Helper Row**
   - Includes small-print reminders: “20-second rounds · Works offline · Tap replay to try again.”

### Responsive Behavior
- ≥960 px: Header + Instruction full width; Game Stage (70%) and Leaderboard (30%) sit side-by-side.
- 640–959 px: Stack vertically with shared margins; timer/score pills align beneath logo.
- <640 px: Full-width stacking, increase tap targets to 64 px, and hide non-essential shadows to avoid clutter.

## Visual Style
- **Color Palette**
  - Background: `#f7f9fc` (page) with a white card (`#ffffff`) for sections.
  - Accent 1: `#ff6b6b` for the bug, active elements, and Replay CTA.
  - Accent 2: `#4ecdc4` for timer/score pills and success highlights.
  - Accent 3: `#1a535c` for headings and icons.
  - Status colors: `#ffd166` (warning/offline), `#2ec4b6` (online).
- **Typography**
  - Headings: `Poppins`, 600 weight (fallback Arial).
  - Body text: `Inter`, 400 weight (fallback Helvetica).
  - Numbers (score/timer): use a mono-spaced variant such as `Roboto Mono` for easy tracking.
- **Iconography**
  - Simple SVG bug icon (two circles + antennae).
  - Info/status icons derived from inline SVG to avoid external libraries.

## Interaction States
1. **Pre-Game**
   - Timer shows `00:20`, bug pulses slowly.
   - “Start Round” button (same location as Replay) invites initial play.
2. **Active Round**
   - Bug jumps to a new random location every 800 ms; on hover/touch, it scales to 110%.
   - Click/tap increments score and triggers a quick particle burst (CSS pseudo-elements) plus accessible text (“+1 point!”).
   - Timer decrements each second with subtle tick animation.
   - Leaderboard submission controls remain disabled.
3. **Round End**
   - Game Stage dims, bug stops moving, final score card slides in center (“You busted X bugs!”).
   - Replay button becomes primary CTA; Start label switches to “Play Again”.
   - “Submit Score” enables if API online; otherwise show tooltip “Leaderboard offline”.
4. **Error / Offline**
   - API status badge toggles to warning color with text “Offline mode”.
   - Submitting a score while offline shows inline message “Saved locally—sync when back online” (non-blocking).

## Accessibility & Guidance
- Provide `aria-live="polite"` regions for timer and score updates.
- Use color plus text labels for states; never rely solely on color.
- Minimum contrast ratio 4.5:1 for text, 3:1 for icons/buttons.
- Ensure bug hit area is at least 48 px on smallest view.
- Show onboarding tip (tooltip or speech bubble) for first load describing controls; allow dismiss via close icon or after first hit.

## Content & Copy
- Headline: “Bug Busters: Click the critter before time runs out!”
- Instruction banner text: “Tap or click the bug to earn points. Finish before the 20-second timer hits zero.”
- Replay CTA: “Replay Round”.
- Score submission label: “Nickname (optional)”.

## Implementation Notes
- Keep DOM hooks (`data-role` attributes) for JS targeting (e.g., `data-role="timer"`, `data-role="bug"`).
- Reserve `div[data-role="leaderboard-status"]` for backend integration so the Frontend Dev can toggle classes based on fetch results.
- Provide exported design tokens (colors, spacing) as CSS custom properties in `:root` for reuse.
- Use CSS transitions for bug movement/scale to keep animation approachable for beginners and avoid abrupt jumps.
