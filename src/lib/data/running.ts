import { readMarkdownFile } from "@/lib/parsers/markdown-tables"
import type {
  RunEntry,
  RunningSummary,
  TrainingPhase,
  WeekSummary,
} from "@/lib/types/running"

const RUN_LOG_PATH = "running/Run Log.md"
const TRAINING_PLAN_PATH = "running/Training Plan.md"

/**
 * Split a pipe-table row into cell strings, ignoring leading/trailing pipes.
 */
function splitRow(row: string): string[] {
  return row
    .split("|")
    .slice(1, -1)
    .map((c) => c.trim())
}

/**
 * Extract the "Run Log Table" section from Run Log.md and parse each entry.
 */
function parseRunLogTable(content: string): RunEntry[] {
  if (!content) return []

  const sectionIdx = content.indexOf("## Run Log Table")
  if (sectionIdx === -1) return []
  // End at the next H2 header
  const nextSectionIdx = content.indexOf("\n## ", sectionIdx + 1)
  const section =
    nextSectionIdx === -1
      ? content.slice(sectionIdx)
      : content.slice(sectionIdx, nextSectionIdx)

  const lines = section.split("\n").filter((l) => l.trim().startsWith("|"))
  // lines[0] = header, lines[1] = separator, rest = data
  const dataLines = lines.slice(2)

  const entries: RunEntry[] = []
  for (const line of dataLines) {
    const cells = splitRow(line)
    if (cells.length < 13) continue
    const [num, date, day, runType, planned, actualDist, time, avgHR, avgPace, zone, rwRatio, effort, notes] = cells

    // Skip skipped/empty sessions for distance parsing but still record them
    const parsedDist = parseFloat(actualDist)
    const parsedTime = parseInt(time)
    const parsedHR = parseInt(avgHR)
    const parsedEffort = parseInt(effort)

    entries.push({
      number: parseInt(num) || 0,
      date: date || "",
      day: day || "",
      runType: runType || "",
      planned: planned || "",
      actualDist: isNaN(parsedDist) ? null : parsedDist,
      time: isNaN(parsedTime) ? null : parsedTime,
      avgHR: isNaN(parsedHR) ? null : parsedHR,
      avgPace: avgPace && avgPace !== "--" ? avgPace : null,
      zone: zone && zone !== "--" ? zone : null,
      rwRatio: rwRatio && rwRatio !== "--" ? rwRatio : null,
      effort: isNaN(parsedEffort) ? null : parsedEffort,
      notes: notes || "",
    })
  }
  return entries
}

/**
 * Parse the Weekly Mileage Summary table.
 */
function parseWeekSummaries(content: string): WeekSummary[] {
  if (!content) return []

  const sectionIdx = content.indexOf("## Weekly Mileage Summary")
  if (sectionIdx === -1) return []
  const nextSectionIdx = content.indexOf("\n## ", sectionIdx + 1)
  const section =
    nextSectionIdx === -1
      ? content.slice(sectionIdx)
      : content.slice(sectionIdx, nextSectionIdx)

  const lines = section.split("\n").filter((l) => l.trim().startsWith("|"))
  const dataLines = lines.slice(2)

  const results: WeekSummary[] = []
  for (const line of dataLines) {
    const cells = splitRow(line)
    if (cells.length < 7) continue
    const [weekLabel, dates, target, actual, tue, fri, notes] = cells

    const weekNumMatch = weekLabel.match(/(\d+)/)
    const weekNum = weekNumMatch ? parseInt(weekNumMatch[1]) : 0

    const targetMatch = target.match(/[\d.]+/)
    const targetMiles = targetMatch ? parseFloat(targetMatch[0]) : 0

    const actualMatch = actual.match(/[\d.]+/)
    const actualMiles = actualMatch ? parseFloat(actualMatch[0]) : null

    // longRun: take max of tue/fri miles if numeric
    const tueMatch = tue.match(/[\d.]+/)
    const friMatch = fri.match(/[\d.]+/)
    const tueMi = tueMatch ? parseFloat(tueMatch[0]) : null
    const friMi = friMatch ? parseFloat(friMatch[0]) : null
    const longRun =
      tueMi !== null || friMi !== null
        ? Math.max(tueMi ?? 0, friMi ?? 0)
        : null

    results.push({
      week: weekNum,
      dates: dates || "",
      targetMiles,
      actualMiles,
      longRun,
      notes: notes || "",
    })
  }
  return results
}

/**
 * Determine the current training phase and week from the plan + today's date.
 */
function getCurrentPhase(planContent: string): TrainingPhase {
  // Phase 1: Return to Running, weeks 1-10 (Apr 14 start)
  const phase: TrainingPhase = {
    phase: 1,
    name: "Return to Running",
    weeks: "1-10",
    focus: "Run/walk progression, pain-free movement",
    currentWeek: null,
  }

  const programStart = new Date("2026-04-14")
  const now = new Date()
  if (now >= programStart) {
    const weeksElapsed = Math.floor(
      (now.getTime() - programStart.getTime()) / (7 * 86400000)
    )
    phase.currentWeek = Math.min(weeksElapsed + 1, 10)
  }

  // If we have plan content we could refine, but Phase 1 covers weeks 1-10
  void planContent
  return phase
}

/**
 * Find the next upcoming session by scanning the plan for the first session
 * whose date is after today.
 */
function getNextSession(
  planContent: string,
  runs: RunEntry[]
): RunningSummary["nextSession"] {
  if (!planContent) return null

  // Match session headers like "#### Tuesday, April 14 -- ZONE 2 RUN/WALK"
  const sessionRegex =
    /####\s+(\w+day),?\s+(\w+\s+\d+)\s+[—-]+\s+(.+?)[\n\r]/g
  const sessions: {
    dayName: string
    date: string
    type: string
    fullLabel: string
  }[] = []
  let match
  while ((match = sessionRegex.exec(planContent)) !== null) {
    sessions.push({
      dayName: match[1],
      date: match[2],
      type: match[3].trim(),
      fullLabel: `${match[1]}, ${match[2]}`,
    })
  }

  if (sessions.length === 0) return null

  // Build a set of logged dates (for completed sessions) to skip
  const loggedLabels = new Set<string>()
  for (const run of runs) {
    if (!run.date) continue
    const d = new Date(run.date)
    if (isNaN(d.getTime())) continue
    loggedLabels.add(
      d.toLocaleDateString("en-US", { month: "long", day: "numeric" })
    )
  }

  // Find first session whose parsed date is strictly after today or not yet logged
  const now = new Date()
  const currentYear = now.getFullYear()
  for (const s of sessions) {
    const sessionDate = new Date(`${s.date}, ${currentYear}`)
    if (isNaN(sessionDate.getTime())) continue
    if (sessionDate > now && !loggedLabels.has(s.date)) {
      // Try to extract total time
      const labelIdx = planContent.indexOf(s.fullLabel)
      const slice = planContent.slice(labelIdx, labelIdx + 1500)
      const timeMatch = slice.match(/\*\*Total Time\*\*\s*\|\s*([^|\n]+?)\s*\|/)
      return {
        date: s.fullLabel,
        type: s.type,
        duration: timeMatch ? timeMatch[1].trim() : "",
      }
    }
  }
  return null
}

/**
 * Parse the "This week" field from State of My Running to get week mileage.
 * Falls back to summing recent runs within the last 7 days.
 */
function computeThisWeekMiles(runs: RunEntry[], stateContent: string): number {
  const stateMatch = stateContent.match(
    /\*\*This week\*\*\s*\|\s*([\d.]+)\s*\/?/i
  )
  if (stateMatch) {
    const miles = parseFloat(stateMatch[1])
    if (!isNaN(miles)) return miles
  }

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  return runs
    .filter((r) => r.date && new Date(r.date) >= sevenDaysAgo && r.actualDist)
    .reduce((sum, r) => sum + (r.actualDist || 0), 0)
}

export function getRunningData(): RunningSummary {
  const logContent = readMarkdownFile(RUN_LOG_PATH)
  const planContent = readMarkdownFile(TRAINING_PLAN_PATH)

  const runs = parseRunLogTable(logContent)
  const weekSummaries = parseWeekSummaries(logContent)
  const currentPhase = getCurrentPhase(planContent)
  const nextSession = getNextSession(planContent, runs)

  // Completed runs = those with actual distance logged
  const completed = runs.filter((r) => r.actualDist !== null && r.actualDist > 0)
  const totalRuns = completed.length
  const totalMiles = completed.reduce((s, r) => s + (r.actualDist || 0), 0)
  const thisWeekMiles = computeThisWeekMiles(completed, logContent)

  return {
    totalRuns,
    totalMiles: Math.round(totalMiles * 100) / 100,
    currentPhase,
    thisWeekMiles: Math.round(thisWeekMiles * 100) / 100,
    nextSession,
    weekSummaries,
    runs,
  }
}
