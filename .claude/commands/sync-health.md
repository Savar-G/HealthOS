---
description: Sweep all HealthOS data sources, refresh the dashboard, and produce a coach-style cross-domain deep dive
---

# /sync-health — HealthOS data sync + coach deep dive

You are running the HealthOS data sweep workflow. This is BOTH a data updater and a coach. Don't skip the coach part.

## What this command does

1. **Survey** — read every data source's latest entry date
2. **Sync** — make sure dashboard rendering matches the data; bump any stale snapshots
3. **Deep Dive** — write fresh cross-domain coach insights to `coach_notes.md`
4. **Obsidian Weekly Summary** — create a 1-page summary note in the user's Obsidian vault
5. **Commit + Push** — one logical commit that lands all updates

## Execution Protocol

### Step 1: Survey every data source

Run a single bash command that reports the latest date in each:

```bash
echo "=== STRENGTH ===" && tail -3 strength/strong_workouts_raw.csv | cut -d',' -f1
echo "=== OURA (Recovery + Sleep + Steps all live here) ===" && grep -E "^### " oura/Recovery_Log.md | tail -3
echo "=== WEIGHT ===" && tail -3 data/weight.csv
echo "=== RUNNING ===" && grep -E "^\| [0-9]+ \|" "running/Run Log.md" | tail -3
```

Oura data: **only check the markdown log.** All four Oura-derived dashboard
views (Recovery, Sleep, Steps, HRV trends) read from `oura/Recovery_Log.md`.
The raw CSVs in `oura/raw/` are historical backup only — do not check them
for sync status.

### Step 2: Read each agent's "State of..." snapshot

These are the hand-curated overviews. Read them all so the coach voice has the same context the agents used:

- `strength/Strength_Profile.md` — top section "## State of My Strength"
- `oura/Oura_Profile.md` — top section "## State of My Recovery"
- `running/Run Log.md` — top section "## State of My Running"

### Step 3: Sync the dashboard

The dashboard reads data files dynamically — most things update automatically. But check for:

- **Stale "as of <date>" labels** in `CLAUDE.md` Current State section → bump
- **Stale hardcoded text** in pages (e.g., "starts Apr 14" if running has started)
- Run `npm run build` at the end to catch type errors.

### Step 4: Write `coach_notes.md`

This file is rendered as the top section of the Insights page. Overwrite it each run. Required sections:

```markdown
# Coach's Deep Dive

_Last sync: YYYY-MM-DD_
_Period covered: <prev sync date> → YYYY-MM-DD (~N weeks)_

## The Big Story
One paragraph framing the period across all domains.

## What's Working
3-5 specific, evidence-backed wins. Cite numbers.

## What to Watch
3-5 specific risks or trends with thresholds. Don't hedge.

## Cross-Domain Insights
3-5 numbered insights that connect ≥2 domains. Each insight should be something
the user could not see from any single domain in isolation.

## Action Items (Next 7 Days)
Concrete, dated, prescriptive. No vague "keep monitoring."

## Data Health Check
Markdown table: source | status | latest entry | days stale
```

### Step 5: Obsidian Weekly Summary

Prepend a new weekly entry to the rolling log in the user's Obsidian vault. This is the "glance at my health" view — much shorter than `coach_notes.md`, optimized for skimming on Sunday. **One file, all weeks, newest at top.**

**Vault:** `obsidian-vault`
**Folder:** `10 Projects/HealthOS`
**File:** `Weekly Log.md` (single rolling file — do NOT create a new file per week)

**Procedure:**

1. Use `mcp__obsidian__read-note` (vault: `obsidian-vault`, folder: `10 Projects/HealthOS`, filename: `Weekly Log.md`) to fetch current content.
2. Locate the **first `## Week ` heading** (newest entry). The new entry must be inserted **above** that line, separated by a `\n---\n\n` divider.
3. Build the new entry block (template below).
4. Use `mcp__obsidian__edit-note` with `operation: "replace"` and the full new content (header + frontmatter preserved + new entry on top + existing entries below).

**Idempotency:** If the topmost `## Week NN` heading already matches today's week number, replace that block instead of prepending a new one. (User re-synced same week — don't create duplicate entries.)

**Entry block template** (note: H3 inside, not H2 — H2 is reserved for week dividers):

```markdown
## Week NN — <Mon D> → <Mon D>, YYYY

_Synced YYYY-MM-DD_

> **TL;DR:** 1-2 sentence framing of the week.

### Snapshot

| Domain | This Week | Direction |
|---|---|---|
| **Strength** | <sessions, volume, last session> | <↑/→/↓ + 3 word note> |
| **Running** | <miles, sessions done/planned> | <↑/→/↓ + 3 word note> |
| **Recovery** | <readiness, HRV, sleep> | <↑/→/↓ + 3 word note> |
| **Weight** | <current, change vs last sync> | <↑/→/↓ + 3 word note> |

### Top 3 Wins
3 specific wins with numbers.

### Top 3 Watch Items
3 risks/trends with thresholds and one-line actions.

### Next Week
2-4 specific scheduled items (next runs, strength focus).

### Cross-Domain Insight of the Week
The single most interesting connection across domains, in 2-3 sentences.
```

**Final assembled file structure:**

```markdown
---
project: HealthOS
type: rolling-log
tags: [health, weekly-summary]
---

# HealthOS Weekly Log

> Rolling weekly summaries from `/sync-health`. Newest entry at the top.
> Full coach analysis lives in [coach_notes.md](...). Repo: [...]. Project: [[wiki/HealthOS]].

---

## Week NN — <newest> ...
<entry>

---

## Week NN-1 — <previous> ...
<entry>

---

## Week NN-2 — <older> ...
<entry>
```

**Voice:** Tighter than the coach notes. The user is going to scan this in 30 seconds, not read it. One screen per week, no fluff.

### Step 6: Commit + push

One commit that bundles:
- Any data file syncs (weight, strength CSV, etc.)
- `coach_notes.md` rewrite
- `CLAUDE.md` "Current State" bump
- Any dashboard code adjustments

Commit message format:
```
Sync health data + coach deep dive (YYYY-MM-DD)

- Data: <one-liner per domain that changed>
- Insights: <2-3 word summary of biggest finding>
- Dashboard: <what code/text changed, if any>
```

Then `git push origin main`.

## The Coach Voice

This is not a dashboard; it's a coach. When writing `coach_notes.md`:

- **Be specific.** "HRV trended up" is useless. "HRV climbed from 41ms (Apr 11) to 73ms (Apr 19) — full recovery in 8 days" is useful.
- **Connect domains.** A single-domain observation belongs in that agent's profile, not here. The coach's value is in the seams.
- **Cite numbers.** Every claim should be backed by a number you can point to in the data.
- **Take a position.** "This is working" or "This is a risk" — not "Things are happening."
- **One concrete action per insight.** If you can't say what to do about it, drop the insight.

## When to skip the coach update

If <3 days have passed since last sync OR no data file has changed, just bump CLAUDE.md and skip the coach_notes rewrite. Tell the user "no meaningful change since last sync." Skip the Obsidian step too in this case — no point creating a duplicate weekly note.

## Cadence

The user typically runs `/sync-health` every **Sunday** as part of their weekly health update. The Obsidian summary is therefore aligned to ISO weeks (Mon-Sun), with the Sunday sync producing the wrap-up note for that week.
