import { PageHeader } from "@/components/layout/page-header"
import { getWeightData } from "@/lib/data/weight"
import { WeightChart } from "@/components/body/weight-chart"

export const dynamic = "force-dynamic"

function formatChange(value: number | null): { text: string; color: string } {
  if (value === null) return { text: "—", color: "var(--text-tertiary)" }
  const sign = value > 0 ? "+" : ""
  return {
    text: `${sign}${value} lbs`,
    color: value > 0 ? "var(--strength)" : value < 0 ? "var(--success)" : "var(--text-tertiary)",
  }
}

export default function BodyPage() {
  const weight = getWeightData()

  if (!weight.latest) {
    return (
      <>
        <PageHeader title="Body" subtitle="Weight tracking and body composition" />
        <div className="border-2 border-dashed border-[rgba(0,0,0,0.12)] rounded-lg p-12 text-center animate-pulse-border">
          <div className="text-2xl mb-2 opacity-50">⚖️</div>
          <p className="text-[14px] text-[var(--text-tertiary)] font-medium mb-1">No weight data yet</p>
          <p className="text-[12px] text-[var(--text-tertiary)]">
            Drop a CSV file at <code className="font-mono bg-[var(--bg-warm)] px-1.5 py-0.5 rounded text-[11px]">data/weight.csv</code>
          </p>
        </div>
      </>
    )
  }

  const c7 = formatChange(weight.change7d)
  const c30 = formatChange(weight.change30d)
  const c90 = formatChange(weight.change90d)

  return (
    <>
      <PageHeader title="Body" subtitle="Weight tracking and body composition" />

      <div className="space-y-6">
        {/* Top stats — 7-day average prominence */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div className="border border-[rgba(0,0,0,0.1)] rounded-lg p-4 md:p-5 text-center shadow-[var(--shadow-card)] col-span-2 md:col-span-1">
            <div className="text-[28px] md:text-[32px] font-bold tracking-[-0.02em]">{weight.sevenDayAvg}</div>
            <div className="text-[12px] text-[var(--text-secondary)] mt-0.5">7-Day Average (lbs)</div>
          </div>
          <div className="border border-[rgba(0,0,0,0.1)] rounded-lg p-4 md:p-5 text-center shadow-[var(--shadow-card)]">
            <div className="text-[22px] font-bold tracking-[-0.02em]">{weight.latest}</div>
            <div className="text-[12px] text-[var(--text-secondary)] mt-0.5">Latest</div>
            <div className="text-[11px] text-[var(--text-tertiary)]">{weight.latestDate}</div>
          </div>
          <div className="border border-[rgba(0,0,0,0.1)] rounded-lg p-4 md:p-5 text-center shadow-[var(--shadow-card)]">
            <div className="text-[22px] font-bold tracking-[-0.02em]">{weight.thirtyDayAvg ?? "—"}</div>
            <div className="text-[12px] text-[var(--text-secondary)] mt-0.5">30-Day Average</div>
          </div>
          <div className="border border-[rgba(0,0,0,0.1)] rounded-lg p-4 md:p-5 text-center shadow-[var(--shadow-card)]">
            <div className="text-[22px] font-bold tracking-[-0.02em]">{weight.ninetyDayAvg ?? "—"}</div>
            <div className="text-[12px] text-[var(--text-secondary)] mt-0.5">90-Day Average</div>
          </div>
        </div>

        {/* Weight Chart */}
        <div className="border border-[rgba(0,0,0,0.1)] rounded-lg p-5 md:p-6 shadow-[var(--shadow-card)]">
          <WeightChart entries={weight.entries} sevenDayAvg={weight.sevenDayAvg} />
        </div>

        {/* Weight Trends */}
        <div className="border border-[rgba(0,0,0,0.1)] rounded-lg p-5 md:p-6 shadow-[var(--shadow-card)]">
          <h3 className="text-[15px] font-bold mb-4">Weight Trends</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-[var(--bg-warm)] rounded-lg">
              <div className="text-[18px] font-bold" style={{ color: c7.color }}>{c7.text}</div>
              <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">Last 7 Days</div>
            </div>
            <div className="text-center p-3 bg-[var(--bg-warm)] rounded-lg">
              <div className="text-[18px] font-bold" style={{ color: c30.color }}>{c30.text}</div>
              <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">Last 30 Days</div>
            </div>
            <div className="text-center p-3 bg-[var(--bg-warm)] rounded-lg">
              <div className="text-[18px] font-bold" style={{ color: c90.color }}>{c90.text}</div>
              <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">Last 90 Days</div>
            </div>
            <div className="text-center p-3 bg-[var(--bg-warm)] rounded-lg">
              <div className="text-[18px] font-bold" style={{ color: formatChange(weight.changeThisMonth).color }}>
                {formatChange(weight.changeThisMonth).text}
              </div>
              <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">This Month</div>
            </div>
          </div>
        </div>

        {/* Recent Stats */}
        <div className="border border-[rgba(0,0,0,0.1)] rounded-lg p-5 md:p-6 shadow-[var(--shadow-card)]">
          <h3 className="text-[15px] font-bold mb-4">Recent Stats (Last 7 Days)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">Weekly High</div>
              <div className="text-[20px] font-bold">{weight.weeklyHigh ?? "—"} <span className="text-[13px] font-normal text-[var(--text-secondary)]">lbs</span></div>
            </div>
            <div>
              <div className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">Latest</div>
              <div className="text-[20px] font-bold">{weight.latest ?? "—"} <span className="text-[13px] font-normal text-[var(--text-secondary)]">lbs</span></div>
            </div>
            <div>
              <div className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">Trend</div>
              <div className="text-[20px] font-bold">
                {weight.trend === "up" ? (
                  <span className="text-[var(--strength)]">↑ Gaining</span>
                ) : weight.trend === "down" ? (
                  <span className="text-[var(--success)]">↓ Losing</span>
                ) : (
                  <span className="text-[var(--text-tertiary)]">→ Stable</span>
                )}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">Weekly Low</div>
              <div className="text-[20px] font-bold">{weight.weeklyLow ?? "—"} <span className="text-[13px] font-normal text-[var(--text-secondary)]">lbs</span></div>
            </div>
          </div>
        </div>

        {/* Data info */}
        <p className="text-[12px] text-[var(--text-tertiary)]">
          {weight.totalEntries.toLocaleString()} entries tracked
          {weight.dateRange && ` (${weight.dateRange.from} → ${weight.dateRange.to})`}
        </p>
      </div>
    </>
  )
}
