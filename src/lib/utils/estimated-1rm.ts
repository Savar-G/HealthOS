/**
 * Epley formula for estimated 1 rep max.
 * Same formula used in PR_History.md: weight * (1 + reps / 30)
 */
export function estimateOneRM(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0
  if (reps === 1) return weight
  return weight * (1 + reps / 30)
}
