import { readMarkdownFile, parseDatedTables } from "@/lib/parsers/markdown-tables"
import { parseCSV } from "@/lib/parsers/csv"
import { movingAverage, trendDirection, round, parseDurationToMinutes } from "@/lib/utils/stats"
import type { RecoveryEntry, SleepEntry, RecoverySummary } from "@/lib/types/oura"
import type { TrendDirection } from "@/lib/types/shared"

const RECOVERY_LOG_PATH = "oura/Recovery_Log.md"
const OURA_PROFILE_PATH = "oura/Oura_Profile.md"
const SLEEP_CSV_PATH = "oura/raw/sleepmodel.csv"
const ACTIVITY_CSV_PATH = "oura/raw/dailyactivity.csv"

function parseTrendArrow(arrow: string): TrendDirection {
  if (arrow.includes("↑")) return "up"
  if (arrow.includes("↓")) return "down"
  return "flat"
}

function parseNumeric(value: string): number | null {
  const num = parseFloat(value.replace(/[^0-9.\-]/g, ""))
  return isNaN(num) ? null : num
}

function parseRecoveryLog(): RecoveryEntry[] {
  const content = readMarkdownFile(RECOVERY_LOG_PATH)
  if (!content) return []

  const tables = parseDatedTables(content)

  return tables.map((entry) => {
    const m = entry.metrics
    return {
      date: entry.date,
      readinessScore: parseNumeric(m["Readiness Score"]?.value || ""),
      sleepScore: parseNumeric(m["Sleep Score"]?.value || ""),
      hrv: parseNumeric(m["HRV"]?.value || ""),
      restingHR: parseNumeric(m["Resting HR"]?.value || ""),
      lowestHR: parseNumeric(m["Lowest HR"]?.value || ""),
      deepSleep: m["Deep Sleep"]?.value || null,
      totalSleep: m["Total Sleep"]?.value || null,
      bodyTempDev: parseNumeric(m["Body Temp Dev"]?.value || ""),
      activityScore: parseNumeric(m["Activity Score"]?.value || ""),
      steps: parseNumeric(m["Steps"]?.value?.replace(/,/g, "") || ""),
      trends: Object.fromEntries(
        Object.entries(m).map(([key, val]) => [key, parseTrendArrow(val.trend)])
      ),
    }
  })
}

function parseOuraProfile(): {
  sevenDayAvgHRV: number | null
  sevenDayAvgReadiness: number | null
  sevenDayAvgRestingHR: number | null
  sleepQualityTrend: TrendDirection
  recoveryStatus: "green" | "yellow" | "red"
  analystNote: string
} {
  const content = readMarkdownFile(OURA_PROFILE_PATH)
  if (!content) {
    return {
      sevenDayAvgHRV: null,
      sevenDayAvgReadiness: null,
      sevenDayAvgRestingHR: null,
      sleepQualityTrend: "flat",
      recoveryStatus: "yellow",
      analystNote: "No Oura profile data available.",
    }
  }

  const hrvMatch = content.match(/7-day avg HRV:\*\*\s*(\d+)/i)
  const readinessMatch = content.match(/7-day avg readiness:\*\*\s*(\d+)/i)
  const restingHRMatch = content.match(/7-day avg resting HR:\*\*\s*([\d.]+)/i)
  const sleepTrendMatch = content.match(/Sleep quality trend:\*\*\s*(\w+)/i)
  const statusMatch = content.match(/recovery status:\*\*\s*🟢|🟡|🔴/i)
  const noteMatch = content.match(/Analyst note:\*\*\s*(.+)/i)

  let recoveryStatus: "green" | "yellow" | "red" = "yellow"
  if (statusMatch) {
    const s = statusMatch[0]
    if (s.includes("🟢")) recoveryStatus = "green"
    else if (s.includes("🔴")) recoveryStatus = "red"
  }

  let sleepTrend: TrendDirection = "flat"
  if (sleepTrendMatch) {
    const t = sleepTrendMatch[1].toLowerCase()
    if (t === "improving") sleepTrend = "up"
    else if (t === "declining") sleepTrend = "down"
  }

  return {
    sevenDayAvgHRV: hrvMatch ? parseFloat(hrvMatch[1]) : null,
    sevenDayAvgReadiness: readinessMatch ? parseFloat(readinessMatch[1]) : null,
    sevenDayAvgRestingHR: restingHRMatch ? parseFloat(restingHRMatch[1]) : null,
    sleepQualityTrend: sleepTrend,
    recoveryStatus,
    analystNote: noteMatch?.[1] || "",
  }
}

export function getRecoveryData(): RecoverySummary {
  const entries = parseRecoveryLog()
  const profile = parseOuraProfile()

  const lastEntry = entries[entries.length - 1]

  return {
    lastEntryDate: lastEntry?.date || null,
    sevenDayAvgHRV: profile.sevenDayAvgHRV,
    sevenDayAvgReadiness: profile.sevenDayAvgReadiness,
    sevenDayAvgRestingHR: profile.sevenDayAvgRestingHR,
    sleepQualityTrend: profile.sleepQualityTrend,
    recoveryStatus: profile.recoveryStatus,
    analystNote: profile.analystNote,
    baselines: null, // TODO: parse from profile if needed
    entries,
  }
}

export function getSleepData(): SleepEntry[] {
  const raw = parseCSV<Record<string, string>>(SLEEP_CSV_PATH, ";")
  if (raw.length === 0) return []

  return raw
    .filter((r) => r["type"] === "long_sleep" && r["day"])
    .map((r) => ({
      date: r["day"] || "",
      deepSleepDuration: parseInt(r["deep_sleep_duration"] || "0"),
      remSleepDuration: parseInt(r["rem_sleep_duration"] || "0"),
      lightSleepDuration: parseInt(r["light_sleep_duration"] || "0"),
      totalSleepDuration: parseInt(r["total_sleep_duration"] || "0"),
      efficiency: r["efficiency"] ? parseInt(r["efficiency"]) : null,
      averageHRV: r["average_hrv"] ? parseFloat(r["average_hrv"]) : null,
      averageHeartRate: r["average_heart_rate"]
        ? parseFloat(r["average_heart_rate"])
        : null,
      lowestHeartRate: r["lowest_heart_rate"]
        ? parseInt(r["lowest_heart_rate"])
        : null,
      bedtimeStart: r["bedtime_start"] || null,
      bedtimeEnd: r["bedtime_end"] || null,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

export function getStepsData(): { date: string; steps: number }[] {
  const raw = parseCSV<Record<string, string>>(ACTIVITY_CSV_PATH, ";")
  if (raw.length === 0) return []

  return raw
    .filter((r) => r["day"] && r["steps"])
    .map((r) => ({
      date: r["day"],
      steps: parseInt(r["steps"]),
    }))
    .filter((r) => !isNaN(r.steps))
    .sort((a, b) => a.date.localeCompare(b.date))
}
