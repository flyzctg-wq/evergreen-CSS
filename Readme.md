# Evergreen Club — Cricket Score Counter
### Full Walkthrough

A single self-contained HTML file plus an optional **viewer sync server** for multi-device live scoreboards. Open the HTML in any browser — no build step required. For viewers on separate phones or tablets, run the small Node server on a laptop on the same Wi‑Fi.

---

## 1. Opening the file

Double-click `EvergreenClub.html` or open it in any browser. The first screen asks **how you're joining**:

- **Scorer** — full scoring. Sets up the match, records every ball, manages bowlers and wickets, and can undo or correct the last ball.
- **Viewer** — read-only live scoreboard. No buttons that change the match, just the score updating automatically.

**URL shortcuts**

| Mode | URL |
|------|-----|
| Viewer (same device) | `EvergreenClub.html?role=viewer` |
| Viewer (remote device) | `EvergreenClub.html?role=viewer&match=ABC123&server=http://192.168.1.10:3847` |

A **⇄Switch role** link in the header lets anyone jump back to this screen at any time.

---

## 2. Live sync server (viewers on other devices)

The HTML file alone syncs between tabs on the **same device** (BroadcastChannel + localStorage). To show the score on phones, tablets, or a venue TV on the **same network**, run the viewer backend:

```bash
cd server
npm install
npm start
```

The server listens on **port 3847** and serves the HTML at `http://localhost:3847/EvergreenClub.html`.

**Scorer flow**

1. Open `http://localhost:3847/EvergreenClub.html?role=scorer` (or open the file directly — sync still works if the server is reachable).
2. Start the match. A **Live viewer link** panel appears with a 6-character match code and a copyable URL.
3. Share that link with anyone who should watch. The scorer pushes every score change to the server automatically.

**Viewer flow (remote)**

1. Open the shared link on any device on the network, e.g. `?role=viewer&match=K7P2MX&server=http://192.168.1.10:3847`.
2. The screen polls the server every second and updates when the scorer records a ball.

**Security model:** viewers can only **read** match state (`GET /api/matches/:code/state`). Only the scorer, with a secret write key generated at match start, can **push** updates (`POST`). Viewers cannot change the score.

---

## 3. Match setup (Scorer only)

Before a ball is bowled, the Scorer sets:

- **Total overs per innings** — any number, not just 20 or 50. A 6-over evening match works the same as a full ODI.
- **Players per team** — defaults to 11, but adjustable for local formats (8-a-side, 7-a-side, etc.).
- **Max overs per bowler** — calculated automatically the moment you change the overs field, using the standard ICC proportional rule:

  ```
  Max overs per bowler = ceil(Total overs ÷ 5)
  ```

  Examples: a 20-over match gives each bowler 4 overs max; a 50-over match gives 10; an odd 7-over match gives 2 (rounded up, so nobody loses a fair share to truncation). This number is read-only — it's derived, not entered, so it can never drift out of sync with the format.

- **Team names and player names** — editable text fields for both sides. Changing the squad size live-resizes the name list, padding with placeholder names you can overwrite.

Tapping **Start Match** locks in the configuration and moves to the toss.

---

## 4. Toss

Pick which team bats first. This decides the batting/bowling order for the first innings; the second innings automatically swaps it.

---

## 5. Playing the match (Scorer)

### The scoreboard strip
Always visible at the top: current score, wickets, overs bowled out of the total, Current Run Rate (CRR), and — once a target exists in the second innings — Required Run Rate (RRR) colored red or green depending on whether you're behind or ahead of it.

Also in the strip:

- **🖨 Print** — print scorecard
- **↩ Undo ball** — removes the last recorded delivery and restores all stats (wickets, overs, free hit, strike rotation, bowler figures, fall of wickets)
- **✎ Correct ball** — undo the last ball and re-open scoring with the previous delivery pre-filled so you can enter the right runs/extras/wicket

### Undo and score correction

Every delivery is checkpointed **before** it is applied. That makes one-ball revert reliable even after wickets, end of over, or free-hit chains.

| Action | What it does |
|--------|-------------|
| **Undo ball** | Reverts exactly one delivery. Disabled when the match is complete or no balls have been recorded. |
| **Correct ball** | Undoes the last ball, pre-fills the extra type and runs, and shows a green banner. Tap the corrected score or wicket to save. |

If you undo a wicket, any “pick incoming batter” prompt is cleared and the dismissed batter’s stats are restored.

### Selecting a bowler
At the start of every over, a picker lists the bowling side's players. Anyone who has already used their full over quota, or who bowled the previous over, shows as disabled with the reason underneath (e.g. *"Quota used (4 ov max)"* or *"Bowled previous over"*). This is enforced in code, not just in the UI — picking a blocked bowler is rejected with an on-screen explanation rather than silently allowed.

### Recording a delivery
A row of extra-type toggles (**Legal ball / Wide / No ball / Bye / Leg bye**) sets what kind of delivery you're about to log. Then tap a run value (0–6) or **Wicket**.

- **Wide** — adds 1 run (or more, if you tap a higher number for extra wide-runs) to the team total only. Doesn't count as a legal ball, so the over doesn't advance.
- **No ball** — adds 1 run plus whatever the batter scored off it, credited to the batter. Doesn't count as a legal ball. Arms a Free Hit for the very next delivery.
- **Bye / Leg bye** — runs go to the team, never to the batter, and the ball *does* count as legal (it still has to be a fair delivery for byes to apply).
- **Plain run (0–6)** — standard scoring off the bat, fours and sixes tracked separately for the batter's card.

### Wickets
Tapping **Wicket** opens a dismissal-type picker: Bowled, Caught, LBW, Run Out, Stumped, Hit Wicket, Retired Hurt. If the *current* delivery is a no-ball, or the previous ball armed a Free Hit, every option except Run Out and Retired Hurt is grayed out — because by law, a batter can only be run out (or retire hurt) off a no-ball or a free hit. Choosing Run Out opens a follow-up step asking how many runs were completed before the throw, and which end the dismissed batter was at, so the incoming batter is placed correctly and strike rotates accurately.

After any wicket that doesn't end the innings, a new-batter picker appears listing everyone not yet out.

### Free Hit handling
Two separate banners cover the two moments this applies:
- While the **No ball** toggle is active: a banner reminds you only Run Out stands on this delivery, and that a Free Hit will be armed for the next one.
- Once that next ball arrives: a gold **FREE HIT** banner stays up until a fair, legal delivery resolves it. A wide bowled during an armed Free Hit does **not** clear it — the Free Hit correctly carries over to the next attempt, exactly as the laws require.

### Over and innings transitions
After the 6th legal delivery, ends swap automatically, the bowler picker reappears (excluding whoever just bowled), and the "this over" ledger resets. When the innings ends — by all-out or overs complete — an innings-break overlay shows the score and the target, then hands control to the second innings with sides reversed. The match ends the moment the chase is won, the second innings is all out, or overs run out, with the result (win margin, or a tie) calculated and displayed automatically.

### The ball-by-ball ledger
A row of small tokens under "This over" shows each delivery as it happens: a dot for a dot ball, the run number for runs, blue for a four, purple for a six, gold for extras (wd/nb), green for byes/leg-byes, and red **W** for a wicket. It resets at the start of each new over.

---

## 6. Watching the match (Viewer)

The Viewer screen mirrors the same scoreboard strip, this-over ledger, "at the crease" batsmen panel, current bowler figures, free-hit banner, and fall-of-wickets list — but with every input control stripped out. It updates automatically as the Scorer scores, through:

- **Same device:** BroadcastChannel + localStorage (instant between tabs)
- **Other devices:** polling the sync server (`GET /api/matches/:code/state`) every second when `?match=` is in the URL

If no match has been started yet, the Viewer shows a waiting message instead of a blank screen.

---

## 7. Printing the scorecard

A **🖨 Print** button sits in the live scoreboard strip during the match, and a larger **🖨 Print scorecard** button appears on the match-complete screen (available to both Scorer and Viewer). Either one opens the browser's print dialog showing a clean, white-background scorecard formatted for paper: club letterhead, match result, and full batting and bowling tables — runs, balls, fours, sixes, strike rate, and dismissal for every batter; overs, maidens, runs, wickets, and economy for every bowler used — plus the fall-of-wickets list, for both innings. everything else on the page (buttons, navigation, the live ledger) is hidden automatically in the print output, so only the scorecard itself ends up on paper.

---

## 8. Technical notes

- **Fully offline-capable (scorer).** React, ReactDOM, and the entire application are compiled and embedded directly inside the HTML file — no CDN links for the app logic, no build step. Fonts may load from Google Fonts when online.
- **Bowler quota math:** `Math.ceil(totalOvers / 5)`, recalculated live as soon as the overs field changes in setup.
- **All-out detection:** triggers when wickets reach `teamSize − 1`, so it scales correctly for any custom squad size, not just 11.
- **Undo stack:** full match checkpoints stored in memory before each delivery; revert restores innings stats, UI prompts, and match-over state.
- **Sync server:** Express app in `server/` — in-memory store, 24-hour TTL, CORS enabled, static HTML served from parent folder.
- **Data scope:** match state on the server is ephemeral (cleared after 24 h or server restart). Closing all scorer tabs without the server still clears local-only matches. Print or save the scorecard for a permanent record.
