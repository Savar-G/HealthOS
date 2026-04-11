import { parseCSV } from "@/lib/parsers/csv"
import { movingAverage, trendDirection, round } from "@/lib/utils/stats"
import type { WeightEntry, WeightSummary } from "@/lib/types/body"

const WEIGHT_CSV_PATH = "data/weight.csv"

export function getWeightData(): WeightSummary {
  const raw = parseCSV<Record<string, string>>(WEIGHT_CSV_PATH)

  const entries: WeightEntry[] = raw
    .filter((r) => r["date"] && r["weight_lbs"])
    .map((r) => ({
      date: r["date"],
      weightLbs: parseFloat(r["weight_lbs"]),
    }))
    .filter((r) => !isNaN(r.weightLbs))
    .sort((a, b) => a.date.localeCompare(b.date))

  if (entries.length === 0) {
    return {
      entries: [],
      current: null,
      sevenDayAvg: null,
      thirtyDayAvg: null,
      trend: null,
      changeThisMonth: null,
    }
  }

  const weights = entries.map((e) => e.weightLbs)
  const current = weights[weights.length - 1]
  const sevenDayAvg = movingAverage(weights, 7)
  const thirtyDayAvg = movingAverage(weights, 30)

  let trend: WeightSummary["trend"] = null
  if (sevenDayAvg && thirtyDayAvg) {
    trend = trendDirection(thirtyDayAvg, sevenDayAvg, 1)
  }

  // Change this month
  const monthStart = new Date()
  monthStart.setDate(1)
  const monthEntries = entries.filter(
    (e) => new Date(e.date) >= monthStart
  )
  const changeThisMonth =
    monthEntries.length >= 2
      ? round(
          monthEntries[monthEntries.length - 1].weightLbs -
            monthEntries[0].weightLbs,
          1
        )
      : null

  return {
    entries,
    current: round(current, 1),
    sevenDayAvg: sevenDayAvg ? round(sevenDayAvg, 1) : null,
    thirtyDayAvg: thirtyDayAvg ? round(thirtyDayAvg, 1) : null,
    trend,
    changeThisMonth,
  }
}
