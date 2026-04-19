import { PageHeader } from "@/components/layout/page-header"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { getStrengthData } from "@/lib/data/strength"
import { getRecoveryData, getStepsData } from "@/lib/data/oura"
import { getRunningData } from "@/lib/data/running"
import { VolumeChart } from "@/components/training/volume-chart"
import { OverloadChart } from "@/components/training/overload-chart"
import { SessionFrequencyChart } from "@/components/training/session-frequency-chart"
import { StepsChart } from "@/components/training/steps-chart"
import { HRVTrendChart } from "@/components/training/hrv-trend-chart"

export const dynamic = "force-dynamic"

export default function TrainingPage() {
  const strength = getStrengthData()
  const recovery = getRecoveryData()
  const steps = getStepsData()
  const running = getRunningData()

  return (
    <>
      <PageHeader title="Training" subtitle="Strength, running, steps, and recovery" />

      <Tabs defaultValue="strength" className="w-full">
        <TabsList>
          <TabsTrigger value="strength">
            Strength
            {strength.totalSessions > 0 && (
              <span className="ml-1.5 text-[10px] text-[var(--strength-dark)] bg-[var(--strength-light)] px-1.5 py-0.5 rounded-full">
                {strength.totalSessions}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="running">Running</TabsTrigger>
          <TabsTrigger value="steps">
            Steps
            {steps.length > 0 && (
              <span className="ml-1.5 text-[10px] text-[var(--recovery-dark)] bg-[var(--recovery-light)] px-1.5 py-0.5 rounded-full">
                {steps.length}d
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="recovery">Recovery</TabsTrigger>
        </TabsList>

        {/* ========== STRENGTH TAB ========== */}
        <TabsContent value="strength">
          <div className="space-y-6">
            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {[
                { label: "Total Sessions", value: String(strength.totalSessions) },
                { label: "Sessions/Week (12wk)", value: String(strength.sessionsPerWeek) },
                { label: "Days Since Last", value: strength.daysSinceLastWorkout !== null ? String(strength.daysSinceLastWorkout) : "—" },
                { label: "Recent PRs (60d)", value: String(strength.recentPRs.length) },
              ].map((stat) => (
                <div key={stat.label} className="border border-[rgba(0,0,0,0.1)] rounded-lg p-4 text-center shadow-[var(--shadow-card)]">
                  <div className="text-[22px] font-bold tracking-[-0.02em]">{stat.value}</div>
                  <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Key Lifts Table */}
            <div className="border border-[rgba(0,0,0,0.1)] rounded-lg p-6 shadow-[var(--shadow-card)]">
              <h3 className="text-[15px] font-bold mb-4">Key Lifts — Current Working Weight</h3>
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-[rgba(0,0,0,0.1)]">
                    <th className="text-left py-2 font-semibold text-[var(--text-secondary)] text-[11px] uppercase tracking-wider">Exercise</th>
                    <th className="text-right py-2 font-semibold text-[var(--text-secondary)] text-[11px] uppercase tracking-wider">Weight × Reps</th>
                    <th className="text-right py-2 font-semibold text-[var(--text-secondary)] text-[11px] uppercase tracking-wider">Est. 1RM</th>
                    <th className="text-center py-2 font-semibold text-[var(--text-secondary)] text-[11px] uppercase tracking-wider">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {strength.liftTrends.slice(0, 12).map((lift) => (
                    <tr key={lift.exerciseName} className="border-b border-[rgba(0,0,0,0.05)]">
                      <td className="py-2.5 font-medium">{lift.exerciseName}</td>
                      <td className="py-2.5 text-right font-mono">{lift.currentWeight} × {lift.currentReps}</td>
                      <td className="py-2.5 text-right font-mono">{lift.estimatedOneRM} lbs</td>
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

            {/* Volume Chart */}
            <div className="border border-[rgba(0,0,0,0.1)] rounded-lg p-6 shadow-[var(--shadow-card)]">
              <VolumeChart data={strength.muscleVolume} />
            </div>

            {/* Progressive Overload Chart */}
            <div className="border border-[rgba(0,0,0,0.1)] rounded-lg p-6 shadow-[var(--shadow-card)]">
              <OverloadChart trends={strength.liftTrends} />
            </div>

            {/* Session Frequency */}
            <div className="border border-[rgba(0,0,0,0.1)] rounded-lg p-6 shadow-[var(--shadow-card)]">
              <SessionFrequencyChart data={strength.weeklySessionCounts} />
            </div>

            {/* Recent PRs */}
            {strength.recentPRs.length > 0 && (
              <div className="border border-[rgba(0,0,0,0.1)] rounded-lg p-6 shadow-[var(--shadow-card)]">
                <h3 className="text-[15px] font-bold mb-4">Recent PRs (Last 60 Days)</h3>
                <div className="grid grid-cols-2 gap-3">
                  {strength.recentPRs.map((pr, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-[var(--bg-warm)] rounded-lg">
                      <div className="w-8 h-8 rounded-md bg-[var(--strength-light)] flex items-center justify-center text-[14px]">🏆</div>
                      <div>
                        <div className="text-[13px] font-semibold">{pr.exerciseName}</div>
                        <div className="text-[12px] text-[var(--text-secondary)]">
                          {pr.weight} × {pr.reps} → {pr.estimatedOneRM} lbs 1RM
                          {pr.previousBest && (
                            <span className="text-[var(--success)] ml-1">
                              (+{(pr.estimatedOneRM - pr.previousBest).toFixed(1)})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Flags */}
            {strength.flags.length > 0 && (
              <div className="border-l-4 border-l-[var(--warning)] border border-[rgba(0,0,0,0.1)] rounded-lg p-5 shadow-[var(--shadow-card)]">
                <h3 className="text-[14px] font-bold mb-2">Flags</h3>
                <ul className="space-y-1.5">
                  {strength.flags.map((flag, i) => (
                    <li key={i} className="flex items-start gap-2 text-[13px] text-[var(--text-secondary)]">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[var(--warning)] shrink-0" />
                      {flag}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ========== RUNNING TAB ========== */}
        <TabsContent value="running">
          <div className="space-y-6">
            {/* Phase indicator */}
            <div className="border border-[rgba(0,0,0,0.1)] rounded-lg p-6 shadow-[var(--shadow-card)]">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-[15px] font-bold">Training Plan</h3>
                {running.currentPhase.currentWeek !== null && (
                  <span className="text-[11px] text-[var(--running-dark)] bg-[var(--running-light)] px-2 py-0.5 rounded-full font-semibold">
                    Week {running.currentPhase.currentWeek} of 32
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mb-3">
                {[1, 2, 3, 4].map((phase) => (
                  <div
                    key={phase}
                    className="flex-1 h-2 rounded-full"
                    style={{
                      backgroundColor: phase === running.currentPhase.phase ? "var(--running)" : "var(--bg-warm)",
                      opacity: phase === running.currentPhase.phase ? 1 : 0.5,
                    }}
                  />
                ))}
              </div>
              <p className="text-[13px] text-[var(--text-secondary)]">
                <strong className="text-[var(--running)]">Phase {running.currentPhase.phase}</strong>: {running.currentPhase.name} — {running.currentPhase.focus}
              </p>
              {running.nextSession && (
                <div className="mt-3 p-3 bg-[var(--running-light)] rounded-lg text-[13px] text-[var(--running-dark)]">
                  <strong>Next session:</strong> {running.nextSession.date} — {running.nextSession.type}
                  {running.nextSession.duration && ` (${running.nextSession.duration})`}
                </div>
              )}
            </div>

            {running.totalRuns > 0 ? (
              <>
                {/* Stats row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  {(() => {
                    const loggedRuns = running.runs.filter((r) => r.actualDist !== null)
                    const lastRun = loggedRuns[loggedRuns.length - 1]
                    return [
                      { label: "Total Runs", value: String(running.totalRuns) },
                      { label: "Total Miles", value: running.totalMiles.toFixed(2) },
                      { label: "This Week", value: `${running.thisWeekMiles.toFixed(2)} mi` },
                      { label: "Last Pace", value: lastRun?.avgPace ?? "—" },
                    ]
                  })().map((stat) => (
                    <div key={stat.label} className="border border-[rgba(0,0,0,0.1)] rounded-lg p-4 text-center shadow-[var(--shadow-card)]">
                      <div className="text-[22px] font-bold tracking-[-0.02em]">{stat.value}</div>
                      <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Run Log */}
                <div className="border border-[rgba(0,0,0,0.1)] rounded-lg p-6 shadow-[var(--shadow-card)]">
                  <h3 className="text-[15px] font-bold mb-4">Run Log</h3>
                  <div className="overflow-x-auto -mx-6 px-6">
                    <table className="w-full text-[13px]">
                      <thead>
                        <tr className="border-b border-[rgba(0,0,0,0.1)]">
                          <th className="text-left py-2 font-semibold text-[var(--text-secondary)] text-[11px] uppercase tracking-wider">Date</th>
                          <th className="text-left py-2 font-semibold text-[var(--text-secondary)] text-[11px] uppercase tracking-wider">Type</th>
                          <th className="text-right py-2 font-semibold text-[var(--text-secondary)] text-[11px] uppercase tracking-wider">Distance</th>
                          <th className="text-right py-2 font-semibold text-[var(--text-secondary)] text-[11px] uppercase tracking-wider hidden md:table-cell">Time</th>
                          <th className="text-right py-2 font-semibold text-[var(--text-secondary)] text-[11px] uppercase tracking-wider hidden md:table-cell">HR</th>
                          <th className="text-right py-2 font-semibold text-[var(--text-secondary)] text-[11px] uppercase tracking-wider">Pace</th>
                          <th className="text-center py-2 font-semibold text-[var(--text-secondary)] text-[11px] uppercase tracking-wider hidden md:table-cell">Effort</th>
                        </tr>
                      </thead>
                      <tbody>
                        {running.runs.slice().reverse().map((run, i) => {
                          const isSkipped = run.actualDist === null
                          return (
                            <tr key={`${run.date}-${i}`} className="border-b border-[rgba(0,0,0,0.05)]">
                              <td className="py-2.5 font-medium whitespace-nowrap">{run.date}</td>
                              <td className="py-2.5 text-[var(--text-secondary)]">{run.runType}</td>
                              <td className="py-2.5 text-right font-mono">
                                {isSkipped ? (
                                  <span className="text-[var(--text-tertiary)] italic">skipped</span>
                                ) : (
                                  `${run.actualDist?.toFixed(2)} mi`
                                )}
                              </td>
                              <td className="py-2.5 text-right font-mono hidden md:table-cell">
                                {run.time ? `${run.time} min` : "—"}
                              </td>
                              <td className="py-2.5 text-right font-mono hidden md:table-cell">
                                {run.avgHR ? `${run.avgHR}` : "—"}
                              </td>
                              <td className="py-2.5 text-right font-mono">{run.avgPace ?? "—"}</td>
                              <td className="py-2.5 text-center hidden md:table-cell">
                                {run.effort !== null ? `${run.effort}/10` : "—"}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Weekly Mileage Summary */}
                {running.weekSummaries.length > 0 && (
                  <div className="border border-[rgba(0,0,0,0.1)] rounded-lg p-6 shadow-[var(--shadow-card)]">
                    <h3 className="text-[15px] font-bold mb-4">Weekly Mileage — Plan vs Actual</h3>
                    <div className="space-y-2.5">
                      {running.weekSummaries.slice(0, 6).map((week) => {
                        const pct = week.actualMiles !== null
                          ? Math.min((week.actualMiles / week.targetMiles) * 100, 100)
                          : 0
                        return (
                          <div key={week.week}>
                            <div className="flex items-center justify-between text-[12px] mb-1">
                              <span className="font-medium">Week {week.week} <span className="text-[var(--text-tertiary)] font-normal">— {week.dates}</span></span>
                              <span className="font-mono text-[var(--text-secondary)]">
                                {week.actualMiles !== null ? `${week.actualMiles.toFixed(2)}` : "—"} / {week.targetMiles.toFixed(2)} mi
                              </span>
                            </div>
                            <div className="h-1.5 bg-[var(--bg-warm)] rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${pct}%`,
                                  backgroundColor: "var(--running)",
                                }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="border-2 border-dashed border-[rgba(0,0,0,0.12)] rounded-lg p-12 text-center animate-pulse-border">
                <div className="text-2xl mb-2 opacity-50">🏃</div>
                <p className="text-[14px] text-[var(--text-tertiary)] font-medium mb-1">
                  Your first run logs will appear here
                </p>
                <p className="text-[12px] text-[var(--text-tertiary)]">
                  Weekly mileage, pace trends, and HR zone data will populate after your first session
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ========== STEPS TAB ========== */}
        <TabsContent value="steps">
          <div className="space-y-6">
            {steps.length > 0 ? (
              <>
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  {(() => {
                    const last7 = steps.slice(-7)
                    const last30 = steps.slice(-30)
                    const avg7 = last7.length > 0 ? Math.round(last7.reduce((s, d) => s + d.steps, 0) / last7.length) : 0
                    const avg30 = last30.length > 0 ? Math.round(last30.reduce((s, d) => s + d.steps, 0) / last30.length) : 0
                    const best = Math.max(...steps.map((s) => s.steps))
                    return [
                      { label: "7-Day Average", value: avg7.toLocaleString() },
                      { label: "30-Day Average", value: avg30.toLocaleString() },
                      { label: "All-Time Best", value: best.toLocaleString() },
                    ]
                  })().map((stat) => (
                    <div key={stat.label} className="border border-[rgba(0,0,0,0.1)] rounded-lg p-4 text-center shadow-[var(--shadow-card)]">
                      <div className="text-[22px] font-bold tracking-[-0.02em]">{stat.value}</div>
                      <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Steps Chart */}
                <div className="border border-[rgba(0,0,0,0.1)] rounded-lg p-6 shadow-[var(--shadow-card)]">
                  <StepsChart data={steps} />
                </div>

                <p className="text-[12px] text-[var(--text-tertiary)]">
                  {steps.length} days of step data from Oura ({steps[0]?.date} → {steps[steps.length - 1]?.date})
                </p>
              </>
            ) : (
              <div className="border-2 border-dashed border-[rgba(0,0,0,0.12)] rounded-lg p-12 text-center animate-pulse-border">
                <div className="text-2xl mb-2 opacity-50">👟</div>
                <p className="text-[14px] text-[var(--text-tertiary)] font-medium">No step data yet</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ========== RECOVERY TAB ========== */}
        <TabsContent value="recovery">
          <div className="space-y-6">
            {recovery.entries.length > 0 ? (
              <>
                {/* Recovery stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  {[
                    {
                      label: "Readiness (7d)",
                      value: recovery.sevenDayAvgReadiness !== null ? String(recovery.sevenDayAvgReadiness) : "—",
                      color: (recovery.sevenDayAvgReadiness || 0) >= 70 ? "var(--success)" : (recovery.sevenDayAvgReadiness || 0) >= 60 ? "var(--warning)" : "var(--danger)",
                    },
                    { label: "HRV (7d avg)", value: recovery.sevenDayAvgHRV !== null ? `${recovery.sevenDayAvgHRV} ms` : "—" },
                    { label: "Resting HR (7d)", value: recovery.sevenDayAvgRestingHR !== null ? `${recovery.sevenDayAvgRestingHR} bpm` : "—" },
                    {
                      label: "Status",
                      value: recovery.recoveryStatus === "green" ? "🟢 Push" : recovery.recoveryStatus === "yellow" ? "🟡 Maintain" : "🔴 Back Off",
                    },
                  ].map((stat) => (
                    <div key={stat.label} className="border border-[rgba(0,0,0,0.1)] rounded-lg p-4 text-center shadow-[var(--shadow-card)]">
                      <div className="text-[20px] font-bold tracking-[-0.02em]">{stat.value}</div>
                      <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* HRV Trend */}
                <div className="border border-[rgba(0,0,0,0.1)] rounded-lg p-6 shadow-[var(--shadow-card)]">
                  <HRVTrendChart entries={recovery.entries} />
                </div>

                {/* Readiness Trend */}
                <div className="border border-[rgba(0,0,0,0.1)] rounded-lg p-6 shadow-[var(--shadow-card)]">
                  <h3 className="text-[15px] font-bold mb-3">Recent Entries</h3>
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr className="border-b border-[rgba(0,0,0,0.1)]">
                        <th className="text-left py-2 font-semibold text-[var(--text-secondary)] text-[11px] uppercase tracking-wider">Date</th>
                        <th className="text-center py-2 font-semibold text-[var(--text-secondary)] text-[11px] uppercase tracking-wider">Readiness</th>
                        <th className="text-center py-2 font-semibold text-[var(--text-secondary)] text-[11px] uppercase tracking-wider">Sleep</th>
                        <th className="text-center py-2 font-semibold text-[var(--text-secondary)] text-[11px] uppercase tracking-wider">HRV</th>
                        <th className="text-center py-2 font-semibold text-[var(--text-secondary)] text-[11px] uppercase tracking-wider">Steps</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recovery.entries.slice(-10).reverse().map((entry) => (
                        <tr key={entry.date} className="border-b border-[rgba(0,0,0,0.05)]">
                          <td className="py-2 font-medium">{entry.date}</td>
                          <td className="py-2 text-center">
                            <span className={
                              (entry.readinessScore || 0) >= 70 ? "text-[var(--success)]" :
                              (entry.readinessScore || 0) >= 60 ? "text-[var(--warning)]" :
                              "text-[var(--danger)]"
                            }>
                              {entry.readinessScore ?? "—"}
                            </span>
                          </td>
                          <td className="py-2 text-center">{entry.sleepScore ?? "—"}</td>
                          <td className="py-2 text-center font-mono">{entry.hrv ?? "—"} ms</td>
                          <td className="py-2 text-center">{entry.steps?.toLocaleString() ?? "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Coach note */}
                <div className="bg-[var(--bg-warm)] rounded-lg p-4 text-[13px] text-[var(--text-secondary)]">
                  <strong className="text-[var(--text-primary)]">Coach:</strong> {recovery.analystNote}
                </div>
              </>
            ) : (
              <div className="border-2 border-dashed border-[rgba(0,0,0,0.12)] rounded-lg p-12 text-center animate-pulse-border">
                <div className="text-2xl mb-2 opacity-50">💤</div>
                <p className="text-[14px] text-[var(--text-tertiary)] font-medium">Oura data will appear here once connected</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </>
  )
}
