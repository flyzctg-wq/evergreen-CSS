# Evergreen Club — Cricket Score Counter
### Full Walkthrough

A single self-contained HTML file. No installation, no server, no internet connection required after the first download — open it in any browser and it runs entirely on-device.

---

## 1. Opening the file

Double-click `EvergreenClub.html` or open it in any browser. The first screen asks **how you're joining**:

- **Scorer** — full controls. Sets up the match, records every ball, manages bowlers and dismissals.
- **Viewer** — read-only live scoreboard. No buttons that change the match, just the score updating automatically.

If you bookmark the file with `?role=viewer` added to the address bar (e.g. `EvergreenClub.html?role=viewer`), it skips this screen and opens straight into Viewer mode — useful for a venue TV or a second tablet that should always boot into watch-only mode.

A **⇄ Switch role** link in the header lets anyone jump back to this screen at any time.

---

## 2. Match setup (Scorer only)

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

## 3. Toss

Pick which team bats first. This decides the batting/bowling order for the first innings; the second innings automatically swaps it.

---

## 4. Playing the match (Scorer)

### The scoreboard strip
Always visible at the top: current score, wickets, overs bowled out of the total, Current Run Rate (CRR), and — once a target exists in the second innings — Required Run Rate (RRR) colored red or green depending on whether you're behind or ahead of it.

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
Two separate banners cover the two moments this matters:
- While the **No ball** toggle is active: a banner reminds you only Run Out stands on this delivery, and that a Free Hit will be armed for the next one.
- Once that next ball arrives: a gold **FREE HIT** banner stays up until a fair, legal delivery resolves it. A wide bowled during an armed Free Hit does **not** clear it — the Free Hit correctly carries over to the next attempt, exactly as the laws require.

### Over and innings transitions
After the 6th legal delivery, ends swap automatically, the bowler picker reappears (excluding whoever just bowled), and the "this over" ledger resets. When the innings ends — by all-out or overs complete — an innings-break overlay shows the score and the target, then hands control to the second innings with sides reversed. The match ends the moment the chase is won, the second innings is all out, or overs run out, with the result (win margin, or a tie) calculated and displayed automatically.

### The ball-by-ball ledger
A row of small tokens under "This over" shows each delivery as it happens: a dot for a dot ball, the run number for runs, blue for a four, purple for a six, gold for extras (wd/nb), green for byes/leg-byes, and red **W** for a wicket. It resets at the start of each new over.

---

## 5. Watching the match (Viewer)

The Viewer screen mirrors the same scoreboard strip, this-over ledger, "at the crease" batsmen panel, current bowler figures, free-hit banner, and fall-of-wickets list — but with every input control stripped out. It updates automatically as the Scorer plays, through two simultaneous mechanisms:

- **Instant push** between tabs open in the same browser, on the same device, via the browser's BroadcastChannel.
- **Recovery snapshot** stored locally, so a Viewer tab opened (or refreshed) after scoring has already started still picks up the latest state within about a second, rather than only working if it was open from the very beginning.

**Important limitation:** this only syncs across tabs on the *same device and browser profile* — for example, a laptop running the Scorer in one tab and a second tab mirrored to a TV, or a tablet with two browser tabs open. It does **not** sync between separate devices (a phone scoring and a different tablet viewing) because the file has no backend server; that would need real infrastructure beyond a single HTML file.

If no match has been started yet, the Viewer shows a waiting message instead of a blank screen.

---

## 6. Printing the scorecard

A **🖨 Print** button sits in the live scoreboard strip during the match, and a larger **🖨 Print scorecard** button appears on the match-complete screen (available to both Scorer and Viewer). Either one opens the browser's print dialog showing a clean, white-background scorecard formatted for paper: club letterhead, match result, and full batting and bowling tables — runs, balls, fours, sixes, strike rate, and dismissal for every batter; overs, maidens, runs, wickets, and economy for every bowler used — plus the fall-of-wickets list, for both innings. Everything else on the page (buttons, navigation, the live ledger) is hidden automatically in the print output, so only the scorecard itself ends up on paper.

---

## 7. Technical notes

- **Fully offline-capable.** React, ReactDOM, and the entire application are compiled and embedded directly inside the HTML file — there are no CDN links, no build step, and no internet connection needed once you have the file.
- **Bowler quota math:** `Math.ceil(totalOvers / 5)`, recalculated live as soon as the overs field changes in setup.
- **All-out detection:** triggers when wickets reach `teamSize − 1`, so it scales correctly for any custom squad size, not just 11.
- **Data scope:** match state lives only in the browser tab(s) involved in that session. Closing all tabs or clearing site data clears the match. There's no cloud save — if you need a permanent record, print or save the scorecard before closing the browser.
