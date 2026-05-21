"use client"

import * as React from "react"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"

type ClassInfo = { label: string; value: number; color: string } | { name: string; count: number; color: string }

function normalize(c: ClassInfo) {
  if ("label" in c) return { name: c.label, count: c.value, color: c.color }
  return c
}

export function DatasetSummary({
  title,
  classes,
  total,
  note,
  index = 0,
}: {
  title: string
  classes: readonly ClassInfo[]
  total: number
  note: string
  index?: number
}) {
  const items = classes.map(normalize)
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="relative overflow-hidden rounded-lg border border-border bg-card p-5"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h4 className="font-display text-lg tracking-tight">{title}</h4>
        <span className="font-mono-tnum text-xs text-muted-foreground">
          n = {total.toLocaleString()}
        </span>
      </div>

      <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-muted">
        {items.map((c, i) => {
          const pct = (c.count / total) * 100
          return (
            <motion.div
              key={c.name}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.7, delay: i * 0.08 }}
              style={{ backgroundColor: c.color }}
            />
          )
        })}
      </div>

      <ul className="mt-4 grid gap-2">
        {items.map((c) => {
          const pct = (c.count / total) * 100
          return (
            <li
              key={c.name}
              className="flex items-center justify-between gap-3 rounded-md border border-border/60 bg-card px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span
                  className="size-2.5 rounded-full"
                  style={{ background: c.color }}
                />
                <span className="text-sm font-medium text-foreground">{c.name}</span>
              </div>
              <div className="flex items-baseline gap-2 font-mono-tnum">
                <span className="text-sm text-foreground">
                  {c.count.toLocaleString()}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {pct.toFixed(1)}%
                </span>
              </div>
            </li>
          )
        })}
      </ul>

      <p className="mt-4 text-[12px] leading-relaxed text-muted-foreground">
        {note}
      </p>
    </motion.div>
  )
}
