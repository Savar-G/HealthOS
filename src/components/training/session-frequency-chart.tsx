"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts"
import { DOMAIN_COLORS, CHART_THEME } from "@/lib/config/design-tokens"

interface SessionFrequencyChartProps {
  data: { week: string; count: number }[]
}

export function SessionFrequencyChart({ data }: SessionFrequencyChartProps) {
  return (
    <div>
      <h4 className="text-[13px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
        Sessions Per Week — Last 12 Weeks
      </h4>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ left: 0, right: 16, top: 4, bottom: 4 }}>
          <XAxis
            dataKey="week"
            tick={{ fontSize: 10, fill: "#a39e98" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(w) => w.split("-W")[1] ? `W${w.split("-W")[1]}` : w}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#615d59" }}
            axisLine={false}
            tickLine={false}
            width={25}
            domain={[0, 4]}
          />
          <Tooltip
            contentStyle={CHART_THEME.tooltipStyle}
            labelFormatter={(w) => `Week ${w}`}
            formatter={(value) => [`${value} sessions`, "Sessions"]}
          />
          <ReferenceLine y={3} stroke="#a39e98" strokeDasharray="4 4" />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={24}>
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.count === 0 ? "#E8E5E0" : entry.count >= 3 ? DOMAIN_COLORS.strength.primary : "#F59F00"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
