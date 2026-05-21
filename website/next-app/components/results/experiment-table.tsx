"use client"

import * as React from "react"
import { motion } from "motion/react"
import { Trophy, Info } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn, formatPct } from "@/lib/utils"
import type { ExperimentRow } from "@/lib/api"

export function ExperimentTable({
  family,
  rows,
}: {
  family: string
  rows: ExperimentRow[]
}) {
  const max = Math.max(...rows.map((r) => r.macroF1))

  return (
    <TooltipProvider delayDuration={150}>
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="font-mono-tnum text-[10px] uppercase tracking-wider text-muted-foreground">
              family
            </span>
            <h4 className="font-display text-lg tracking-tight">{family}</h4>
          </div>
          <span className="font-mono-tnum text-[10px] uppercase tracking-wider text-muted-foreground">
            {rows.length} runs
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-2.5 text-left font-medium">Run</th>
                <th className="px-5 py-2.5 text-right font-medium">Macro F1</th>
                <th className="px-5 py-2.5 text-right font-medium">ACA F1</th>
                <th className="px-5 py-2.5 text-right font-medium">MCA F1</th>
                <th className="px-5 py-2.5 text-right font-medium">PCA F1</th>
                <th className="px-5 py-2.5 text-left font-medium">Yaklasim</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <motion.tr
                  key={`${r.family}-${r.version}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={cn(
                    "border-b border-border/60 transition-colors",
                    r.selected ? "bg-primary/5" : "hover:bg-muted/30"
                  )}
                >
                  <td className="px-5 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono-tnum text-[12px] text-foreground">
                        {r.version}
                      </span>
                      {r.selected && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/12 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider text-primary">
                          <Trophy className="size-3" /> final
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-2.5 text-right">
                    <MetricBar value={r.macroF1} max={max} />
                  </td>
                  <td className="px-5 py-2.5 text-right font-mono-tnum text-[12px] text-foreground/80">
                    {r.acaF1 != null ? formatPct(r.acaF1, 2) : "—"}
                  </td>
                  <td className="px-5 py-2.5 text-right font-mono-tnum text-[12px] text-foreground/80">
                    {r.mcaF1 != null ? formatPct(r.mcaF1, 2) : "—"}
                  </td>
                  <td className="px-5 py-2.5 text-right font-mono-tnum text-[12px] text-foreground/80">
                    {r.pcaF1 != null ? formatPct(r.pcaF1, 2) : "—"}
                  </td>
                  <td className="px-5 py-2.5 text-[12px] text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <span className="max-w-[34ch] truncate" title={r.strategy}>
                        {r.strategy}
                      </span>
                      {r.strategyDetail && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className="inline-grid size-4 shrink-0 place-items-center rounded-full text-muted-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
                              aria-label="Yaklasim detayi"
                            >
                              <Info className="size-3" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent
                            side="left"
                            align="start"
                            className="max-w-[340px] text-[11px] leading-relaxed"
                          >
                            <p className="font-medium text-foreground">
                              {r.strategy}
                            </p>
                            <p className="mt-1 text-muted-foreground">
                              {r.strategyDetail}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </TooltipProvider>
  )
}

function MetricBar({ value, max }: { value: number; max: number }) {
  const pct = (value / max) * 100
  return (
    <div className="flex items-center justify-end gap-2">
      <div className="h-1 w-20 overflow-hidden rounded-full bg-muted">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7 }}
          className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
        />
      </div>
      <span className="font-mono-tnum text-[12px] font-semibold text-foreground">
        {formatPct(value, 2)}
      </span>
    </div>
  )
}
