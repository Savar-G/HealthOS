import fs from "fs"
import path from "path"
import { parseCSV } from "@/lib/parsers/csv"
import { estimateOneRM } from "@/lib/utils/estimated-1rm"
import { exerciseToMuscleGroup } from "@/lib/utils/exercise-mapping"
import { getWeekKey, daysBetween, today, startOfMonth } from "@/lib/utils/dates"
import { trendDirection, round } from "@/lib/utils/stats"
import type {
  WorkoutRow,
  WorkoutSession,
  ExerciseSet,
  PersonalRecord,
  MuscleGroupVolume,
  LiftTrend,
  StrengthSummary,
} from "@/lib/types/strength"

const CSV_PATH = "strength/strong_workouts_raw.csv"

// Module-level cache
let cachedData: StrengthSummary | null = null
let cachedMtime: number = 0

function parseRows(): WorkoutRow[] {
  const raw = parseCSV<Record<string, string>>(CSV_PATH)

  return raw
    .filter((r) => r["Exercise Name"] && r["Date"])
    .map((r) => ({
      date: r["Date"]?.split(" ")[0] || "",
      workoutName: r["Workout Name"] || "",
      duration: r["Duration"] || "",
      exerciseName: (r["Exercise Name"] || "").trim(),
      setOrder: parseInt(r["Set Order"] || "0"),
      weight: parseFloat(r["Weight"] || "0"),
      reps: parseFloat(r["Reps"] || "0"),
      distance: parseFloat(r["Distance"] || "0"),
      seconds: parseFloat(r["Seconds"] || "0"),
      notes: r["Notes"] || "",
      workoutNotes: r["Workout Notes"] || "",
      rpe: r["RPE"] ? parseFloat(r["RPE"]) : null,
    }))
}

function groupIntoSessions(rows: WorkoutRow[]): WorkoutSession[] {
  const sessionMap = new Map<string, WorkoutSession>()

  for (const row of rows) {
    const key = `${row.date}|${row.workoutName}`
    if (!sessionMap.has(key)) {
      sessionMap.set(key, {
        date: row.date,
        name: row.workoutName,
        duration: row.duration,
        exercises: [],
      })
    }
    sessionMap.get(key)!.exercises.push({
      exerciseName: row.exerciseName,
      setOrder: row.setOrder,
      weight: row.weight,
      reps: row.reps,
      estimatedOneRM: round(estimateOneRM(row.weight, row.reps)),
    })
  }

  return Array.from(sessionMap.values()).sort(
    (a, b) => a.date.localeCompare(b.date)
  )
}

function computePRs(sessions: WorkoutSession[]): {
  allTimePRs: Map<string, PersonalRecord>
  recentPRs: PersonalRecord[]
} {
  const bestByExercise = new Map<string, { oneRM: number; record: PersonalRecord }>()
  const recentPRs: PersonalRecord[] = []
  const sixtyDaysAgo = new Date()
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

  for (const session of sessions) {
    for (const set of session.exercises) {
      if (set.weight <= 0 || set.reps <= 0) continue

      const oneRM = set.estimatedOneRM
      const existing = bestByExercise.get(set.exerciseName)

      if (!existing || oneRM > existing.oneRM) {
        const record: PersonalRecord = {
          exerciseName: set.exerciseName,
          weight: set.weight,
          reps: set.reps,
          estimatedOneRM: round(oneRM),
          date: session.date,
          previousBest: existing ? round(existing.oneRM) : null,
        }
        bestByExercise.set(set.exerciseName, { oneRM, record })

        if (new Date(session.date) >= sixtyDaysAgo) {
          recentPRs.push(record)
        }
      }
    }
  }

  const allTimePRs = new Map<string, PersonalRecord>()
  for (const [name, { record }] of bestByExercise) {
    allTimePRs.set(name, record)
  }

  return {
    allTimePRs,
    recentPRs: recentPRs.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10),
  }
}

function computeMuscleVolume(rows: WorkoutRow[], days: number): MuscleGroupVolume[] {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)

  const volumeMap = new Map<string, { sets: number; totalVolume: number }>()
  const seen = new Set<string>()

  for (const row of rows) {
    if (new Date(row.date) < cutoff) continue
    if (row.weight <= 0 || row.reps <= 0) continue

    const muscle = exerciseToMuscleGroup(row.exerciseName)
    const setKey = `${row.date}|${row.exerciseName}|${row.setOrder}`

    if (seen.has(setKey)) continue
    seen.add(setKey)

    const existing = volumeMap.get(muscle) || { sets: 0, totalVolume: 0 }
    existing.sets += 1
    existing.totalVolume += row.weight * row.reps
    volumeMap.set(muscle, existing)
  }

  return Array.from(volumeMap.entries())
    .map(([muscleGroup, data]) => ({
      muscleGroup,
      sets: data.sets,
      totalVolume: round(data.totalVolume, 0),
    }))
    .sort((a, b) => b.sets - a.sets)
}

function computeLiftTrends(sessions: WorkoutSession[]): LiftTrend[] {
  // Track key lifts — exercises used in the last 60 days
  const recentExercises = new Set<string>()
  const sixtyDaysAgo = new Date()
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

  for (const session of sessions) {
    if (new Date(session.date) < sixtyDaysAgo) continue
    for (const set of session.exercises) {
      if (set.weight > 0 && set.reps > 0) {
        recentExercises.add(set.exerciseName)
      }
    }
  }

  const trends: LiftTrend[] = []

  for (const exercise of recentExercises) {
    const dataPoints: { date: string; estimatedOneRM: number }[] = []

    for (const session of sessions) {
      const sets = session.exercises.filter(
        (s) => s.exerciseName === exercise && s.weight > 0 && s.reps > 0
      )
      if (sets.length === 0) continue

      const bestOneRM = Math.max(...sets.map((s) => s.estimatedOneRM))
      dataPoints.push({ date: session.date, estimatedOneRM: round(bestOneRM) })
    }

    if (dataPoints.length < 2) continue

    const last6 = dataPoints.slice(-6)
    const firstHalf = last6.slice(0, Math.floor(last6.length / 2))
    const secondHalf = last6.slice(Math.floor(last6.length / 2))

    const avgFirst =
      firstHalf.reduce((s, d) => s + d.estimatedOneRM, 0) / firstHalf.length
    const avgSecond =
      secondHalf.reduce((s, d) => s + d.estimatedOneRM, 0) / secondHalf.length

    const latest = dataPoints[dataPoints.length - 1]
    const latestSession = sessions
      .slice()
      .reverse()
      .find((s) =>
        s.exercises.some((e) => e.exerciseName === exercise && e.weight > 0)
      )

    const latestSet = latestSession?.exercises
      .filter((e) => e.exerciseName === exercise && e.weight > 0)
      .sort((a, b) => b.estimatedOneRM - a.estimatedOneRM)[0]

    trends.push({
      exerciseName: exercise,
      trend: trendDirection(avgFirst, avgSecond, 3),
      currentWeight: latestSet?.weight || 0,
      currentReps: latestSet?.reps || 0,
      estimatedOneRM: latest.estimatedOneRM,
      dataPoints: dataPoints.slice(-12),
    })
  }

  return trends.sort((a, b) => b.estimatedOneRM - a.estimatedOneRM)
}

function computeWeeklySessions(sessions: WorkoutSession[]): { week: string; count: number }[] {
  const weekMap = new Map<string, number>()

  for (const session of sessions) {
    const week = getWeekKey(session.date)
    weekMap.set(week, (weekMap.get(week) || 0) + 1)
  }

  return Array.from(weekMap.entries())
    .map(([week, count]) => ({ week, count }))
    .sort((a, b) => a.week.localeCompare(b.week))
    .slice(-12)
}

export function getStrengthData(): StrengthSummary {
  // Check cache
  const csvPath = path.join(process.cwd(), CSV_PATH)
  if (fs.existsSync(csvPath)) {
    const stat = fs.statSync(csvPath)
    if (cachedData && stat.mtimeMs === cachedMtime) return cachedData
    cachedMtime = stat.mtimeMs
  }

  const rows = parseRows()
  const sessions = groupIntoSessions(rows)
  const { recentPRs } = computePRs(sessions)
  const muscleVolume = computeMuscleVolume(rows, 30)
  const liftTrends = computeLiftTrends(sessions)
  const weeklySessionCounts = computeWeeklySessions(sessions)

  const lastSession = sessions[sessions.length - 1] || null
  const monthStart = startOfMonth()
  const sessionsThisMonth = sessions.filter((s) => s.date >= monthStart).length

  // Sessions per week (trailing 12 weeks)
  const twelveWeeksAgo = new Date()
  twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84)
  const recentSessions = sessions.filter(
    (s) => new Date(s.date) >= twelveWeeksAgo
  )
  const sessionsPerWeek = round(recentSessions.length / 12)

  // Flags
  const flags: string[] = []
  const daysSinceLast = lastSession
    ? daysBetween(lastSession.date, today())
    : null

  if (daysSinceLast && daysSinceLast > 14) {
    flags.push(`${daysSinceLast}-day training gap — last workout ${lastSession!.date}`)
  }

  // Check hamstring vs quad ratio
  const quads = muscleVolume.find((m) => m.muscleGroup === "Quads")
  const hams = muscleVolume.find((m) => m.muscleGroup === "Hamstrings")
  if (quads && (!hams || quads.sets / Math.max(hams.sets, 1) > 3)) {
    const ratio = hams ? round(quads.sets / hams.sets) : "∞"
    flags.push(`Hamstring volume critically low — ${ratio}:1 quad:ham ratio`)
  }

  // Check for stalled lifts
  for (const lift of liftTrends) {
    if (lift.trend === "flat" && lift.dataPoints.length >= 3) {
      flags.push(`${lift.exerciseName} stalled at ${lift.currentWeight}×${lift.currentReps}`)
    }
    if (lift.trend === "down") {
      flags.push(`${lift.exerciseName} trending down`)
    }
  }

  const result: StrengthSummary = {
    totalSessions: sessions.length,
    lastWorkoutDate: lastSession?.date || null,
    daysSinceLastWorkout: daysSinceLast,
    sessionsThisMonth,
    sessionsPerWeek,
    recentPRs,
    liftTrends,
    muscleVolume,
    weeklySessionCounts,
    flags: flags.slice(0, 5),
  }

  cachedData = result
  return result
}
