export interface RunEntry {
  number: number
  date: string
  day: string
  runType: string
  planned: string
  actualDist: number | null
  time: number | null // minutes
  avgHR: number | null
  avgPace: string | null
  zone: string | null
  rwRatio: string | null
  effort: number | null
  notes: string
}

export interface WeekSummary {
  week: number
  dates: string
  targetMiles: number
  actualMiles: number | null
  longRun: number | null
  notes: string
}

export interface TrainingPhase {
  phase: number
  name: string
  weeks: string
  focus: string
  currentWeek: number | null
}

export interface RunningSummary {
  totalRuns: number
  totalMiles: number
  currentPhase: TrainingPhase
  thisWeekMiles: number
  nextSession: { date: string; type: string; duration: string } | null
  weekSummaries: WeekSummary[]
  runs: RunEntry[]
}
