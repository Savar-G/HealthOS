# HealthOS

Personal health dashboard tracking strength training, running, sleep, recovery, and body composition.

## Stack

- **Next.js 16** (App Router, Server Components)
- **shadcn/ui** + Tailwind CSS
- **Recharts** for data visualization
- **PapaParse** for CSV parsing

## Data Sources

| Domain | Source | Status |
|--------|--------|--------|
| Strength | `strength/strong_workouts_raw.csv` (18K rows, 2020–2026) | Active |
| Recovery | `oura/Recovery_Log.md` + raw CSVs | Active |
| Running | `running/Run Log.md` | Starting Apr 12 |
| Weight | `data/weight.csv` | Placeholder |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Pages

- `/` — Overview (health score, stats, priorities)
- `/training` — Strength, Running, Steps, Recovery tabs
- `/sleep` — Sleep quality and stages
- `/body` — Weight tracking
- `/insights` — Cross-domain correlations
