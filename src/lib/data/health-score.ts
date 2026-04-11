import { getStrengthData } from "./strength"
import { getRecoveryData } from "./oura"
import { getRunningData } from "./running"
import { round } from "@/lib/utils/stats"
import type { HealthScore } from "@/lib/types/shared"

/**
 * Compute weighted health score.
 * Recovery: 40%, Strength: 30%, Running: 30%.
 * If a domain has no data, redistribute its weight equally.
 */
export function calculateHealthScore(): HealthScore {
  const strength = getStrengthData()
  const recovery = getRecoveryData()
  const running = getRunningData()

  // Determine which domains have data
  const hasStrength = strength.totalSessions > 0
  const hasRecovery = recovery.entries.length > 0
  const hasRunning = running.totalRuns > 0

  const activeDomains = [hasStrength, hasRecovery, hasRunning].filter(Boolean).length

  if (activeDomains === 0) {
    return {
      overall: 0,
      breakdown: { strength: null, running: null, recovery: null },
    }
  }

  // Calculate individual scores (0-10)

  // Strength score
  let strengthScore = 0
  let strengthReason = "No data"
  if (hasStrength) {
    let score = 5 // base

    // Consistency: sessions per week (target 3)
    const consistencyRatio = Math.min(strength.sessionsPerWeek / 3, 1)
    score += consistencyRatio * 2 // up to +2

    // Recency penalty
    if (strength.daysSinceLastWorkout !== null) {
      if (strength.daysSinceLastWorkout <= 3) score += 1
      else if (strength.daysSinceLastWorkout <= 7) score += 0.5
      else if (strength.daysSinceLastWorkout > 14) score -= 2
      else if (strength.daysSinceLastWorkout > 21) score -= 3
    }

    // Progressive overload bonus
    const upTrends = strength.liftTrends.filter((l) => l.trend === "up").length
    const totalTrends = strength.liftTrends.length
    if (totalTrends > 0) {
      score += (upTrends / totalTrends) * 2 // up to +2
    }

    // Flag penalties
    score -= strength.flags.length * 0.3

    strengthScore = round(Math.max(0, Math.min(10, score)))
    strengthReason = `${strength.sessionsPerWeek}/wk, ${strength.daysSinceLastWorkout || 0}d gap, ${upTrends} lifts trending up`
  }

  // Recovery score
  let recoveryScore = 0
  let recoveryReason = "No data"
  if (hasRecovery) {
    const readiness = recovery.sevenDayAvgReadiness
    if (readiness !== null) {
      // Readiness maps roughly: 85+ = 9-10, 70-85 = 6-8, 60-70 = 4-6, <60 = 0-4
      recoveryScore = round(Math.max(0, Math.min(10, (readiness - 40) / 5)))
    }
    recoveryReason = `Readiness ${readiness || "?"}, HRV ${recovery.sevenDayAvgHRV || "?"}ms, ${recovery.recoveryStatus}`
  }

  // Running score
  let runningScore = 0
  let runningReason = "No data"
  if (hasRunning) {
    // Base on adherence — if they're running at all, that's progress
    const adherence = Math.min(running.totalRuns / 3, 1) // 3 runs/week target
    runningScore = round(adherence * 7 + 3) // 3 for showing up, up to 10
    runningReason = `${running.totalRuns} runs, ${running.thisWeekMiles}mi this week`
  }

  // Calculate weights
  let wStrength = hasStrength ? 0.3 : 0
  let wRecovery = hasRecovery ? 0.4 : 0
  let wRunning = hasRunning ? 0.3 : 0

  const totalWeight = wStrength + wRecovery + wRunning
  if (totalWeight > 0) {
    wStrength /= totalWeight
    wRecovery /= totalWeight
    wRunning /= totalWeight
  }

  const overall = round(
    strengthScore * wStrength +
    recoveryScore * wRecovery +
    runningScore * wRunning
  )

  return {
    overall,
    breakdown: {
      strength: hasStrength
        ? { score: strengthScore, weight: round(wStrength * 100, 0), reason: strengthReason }
        : null,
      running: hasRunning
        ? { score: runningScore, weight: round(wRunning * 100, 0), reason: runningReason }
        : null,
      recovery: hasRecovery
        ? { score: recoveryScore, weight: round(wRecovery * 100, 0), reason: recoveryReason }
        : null,
    },
  }
}
