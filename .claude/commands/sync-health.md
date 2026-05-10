---
description: Sweep all HealthOS data sources, refresh the dashboard, and produce a coach-style cross-domain deep dive
---

# /sync-health — HealthOS data sync + coach deep dive

You are running the HealthOS data sweep workflow. This is BOTH a data updater and a coach. Don't skip the coach part.

## What this command does

1. **Survey** — read every data source's latest entry date
2. **Sync** — make sure dashboard rendering matches the data; bump any stale snapshots
3. **Deep Dive** — write fresh cross-domain coach insights to `coach_notes.md`
4. **Commit + Push** — one logical commit that lands all updates

## Execution Protocol

### Step 1: Survey every data source

Run a single bash command that reports the latest date in each:

```bash
echo "=== STRENGTH ===" && tail -3 strength/strong_workouts_raw.csv | cut -d',' -f1
echo "=== OURA RECOVERY ===" && grep -E "^### " oura/Recovery_Log.md | tail -3
echo "=== OURA SLEEP CSV ===" && awk -F';' 'NR>1 && /long_sleep/ {print}' oura/raw/sleepmodel.csv | grep -oE '[0-9]{4}-[0-9]{2}-[0-9]{2}' | sort -u | tail -3
echo "=== OURA STEPS CSV ===" && awk -F';' 'NR>1 {for(i=1;i<=NF;i++) if($i ~ /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/) print $i}' oura/raw/dailyactivity.csv | sort -u | tail -3
echo "=== WEIGHT ===" && tail -3 data/weight.csv
echo "=== RUNNING ===" && grep -E "^\| [0-9]+ \|" "running/Run Log.md" | tail -3
```

### Step 2: Read each agent's "State of..." snapshot

These are the hand-curated overviews. Read them all so the coach voice has the same context the agents used:

- `strength/Strength_Profile.md` — top section "## State of My Strength"
- `oura/Oura_Profile.md` — top section "## State of My Recovery"
- `running/Run Log.md` — top section "## State of My Running"

### Step 3: Sync the dashboard

The dashboard reads data files dynamically — most things update automatically. But check for:

- **Stale "as of <date>" labels** in `CLAUDE.md` Current State section → bump
- **Stale hardcoded text** in pages (e.g., "starts Apr 14" if running has started)
- **Stale Oura raw CSVs** — the markdown agent might be current, but `oura/raw/sleepmodel.csv` and `oura/raw/dailyactivity.csv` only update when CSVs are re-exported. Flag this in the coach notes if they're >14 days behind.
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

### Step 5: Commit + push

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

If <3 days have passed since last sync OR no data file has changed, just bump CLAUDE.md and skip the coach_notes rewrite. Tell the user "no meaningful change since last sync."
