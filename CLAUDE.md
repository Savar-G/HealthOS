# HealthOS — Root Context

This is Savar's personal health tracking system. It combines a **Next.js dashboard app** with four specialized Claude Code agents that manage domain-specific data.

## Architecture

```
HealthOS/
├── CLAUDE.md          ← You are here (root orchestrator context)
├── DESIGN.md          ← Notion-inspired design system
├── src/               ← Next.js dashboard app (App Router)
├── running/           ← Running coach agent
├── strength/          ← Strength training tracker agent
├── oura/              ← Oura ring recovery/sleep analyst agent
├── data/              ← Weight CSV and other standalone data
└── dashboard/         ← Legacy HTML dashboard (archived)
```

## The Dashboard App (`src/`)

An interactive Next.js web app that reads data from all agent directories and renders it as charts, tables, and insights. Run with `npm run dev` → localhost:3000.

**5 pages:**
- **Overview** (`/`) — Health score ring, quick stats, doing well/needs attention, lifts table, recovery status
- **Training** (`/training`) — 4 tabs: Strength (lifts, volume chart, overload, PRs), Running (plan phase), Steps (Oura), Recovery (HRV/readiness)
- **Sleep** (`/sleep`) — Sleep score, stages chart, duration trend, recent nights
- **Body** (`/body`) — Weight tracking with 7d/30d/90d averages, trends, interactive chart
- **Insights** (`/insights`) — AI narrative, domain status, cross-domain correlations

**Tech:** Next.js 16, shadcn/ui, Tailwind CSS, Recharts, PapaParse. All data read server-side via `fs` — no database.

## The Four Agents

### 1. Running (`running/CLAUDE.md`)
- **Role:** AI running coach and data tracker
- **Data files:** `Runner Profile.md`, `Training Plan.md`, `Run Log.md`
- **What it does:** Logs runs, updates the training plan, tracks weekly mileage, flags plan adjustments, gives coaching feedback
- **Key detail:** 27-week half marathon plan, 3x/week running (Sun long + Tue quality + Fri easy) integrated with strength training
- **State export:** "State of My Running" section at top of Run Log.md

### 2. Strength (`strength/CLAUDE.md`)
- **Role:** Strength training tracker and coach
- **Data files:** `Strength_Profile.md`, `Workout_Log.md`, `PR_History.md`, `strong_workouts_raw.csv`
- **What it does:** Logs every set of every workout, tracks PRs, flags progressive overload opportunities and muscle imbalances
- **Key detail:** Data sourced from Strong iOS app (CSV export). Full Body A/B/C split, 3x/week. 994 sessions since Sept 2020.
- **State export:** "State of My Strength" section in Strength_Profile.md

### 3. Oura (`oura/CLAUDE.md`)
- **Role:** Oura Ring data analyst — sleep, recovery, readiness
- **Data files:** `Oura_Profile.md`, `Recovery_Log.md`, `raw/` (13 CSVs, 834+ days)
- **What it does:** Logs daily Oura stats, interprets data in plain English, gives training recommendations (Push / Maintain / Back Off), connects recovery to training performance
- **Key detail:** HRV is the most important metric. Readiness below 70 = always recommend backing off.
- **State export:** "State of My Recovery" section in Oura_Profile.md

### 4. Dashboard (`dashboard/CLAUDE.md`) — Legacy
- **Role:** Was the HTML dashboard generator, now superseded by the Next.js app
- **Status:** Archived. The `dashboard.html` file remains for reference.

## Data Sources

| Domain | File | Records | Format |
|--------|------|---------|--------|
| Strength | `strength/strong_workouts_raw.csv` | 18,213 rows | CSV (comma) |
| Recovery | `oura/Recovery_Log.md` | 94 daily entries | Markdown tables |
| Sleep | `oura/raw/sleepmodel.csv` | 1,103 nights | CSV (semicolon) |
| Steps | `oura/raw/dailyactivity.csv` | 834 days | CSV (semicolon) |
| Weight | `data/weight.csv` | 1,602 entries | CSV (comma) |
| Running | `running/Run Log.md` | 0 | Markdown tables |

## Health Score

Weighted composite: Recovery 40%, Strength 30%, Running 30%. Weights redistribute when a domain has no data. Computed in `src/lib/data/health-score.ts`.

## Design System (`DESIGN.md`)

Notion-inspired editorial minimalism:
- **Typography:** Inter with negative letter-spacing at display sizes
- **Palette:** Warm neutrals — `#f6f5f4` (warm white), `rgba(0,0,0,0.95)` (near-black text)
- **Domain colors:** Strength = orange (#E8590C), Running = green (#2B8A3E), Recovery = blue (#1971C2)
- **Borders:** Whisper-weight `1px solid rgba(0,0,0,0.1)`
- **Shadows:** Multi-layer stacks with sub-0.05 opacity

## How the Agents Connect
- Each domain agent maintains a **"State of..."** section that serves as its exportable snapshot
- The **Next.js app** reads data files directly (CSV + markdown) and renders everything
- The **Oura agent** can cross-reference training data when giving recovery recommendations
- The **Strength agent** can reference Oura recovery data when Savar mentions it
- The **Running agent** is aware of the strength schedule for interference-effect management

## Conventions
- All agents update their data files on every interaction
- Coaching responses are brief (3-5 sentences) unless more detail is requested
- Trends always get direction indicators (up/down/flat)
- Flags are prioritized by urgency
- Dates use YYYY-MM-DD format

## Current State (as of 2026-05-10)
- **Strength:** Active — 1,006 unique sessions, last session May 10 (Pull). 4 sessions this week, 9 PRs in last 22 days. Fully recovered from Mar-Apr gap and pushing past pre-break weights. Split stabilized at Push/Pull/Legs+Core/Upper.
- **Running:** Active — 33-week half marathon plan (2x/week), 6 runs logged through May 8. Wk4 closed with PRs: easy pace 11:49/mi @ 141 bpm (Tue) + first quality session done (Fri tempo fartlek). Wk5 = Recovery Week.
- **Oura:** Active — 123 daily entries through May 10. Status 🟢 GREEN. 7-day HRV 66ms, readiness 80, sleep 83. Sleep + Activity raw CSVs are 32 days stale (last export Apr 8) — re-run `python3 oura/import_oura.py` after re-export.
- **Weight:** Active — 1,625 daily entries, current 159.6 lbs (May 10), +3.8 lbs since Apr 12 (productive refueling during training rebuild).
- **Dashboard:** Next.js app with 5 interactive pages, all data-driven. Insights page renders `coach_notes.md` at top.

## Workflow: `/sync-health`

Whenever you've updated multiple data sources (running log, strength workouts, Oura recovery, weight) and want the dashboard refreshed + a fresh coach deep dive, run **`/sync-health`** in Claude Code. The skill lives at `.claude/commands/sync-health.md`.

It does three things in order:

1. **Sweep** — surveys the latest entry date in every data source (strength CSV, Oura recovery log + raw CSVs, weight CSV, run log) and flags any that are stale.
2. **Sync dashboard** — bumps the "Current State" snapshot in this CLAUDE.md, fixes any stale labels in dashboard pages, and runs `npm run build` to verify.
3. **Coach deep dive** — rewrites `coach_notes.md` with cross-domain insights for the period since last sync. This file is rendered as the top section of the Insights page (`/insights`). The coach voice is opinionated, evidence-backed, and prescriptive — connecting domains in ways no single agent can.

The slash command commits and pushes everything in one logical commit.

**Don't** confuse `/sync-health` with the four domain agents. The agents (`strength/`, `running/`, `oura/`) update _their own_ data on every interaction. `/sync-health` is the periodic cross-cutting layer that turns that data into dashboard updates + coach insights.
