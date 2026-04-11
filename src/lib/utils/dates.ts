/**
 * Get the Monday-based ISO week string for a date: "YYYY-WXX"
 */
export function getWeekKey(dateStr: string): string {
  const d = new Date(dateStr)
  const jan1 = new Date(d.getFullYear(), 0, 1)
  const dayOfYear = Math.floor((d.getTime() - jan1.getTime()) / 86400000) + 1
  const weekNum = Math.ceil(dayOfYear / 7)
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, "0")}`
}

/**
 * Days between two dates.
 */
export function daysBetween(dateA: string, dateB: string): number {
  const a = new Date(dateA)
  const b = new Date(dateB)
  return Math.floor(Math.abs(b.getTime() - a.getTime()) / 86400000)
}

/**
 * Format a date to "Mon DD, YYYY"
 */
export function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

/**
 * Get YYYY-MM-DD for today.
 */
export function today(): string {
  return new Date().toISOString().split("T")[0]
}

/**
 * Check if a date falls within the last N days from today.
 */
export function isWithinDays(dateStr: string, n: number): boolean {
  return daysBetween(dateStr, today()) <= n
}

/**
 * Get the start of the current month as YYYY-MM-DD.
 */
export function startOfMonth(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`
}
