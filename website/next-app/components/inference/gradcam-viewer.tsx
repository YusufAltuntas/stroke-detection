"use client"

import * as React from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "motion/react"
import { Flame, Eye, Layers, ImageOff } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import type { GradCam } from "@/lib/samples"

type Mode = "original" | "heatmap" | "overlay"

const MODES: { id: Mode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "original", label: "Original", icon: Eye },
  { id: "heatmap", label: "Heatmap", icon: Flame },
  { id: "overlay", label: "Overlay", icon: Layers },
]

export function GradCamViewer({ gradcam }: { gradcam: GradCam | null }) {
  const [mode, setMode] = React.useState<Mode>("overlay")

  const ready = gradcam && gradcam.status === "available" && gradcam.images
  const url = ready ? gradcam.images[`${mode}Url` as const] : null

  if (!ready || !url) {
    return (
      <div className="flex h-full min-h-[260px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-card/40 p-6 text-center">
        <ImageOff className="size-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          {gradcam?.message ?? "Grad-CAM bu kosturma icin uretilemedi."}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="accent" className="font-mono-tnum text-[10px] normal-case">
            Grad-CAM · {gradcam.stage === "stage1" ? "Stage 1" : "Stage 2"}
          </Badge>
          <span className="text-[11px] text-muted-foreground">
            son karar icin model dikkat haritasi
          </span>
        </div>
        <div className="inline-flex items-center gap-1 rounded-md bg-muted/60 p-1">
          {MODES.map((m) => {
            const Icon = m.icon
            const active = m.id === mode
            return (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium transition-colors",
                  active
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="size-3.5" />
                {m.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-border bg-black/80">
        <AnimatePresence mode="wait">
          <motion.div
            key={url}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0"
          >
            <Image
              src={url}
              alt={`Grad-CAM ${mode}`}
              fill
              unoptimized
              sizes="(min-width: 1024px) 480px, 80vw"
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>

        <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2">
          <span className="rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white/90 backdrop-blur">
            {mode}
          </span>
        </div>
        <div className="pointer-events-none absolute bottom-3 right-3">
          <span className="rounded-full bg-black/45 px-2 py-0.5 font-mono-tnum text-[10px] text-white/90 backdrop-blur">
            512 × 512
          </span>
        </div>
      </div>
    </div>
  )
}
