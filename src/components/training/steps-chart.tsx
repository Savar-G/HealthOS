"use client"

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
import { DOMAIN_COLORS, CHART_THEME } from "@/lib/config/design-tokens"

interface StepsChartProps {
  data: { date: string; steps: number }[]
}

export function StepsChart({ data }: StepsChartProps) {
  // Show last 30 days
  const chartData = data.slice(-30)
  const avg = chartData.length > 0
    ? Math.round(chartData.reduce((s, d) => s + d.steps, 0) / chartData.length)
    : 0

  return (
    <div>
      <h4 className="text-[13px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
        Daily Steps — Last 30 Days
      </h4>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={chartData} margin={{ left: 0, right: 16, top: 4, bottom: 4 }}>
          <defs>
            <linearGradient id="stepsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={DOMAIN_COLORS.recovery.primary} stopOpacity={0.15} />
              <stop offset="95%" stopColor={DOMAIN_COLORS.recovery.primary} stopOpacity={0.02} />
            </linearGradient>
          </defs>
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
            width={50}
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={CHART_THEME.tooltipStyle}
            labelFormatter={(d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            formatter={(value) => [`${Number(value).toLocaleString()} steps`, "Steps"]}
          />
          <ReferenceLine
            y={avg}
            stroke="#a39e98"
            strokeDasharray="4 4"
            label={{ value: `Avg: ${avg.toLocaleString()}`, position: "right", fontSize: 10, fill: "#a39e98" }}
          />
          <Area
            type="monotone"
            dataKey="steps"
            stroke={DOMAIN_COLORS.recovery.primary}
            strokeWidth={2}
            fill="url(#stepsGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
