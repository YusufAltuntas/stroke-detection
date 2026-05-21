"use client"

import * as React from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"

export function ConfusionMatrix({
  title,
  classes,
  matrix,
}: {
  title: string
  classes: string[]
  matrix: number[][]
}) {
  const rowSums = matrix.map((r) => r.reduce((a, b) => a + b, 0))
  const max = Math.max(...matrix.flat())

  return (
    <div className="relative overflow-hidden rounded-lg border border-border bg-card p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h4 className="font-display text-lg tracking-tight">{title}</h4>
        <span className="font-mono-tnum text-[10px] uppercase tracking-wider text-muted-foreground">
          rows: true · cols: pred
        </span>
      </div>

      <div
        className="mt-5 grid gap-1.5"
        style={{
          gridTemplateColumns: `auto repeat(${classes.length}, minmax(0,1fr))`,
        }}
      >
        <div />
        {classes.map((c) => (
          <div
            key={`col-${c}`}
            className="text-center text-[10px] font-medium uppercase tracking-wider text-muted-foreground"
          >
            {c}
          </div>
        ))}

        {matrix.map((row, ri) => (
          <React.Fragment key={`row-${ri}`}>
            <div className="grid place-items-end pr-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {classes[ri]}
            </div>
            {row.map((v, ci) => {
              const intensity = max > 0 ? v / max : 0
              const isDiagonal = ri === ci
              const pct = rowSums[ri] > 0 ? v / rowSums[ri] : 0
              return (
                <motion.div
                  key={`cell-${ri}-${ci}`}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (ri * row.length + ci) * 0.04 }}
                  className={cn(
                    "relative grid aspect-square place-items-center rounded-md border text-sm font-medium",
                    isDiagonal
                      ? "border-primary/30 text-primary"
                      : "border-border text-foreground/80"
                  )}
                  style={{
                    background: isDiagonal
                      ? `color-mix(in oklch, var(--primary) ${10 + intensity * 28}%, transparent)`
                      : `color-mix(in oklch, var(--destructive) ${intensity * 18}%, transparent)`,
                  }}
                >
                  <span className="font-mono-tnum">{v}</span>
                  <span className="absolute bottom-1 right-1.5 font-mono-tnum text-[9px] text-muted-foreground">
                    {(pct * 100).toFixed(0)}%
                  </span>
                </motion.div>
              )
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}
