"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import type { SleepEntry } from "@/lib/types/oura"
import { CHART_THEME } from "@/lib/config/design-tokens"

interface StagesChartProps {
  data: SleepEntry[]
}

function secondsToHours(s: number): number {
  return Math.round((s / 3600) * 10) / 10
}

export function StagesChart({ data }: StagesChartProps) {
  const recent = data.slice(-30)

  // If REM + Light are all zero, the data came from the markdown log
  // (which only tracks Deep + Total). Fall back to a Deep + Other stack.
  const hasFullStages = recent.some(
    (d) => d.remSleepDuration > 0 || d.lightSleepDuration > 0
  )

  const chartData = recent.map((d) => {
    if (hasFullStages) {
      return {
        date: d.date,
        Deep: secondsToHours(d.deepSleepDuration),
        REM: secondsToHours(d.remSleepDuration),
        Light: secondsToHours(d.lightSleepDuration),
      }
    }
    const deepHrs = secondsToHours(d.deepSleepDuration)
    const totalHrs = secondsToHours(d.totalSleepDuration)
    return {
      date: d.date,
      Deep: deepHrs,
      Other: Math.max(Math.round((totalHrs - deepHrs) * 10) / 10, 0),
    }
  })

  return (
    <div>
      <h4 className="text-[13px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
        {hasFullStages
          ? "Sleep Stages — Last 30 Nights (Hours)"
          : "Sleep Composition — Last 30 Nights (Deep vs Other)"}
      </h4>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} margin={{ left: 0, right: 8, top: 4, bottom: 4 }}>
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
            width={30}
            tickFormatter={(v) => `${v}h`}
          />
          <Tooltip
            contentStyle={CHART_THEME.tooltipStyle}
            labelFormatter={(d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            formatter={(value, name) => [`${value}h`, String(name)]}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: "11px", color: "#615d59" }}
          />
          <Bar dataKey="Deep" stackId="sleep" fill="#1864AB" radius={[0, 0, 0, 0]} barSize={12} />
          {hasFullStages ? (
            <>
              <Bar dataKey="REM" stackId="sleep" fill="#4DABF7" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Light" stackId="sleep" fill="#D0EBFF" radius={[2, 2, 0, 0]} />
            </>
          ) : (
            <Bar dataKey="Other" stackId="sleep" fill="#D0EBFF" radius={[2, 2, 0, 0]} />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
