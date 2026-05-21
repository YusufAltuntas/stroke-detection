"use client"

import * as React from "react"
import { motion } from "motion/react"
import {
  Brain,
  Scan,
  Stethoscope,
  ArrowRight,
  ShieldAlert,
  FlaskConical,
  Trophy,
  Sparkles,
  Loader2,
  ServerCrash,
  Info,
} from "lucide-react"

import { cn, formatPct } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ConfusionMatrix } from "@/components/results/confusion-matrix"
import { PerClassChart } from "@/components/results/per-class-chart"
import { ExperimentTable } from "@/components/results/experiment-table"
import { DatasetSummary } from "@/components/results/dataset-summary"
import { getResults, type ResultsResponse } from "@/lib/api"

const NUMERIC_LIKE = /^[-0-9.]+/

export default function ResultsPage() {
  const [data, setData] = React.useState<ResultsResponse | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const r = await getResults()
        if (!cancelled) setData(r)
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? `${err.message} — Backend baglatildi mi? 'uvicorn app.main:app --port 8000'`
              : "Backend istegi basarisiz oldu."
          )
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (error) {
    return (
      <div className="mx-auto max-w-[1400px] px-6 py-20">
        <div className="rounded-lg border border-destructive/30 bg-destructive/8 p-6 text-sm text-destructive">
          <div className="flex items-center gap-2 font-medium">
            <ServerCrash className="size-4" />
            Sonuc verileri yuklenemedi
          </div>
          <p className="mt-2 text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-center gap-3 px-6 py-32 text-sm text-muted-foreground">
        <Loader2 className="size-5 animate-spin text-primary" />
        Backend'den deney sonuclari aliniyor…
      </div>
    )
  }

  const efnb3 = data.experiments.filter((e) => e.family === "EfficientNet-B3")
  const densenet = data.experiments.filter((e) => e.family === "DenseNet-121")

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10 lg:py-14">
      <ResultsHero
        totalExperiments={data.experiments.length}
        bestMacroF1={Math.max(...data.experiments.map((e) => e.macroF1))}
      />

      <Section
        number="01"
        eyebrow="Proje genel bakis"
        title="Iki asamali boru hatti"
        description="Inme tespiti once binary (Stage 1), ardindan arter siniflandirmasi (Stage 2) olarak iki asamada gerceklestirilir."
      >
        <PipelineFlow />
      </Section>

      <Section
        number="02"
        eyebrow="Veri seti"
        title="Sinif dagilimi ve dengesizlik"
        description="ACA sinifi kucuk olduğundan Stage 2 birincil metrigi Macro F1 secildi."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <DatasetSummary
            title="Stage 1 — Stroke vs Normal"
            classes={data.stage1Distribution}
            total={data.stage1Distribution.reduce((a, b) => a + b.value, 0)}
            note="Stage 1 ikili siniflandirma: stroke=ACA+MCA+PCA, normal=demo amacli toplandi."
            index={0}
          />
          <DatasetSummary
            title="Stage 2 — Artery Classification"
            classes={data.stage2Distribution}
            total={data.stage2Distribution.reduce((a, b) => a + b.value, 0)}
            note="MCA:ACA = 8.79:1 oranindaki yuksek dengesizlik nedeniyle birincil metrik Macro F1."
            index={1}
          />
        </div>
      </Section>

      {data.stage1Summary && <Stage1SummarySection summary={data.stage1Summary} />}

      <Section
        number="04"
        eyebrow="Stage 2 deney gecmisi"
        title="Model ailesi denemeleri — 14 deney"
        description="Stage 2 (ACA/MCA/PCA arter siniflandirmasi) icin yurutulen tum deneyler. Stage 1'de iterasyon yapilmadi (bkz. 03). Her satirin yaklasiminin uzerine gelerek detayli aciklamayi gor."
      >
        <div className="grid gap-5">
          <ExperimentTable family="EfficientNet-B3" rows={efnb3} />
          <ExperimentTable family="DenseNet-121" rows={densenet} />
        </div>
        <BestPicksCallout />
      </Section>

      <Section
        number="05"
        eyebrow="Final modeller"
        title="Test seti metrikleri"
        description="Iki asamali boru hattindaki final modeller icin test seti uzerinde olculen birincil metrikler."
      >
        <div className="space-y-8">
          <ModelMetricsBlock
            stage="Stage 1"
            modelName="EfficientNet-B3"
            tagline="Stroke vs Normal · binary · best-shot"
            metrics={data.stage1Metrics}
          />
          <ModelMetricsBlock
            stage="Stage 2"
            modelName="DenseNet-121 v1"
            tagline="Artery classification · 3-class · 14 deneyin en iyisi"
            metrics={data.stage2Metrics}
          />
        </div>
      </Section>

      <Section
        number="06"
        eyebrow="Hata analizi"
        title="Confusion matrix & sinif bazinda metrikler"
        description="Her iki final model icin sinif duzeyinde performans dagilimi."
      >
        <div className="grid gap-5 lg:grid-cols-2">
          {data.stage1ConfusionMatrix && (
            <ConfusionMatrix
              title="Stage 1 — Confusion Matrix"
              classes={data.stage1ConfusionMatrix.classes}
              matrix={data.stage1ConfusionMatrix.matrix}
            />
          )}
          {data.stage2ConfusionMatrix && (
            <ConfusionMatrix
              title="Stage 2 — Confusion Matrix"
              classes={data.stage2ConfusionMatrix.classes}
              matrix={data.stage2ConfusionMatrix.matrix}
            />
          )}
        </div>

        <div className="mt-5">
          <PerClassChart
            data={data.stage2PerClass.map((p) => ({
              class: p.className,
              precision: p.precision,
              recall: p.recall,
              f1: p.f1,
            }))}
          />
        </div>
      </Section>

      <Section
        number="07"
        eyebrow="Sinirlamalar"
        title="Sorumlu kullanim cercevesi"
        description="Sunulan modeller arastirma kapsaminda gelistirilmis bir prototiptir."
      >
        <LimitationsPanel items={data.limitations} />
      </Section>
    </div>
  )
}

/* ──────────────────────── components ──────────────────────── */

function ResultsHero({
  totalExperiments,
  bestMacroF1,
}: {
  totalExperiments: number
  bestMacroF1: number
}) {
  return (
    <div className="relative isolate overflow-hidden rounded-2xl border border-border bg-card/70 px-6 py-10 sm:px-10 sm:py-14">
      <div aria-hidden className="absolute inset-0 bg-mesh opacity-90" />
      <div aria-hidden className="absolute inset-0 bg-grid-sm opacity-50" />
      <div
        aria-hidden
        className="absolute -right-24 -top-24 size-72 rounded-full bg-accent/20 blur-3xl"
      />

      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <Badge variant="accent" className="mb-4">
            <FlaskConical className="size-3" />
            Deneyler & sonuclar
          </Badge>
          <h1 className="font-display text-balance text-4xl leading-[1.05] tracking-tight text-foreground sm:text-5xl">
            {totalExperiments} deney, 2 model ailesi,{" "}
            <span className="text-gradient">tek bir hedef</span>.
          </h1>
          <p className="mt-4 max-w-xl text-balance text-sm leading-relaxed text-muted-foreground sm:text-base">
            Stage 2 (arter siniflandirmasi) icin EfficientNet-B3 ve DenseNet-121
            mimarileri uzerinde sirayla yurutulen denemelerin akademik ozeti.
            Birincil metrik Macro F1. Stage 1 ise tek 'best-shot' modeldir.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <HeroStat label="Final · Stage 1" value="0.973" hint="Stroke F1" />
          <HeroStat label="Final · Stage 2" value={bestMacroF1.toFixed(3)} hint="Macro F1" />
          <HeroStat label="Stage 2 deney" value={String(totalExperiments)} hint="9 efnb3 · 5 densenet" />
          <HeroStat label="Birincil metrik" value="Macro F1" hint="3-class" />
        </div>
      </div>
    </div>
  )
}

function HeroStat({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint: string
}) {
  return (
    <div className="rounded-md border border-border bg-card/70 p-3 backdrop-blur-sm">
      <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-mono-tnum text-xl font-semibold leading-tight text-foreground">
        {value}
      </p>
      <p className="font-mono-tnum text-[10px] text-muted-foreground">{hint}</p>
    </div>
  )
}

function Section({
  number,
  eyebrow,
  title,
  description,
  children,
}: {
  number: string
  eyebrow: string
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="mt-16">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="font-mono-tnum text-[10px] tracking-wider text-muted-foreground">
            {number}
          </span>
          <span className="h-px w-6 bg-border" />
          <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {eyebrow}
          </span>
        </div>
        <h2 className="font-display text-3xl leading-tight tracking-tight text-foreground">
          {title}
        </h2>
        {description && (
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </header>
      <div className="mt-6">{children}</div>
    </section>
  )
}

function Stage1SummarySection({
  summary,
}: {
  summary: NonNullable<ResultsResponse["stage1Summary"]>
}) {
  return (
    <Section
      number="03"
      eyebrow="Stage 1 yaklasim"
      title={summary.title}
      description={summary.description}
    >
      <div className="grid gap-5 md:grid-cols-[1fr_minmax(280px,360px)]">
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="mb-3 flex items-center gap-2">
            <Badge variant="default" className="font-mono-tnum text-[10px] normal-case">
              best-shot
            </Badge>
            <span className="text-[11px] text-muted-foreground">
              Stage 1 icin tek model, cok katmanli strateji
            </span>
          </div>
          <ul className="space-y-2 text-sm">
            {summary.approach.map((line, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-start gap-2 text-foreground/85"
              >
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary/60" />
                <span className="leading-relaxed">{line}</span>
              </motion.li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-primary/25 bg-gradient-to-br from-primary/8 via-accent/4 to-transparent p-5">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="size-4" />
            <span className="text-[10px] font-medium uppercase tracking-wider">
              neden iterasyon yapilmadi
            </span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-foreground/85">
            {summary.note}
          </p>
        </div>
      </div>
    </Section>
  )
}

function PipelineFlow() {
  return (
    <div className="relative overflow-hidden rounded-lg border border-border bg-card p-6">
      <div className="absolute inset-0 bg-grid-sm opacity-40" />
      <div className="relative grid items-center gap-5 md:grid-cols-[1fr_auto_1.4fr_auto_1.4fr]">
        <FlowNode
          icon={Scan}
          stage="Girdi"
          title="MR-DWI"
          desc="Tek kesit gri tonlamali MR-DWI gorsel"
          tone="muted"
        />
        <FlowArrow />
        <FlowNode
          icon={Brain}
          stage="Stage 1"
          title="EfficientNet-B3"
          desc="Stroke vs Normal ikili siniflandirma · sigmoid"
          tone="primary"
          stat={{ label: "Stroke F1", value: "0.973" }}
        />
        <FlowArrow conditional />
        <FlowNode
          icon={Stethoscope}
          stage="Stage 2"
          title="DenseNet-121 v1"
          desc="ACA / MCA / PCA arter siniflandirmasi · softmax"
          tone="accent"
          stat={{ label: "Macro F1", value: "0.853" }}
        />
      </div>

      <Separator className="my-5" />

      <p className="text-[12px] leading-relaxed text-muted-foreground">
        Full pipeline modu: Stage 1 inme tespit etmezse Stage 2 atlanir.
        Stage 2 Only modu: bilinen inme orneklerinde dogrudan arter
        siniflandirmasi.
      </p>
    </div>
  )
}

function FlowNode({
  icon: Icon,
  stage,
  title,
  desc,
  tone = "muted",
  stat,
}: {
  icon: React.ComponentType<{ className?: string }>
  stage: string
  title: string
  desc: string
  tone?: "primary" | "accent" | "muted"
  stat?: { label: string; value: string }
}) {
  const toneCls: Record<string, string> = {
    primary: "from-primary/15 to-primary/5 border-primary/30 text-primary",
    accent: "from-accent/15 to-accent/5 border-accent/30 text-accent",
    muted: "from-muted/40 to-muted/10 border-border text-foreground",
  }
  const iconCls: Record<string, string> = {
    primary: "bg-primary/15 text-primary",
    accent: "bg-accent/15 text-accent",
    muted: "bg-muted text-foreground/80",
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "relative overflow-hidden rounded-lg border bg-gradient-to-br p-4",
        toneCls[tone]
      )}
    >
      <div className="flex items-start gap-3">
        <span className={cn("grid size-9 place-items-center rounded-md", iconCls[tone])}>
          <Icon className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            {stage}
          </p>
          <h4 className="font-display text-lg leading-tight tracking-tight text-foreground">
            {title}
          </h4>
        </div>
        {stat && (
          <div className="ml-auto text-right">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {stat.label}
            </p>
            <p className="font-mono-tnum text-base font-semibold text-foreground">
              {stat.value}
            </p>
          </div>
        )}
      </div>
      <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
        {desc}
      </p>
    </motion.div>
  )
}

function FlowArrow({ conditional }: { conditional?: boolean }) {
  return (
    <div className="hidden flex-col items-center md:flex">
      <ArrowRight className="size-4 text-foreground/40" />
      {conditional && (
        <span className="mt-1 rounded-full bg-muted px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-muted-foreground">
          if stroke
        </span>
      )}
    </div>
  )
}

function ModelMetricsBlock({
  stage,
  modelName,
  tagline,
  metrics,
}: {
  stage: string
  modelName: string
  tagline: string
  metrics: { label: string; value: string; note: string | null }[]
}) {
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-baseline gap-3">
        <span className="font-mono-tnum text-[10px] uppercase tracking-wider text-muted-foreground">
          {stage}
        </span>
        <span className="h-px w-6 bg-border" />
        <h3 className="font-display text-2xl tracking-tight text-foreground">
          {modelName}
        </h3>
        <span className="text-sm text-muted-foreground">· {tagline}</span>
      </div>
      <div
        className="grid gap-3"
        style={{
          gridTemplateColumns: `repeat(${Math.min(metrics.length, 5)}, minmax(0,1fr))`,
        }}
      >
        {metrics.map((m, i) => (
          <MetricCardCompact
            key={m.label}
            label={m.label}
            value={m.value}
            hint={m.note ?? undefined}
            tone={i === 1 ? "accent" : i === 0 ? "primary" : "muted"}
            index={i}
          />
        ))}
      </div>
    </div>
  )
}

function MetricCardCompact({
  label,
  value,
  hint,
  tone = "muted",
  index = 0,
}: {
  label: string
  value: string
  hint?: string
  tone?: "primary" | "accent" | "muted"
  index?: number
}) {
  const TONE: Record<string, string> = {
    primary: "from-primary/15 to-accent/5 border-primary/25",
    accent: "from-accent/18 to-primary/5 border-accent/25",
    muted: "from-muted/40 to-muted/10 border-border",
  }
  const isNumericPct = NUMERIC_LIKE.test(value) && Number.isFinite(Number(value))
  const display = isNumericPct ? formatPct(Number(value), 2) : value
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
      <div className="relative">
        <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
          {label}
        </p>
        <p className="mt-3 font-mono-tnum text-3xl font-semibold tracking-tight text-foreground">
          {display}
        </p>
        {hint && (
          <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>
        )}
      </div>
    </motion.div>
  )
}

function BestPicksCallout() {
  return (
    <TooltipProvider delayDuration={150}>
      <div className="mt-5 grid gap-3 rounded-lg border border-primary/25 bg-gradient-to-br from-primary/8 via-accent/4 to-transparent p-5 md:grid-cols-2">
        <BestPick
          stage="Stage 1"
          model="EfficientNet-B3 (best-shot)"
          reason="Yuksek stroke recall (0.98) ile yanlis negatifi minimumda tutar."
          detail="Two-stage finetune + EMA + TTA + constraint'li threshold secimi. Iterasyon yapilmadi cunku tek modelle hedef ustu sonuca ulasildi."
        />
        <BestPick
          stage="Stage 2"
          model="DenseNet-121 v1"
          reason="Macro F1 = 0.8533 ve ACA F1 = 0.8036 ile 14 deneyin en iyisi."
          detail="Focal Loss (gamma=1.5, power=0.5) softened class weights. EfnB3'te en iyi sonucu veren konfigurasyon DenseNet'e tasindi, ACA precision ve recall ayni anda 0.80+ seviyesine cikti."
        />
      </div>
    </TooltipProvider>
  )
}

function BestPick({
  stage,
  model,
  reason,
  detail,
}: {
  stage: string
  model: string
  reason: string
  detail: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-md bg-card/70 p-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-md bg-primary/15 text-primary">
        <Trophy className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Final · {stage}
          </p>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="inline-grid size-5 place-items-center rounded-full text-muted-foreground/70 hover:bg-muted hover:text-foreground"
                aria-label="Detay"
              >
                <Info className="size-3" />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              align="end"
              className="max-w-[320px] text-[11px] leading-relaxed"
            >
              {detail}
            </TooltipContent>
          </Tooltip>
        </div>
        <p className="font-display text-base text-foreground">{model}</p>
        <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
          {reason}
        </p>
      </div>
    </div>
  )
}

function LimitationsPanel({ items }: { items: string[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {items.map((l, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="flex items-start gap-3 rounded-lg border border-border bg-card p-4"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-md bg-warning/15 text-warning-foreground">
            <ShieldAlert className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="text-[12px] leading-relaxed text-muted-foreground">
              {l}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
