"use client"

import * as React from "react"
import { motion } from "motion/react"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"
import type { SampleItem } from "@/lib/api"

const TONE: Record<string, string> = {
  Normal: "border-success/30 bg-success/8 text-success",
  ACA: "border-chart-1/30 bg-chart-1/8 text-chart-1",
  MCA: "border-chart-2/30 bg-chart-2/8 text-chart-2",
  PCA: "border-chart-3/30 bg-chart-3/8 text-chart-3",
}

export function SamplePicker({
  samples,
  selectedId,
  onSelect,
}: {
  samples: SampleItem[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  if (samples.length === 0) {
    return (
      <div className="grid place-items-center rounded-lg border border-dashed border-border bg-card/40 p-8 text-center text-sm text-muted-foreground">
        Ornek goruntu listesi yukleniyor… Backend baslatildigindan emin ol.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
      {samples.map((s, i) => {
        const active = selectedId === s.id
        const tone = TONE[s.labelGroup] ?? "border-border bg-muted text-muted-foreground"
        return (
          <motion.button
            key={s.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            onClick={() => onSelect(s.id)}
            className={cn(
              "group relative overflow-hidden rounded-lg border bg-card text-left transition-all",
              active
                ? "border-primary/60 shadow-md ring-2 ring-primary/30"
                : "border-border hover:border-foreground/30 hover:shadow-sm"
            )}
          >
            <div className="relative aspect-square w-full overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.thumbnailUrl}
                alt={s.displayName}
                className={cn(
                  "size-full object-cover transition-transform duration-500",
                  "group-hover:scale-[1.04]"
                )}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
              <span
                className={cn(
                  "absolute left-2 top-2 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider backdrop-blur",
                  tone
                )}
              >
                {s.labelGroup}
              </span>
              {active && (
                <span className="absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm">
                  <Check className="size-3.5" />
                </span>
              )}
              <p className="absolute bottom-2 left-2 font-mono-tnum text-xs font-medium text-white">
                {s.displayName}
              </p>
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}
