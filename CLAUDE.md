# HealthOS — Root Context

This is Savar's personal health tracking system. It combines a **Next.js dashboard app** with five specialized Claude Code agents that manage domain-specific data.

## Architecture

```
HealthOS/
├── CLAUDE.md          ← You are here (root orchestrator context)
├── DESIGN.md          ← Notion-inspired design system
├── src/               ← Next.js dashboard app (App Router)
├── tennis/            ← Tennis coach agent (ACTIVE — primary cardio)
├── running/           ← Running coach agent (PAUSED — pivoted to tennis May 22)
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

## The Five Agents

### 1. Tennis (`tennis/CLAUDE.md`) — ACTIVE primary cardio
- **Role:** AI tennis coach and data tracker
- **Data files:** `Tennis Profile.md`, `Session Log.md`
- **What it does:** Logs sessions, tracks skill progression (quarterly self-rating), match record, HR efficiency trend, recovery cost
- **Key detail:** 2x/week tennis (drills + match play), goal = get measurably better. Started May 22, 2026 (pivot from running).
- **State export:** "State of My Tennis" section at top of Tennis Profile.md
- **Coaching framework:** Ericsson's deliberate practice (skill sessions) + application (match play). 1 session focused practice, 1 session pressure application.

### 2. Running (`running/CLAUDE.md`) — PAUSED
- **Role:** AI running coach and data tracker (currently inactive)
- **Data files:** `Runner Profile.md`, `Training Plan.md`, `Run Log.md`
- **Status:** Paused May 22, 2026 after Savar pivoted to tennis. 7 runs logged, made it to Wk5 of 33-week half marathon plan. Easy pace PR 11:49/mi @ 141 bpm. Plan and data preserved for future resumption.
- **State export:** "State of My Running" section at top of Run Log.md (marked PAUSED)

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
| Strength | `strength/strong_workouts_raw.csv` | 18,213+ rows | CSV (comma) |
| Recovery | `oura/Recovery_Log.md` | 123+ daily entries | Markdown tables |
| Sleep | `oura/Recovery_Log.md` (Sleep Score, Deep, Total, HRV, HR fields) | 123+ entries | Markdown tables |
| Steps | `oura/Recovery_Log.md` (Steps field) | 123+ entries | Markdown tables |
| Weight | `data/weight.csv` | 1,658+ entries | CSV (comma) |
| Running | `running/Run Log.md` | 7 runs (paused) | Markdown tables |
| Tennis | `tennis/Session Log.md` | 2 matches | Markdown |

> **Note on Oura data:** All Oura metrics now flow through `oura/Recovery_Log.md`. The Oura API skill writes directly to that markdown file. The `oura/raw/` CSVs are historical-only — kept as a backup but no longer read by the dashboard. REM sleep, light sleep, and efficiency are NOT in the markdown source, so the Sleep page falls back to a "Deep + Other" 2-stack composition view.

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

## Current State (as of 2026-06-16)
- **Strength:** Active — 1,023 unique sessions, last session Jun 14 (Pull). 4 sessions this week, 35+ PRs in last 5 weeks. Best progression run of the year — Tricep Dips Machine 180→205, Lat Pulldown 160→170 (first e1RM >200), Calf Press 235→245 (first e1RM >300). Push/Pull/Legs+Core/Upper rotation locked in.
- **Tennis:** Active (NEW as of May 22) — 2x/week (drills + match play), goal = get measurably better. **2-0 match record** (last: Jun 9, beat Sid M. 6-1, 6-3; 90 min, avg HR 104). Skill baseline 6.58/10 — forehand the weapon (8), serve the weakness (5). Match HR profile (max 136) shows tennis isn't a cardio stimulus at this level.
- **Running:** ⏸️ PAUSED (May 22) — Savar pivoted to tennis. 7 runs logged before pause, easy pace PR 11:49/mi @ 141 bpm. Plan and data preserved for future resumption.
- **Oura:** Active — 160 daily entries through Jun 16. Status 🟢 GREEN. 7-day HRV 75ms ↑, readiness 83, sleep 82, RHR 56.3 bpm ↓. Recovery strengthened materially over the last 5 weeks (HRV +14%, RHR -2 bpm). Dashboard reads Sleep + Steps directly from `Recovery_Log.md`.
- **Weight:** Active — 1,658 daily entries, current 161.6 lbs (Jun 16), 7-day avg 161.1, 30-day avg 160.1. Up +2.0 lbs since May 10 (~0.4 lb/wk) — gradual climb continuing alongside the year's best strength progression (35+ PRs), so still tracking as productive lean-mass gain rather than surplus.
- **Dashboard:** Next.js app with 5 interactive pages, all data-driven. Insights page renders `coach_notes.md` at top.

## Workflow: `/sync-health`

Whenever you've updated multiple data sources (running log, strength workouts, Oura recovery, weight) and want the dashboard refreshed + a fresh coach deep dive, run **`/sync-health`** in Claude Code. The skill lives at `.claude/commands/sync-health.md`.

It does four things in order:

1. **Sweep** — surveys the latest entry date in every data source (strength CSV, Oura recovery log, weight CSV, run log) and flags any that are stale.
2. **Sync dashboard** — bumps the "Current State" snapshot in this CLAUDE.md, fixes any stale labels in dashboard pages, and runs `npm run build` to verify.
3. **Coach deep dive** — rewrites `coach_notes.md` with cross-domain insights for the period since last sync. This file is rendered as the top section of the Insights page (`/insights`). The coach voice is opinionated, evidence-backed, and prescriptive — connecting domains in ways no single agent can.
4. **Obsidian weekly summary** — prepends a new weekly entry to the rolling log at `10 Projects/HealthOS/Weekly Log.md` in the Obsidian vault. Single file, all weeks, newest at top. Each entry is optimized for 30-second scanning on Sunday: snapshot table, top 3 wins, top 3 watch items, next week, one cross-domain insight. Uses `mcp__obsidian__read-note` + `mcp__obsidian__edit-note` (replace mode).

The slash command commits and pushes everything in one logical commit. Cadence: typically run every **Sunday** as part of the weekly health update — the Obsidian summary aligns to ISO weeks (Mon-Sun).

**Don't** confuse `/sync-health` with the four domain agents. The agents (`strength/`, `running/`, `oura/`) update _their own_ data on every interaction. `/sync-health` is the periodic cross-cutting layer that turns that data into dashboard updates + coach insights.
