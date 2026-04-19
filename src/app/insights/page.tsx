import { PageHeader } from "@/components/layout/page-header"
import { getStrengthData } from "@/lib/data/strength"
import { getRecoveryData } from "@/lib/data/oura"
import { getRunningData } from "@/lib/data/running"

export const dynamic = "force-dynamic"

export default function InsightsPage() {
  const strength = getStrengthData()
  const recovery = getRecoveryData()
  const running = getRunningData()

  const hasMultipleDomains =
    (strength.totalSessions > 0 ? 1 : 0) +
    (recovery.entries.length > 0 ? 1 : 0) +
    (running.totalRuns > 0 ? 1 : 0) >= 2

  // Build narrative — composed from whatever domains are active right now
  const narrativeParagraphs: string[] = []

  const readiness = recovery.sevenDayAvgReadiness
  const hrv = recovery.sevenDayAvgHRV
  const gap = strength.daysSinceLastWorkout
  const recoveryStatus = recovery.recoveryStatus

  // Strength — framing depends on whether there's an active gap
  if (strength.totalSessions > 0) {
    if (gap !== null && gap > 14) {
      narrativeParagraphs.push(
        `You've been away from the gym for ${gap} days. With ${strength.totalSessions} lifetime sessions, muscle memory is deeply ingrained — but measurable strength loss begins around two weeks of detraining, and you're past that. Ease back in at 80-85% of your previous working weights and expect a 2-4 week rebuild.`
      )
    } else if (strength.sessionsThisMonth > 0) {
      narrativeParagraphs.push(
        `Strength training is active — ${strength.sessionsThisMonth} session${strength.sessionsThisMonth === 1 ? "" : "s"} this month across ${strength.totalSessions} lifetime sessions. ${strength.recentPRs.length > 0 ? `You've hit ${strength.recentPRs.length} PR${strength.recentPRs.length === 1 ? "" : "s"} in the last 60 days — progressive overload is working.` : "No new PRs in the last 60 days; expect rebuilding-phase progress instead of records."}`
      )
    }
  }

  // Recovery — tie it to the current training load
  if (readiness !== null && hrv !== null) {
    const readinessLevel = readiness >= 70 ? "solid" : readiness >= 60 ? "moderate" : "low"
    const statusText =
      recoveryStatus === "green"
        ? "You're cleared to train — readiness, HRV, and resting HR are all trending the right way."
        : recoveryStatus === "yellow"
          ? "Recovery is mixed. Hold intensity where you are; don't add volume this week."
          : "Your body is signaling stress. Back off intensity, prioritize sleep, and watch HRV over the next 3 days."
    narrativeParagraphs.push(
      `Recovery is ${readinessLevel} — 7-day readiness ${readiness}, HRV ${hrv}ms. ${statusText}`
    )
  }

  // Running — phase-aware narrative once the program is live
  if (running.totalRuns > 0) {
    const completed = running.runs.filter((r) => r.actualDist !== null)
    const last = completed[completed.length - 1]
    narrativeParagraphs.push(
      `Running is live. You've logged ${running.totalRuns} run${running.totalRuns === 1 ? "" : "s"} (${running.totalMiles.toFixed(2)} mi total) in Phase ${running.currentPhase.phase} — ${running.currentPhase.name}. ${last ? `Last session: ${last.actualDist} mi at ${last.avgPace ?? "unknown pace"}, HR ${last.avgHR ?? "—"} bpm, effort ${last.effort ?? "—"}/10.` : ""} With only 2 sessions/week, every run is load-bearing — missed runs can't be made up.`
    )
  }

  // Running + strength interference — only flag if running is just starting
  if (running.totalRuns > 0 && running.totalRuns < 4 && strength.totalSessions > 0) {
    const hamFlag = strength.flags.find((f) => f.toLowerCase().includes("hamstring"))
    if (hamFlag) {
      narrativeParagraphs.push(
        `Heads up on the running-strength interface: your quad-to-hamstring volume ratio is skewed. Hamstrings absorb eccentric load with every stride — prioritize RDLs and leg curls in the next few sessions to protect the running progression.`
      )
    }
  }

  if (narrativeParagraphs.length === 0 && strength.totalSessions > 0) {
    narrativeParagraphs.push(
      `With ${strength.totalSessions} training sessions logged, your strength data shows consistent progressive overload on key lifts. Cross-domain insights become richer as you layer in Oura recovery data and running logs.`
    )
  }

  // Time Machine — year-over-year comparisons
  // We'd need to parse the CSV for same-period data from last year
  // For now, show what exercises we can compare

  return (
    <>
      <PageHeader title="Insights" subtitle="Cross-domain correlations and AI narrative" />

      <div className="space-y-6">
        {/* What Your Body Is Saying */}
        <div className="border border-[rgba(0,0,0,0.1)] rounded-lg p-6 shadow-[var(--shadow-card)] bg-gradient-to-br from-white to-[var(--bg-warm)]">
          <h3 className="text-[17px] font-bold mb-4 tracking-[-0.01em]">What Your Body Is Saying</h3>
          {narrativeParagraphs.length > 0 ? (
            <div className="space-y-3">
              {narrativeParagraphs.map((p, i) => (
                <p key={i} className="text-[14px] text-[var(--text-secondary)] leading-relaxed">
                  {p}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-[14px] text-[var(--text-tertiary)]">
              Add data from at least one domain to see AI-generated insights.
            </p>
          )}
        </div>

        {/* Cross-Domain Status */}
        <div className="grid grid-cols-3 gap-4">
          <div className={`border rounded-lg p-5 shadow-[var(--shadow-card)] ${strength.totalSessions > 0 ? "border-[var(--strength)] bg-[var(--strength-light)]" : "border-[rgba(0,0,0,0.1)]"}`}>
            <div className="text-[13px] font-semibold mb-1" style={{ color: "var(--strength-dark)" }}>Strength</div>
            {strength.totalSessions > 0 ? (
              <>
                <div className="text-[20px] font-bold">{strength.totalSessions}</div>
                <div className="text-[12px] text-[var(--text-secondary)]">
                  sessions • {strength.sessionsPerWeek}/wk • {strength.daysSinceLastWorkout}d gap
                </div>
              </>
            ) : (
              <div className="text-[13px] text-[var(--text-tertiary)]">No data yet</div>
            )}
          </div>

          <div className={`border rounded-lg p-5 shadow-[var(--shadow-card)] ${recovery.entries.length > 0 ? "border-[var(--recovery)] bg-[var(--recovery-light)]" : "border-[rgba(0,0,0,0.1)]"}`}>
            <div className="text-[13px] font-semibold mb-1" style={{ color: "var(--recovery-dark)" }}>Recovery</div>
            {recovery.entries.length > 0 ? (
              <>
                <div className="text-[20px] font-bold">{recovery.sevenDayAvgReadiness ?? "—"}</div>
                <div className="text-[12px] text-[var(--text-secondary)]">
                  readiness • {recovery.sevenDayAvgHRV}ms HRV • {recovery.recoveryStatus}
                </div>
              </>
            ) : (
              <div className="text-[13px] text-[var(--text-tertiary)]">No data yet</div>
            )}
          </div>

          <div className={`border rounded-lg p-5 shadow-[var(--shadow-card)] ${running.totalRuns > 0 ? "border-[var(--running)] bg-[var(--running-light)]" : "border-[rgba(0,0,0,0.1)]"}`}>
            <div className="text-[13px] font-semibold mb-1" style={{ color: "var(--running-dark)" }}>Running</div>
            {running.totalRuns > 0 ? (
              <>
                <div className="text-[20px] font-bold">{running.totalRuns}</div>
                <div className="text-[12px] text-[var(--text-secondary)]">
                  run{running.totalRuns === 1 ? "" : "s"} • {running.thisWeekMiles.toFixed(2)}mi this week • Wk {running.currentPhase.currentWeek ?? "—"}
                </div>
              </>
            ) : (
              <div className="text-[13px] text-[var(--text-tertiary)]">
                {running.currentPhase.currentWeek ? `Phase ${running.currentPhase.phase}, Week ${running.currentPhase.currentWeek}` : "Starts Apr 14"}
              </div>
            )}
          </div>
        </div>

        {/* Cross-Domain Correlations */}
        {hasMultipleDomains ? (
          <div className="border border-[rgba(0,0,0,0.1)] rounded-lg p-6 shadow-[var(--shadow-card)]">
            <h3 className="text-[15px] font-bold mb-4">Cross-Domain Correlations</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-[var(--bg-warm)] rounded-lg">
                <div className="w-8 h-8 rounded-md bg-white border border-[rgba(0,0,0,0.1)] flex items-center justify-center text-sm">💓</div>
                <div>
                  <div className="text-[13px] font-semibold">HRV vs Training Load</div>
                  <div className="text-[12px] text-[var(--text-secondary)]">
                    {recovery.sevenDayAvgHRV !== null && strength.daysSinceLastWorkout !== null
                      ? (strength.daysSinceLastWorkout <= 3
                          ? `HRV at ${recovery.sevenDayAvgHRV}ms with training active (last session ${strength.daysSinceLastWorkout}d ago). Watch for HRV drops ≥10ms day-over-day — that signals inadequate between-session recovery.`
                          : `HRV at ${recovery.sevenDayAvgHRV}ms during a ${strength.daysSinceLastWorkout}-day training break. Watch whether HRV holds when training resumes.`)
                      : "Correlation data will populate as both domains collect more data."}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[var(--bg-warm)] rounded-lg">
                <div className="w-8 h-8 rounded-md bg-white border border-[rgba(0,0,0,0.1)] flex items-center justify-center text-sm">😴</div>
                <div>
                  <div className="text-[13px] font-semibold">Sleep Quality vs Strength Performance</div>
                  <div className="text-[12px] text-[var(--text-secondary)]">
                    {strength.sessionsThisMonth > 0
                      ? `With ${strength.sessionsThisMonth} session${strength.sessionsThisMonth === 1 ? "" : "s"} this month, we can start correlating sleep scores (<70) with session-day RPE and volume. Look for a 2-3 PR drop in estimated 1RM on poor-sleep days.`
                      : "Once training resumes, this will show whether nights with poor sleep (<70 sleep score) correlate with weaker gym sessions."}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[var(--bg-warm)] rounded-lg">
                <div className="w-8 h-8 rounded-md bg-white border border-[rgba(0,0,0,0.1)] flex items-center justify-center text-sm">🦵</div>
                <div>
                  <div className="text-[13px] font-semibold">Running Impact on Recovery</div>
                  <div className="text-[12px] text-[var(--text-secondary)]">
                    {running.totalRuns > 0
                      ? `${running.totalRuns} run${running.totalRuns === 1 ? "" : "s"} logged so far. We'll track readiness deltas the day after each Tuesday Zone-2 run (post-legs) vs Friday quality runs — the Tuesday pattern is the key injury-risk signal.`
                      : "Will track how adding running volume affects readiness scores and strength session quality. Expect this to activate after Week 1 of running."}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-[rgba(0,0,0,0.12)] rounded-lg p-12 text-center animate-pulse-border">
            <div className="text-2xl mb-2 opacity-50">📊</div>
            <p className="text-[14px] text-[var(--text-tertiary)] font-medium mb-1">
              Cross-domain correlations require 2+ active domains
            </p>
            <p className="text-[12px] text-[var(--text-tertiary)]">
              Scatter plots and overlay charts will appear when running data is available
            </p>
          </div>
        )}
      </div>
    </>
  )
}
