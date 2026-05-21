"use client"

import * as React from "react"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Cell,
} from "recharts"

type Row = { class: string; precision: number; recall: number; f1: number }

export function PerClassChart({ data }: { data: Row[] }) {
  const flat = data.flatMap((d) => [
    { class: d.class, metric: "Precision", value: d.precision },
    { class: d.class, metric: "Recall", value: d.recall },
    { class: d.class, metric: "F1", value: d.f1 },
  ])

  // Wide format easier for Recharts grouped bars
  return (
    <div className="relative h-72 w-full overflow-hidden rounded-lg border border-border bg-card p-4">
      <div className="flex items-baseline justify-between">
        <h4 className="font-display text-lg tracking-tight">
          Stage 2 — Per-class metrics
        </h4>
        <span className="font-mono-tnum text-[10px] uppercase tracking-wider text-muted-foreground">
          precision · recall · f1
        </span>
      </div>
      <div className="mt-2 h-[calc(100%-28px)]">
        <ResponsiveContainer>
          <BarChart data={data} barCategoryGap={28} barGap={4}>
            <CartesianGrid
              vertical={false}
              stroke="color-mix(in oklch, var(--foreground) 8%, transparent)"
            />
            <XAxis
              dataKey="class"
              stroke="var(--muted-foreground)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[0, 1]}
              tickFormatter={(v) => `${Math.round(v * 100)}%`}
              stroke="var(--muted-foreground)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              width={36}
            />
            <Tooltip
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
                color: "var(--popover-foreground)",
              }}
              cursor={{ fill: "color-mix(in oklch, var(--foreground) 4%, transparent)" }}
              formatter={(v) => `${(Number(v) * 100).toFixed(2)}%`}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, color: "var(--muted-foreground)" }}
              iconType="circle"
            />
            <Bar dataKey="precision" name="Precision" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="recall" name="Recall" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="f1" name="F1" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
