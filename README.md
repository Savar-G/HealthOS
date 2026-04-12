# HealthOS

A personal health dashboard that synthesizes data across strength training, running, sleep, recovery, and body composition into an interactive Next.js web app. Built for a single user — no auth, no hosting, just `npm run dev`.

## Screenshot
<img width="1275" height="1049" alt="image" src="https://github.com/user-attachments/assets/e4d105df-c0db-4b2f-a7c2-a87f157dae4d" />
<img width="1140" height="903" alt="image" src="https://github.com/user-attachments/assets/10337d88-0298-44e4-be03-6467a445da93" />
<img width="1140" height="945" alt="image" src="https://github.com/user-attachments/assets/538a8fd5-6ba5-4551-a942-78593c376c76" />
<img width="1140" height="855" alt="image" src="https://github.com/user-attachments/assets/0483d230-38dd-4715-a806-cadfd25a193a" />

The dashboard pulls real data from CSV exports and markdown logs, computes health scores, detects trends, flags imbalances, and generates cross-domain insights.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Pages

| Page | Route | What it shows |
|------|-------|---------------|
| **Overview** | `/` | Animated health score ring (weighted composite), quick stats, "doing well" / "needs attention" cards, key lifts table, recovery status |
| **Training** | `/training` | 4 sub-tabs: **Strength** (lifts table, volume chart, overload trends, session frequency, PRs, flags), **Running** (plan phase + empty state), **Steps** (834-day Oura area chart), **Recovery** (readiness, HRV trend, entries table) |
| **Sleep** | `/sleep` | Sleep score, stages stacked bar chart, duration trend, recent nights table |
| **Body** | `/body` | 7-day avg weight, trends (7d/30d/90d), weekly high/low, interactive weight chart with time range toggle |
| **Insights** | `/insights` | AI narrative ("What Your Body Is Saying"), domain status cards, cross-domain correlation previews |

## Data Sources

| Domain | Source | Records |
|--------|--------|---------|
| Strength | `strength/strong_workouts_raw.csv` | 18,213 rows (Sept 2020 – Mar 2026) |
| Recovery | `oura/Recovery_Log.md` + `oura/raw/*.csv` | 94 daily entries + 834 days raw |
| Sleep | `oura/raw/sleepmodel.csv` | 1,103 nights |
| Steps | `oura/raw/dailyactivity.csv` | 834 days |
| Weight | `data/weight.csv` | 1,602 daily entries (Jan 2021 – Apr 2026) |
| Running | `running/Run Log.md` | 0 (first run Apr 12, 2026) |

All data is read server-side via Node.js `fs` in Server Components — no API routes, no database. The strength CSV is cached by file mtime for performance.

## Architecture

```
HealthOS/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Overview
│   │   ├── training/page.tsx   # Training (4 tabs)
│   │   ├── sleep/page.tsx      # Sleep
│   │   ├── body/page.tsx       # Body / Weight
│   │   └── insights/page.tsx   # Insights
│   ├── components/
│   │   ├── ui/                 # shadcn/ui primitives
│   │   ├── layout/             # Sidebar, page header
│   │   ├── shared/             # Score ring, empty state
│   │   ├── training/           # Recharts: volume, overload, steps, HRV, frequency
│   │   ├── sleep/              # Recharts: stages, duration
│   │   ├── body/               # Recharts: weight trend
│   │   └── insights/           # Narrative, correlations
│   └── lib/
│       ├── data/               # Data fetchers (strength, oura, running, weight, health-score)
│       ├── parsers/            # CSV (PapaParse) + markdown table parsers
│       ├── types/              # TypeScript interfaces per domain
│       ├── utils/              # Dates, stats, exercise-to-muscle mapping, est. 1RM
│       └── config/             # Design tokens, chart theme
│
├── strength/                   # Strength agent data + CLAUDE.md
├── running/                    # Running agent data + CLAUDE.md
├── oura/                       # Oura agent data + CLAUDE.md + raw/ CSVs
├── data/                       # Weight CSV
├── dashboard/                  # Legacy HTML dashboard (archived)
├── CLAUDE.md                   # Root agent context
└── DESIGN.md                   # Notion-inspired design system
```

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router, Server Components) |
| Components | shadcn/ui (New York style) + Radix UI |
| Styling | Tailwind CSS |
| Charts | Recharts |
| CSV Parsing | PapaParse |
| Icons | Lucide React |

## Design

Notion-inspired editorial minimalism — warm neutrals, Inter font, whisper-weight borders (`1px solid rgba(0,0,0,0.1)`), multi-layer shadows. Domain colors: Strength (orange `#E8590C`), Running (green `#2B8A3E`), Recovery (blue `#1971C2`), Body (purple `#7048E8`). Full spec in `DESIGN.md`.

## Health Score

Weighted composite: Recovery 40%, Strength 30%, Running 30%. If a domain has no data, its weight redistributes equally to active domains.

- **Strength** scores on: session consistency, recency, progressive overload trends, muscle balance
- **Recovery** scores on: 7-day readiness average mapped to 0–10
- **Running** scores on: plan adherence and mileage (once active)

## Claude Agents

The data files are maintained by four Claude Code agents, each with their own `CLAUDE.md`:

- **Strength** — Logs workouts from Strong app exports, tracks PRs, flags imbalances
- **Running** — AI running coach with 27-week half marathon plan
- **Oura** — Daily recovery/sleep analyst with training recommendations
- **Dashboard** — Legacy HTML dashboard generator (superseded by this Next.js app)

## Adding Data

- **Weight**: Replace `data/weight.csv` with a new export from your weight tracking app (columns: `Date`, `Weight (lb)`)
- **Strength**: Replace `strength/strong_workouts_raw.csv` with a new Strong app export
- **Oura**: Update `oura/Recovery_Log.md` via the Oura agent, or replace raw CSVs in `oura/raw/`
- **Running**: Log runs via the Running agent — it updates `running/Run Log.md`
