"use client"

import * as React from "react"
import { motion } from "motion/react"
import { TrendingUp } from "lucide-react"
import { cn, formatPct } from "@/lib/utils"

const TONE: Record<string, string> = {
  primary: "from-primary/15 to-accent/5 border-primary/25",
  accent: "from-accent/18 to-primary/5 border-accent/25",
  muted: "from-muted/40 to-muted/10 border-border",
}

export function MetricCard({
  label,
  value,
  hint,
  tone = "muted",
  index = 0,
}: {
  label: string
  value: number
  hint?: string
  tone?: "primary" | "accent" | "muted"
  index?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className={cn(
        "relative overflow-hidden rounded-lg border bg-gradient-to-br p-4",
        TONE[tone]
      )}
    >
      <div className="absolute inset-0 bg-grid-sm opacity-30" />
      <div className="relative flex items-start justify-between gap-2">
        <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
          {label}
        </p>
        <TrendingUp className="size-3.5 text-muted-foreground/60" />
      </div>
      <p className="relative mt-3 font-mono-tnum text-3xl font-semibold tracking-tight text-foreground">
        {formatPct(value, 2)}
      </p>
      {hint && (
        <p className="relative mt-1 text-[11px] text-muted-foreground">
          {hint}
        </p>
      )}
    </motion.div>
  )
}
