import type { TrendDirection } from "./shared"

export interface WorkoutRow {
  date: string
  workoutName: string
  duration: string
  exerciseName: string
  setOrder: number
  weight: number
  reps: number
  distance: number
  seconds: number
  notes: string
  workoutNotes: string
  rpe: number | null
}

export interface WorkoutSession {
  date: string
  name: string
  duration: string
  exercises: ExerciseSet[]
}

export interface ExerciseSet {
  exerciseName: string
  setOrder: number
  weight: number
  reps: number
  estimatedOneRM: number
}

export interface PersonalRecord {
  exerciseName: string
  weight: number
  reps: number
  estimatedOneRM: number
  date: string
  previousBest: number | null
}

export interface MuscleGroupVolume {
  muscleGroup: string
  sets: number
  totalVolume: number // weight * reps summed
}

export interface LiftTrend {
  exerciseName: string
  trend: TrendDirection
  currentWeight: number
  currentReps: number
  estimatedOneRM: number
  dataPoints: { date: string; estimatedOneRM: number }[]
}

export interface StrengthSummary {
  totalSessions: number
  lastWorkoutDate: string | null
  daysSinceLastWorkout: number | null
  sessionsThisMonth: number
  sessionsPerWeek: number // trailing 12 weeks
  recentPRs: PersonalRecord[]
  liftTrends: LiftTrend[]
  muscleVolume: MuscleGroupVolume[]
  weeklySessionCounts: { week: string; count: number }[]
  flags: string[]
}

export type MuscleGroup =
  | "Quads"
  | "Hamstrings"
  | "Glutes"
  | "Back"
  | "Chest"
  | "Shoulders"
  | "Biceps"
  | "Triceps"
  | "Calves"
  | "Core"
  | "Forearms"
  | "Traps"
  | "Other"
