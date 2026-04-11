import { PageHeader } from "@/components/layout/page-header"
import { getRecoveryData, getSleepData } from "@/lib/data/oura"
import { StagesChart } from "@/components/sleep/stages-chart"
import { DurationChart } from "@/components/sleep/duration-chart"

export const dynamic = "force-dynamic"

export default function SleepPage() {
  const recovery = getRecoveryData()
  const sleepEntries = getSleepData()

  // Compute stats from recovery log (has sleep scores)
  const recentEntries = recovery.entries.slice(-30)
  const avgSleepScore = recentEntries.length > 0
    ? Math.round(recentEntries.filter(e => e.sleepScore !== null).reduce((s, e) => s + (e.sleepScore || 0), 0) /
      recentEntries.filter(e => e.sleepScore !== null).length)
    : null

  // Compute stats from sleep model CSV (has durations)
  const recentSleep = sleepEntries.slice(-30)
  const avgTotalSleep = recentSleep.length > 0
    ? Math.round(recentSleep.reduce((s, e) => s + e.totalSleepDuration, 0) / recentSleep.length / 3600 * 10) / 10
    : null
  const avgDeepSleep = recentSleep.length > 0
    ? Math.round(recentSleep.reduce((s, e) => s + e.deepSleepDuration, 0) / recentSleep.length / 60)
    : null
  const avgEfficiency = recentSleep.filter(e => e.efficiency !== null).length > 0
    ? Math.round(recentSleep.filter(e => e.efficiency !== null).reduce((s, e) => s + (e.efficiency || 0), 0) /
      recentSleep.filter(e => e.efficiency !== null).length)
    : null

  const hasSleepData = sleepEntries.length > 0 || recovery.entries.length > 0

  return (
    <>
      <PageHeader title="Sleep" subtitle="Sleep quality, stages, and recovery correlation" />

      {hasSleepData ? (
        <div className="space-y-6">
          {/* Stats row */}
          <div className="grid grid-cols-4 gap-4">
            {[
              {
                label: "Sleep Score (30d avg)",
                value: avgSleepScore !== null ? String(avgSleepScore) : "—",
                color: (avgSleepScore || 0) >= 75 ? "var(--success)" : (avgSleepScore || 0) >= 60 ? "var(--warning)" : "var(--danger)",
              },
              {
                label: "Total Sleep (30d avg)",
                value: avgTotalSleep !== null ? `${avgTotalSleep}h` : "—",
              },
              {
                label: "Deep Sleep (30d avg)",
                value: avgDeepSleep !== null ? `${avgDeepSleep} min` : "—",
              },
              {
                label: "Efficiency (30d avg)",
                value: avgEfficiency !== null ? `${avgEfficiency}%` : "—",
              },
            ].map((stat) => (
              <div key={stat.label} className="border border-[rgba(0,0,0,0.1)] rounded-lg p-4 text-center shadow-[var(--shadow-card)]">
                <div className="text-[22px] font-bold tracking-[-0.02em]">{stat.value}</div>
                <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Sleep Stages Chart */}
          {sleepEntries.length > 0 && (
            <div className="border border-[rgba(0,0,0,0.1)] rounded-lg p-6 shadow-[var(--shadow-card)]">
              <StagesChart data={sleepEntries} />
            </div>
          )}

          {/* Duration Trend */}
          {sleepEntries.length > 0 && (
            <div className="border border-[rgba(0,0,0,0.1)] rounded-lg p-6 shadow-[var(--shadow-card)]">
              <DurationChart data={sleepEntries} />
            </div>
          )}

          {/* Recent Sleep Entries table */}
          <div className="border border-[rgba(0,0,0,0.1)] rounded-lg p-6 shadow-[var(--shadow-card)]">
            <h3 className="text-[15px] font-bold mb-4">Recent Nights</h3>
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-[rgba(0,0,0,0.1)]">
                  <th className="text-left py-2 font-semibold text-[var(--text-secondary)] text-[11px] uppercase tracking-wider">Date</th>
                  <th className="text-center py-2 font-semibold text-[var(--text-secondary)] text-[11px] uppercase tracking-wider">Score</th>
                  <th className="text-center py-2 font-semibold text-[var(--text-secondary)] text-[11px] uppercase tracking-wider">Total</th>
                  <th className="text-center py-2 font-semibold text-[var(--text-secondary)] text-[11px] uppercase tracking-wider">Deep</th>
                  <th className="text-center py-2 font-semibold text-[var(--text-secondary)] text-[11px] uppercase tracking-wider">HRV</th>
                  <th className="text-center py-2 font-semibold text-[var(--text-secondary)] text-[11px] uppercase tracking-wider">Resting HR</th>
                </tr>
              </thead>
              <tbody>
                {recovery.entries.slice(-10).reverse().map((entry) => (
                  <tr key={entry.date} className="border-b border-[rgba(0,0,0,0.05)]">
                    <td className="py-2.5 font-medium">{entry.date}</td>
                    <td className="py-2.5 text-center">
                      <span className={
                        (entry.sleepScore || 0) >= 75 ? "text-[var(--success)]" :
                        (entry.sleepScore || 0) >= 60 ? "text-[var(--warning)]" :
                        "text-[var(--danger)]"
                      }>
                        {entry.sleepScore ?? "—"}
                      </span>
                    </td>
                    <td className="py-2.5 text-center">{entry.totalSleep ?? "—"}</td>
                    <td className="py-2.5 text-center">{entry.deepSleep ?? "—"}</td>
                    <td className="py-2.5 text-center font-mono">{entry.hrv ?? "—"} ms</td>
                    <td className="py-2.5 text-center font-mono">{entry.restingHR ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-[12px] text-[var(--text-tertiary)]">
            {sleepEntries.length} nights of sleep data from Oura
            ({sleepEntries[0]?.date} → {sleepEntries[sleepEntries.length - 1]?.date})
          </p>
        </div>
      ) : (
        <div className="border-2 border-dashed border-[rgba(0,0,0,0.12)] rounded-lg p-12 text-center animate-pulse-border">
          <div className="text-2xl mb-2 opacity-50">🌙</div>
          <p className="text-[14px] text-[var(--text-tertiary)] font-medium">
            Sleep data will appear here once Oura data is connected
          </p>
        </div>
      )}
    </>
  )
}
