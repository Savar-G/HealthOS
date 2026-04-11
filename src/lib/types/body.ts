export interface WeightEntry {
  date: string
  weightLbs: number
}

export interface WeightSummary {
  entries: WeightEntry[]
  current: number | null
  sevenDayAvg: number | null
  thirtyDayAvg: number | null
  trend: "up" | "down" | "flat" | null
  changeThisMonth: number | null
}
