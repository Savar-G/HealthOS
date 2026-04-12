export interface WeightEntry {
  date: string
  weightLbs: number
}

export interface WeightSummary {
  entries: WeightEntry[]
  totalEntries: number
  dateRange: { from: string; to: string } | null

  // Current
  latest: number | null
  latestDate: string | null

  // Averages
  sevenDayAvg: number | null
  thirtyDayAvg: number | null
  ninetyDayAvg: number | null

  // Trends (change in lbs)
  change7d: number | null
  change30d: number | null
  change90d: number | null
  changeThisMonth: number | null

  // Recent stats (last 7 days)
  weeklyHigh: number | null
  weeklyLow: number | null

  // Overall direction
  trend: "up" | "down" | "flat" | null
}
