"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
import type { RecoveryEntry } from "@/lib/types/oura"
import { DOMAIN_COLORS, CHART_THEME } from "@/lib/config/design-tokens"

interface HRVTrendChartProps {
  entries: RecoveryEntry[]
}

export function HRVTrendChart({ entries }: HRVTrendChartProps) {
  const chartData = entries
    .filter((e) => e.hrv !== null)
    .slice(-30)
    .map((e) => ({ date: e.date, hrv: e.hrv, readiness: e.readinessScore }))

  const avg = chartData.length > 0
    ? Math.round(chartData.reduce((s, d) => s + (d.hrv || 0), 0) / chartData.length)
    : 0

  return (
    <div>
      <h4 className="text-[13px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
        HRV Trend — Last 30 Days
      </h4>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={chartData} margin={{ left: 0, right: 16, top: 4, bottom: 4 }}>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "#a39e98" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(d) => {
              const date = new Date(d)
              return `${date.getMonth() + 1}/${date.getDate()}`
            }}
            interval="equidistantPreserveStart"
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#615d59" }}
            axisLine={false}
            tickLine={false}
            width={40}
            domain={["dataMin - 10", "dataMax + 10"]}
          />
          <Tooltip
            contentStyle={CHART_THEME.tooltipStyle}
            labelFormatter={(d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            formatter={(value, name) => [
              `${value} ${name === "hrv" ? "ms" : ""}`,
              name === "hrv" ? "HRV" : "Readiness",
            ]}
          />
          <ReferenceLine
            y={avg}
            stroke="#a39e98"
            strokeDasharray="4 4"
            label={{ value: `Avg: ${avg}ms`, position: "right", fontSize: 10, fill: "#a39e98" }}
          />
          <Line
            type="monotone"
            dataKey="hrv"
            stroke={DOMAIN_COLORS.recovery.primary}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
