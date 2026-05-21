"use client"

import * as React from "react"
import { motion } from "motion/react"
import { Cpu, Layers2, Target } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

export type Mode = "full_pipeline" | "stage1_only" | "stage2_only"

const MODE_DEFS: {
  id: Mode
  title: string
  code: string
  desc: string
  icon: React.ComponentType<{ className?: string }>
}[] = [
  {
    id: "full_pipeline",
    title: "Full Pipeline",
    code: "01 → 02",
    desc: "Once inme tespiti, ardindan inme varsa arter siniflandirmasi.",
    icon: Layers2,
  },
  {
    id: "stage1_only",
    title: "Stage 1 Only",
    code: "01",
    desc: "Sadece inme vs normal ikili siniflandirma.",
    icon: Cpu,
  },
  {
    id: "stage2_only",
    title: "Stage 2 Only",
    code: "02",
    desc: "Bilinen inme orneklerinde dogrudan arter siniflandirmasi.",
    icon: Target,
  },
]

export function PipelineControls({
  mode,
  onModeChange,
}: {
  mode: Mode
  onModeChange: (m: Mode) => void
}) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Pipeline modu
        </p>
        <div className="mt-2 grid gap-2">
          {MODE_DEFS.map((m) => {
            const active = mode === m.id
            const Icon = m.icon
            return (
              <button
                key={m.id}
                onClick={() => onModeChange(m.id)}
                className={cn(
                  "group relative flex w-full items-start gap-3 rounded-md border bg-card px-3 py-2.5 text-left transition-all",
                  active
                    ? "border-primary/50 ring-2 ring-primary/15 shadow-xs"
                    : "border-border hover:border-foreground/25"
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 grid size-8 shrink-0 place-items-center rounded-md transition-colors",
                    active
                      ? "bg-primary/12 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{m.title}</span>
                    <span className="font-mono-tnum text-[10px] text-muted-foreground">
                      {m.code}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                    {m.desc}
                  </p>
                </div>
                {active && (
                  <motion.span
                    layoutId="mode-dot"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    className="mt-1.5 size-2 shrink-0 rounded-full bg-primary"
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <ModelChip
          stage="Stage 1"
          model="EfficientNet-B3"
          params="12.0M"
          dim="binary"
        />
        <ModelChip
          stage="Stage 2"
          model="DenseNet-121"
          params="6.96M"
          dim="3-class"
        />
      </div>
    </div>
  )
}

function ModelChip({
  stage,
  model,
  params,
  dim,
}: {
  stage: string
  model: string
  params: string
  dim: string
}) {
  return (
    <div className="rounded-md border border-border bg-card/60 p-2.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {stage}
        </span>
        <Badge variant="outline" className="font-mono-tnum text-[9px] normal-case">
          {dim}
        </Badge>
      </div>
      <p className="mt-1.5 font-mono-tnum text-xs text-foreground">{model}</p>
      <p className="font-mono-tnum text-[10px] text-muted-foreground">{params} params</p>
    </div>
  )
}
