"use client"

import { PieChart, Pie, Cell } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import type { ResponseStats as ResponseStatsType } from "../types/analytics"

interface ResponseStatsProps {
  stats: ResponseStatsType
  showOnlyChart?: boolean
}

const chartConfig = {
  qr: {
    label: "QR Code",
    color: "var(--chart-1)",
  },
  web: {
    label: "Web Link",
    color: "var(--chart-4)",
  },
} satisfies Record<string, { label: string; color: string }>

export function ResponseStats({ stats, showOnlyChart = false }: ResponseStatsProps) {
  const sourceData = [
    { name: "QR Code", value: stats.qr, fill: "var(--color-qr)" },
    { name: "Web Link", value: stats.web, fill: "var(--color-web)" },
  ]

  if (showOnlyChart) {
    return (
      <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[200px]">
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Pie
            data={sourceData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label={({ name, value, percent }) => {
              if (value === 0) return ""
              return `${name}\n${value} (${(percent * 100).toFixed(0)}%)`
            }}
            labelLine={false}
          >
            {sourceData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>
    )
  }

  // Legacy layout for backward compatibility (not used in new layout)
  return null
}
