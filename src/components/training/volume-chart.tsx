"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import type { MuscleGroupVolume } from "@/lib/types/strength"
import { DOMAIN_COLORS, CHART_THEME } from "@/lib/config/design-tokens"

interface VolumeChartProps {
  data: MuscleGroupVolume[]
}

const LOW_THRESHOLD = 8

export function VolumeChart({ data }: VolumeChartProps) {
  return (
    <div>
      <h4 className="text-[13px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
        Volume by Muscle Group — Last 30 Days (Sets)
      </h4>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
          <XAxis type="number" tick={{ fontSize: 11, fill: "#615d59" }} axisLine={false} tickLine={false} />
          <YAxis
            type="category"
            dataKey="muscleGroup"
            tick={{ fontSize: 12, fill: "#615d59" }}
            axisLine={false}
            tickLine={false}
            width={90}
          />
          <Tooltip
            contentStyle={CHART_THEME.tooltipStyle}
            formatter={(value) => [`${value} sets`, "Sets"]}
          />
          <Bar dataKey="sets" radius={[0, 4, 4, 0]} barSize={20}>
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.sets < LOW_THRESHOLD ? "#C92A2A" : DOMAIN_COLORS.strength.primary}
                fillOpacity={entry.sets < LOW_THRESHOLD ? 0.8 : 1}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
