"use client"

import * as React from "react"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"
import { formatPct } from "@/lib/utils"
import type { Probability } from "@/lib/samples"

const CLASS_COLOR: Record<string, string> = {
  Stroke: "from-destructive/80 to-destructive",
  "No Stroke": "from-success/80 to-success",
  ACA: "from-chart-1 to-primary",
  MCA: "from-chart-2 to-accent",
  PCA: "from-chart-3 to-success",
}

export function ProbabilityBars({
  values,
  highlight,
  className,
}: {
  values: Probability[]
  highlight?: string
  className?: string
}) {
  return (
    <ul className={cn("flex flex-col gap-2.5", className)}>
      {values.map((v, i) => {
        const pct = Math.max(0, Math.min(1, v.probability))
        const isMax = highlight ? v.label === highlight : false
        return (
          <li key={v.label} className="flex flex-col gap-1">
            <div className="flex items-baseline justify-between gap-2">
              <span
                className={cn(
                  "text-[11px] font-medium uppercase tracking-wider",
                  isMax ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {v.label}
              </span>
              <span className="font-mono-tnum text-xs text-foreground/80">
                {formatPct(pct, 2)}
              </span>
            </div>
            <div className="relative h-1.5 overflow-hidden rounded-full bg-muted">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct * 100}%` }}
                transition={{ duration: 0.9, delay: 0.08 * i, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                  "h-full rounded-full bg-gradient-to-r",
                  CLASS_COLOR[v.label] ?? "from-primary/70 to-primary",
                  !isMax && "opacity-70"
                )}
              />
            </div>
          </li>
        )
      })}
    </ul>
  )
}
