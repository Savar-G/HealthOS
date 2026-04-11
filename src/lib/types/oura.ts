import type { TrendDirection } from "./shared"

export interface RecoveryEntry {
  date: string
  readinessScore: number | null
  sleepScore: number | null
  hrv: number | null // ms
  restingHR: number | null // bpm
  lowestHR: number | null // bpm
  deepSleep: string | null // "Xh Xm"
  totalSleep: string | null // "Xh Xm"
  bodyTempDev: number | null // °C
  activityScore: number | null
  steps: number | null
  trends: Record<string, TrendDirection>
}

export interface SleepEntry {
  date: string
  deepSleepDuration: number // seconds
  remSleepDuration: number // seconds
  lightSleepDuration: number // seconds
  totalSleepDuration: number // seconds
  efficiency: number | null
  averageHRV: number | null
  averageHeartRate: number | null
  lowestHeartRate: number | null
  bedtimeStart: string | null
  bedtimeEnd: string | null
}

export interface OuraBaselines {
  readiness: { avg: number; min: number; max: number }
  sleepScore: { avg: number; min: number; max: number }
  hrv: { avg: number; min: number; max: number }
  restingHR: { avg: number; min: number; max: number }
  deepSleep: { avg: string; min: string; max: string }
}

export interface RecoverySummary {
  lastEntryDate: string | null
  sevenDayAvgHRV: number | null
  sevenDayAvgReadiness: number | null
  sevenDayAvgRestingHR: number | null
  sleepQualityTrend: TrendDirection
  recoveryStatus: "green" | "yellow" | "red"
  analystNote: string
  baselines: OuraBaselines | null
  entries: RecoveryEntry[]
}
