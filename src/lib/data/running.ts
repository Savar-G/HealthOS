import { readMarkdownFile } from "@/lib/parsers/markdown-tables"
import type { RunningSummary, TrainingPhase } from "@/lib/types/running"

const RUN_LOG_PATH = "running/Run Log.md"
const TRAINING_PLAN_PATH = "running/Training Plan.md"

export function getRunningData(): RunningSummary {
  const logContent = readMarkdownFile(RUN_LOG_PATH)
  const planContent = readMarkdownFile(TRAINING_PLAN_PATH)

  // Determine current phase from training plan
  const currentPhase: TrainingPhase = {
    phase: 1,
    name: "Return to Running",
    weeks: "1-8",
    focus: "Run/walk progression, pain-free movement",
    currentWeek: null,
  }

  // Check if Week 1 has started (Apr 12)
  const now = new Date()
  const week1Start = new Date("2026-04-12")
  if (now >= week1Start) {
    const weeksElapsed = Math.floor(
      (now.getTime() - week1Start.getTime()) / (7 * 86400000)
    )
    currentPhase.currentWeek = Math.min(weeksElapsed + 1, 8)
  }

  // Parse next session from plan
  let nextSession: RunningSummary["nextSession"] = null
  if (planContent) {
    // Find the first "Upcoming" status session
    const upcomingMatch = planContent.match(
      /####\s+(\w+day,\s+\w+\s+\d+)\s+--\s+(.+?)[\n\r][\s\S]*?\*\*Total Time\*\*\s*\|\s*(.+?)\s*\|/
    )
    if (upcomingMatch) {
      nextSession = {
        date: upcomingMatch[1],
        type: upcomingMatch[2].trim(),
        duration: upcomingMatch[3].trim(),
      }
    } else {
      // Fallback: first session
      nextSession = {
        date: "Sunday, April 12",
        type: "RUN/WALK LONG SESSION",
        duration: "25 minutes",
      }
    }
  }

  return {
    totalRuns: 0,
    totalMiles: 0,
    currentPhase,
    thisWeekMiles: 0,
    nextSession,
    weekSummaries: [],
    runs: [],
  }
}
