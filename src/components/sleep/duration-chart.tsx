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
import type { SleepEntry } from "@/lib/types/oura"
import { CHART_THEME } from "@/lib/config/design-tokens"

interface DurationChartProps {
  data: SleepEntry[]
}

export function DurationChart({ data }: DurationChartProps) {
  const chartData = data.slice(-60).map((d) => ({
    date: d.date,
    hours: Math.round((d.totalSleepDuration / 3600) * 10) / 10,
  }))

  const avg = chartData.length > 0
    ? Math.round(chartData.reduce((s, d) => s + d.hours, 0) / chartData.length * 10) / 10
    : 0

  return (
    <div>
      <h4 className="text-[13px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
        Total Sleep Duration — Last 60 Nights
      </h4>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={chartData} margin={{ left: 0, right: 16, top: 4, bottom: 4 }}>
          <defs>
            <linearGradient id="sleepGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1971C2" stopOpacity={0.12} />
              <stop offset="95%" stopColor="#1971C2" stopOpacity={0.02} />
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
            width={35}
            domain={[4, 12]}
            tickFormatter={(v) => `${v}h`}
          />
          <Tooltip
            contentStyle={CHART_THEME.tooltipStyle}
            labelFormatter={(d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            formatter={(value) => [`${value}h`, "Total Sleep"]}
          />
          <ReferenceLine
            y={avg}
            stroke="#a39e98"
            strokeDasharray="4 4"
            label={{ value: `Avg: ${avg}h`, position: "right", fontSize: 10, fill: "#a39e98" }}
          />
          <ReferenceLine y={7} stroke="#2B8A3E" strokeDasharray="2 4" strokeOpacity={0.4} />
          <Area
            type="monotone"
            dataKey="hours"
            stroke="#1971C2"
            strokeWidth={2}
            fill="url(#sleepGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
