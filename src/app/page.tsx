import { PageHeader } from "@/components/layout/page-header"
import { Badge } from "@/components/ui/badge"
import { ScoreRing } from "@/components/shared/score-ring"
import { getStrengthData } from "@/lib/data/strength"
import { getRecoveryData } from "@/lib/data/oura"
import { getRunningData } from "@/lib/data/running"
import { calculateHealthScore } from "@/lib/data/health-score"

export const dynamic = "force-dynamic"

export default function OverviewPage() {
  const strength = getStrengthData()
  const recovery = getRecoveryData()
  const running = getRunningData()
  const healthScore = calculateHealthScore()

  const doingWell: string[] = []
  const needsAttention: string[] = []

  // Doing well
  if (strength.totalSessions > 0) {
    doingWell.push(`${strength.totalSessions} lifetime sessions — 5+ years of training history`)
  }
  if (strength.recentPRs.length > 0) {
    doingWell.push(
      `${strength.recentPRs.length} PRs in the last 60 days — ${strength.recentPRs
        .slice(0, 3)
        .map((p) => `${p.exerciseName.split("(")[0].trim()} ${p.weight}×${p.reps}`)
        .join(", ")}`
    )
  }
  const upTrends = strength.liftTrends.filter((l) => l.trend === "up")
  if (upTrends.length > 0) {
    doingWell.push(
      `Progressive overload trending UP on ${upTrends.length} lifts: ${upTrends
        .slice(0, 3)
        .map((l) => l.exerciseName.split("(")[0].trim())
        .join(", ")}`
    )
  }
  if (recovery.entries.length > 0) {
    doingWell.push(`${recovery.entries.length} days of Oura data tracked`)
  }

  // Needs attention
  needsAttention.push(...strength.flags)
  if (running.totalRuns === 0) {
    needsAttention.push("No runs logged yet — first session starts Apr 12")
  }

  return (
    <>
      <PageHeader title="Overview" subtitle="Your health at a glance">
        <div className="flex gap-2 flex-wrap">
          <Badge variant="strength">Strength</Badge>
          <Badge variant="running">Running</Badge>
          <Badge variant="recovery">Recovery</Badge>
        </div>
      </PageHeader>

      <div className="space-y-6">
        {/* Health Score with animated ring */}
        <section className="section-animate animate-fade-in-up">
          <div className="flex flex-col items-center justify-center py-8 border border-[rgba(0,0,0,0.1)] rounded-lg shadow-[var(--shadow-card)]">
            <ScoreRing score={healthScore.overall} />
            <div className="flex gap-5 mt-4 text-[12px] text-[var(--text-secondary)]">
              {healthScore.breakdown.strength && (
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[var(--strength)]" />
                  Strength {healthScore.breakdown.strength.score.toFixed(1)}
                </span>
              )}
              {healthScore.breakdown.recovery && (
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[var(--recovery)]" />
                  Recovery {healthScore.breakdown.recovery.score.toFixed(1)}
                </span>
              )}
              {healthScore.breakdown.running && (
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[var(--running)]" />
                  Running {healthScore.breakdown.running.score.toFixed(1)}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Quick Stats — responsive grid */}
        <section className="section-animate animate-fade-in-up grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[
            { label: "Runs This Month", value: String(running.totalRuns) },
            { label: "Strength Sessions (Apr)", value: String(strength.sessionsThisMonth) },
            { label: "Avg HRV (7-day)", value: recovery.sevenDayAvgHRV ? `${recovery.sevenDayAvgHRV} ms` : "—" },
            { label: "Total Sessions", value: String(strength.totalSessions) },
          ].map((stat) => (
            <div
              key={stat.label}
              className="border border-[rgba(0,0,0,0.1)] rounded-lg p-4 md:p-5 text-center shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-deep)] transition-shadow duration-200"
            >
              <div className="text-[22px] md:text-[24px] font-bold tracking-[-0.02em]">{stat.value}</div>
              <div className="text-[11px] md:text-[12px] text-[var(--text-secondary)] mt-1">{stat.label}</div>
            </div>
          ))}
        </section>

        {/* What You're Doing Well */}
        {doingWell.length > 0 && (
          <section className="section-animate animate-fade-in-up border-l-4 border-l-[var(--success)] border border-[rgba(0,0,0,0.1)] rounded-lg p-5 md:p-6 shadow-[var(--shadow-card)]">
            <h3 className="text-[15px] font-bold mb-3">What You&apos;re Doing Well</h3>
            <ul className="space-y-2">
              {doingWell.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[13px] md:text-[14px] text-[var(--text-secondary)]">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--success)] shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* What Needs Attention */}
        {needsAttention.length > 0 && (
          <section className="section-animate animate-fade-in-up border-l-4 border-l-[var(--warning)] border border-[rgba(0,0,0,0.1)] rounded-lg p-5 md:p-6 shadow-[var(--shadow-card)]">
            <h3 className="text-[15px] font-bold mb-3">What Needs Attention</h3>
            <ul className="space-y-2">
              {needsAttention.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[13px] md:text-[14px] text-[var(--text-secondary)]">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--warning)] shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Key Lifts */}
        {strength.liftTrends.length > 0 && (
          <section className="section-animate animate-fade-in-up border border-[rgba(0,0,0,0.1)] rounded-lg p-5 md:p-6 shadow-[var(--shadow-card)]">
            <h3 className="text-[15px] font-bold mb-4">Key Lifts — Current Working Weight</h3>
            <div className="overflow-x-auto -mx-5 md:-mx-6 px-5 md:px-6">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-[rgba(0,0,0,0.1)]">
                    <th className="text-left py-2 font-semibold text-[var(--text-secondary)] text-[11px] uppercase tracking-wider">Exercise</th>
                    <th className="text-right py-2 font-semibold text-[var(--text-secondary)] text-[11px] uppercase tracking-wider">Weight</th>
                    <th className="text-right py-2 font-semibold text-[var(--text-secondary)] text-[11px] uppercase tracking-wider hidden md:table-cell">Est. 1RM</th>
                    <th className="text-center py-2 font-semibold text-[var(--text-secondary)] text-[11px] uppercase tracking-wider">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {strength.liftTrends.slice(0, 10).map((lift) => (
                    <tr key={lift.exerciseName} className="border-b border-[rgba(0,0,0,0.05)]">
                      <td className="py-2.5 font-medium">{lift.exerciseName}</td>
                      <td className="py-2.5 text-right font-mono text-[13px]">
                        {lift.currentWeight} × {lift.currentReps}
                      </td>
                      <td className="py-2.5 text-right font-mono text-[13px] hidden md:table-cell">
                        {lift.estimatedOneRM} lbs
                      </td>
                      <td className="py-2.5 text-center">
                        <span className={
                          lift.trend === "up" ? "text-[var(--success)]" :
                          lift.trend === "down" ? "text-[var(--danger)]" :
                          "text-[var(--text-tertiary)]"
                        }>
                          {lift.trend === "up" ? "↑" : lift.trend === "down" ? "↓" : "→"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Recovery Status */}
        {recovery.entries.length > 0 && (
          <section className="section-animate animate-fade-in-up border border-[rgba(0,0,0,0.1)] rounded-lg p-5 md:p-6 shadow-[var(--shadow-card)]">
            <h3 className="text-[15px] font-bold mb-3">Recovery Status</h3>
            <div className="grid grid-cols-3 gap-3 md:gap-4 mb-3">
              <div className="text-center">
                <div className="text-[18px] md:text-[20px] font-bold">{recovery.sevenDayAvgReadiness ?? "—"}</div>
                <div className="text-[10px] md:text-[11px] text-[var(--text-secondary)]">Readiness (7d)</div>
              </div>
              <div className="text-center">
                <div className="text-[18px] md:text-[20px] font-bold">{recovery.sevenDayAvgHRV ?? "—"} ms</div>
                <div className="text-[10px] md:text-[11px] text-[var(--text-secondary)]">HRV (7d)</div>
              </div>
              <div className="text-center">
                <div className="text-[18px] md:text-[20px] font-bold">{recovery.sevenDayAvgRestingHR ?? "—"} bpm</div>
                <div className="text-[10px] md:text-[11px] text-[var(--text-secondary)]">Resting HR (7d)</div>
              </div>
            </div>
            <p className="text-[13px] text-[var(--text-secondary)]">{recovery.analystNote}</p>
          </section>
        )}
      </div>
    </>
  )
}
