"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import type { LiftTrend } from "@/lib/types/strength"
import { CHART_THEME } from "@/lib/config/design-tokens"

interface OverloadChartProps {
  trends: LiftTrend[]
}

const COLORS = ["#E8590C", "#2B8A3E", "#1971C2", "#7048E8", "#D6336C", "#0B7285"]

export function OverloadChart({ trends }: OverloadChartProps) {
  // Pick top 5 lifts by estimated 1RM
  const topLifts = trends.slice(0, 5)

  // Build unified data points by date
  const dateMap = new Map<string, Record<string, number>>()
  for (const lift of topLifts) {
    for (const dp of lift.dataPoints) {
      const existing = dateMap.get(dp.date) || {}
      existing[lift.exerciseName] = dp.estimatedOneRM
      dateMap.set(dp.date, existing)
    }
  }

  const chartData = Array.from(dateMap.entries())
    .map(([date, values]) => ({ date, ...values }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-20) // last 20 data points

  return (
    <div>
      <h4 className="text-[13px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
        Progressive Overload — Est. 1RM Over Time
      </h4>
      <ResponsiveContainer width="100%" height={300}>
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
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#615d59" }}
            axisLine={false}
            tickLine={false}
            width={45}
            tickFormatter={(v) => `${v}`}
          />
          <Tooltip
            contentStyle={CHART_THEME.tooltipStyle}
            labelFormatter={(d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            formatter={(value, name) => [`${value} lbs`, name]}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: "11px", color: "#615d59" }}
          />
          {topLifts.map((lift, i) => (
            <Line
              key={lift.exerciseName}
              type="monotone"
              dataKey={lift.exerciseName}
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={2}
              dot={{ r: 3, fill: COLORS[i % COLORS.length] }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
