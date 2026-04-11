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

  // Build narrative
  const narrativeParagraphs: string[] = []

  if (strength.totalSessions > 0 && recovery.entries.length > 0) {
    // Cross-domain narrative
    const readiness = recovery.sevenDayAvgReadiness
    const hrv = recovery.sevenDayAvgHRV
    const gap = strength.daysSinceLastWorkout

    if (gap && gap > 14) {
      narrativeParagraphs.push(
        `Your body has been away from the gym for ${gap} days. The good news: with ${strength.totalSessions} sessions in your history, muscle memory is deeply ingrained. The concerning part: measurable strength loss begins around 2 weeks of detraining, and you're past that threshold. Your most recent session saw 5 PRs, so the foundation is strong — but every additional day off costs more than the last.`
      )
    }

    if (readiness !== null && hrv !== null) {
      const readinessLevel = readiness >= 70 ? "solid" : readiness >= 60 ? "moderate" : "low"
      narrativeParagraphs.push(
        `Recovery is currently ${readinessLevel} — your 7-day readiness sits at ${readiness} with HRV at ${hrv}ms. ${readiness < 70
          ? "This suggests your body is under some stress. When you return to training, start at 80-85% of your last working weights and prioritize sleep quality."
          : "Your recovery metrics support resuming training at or near your previous intensity."
        }`
      )
    }

    // Hamstring flag + running
    const hamFlag = strength.flags.find(f => f.toLowerCase().includes("hamstring"))
    if (hamFlag) {
      narrativeParagraphs.push(
        `A critical imbalance worth addressing: your quad-to-hamstring volume ratio is heavily skewed. This matters because you're about to start a running program — hamstrings absorb eccentric load during every stride. Prioritize RDLs and leg curls in your next sessions to reduce injury risk before your first run on April 12.`
      )
    }
  } else if (strength.totalSessions > 0) {
    narrativeParagraphs.push(
      `With ${strength.totalSessions} training sessions logged, your strength data tells a clear story: consistent training with progressive overload on key lifts, interrupted by a ${strength.daysSinceLastWorkout}-day gap. Cross-domain insights will become richer as you add Oura recovery data and start logging runs.`
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
                  runs • {running.thisWeekMiles}mi this week
                </div>
              </>
            ) : (
              <div className="text-[13px] text-[var(--text-tertiary)]">
                Starts Apr 12 — Phase {running.currentPhase.phase}
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
                      ? `HRV at ${recovery.sevenDayAvgHRV}ms during a ${strength.daysSinceLastWorkout}-day training break. Watch if HRV drops when training resumes — that signals inadequate recovery between sessions.`
                      : "Correlation data will populate as both domains collect more data."}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[var(--bg-warm)] rounded-lg">
                <div className="w-8 h-8 rounded-md bg-white border border-[rgba(0,0,0,0.1)] flex items-center justify-center text-sm">😴</div>
                <div>
                  <div className="text-[13px] font-semibold">Sleep Quality vs Strength Performance</div>
                  <div className="text-[12px] text-[var(--text-secondary)]">
                    Once training resumes, this will show whether nights with poor sleep (&lt;70 sleep score) correlate with weaker gym sessions.
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[var(--bg-warm)] rounded-lg">
                <div className="w-8 h-8 rounded-md bg-white border border-[rgba(0,0,0,0.1)] flex items-center justify-center text-sm">🦵</div>
                <div>
                  <div className="text-[13px] font-semibold">Running Impact on Recovery</div>
                  <div className="text-[12px] text-[var(--text-secondary)]">
                    Will track how adding running volume affects readiness scores and strength session quality. Expect this to activate after Week 1 of running.
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
