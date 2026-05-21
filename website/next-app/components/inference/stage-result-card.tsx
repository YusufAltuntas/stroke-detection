"use client"

import * as React from "react"
import { motion } from "motion/react"
import { CheckCircle2, AlertTriangle, MinusCircle } from "lucide-react"

import { cn, formatPct } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { ProbabilityBars } from "./probability-bars"
import type { StageResult } from "@/lib/samples"

export function StageResultCard({
  stageLabel,
  stageCode,
  result,
  index,
}: {
  stageLabel: string
  stageCode: string
  result: StageResult | null
  index: number
}) {
  if (!result) {
    return (
      <Empty stageLabel={stageLabel} stageCode={stageCode} />
    )
  }

  if (result.skipped) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 * index }}
        className="relative overflow-hidden rounded-lg border border-dashed border-border bg-card/40 p-5"
      >
        <Header stageCode={stageCode} stageLabel={stageLabel} modelName={result.modelName} />
        <div className="mt-5 flex items-start gap-3 rounded-md bg-muted/40 p-3 text-sm">
          <MinusCircle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <p className="text-muted-foreground">
            {result.message ?? "Bu asama icin bir cikti uretilmedi."}
          </p>
        </div>
      </motion.div>
    )
  }

  const isStroke = result.label === "Stroke Detected"
  const isNoStroke = result.label === "No Stroke Detected"

  const tone = isStroke
    ? "destructive"
    : isNoStroke
    ? "success"
    : "primary"

  const toneClasses: Record<string, string> = {
    destructive:
      "from-destructive/15 via-destructive/5 to-transparent ring-destructive/30",
    success: "from-success/15 via-success/5 to-transparent ring-success/30",
    primary: "from-primary/15 via-accent/8 to-transparent ring-primary/30",
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.05 * index, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group relative overflow-hidden rounded-lg border border-border bg-card p-5 shadow-sm",
        "ring-1 ring-transparent transition-shadow hover:shadow-md"
      )}
    >
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-90",
          toneClasses[tone]
        )}
      />
      <div className="relative">
        <Header stageCode={stageCode} stageLabel={stageLabel} modelName={result.modelName} />

        <div className="mt-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Karar
            </p>
            <div className="mt-1 flex items-center gap-2">
              {isStroke && (
                <AlertTriangle className="size-5 text-destructive" />
              )}
              {isNoStroke && <CheckCircle2 className="size-5 text-success" />}
              <h3
                className={cn(
                  "font-display text-2xl tracking-tight",
                  isStroke && "text-destructive",
                  isNoStroke && "text-success",
                  !isStroke && !isNoStroke && "text-foreground"
                )}
              >
                {result.label}
              </h3>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Confidence
            </p>
            <p className="font-mono-tnum text-2xl font-semibold tracking-tight text-foreground">
              {formatPct(result.confidence, 1)}
            </p>
          </div>
        </div>

        <div className="mt-5">
          <ProbabilityBars values={result.probabilities} highlight={result.label} />
        </div>
      </div>
    </motion.div>
  )
}

function Header({
  stageCode,
  stageLabel,
  modelName,
}: {
  stageCode: string
  stageLabel: string
  modelName: string
}) {
  return (
    <div className="relative flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="grid size-7 place-items-center rounded-md bg-foreground/5 font-mono-tnum text-[11px] tracking-wider text-muted-foreground">
          {stageCode}
        </span>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {stageLabel}
          </p>
          <p className="font-mono-tnum text-xs text-foreground/80">{modelName}</p>
        </div>
      </div>
      <Badge variant="outline" className="font-mono-tnum text-[10px] normal-case">
        deep learning
      </Badge>
    </div>
  )
}

function Empty({ stageLabel, stageCode }: { stageLabel: string; stageCode: string }) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-dashed border-border bg-card/40 p-5">
      <div className="absolute inset-0 bg-grid-sm opacity-50" />
      <div className="relative">
        <Header stageCode={stageCode} stageLabel={stageLabel} modelName="bekleniyor" />
        <p className="mt-5 text-sm text-muted-foreground">
          Bu asama henuz calistirilmadi. Bir ornek sec veya bir gorsel yukle, ardindan
          tahmin baslat.
        </p>
      </div>
    </div>
  )
}
