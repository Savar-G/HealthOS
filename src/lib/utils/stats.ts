import type { TrendDirection } from "@/lib/types/shared"

/**
 * Compute a simple moving average over the last N values.
 */
export function movingAverage(values: number[], window: number): number | null {
  if (values.length === 0) return null
  const slice = values.slice(-window)
  return slice.reduce((sum, v) => sum + v, 0) / slice.length
}

/**
 * Determine trend direction from two averages.
 * "up" if newer > older by threshold%, "down" if lower, else "flat".
 */
export function trendDirection(
  older: number,
  newer: number,
  thresholdPct: number = 5
): TrendDirection {
  if (older === 0) return "flat"
  const changePct = ((newer - older) / older) * 100
  if (changePct > thresholdPct) return "up"
  if (changePct < -thresholdPct) return "down"
  return "flat"
}

/**
 * Parse a duration string like "2h 1m" or "1h 45m" into total minutes.
 */
export function parseDurationToMinutes(duration: string): number {
  const hours = duration.match(/(\d+)h/)?.[1]
  const mins = duration.match(/(\d+)m/)?.[1]
  return (parseInt(hours || "0") * 60) + parseInt(mins || "0")
}

/**
 * Round to N decimal places.
 */
export function round(value: number, decimals: number = 1): number {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}
