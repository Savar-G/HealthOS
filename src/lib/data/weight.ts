import { parseCSV } from "@/lib/parsers/csv"
import { round } from "@/lib/utils/stats"
import type { WeightEntry, WeightSummary } from "@/lib/types/body"

const WEIGHT_CSV_PATH = "data/weight.csv"

function avgOf(entries: WeightEntry[]): number | null {
  if (entries.length === 0) return null
  return round(entries.reduce((s, e) => s + e.weightLbs, 0) / entries.length, 1)
}

function entriesInLastDays(entries: WeightEntry[], days: number): WeightEntry[] {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  return entries.filter((e) => new Date(e.date) >= cutoff)
}

export function getWeightData(): WeightSummary {
  const raw = parseCSV<Record<string, string>>(WEIGHT_CSV_PATH)

  // Handle both "Date"/"Weight (lb)" and "date"/"weight_lbs" column names
  const entries: WeightEntry[] = raw
    .filter((r) => (r["Date"] || r["date"]) && (r["Weight (lb)"] || r["weight_lbs"]))
    .map((r) => ({
      date: (r["Date"] || r["date"]).replace(/"/g, ""),
      weightLbs: parseFloat((r["Weight (lb)"] || r["weight_lbs"]).replace(/"/g, "")),
    }))
    .filter((r) => !isNaN(r.weightLbs))
    .sort((a, b) => a.date.localeCompare(b.date))

  if (entries.length === 0) {
    return {
      entries: [],
      totalEntries: 0,
      dateRange: null,
      latest: null,
      latestDate: null,
      sevenDayAvg: null,
      thirtyDayAvg: null,
      ninetyDayAvg: null,
      change7d: null,
      change30d: null,
      change90d: null,
      changeThisMonth: null,
      weeklyHigh: null,
      weeklyLow: null,
      trend: null,
    }
  }

  const latest = entries[entries.length - 1]

  // Entries by time window
  const last7 = entriesInLastDays(entries, 7)
  const last30 = entriesInLastDays(entries, 30)
  const last90 = entriesInLastDays(entries, 90)

  // Averages
  const sevenDayAvg = avgOf(last7)
  const thirtyDayAvg = avgOf(last30)
  const ninetyDayAvg = avgOf(last90)

  // Changes (first entry in window vs last)
  function changeInWindow(windowEntries: WeightEntry[]): number | null {
    if (windowEntries.length < 2) return null
    return round(windowEntries[windowEntries.length - 1].weightLbs - windowEntries[0].weightLbs, 1)
  }

  const change7d = changeInWindow(last7)
  const change30d = changeInWindow(last30)
  const change90d = changeInWindow(last90)

  // Change this month
  const monthStart = new Date()
  monthStart.setDate(1)
  const monthStr = monthStart.toISOString().split("T")[0]
  const monthEntries = entries.filter((e) => e.date >= monthStr)
  const changeThisMonth = changeInWindow(monthEntries)

  // Weekly high/low
  const weeklyHigh = last7.length > 0 ? round(Math.max(...last7.map((e) => e.weightLbs)), 1) : null
  const weeklyLow = last7.length > 0 ? round(Math.min(...last7.map((e) => e.weightLbs)), 1) : null

  // Trend direction (7d avg vs 30d avg)
  let trend: WeightSummary["trend"] = null
  if (sevenDayAvg !== null && thirtyDayAvg !== null) {
    const diff = sevenDayAvg - thirtyDayAvg
    if (diff > 0.5) trend = "up"
    else if (diff < -0.5) trend = "down"
    else trend = "flat"
  }

  return {
    entries,
    totalEntries: entries.length,
    dateRange: { from: entries[0].date, to: latest.date },
    latest: round(latest.weightLbs, 1),
    latestDate: latest.date,
    sevenDayAvg,
    thirtyDayAvg,
    ninetyDayAvg,
    change7d,
    change30d,
    change90d,
    changeThisMonth,
    weeklyHigh,
    weeklyLow,
    trend,
  }
}
