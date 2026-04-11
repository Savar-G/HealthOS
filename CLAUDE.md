# Health Project — Root Context

This is Savar's personal health tracking system, powered by four specialized Claude Code agents. Each agent operates in its own subfolder with its own CLAUDE.md, data files, and domain expertise.

## Architecture

```
health/
├── CLAUDE.md          ← You are here (root orchestrator context)
├── DESIGN.md          ← Design system for all visual output
├── running/           ← Running coach agent
├── strength/          ← Strength training tracker agent
├── oura/              ← Oura ring recovery/sleep analyst agent
└── dashboard/         ← Cross-domain HTML dashboard generator agent
```

## The Four Agents

### 1. Running (`running/CLAUDE.md`)
- **Role:** AI running coach and data tracker
- **Data files:** `Runner Profile.md`, `Training Plan.md`, `Run Log.md`
- **What it does:** Logs runs, updates the training plan, tracks weekly mileage, flags plan adjustments, gives coaching feedback
- **Key detail:** 32-week half marathon plan, 2x/week running (Tue Zone 2 + Fri Quality) integrated with 4x/week strength. Calendar integration (America/Vancouver, sage green for build weeks, peacock blue for recovery)
- **State export:** "State of My Running" section at top of Run Log.md

### 2. Strength (`strength/CLAUDE.md`)
- **Role:** Strength training tracker and coach
- **Data files:** `Strength_Profile.md`, `Workout_Log.md`, `PR_History.md`, `strong_workouts_raw.csv`
- **What it does:** Logs every set of every workout, tracks PRs, flags progressive overload opportunities and muscle imbalances
- **Key detail:** Data sourced from Strong iOS app (CSV export). Push/Pull/Legs+Core/Upper split, 4x/week (Sat/Sun/Mon/Wed). 991 sessions since Sept 2020.
- **State export:** "State of My Strength" section in Strength_Profile.md
- **Current flags:** 23-day training gap, hamstring volume critically low (5:1 quad:ham ratio), incline DB bench stalled, RDL regression

### 3. Oura (`oura/CLAUDE.md`)
- **Role:** Oura Ring data analyst — sleep, recovery, readiness
- **Data files:** `Oura_Profile.md`, `Recovery_Log.md`
- **What it does:** Logs daily Oura stats, interprets data in plain English, gives training recommendations (Push / Maintain / Back Off), connects recovery to training performance
- **Key detail:** HRV is the most important metric. Readiness below 70 = always recommend backing off.
- **State export:** "State of My Recovery" section in Oura_Profile.md

### 4. Dashboard (`dashboard/CLAUDE.md`)
- **Role:** Cross-domain health insights synthesizer
- **Output:** `dashboard.html` (always overwritten with latest), `archive/` for snapshots, `Wrapped_YYYY-MM.html` for monthly recaps
- **What it does:** Reads state from all three domain agents, generates a styled HTML dashboard with charts, animations, cross-domain insights, goal tracking, streaks, PR cards, muscle heatmap, time machine comparisons, and AI narrative
- **Key detail:** Uses Chart.js and Google Fonts via CDN. No server needed — opens via Finder. Follows `DESIGN.md` for all visual decisions.
- **Health Score:** Recovery 40%, Strength 30%, Running 30% (redistributed if a domain has no data)
- **New features (Apr 2026):** Goal Progress bars, Streaks + PR Celebration Cards, Muscle Group Heatmap (SVG), Time Machine (year-over-year lift comparisons), "What Your Body Is Saying" AI narrative, Cross-Domain Correlation Charts (placeholder until 2+ domains active), Monthly Wrapped (separate file)

## Design System (`DESIGN.md`)
- **Aesthetic:** True Notion — pure white, flat, minimal borders, content floats via spacing
- **Typography:** Outfit (headings), DM Sans (body), JetBrains Mono (metrics)
- **Domain colors:** Strength = orange (#E8590C), Running = green (#2B8A3E), Recovery = blue (#1971C2)
- **Base palette:** Pure white background (#FFFFFF), brown-black text (#37352F), no shadows
- **Cards:** Flat — no shadows, no hover lifts. Border-radius 6px. Hover = background tint only.
- **Animations:** Staggered fade-in on load, counter animations, subtle transitions
- **Empty states:** Dashed borders with pulsing opacity animation
- **Layout:** Narrow content width (~900px), left-aligned headers, generous vertical rhythm (48px between sections)

## How the Agents Connect
- Each domain agent maintains a **"State of..."** section that serves as its exportable snapshot
- The **Dashboard agent** reads these snapshots (plus raw data files) to generate cross-domain insights
- The **Oura agent** can cross-reference training data when giving recovery recommendations
- The **Strength agent** can reference Oura recovery data when Savar mentions it
- The **Running agent** is aware of the strength schedule — Tuesday runs are always easy (post-legs), Friday runs are for intensity (4 days post-legs). The interference effect logic is documented in the Training Plan.

## Conventions
- All agents update their data files on every interaction — that's the core contract
- Coaching responses are brief (3-5 sentences) unless more detail is requested
- Trends always get direction indicators (up/down/flat)
- Flags are prioritized by urgency
- Dates use YYYY-MM-DD format
- The dashboard is always a single self-contained HTML file, never markdown

## Current State (as of 2026-04-08)
- **Strength:** Active — 991 sessions logged, but 23-day gap since last workout (Mar 16)
- **Running:** Set up — 32-week plan (2x/week Tue+Fri), first run Apr 14, awaiting first logged runs
- **Oura:** Set up — awaiting first data entries
- **Dashboard:** v2 dashboard generated (2026-04-08) with 7 new features — single `dashboard.html` file (old dated files archived)
