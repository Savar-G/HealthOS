"use client"

import { useState } from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
import type { WeightEntry } from "@/lib/types/body"
import { CHART_THEME } from "@/lib/config/design-tokens"

interface WeightChartProps {
  entries: WeightEntry[]
  sevenDayAvg: number | null
}

type TimeRange = "30d" | "90d" | "1y" | "all"

const ranges: { key: TimeRange; label: string }[] = [
  { key: "30d", label: "30D" },
  { key: "90d", label: "90D" },
  { key: "1y", label: "1Y" },
  { key: "all", label: "All" },
]

function filterByRange(entries: WeightEntry[], range: TimeRange): WeightEntry[] {
  if (range === "all") return entries
  const days = range === "30d" ? 30 : range === "90d" ? 90 : 365
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  return entries.filter((e) => new Date(e.date) >= cutoff)
}

export function WeightChart({ entries, sevenDayAvg }: WeightChartProps) {
  const [range, setRange] = useState<TimeRange>("90d")
  const filtered = filterByRange(entries, range)

  const chartData = filtered.map((e) => ({
    date: e.date,
    weight: e.weightLbs,
  }))

  // Compute Y domain with some padding
  const weights = chartData.map((d) => d.weight)
  const min = Math.floor(Math.min(...weights) - 1)
  const max = Math.ceil(Math.max(...weights) + 1)

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-[13px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
          Weight Trend
        </h4>
        <div className="flex gap-1">
          {ranges.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`px-2.5 py-1 rounded-md text-[12px] font-medium transition-colors ${
                range === r.key
                  ? "bg-[rgba(0,0,0,0.95)] text-white"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-warm)]"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={chartData} margin={{ left: 0, right: 16, top: 4, bottom: 4 }}>
          <defs>
            <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7048E8" stopOpacity={0.12} />
              <stop offset="95%" stopColor="#7048E8" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "#a39e98" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(d) => {
              const date = new Date(d)
              return range === "all" || range === "1y"
                ? `${date.toLocaleString("en", { month: "short" })} '${String(date.getFullYear()).slice(2)}`
                : `${date.getMonth() + 1}/${date.getDate()}`
            }}
            interval="equidistantPreserveStart"
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#615d59" }}
            axisLine={false}
            tickLine={false}
            width={45}
            domain={[min, max]}
            tickFormatter={(v) => `${v} lb`}
          />
          <Tooltip
            contentStyle={CHART_THEME.tooltipStyle}
            labelFormatter={(d) =>
              new Date(d).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            }
            formatter={(value) => [`${value} lbs`, "Weight"]}
          />
          {sevenDayAvg && (
            <ReferenceLine
              y={sevenDayAvg}
              stroke="#a39e98"
              strokeDasharray="4 4"
              label={{
                value: `7d avg: ${sevenDayAvg}`,
                position: "right",
                fontSize: 10,
                fill: "#a39e98",
              }}
            />
          )}
          <Area
            type="monotone"
            dataKey="weight"
            stroke="#7048E8"
            strokeWidth={2}
            fill="url(#weightGradient)"
            dot={false}
            activeDot={{ r: 4, fill: "#7048E8" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
