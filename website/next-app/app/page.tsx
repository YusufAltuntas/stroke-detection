"use client"

import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  Brain,
  Play,
  Loader2,
  RotateCcw,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  ServerCrash,
  CheckCircle2,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { SamplePicker } from "@/components/inference/sample-picker"
import { UploadDropzone, type UploadState } from "@/components/inference/upload-dropzone"
import { PipelineControls, type Mode } from "@/components/inference/pipeline-controls"
import { StageResultCard } from "@/components/inference/stage-result-card"
import { GradCamViewer } from "@/components/inference/gradcam-viewer"
import {
  API_BASE,
  getHealth,
  getSamples,
  predictSample,
  predictUpload,
  withAbsoluteAssets,
  type HealthResponse,
  type PredictResponse,
  type SampleItem,
} from "@/lib/api"

type Status =
  | "loading-backend"
  | "idle"
  | "sample-selected"
  | "upload-selected"
  | "running"
  | "success"
  | "rejected"
  | "error"

export default function InferencePage() {
  const [tab, setTab] = React.useState<"sample" | "upload">("sample")
  const [sampleId, setSampleId] = React.useState<string | null>(null)
  const [upload, setUpload] = React.useState<UploadState>(null)
  const [mode, setMode] = React.useState<Mode>("full_pipeline")
  const [status, setStatus] = React.useState<Status>("loading-backend")
  const [result, setResult] = React.useState<PredictResponse | null>(null)
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null)
  const [samples, setSamples] = React.useState<SampleItem[]>([])
  const [health, setHealth] = React.useState<HealthResponse | null>(null)
  const [backendError, setBackendError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const controller = new AbortController()
    let cancelled = false
    ;(async () => {
      try {
        const [h, s] = await Promise.all([
          getHealth(controller.signal),
          getSamples(),
        ])
        if (cancelled) return
        setHealth(h)
        setSamples(s.samples)
        setStatus("idle")
      } catch (err) {
        if (cancelled) return
        setBackendError(
          `Backend baglanamadi (${API_BASE}). FastAPI sunucusunu baslat: 'uvicorn app.main:app --port 8000'.`
        )
        setStatus("idle")
      }
    })()
    return () => {
      cancelled = true
      controller.abort()
    }
  }, [])

  const canRun =
    !backendError &&
    ((tab === "sample" && sampleId !== null) ||
      (tab === "upload" && upload !== null))

  const reset = () => {
    setSampleId(null)
    setUpload(null)
    setResult(null)
    setStatus(backendError ? "idle" : "idle")
    setStatusMessage(null)
  }

  const handleRun = async () => {
    if (!canRun) return
    setStatus("running")
    setStatusMessage(null)
    setResult(null)
    try {
      let response: PredictResponse
      if (tab === "sample" && sampleId) {
        response = await predictSample(sampleId, mode)
      } else if (tab === "upload" && upload) {
        response = await predictUpload(upload.file, mode)
      } else {
        return
      }

      response = withAbsoluteAssets(response)
      setResult(response)

      if (response.status === "success") {
        setStatus("success")
      } else if (response.status === "validation_rejected") {
        setStatus("rejected")
        setStatusMessage(
          response.validationMessage ?? "Goruntu dogrulamadan gecemedi."
        )
      } else if (response.status === "model_unavailable") {
        setStatus("error")
        setStatusMessage(
          response.validationMessage ??
            "Model dosyasi yuklenemedi - checkpoint mevcut mu?"
        )
      } else {
        setStatus("error")
        setStatusMessage(
          response.validationMessage ??
            "Inference sirasinda bir hata olustu."
        )
      }
    } catch (err) {
      setStatus("error")
      setStatusMessage(
        err instanceof Error ? err.message : "Backend istegi basarisiz oldu."
      )
    }
  }

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10 lg:py-14">
      <Hero health={health} backendError={backendError} />

      <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-6">
          <Panel
            number="01"
            eyebrow="Girdi"
            title="Bir ornek sec ya da kendi gorselini yukle"
            description="Hazirlanmis kesitler onceden hesaplanmis tahmin ve Grad-CAM kullanir; yukledigin gorseller backend uzerinde gercek inference + Grad-CAM ile islenir."
          >
            <Tabs
              value={tab}
              onValueChange={(v) => setTab(v as "sample" | "upload")}
            >
              <TabsList>
                <TabsTrigger value="sample">Ornek Gorsel</TabsTrigger>
                <TabsTrigger value="upload">Gorsel Yukle</TabsTrigger>
              </TabsList>
              <TabsContent value="sample">
                <SamplePicker
                  samples={samples}
                  selectedId={sampleId}
                  onSelect={(id) => {
                    setSampleId(id)
                    setStatus("sample-selected")
                    setResult(null)
                    setStatusMessage(null)
                  }}
                />
              </TabsContent>
              <TabsContent value="upload">
                <UploadDropzone
                  value={upload}
                  onChange={(u) => {
                    setUpload(u)
                    setStatus(u ? "upload-selected" : "idle")
                    setResult(null)
                    setStatusMessage(null)
                  }}
                />
              </TabsContent>
            </Tabs>
          </Panel>

          <Panel
            number="02"
            eyebrow="Kontroller"
            title="Pipeline ve modelleri yapilandir"
            description="Calistirma stratejisini sec. Modeller backend tarafinda lazy-load edilir, ilk istekte yuklenir."
          >
            <PipelineControls mode={mode} onModeChange={setMode} />
            <Separator className="my-5" />
            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                size="lg"
                onClick={handleRun}
                disabled={!canRun || status === "running"}
                className="font-medium"
              >
                {status === "running" ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Tahmin ediliyor…
                  </>
                ) : (
                  <>
                    <Play />
                    Tahmin Baslat
                  </>
                )}
              </Button>
              <Button variant="ghost" onClick={reset} disabled={status === "running"}>
                <RotateCcw />
                Sifirla
              </Button>
              <div className="ml-auto flex items-center gap-2 text-[11px] text-muted-foreground">
                <Sparkles className="size-3.5 text-accent" />
                Stage 1: EfficientNet-B3 · Stage 2: DenseNet-121
              </div>
            </div>
            {statusMessage && status !== "success" && (
              <Alert variant={status === "rejected" ? "warning" : "destructive"} className="mt-4">
                <AlertTriangle />
                <AlertDescription>{statusMessage}</AlertDescription>
              </Alert>
            )}
          </Panel>
        </section>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <PipelineDiagram mode={mode} result={result} />
          <SelectedPreview
            tab={tab}
            sample={samples.find((s) => s.id === sampleId) ?? null}
            upload={upload}
          />
          <BackendCard health={health} backendError={backendError} />
        </aside>
      </div>

      <section className="mt-12">
        <SectionHeader
          number="03"
          eyebrow="Sonuclar"
          title={
            status === "success"
              ? "Pipeline ciktilari ve dikkat haritasi"
              : "Sonuclar henuz yok"
          }
          description={
            status === "success"
              ? "Her asama icin model karari, guven skoru, sinif olasiliklari ve Grad-CAM dikkat haritasi - backend uzerinden uretildi."
              : "Tahmin baslatildiktan sonra her asama icin model ciktilari burada gosterilecek."
          }
        />

        <AnimatePresence mode="wait">
          {status === "running" && (
            <motion.div
              key="running"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-6"
            >
              <RunningSkeleton />
            </motion.div>
          )}

          {status === "success" && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)]"
            >
              <div className="space-y-4">
                <StageResultCard
                  stageLabel="Stage 1 · Stroke Detection"
                  stageCode="01"
                  result={result.stage1}
                  index={0}
                />
                <StageResultCard
                  stageLabel="Stage 2 · Artery Classification"
                  stageCode="02"
                  result={result.stage2}
                  index={1}
                />
              </div>
              <div className="rounded-lg border border-border bg-card p-5">
                <GradCamViewer gradcam={result.gradcam} />
                {result.warnings.length > 0 && (
                  <Alert variant="info" className="mt-4">
                    <Sparkles />
                    <AlertDescription>
                      {result.warnings.map((w, i) => (
                        <p key={i}>{w}</p>
                      ))}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </motion.div>
          )}

          {status !== "running" && status !== "success" && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-6"
            >
              <EmptyResults backendError={backendError} />
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  )
}

function Hero({
  health,
  backendError,
}: {
  health: HealthResponse | null
  backendError: string | null
}) {
  return (
    <div className="relative isolate overflow-hidden rounded-2xl border border-border bg-card/70 px-6 py-10 sm:px-10 sm:py-14">
      <div aria-hidden className="absolute inset-0 bg-mesh opacity-90" />
      <div aria-hidden className="absolute inset-0 bg-grid-sm opacity-50" />
      <div
        aria-hidden
        className="absolute -right-24 -top-24 size-72 rounded-full bg-primary/15 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -bottom-24 -left-12 size-72 rounded-full bg-accent/15 blur-3xl"
      />

      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <Badge variant="default" className="mb-4">
            <span className="size-1.5 rounded-full bg-primary animate-pulse" />
            Iki asamali boru hatti
          </Badge>
          <h1 className="font-display text-balance text-4xl leading-[1.05] tracking-tight text-foreground sm:text-5xl">
            MR-DWI uzerinden{" "}
            <span className="text-gradient">inme tespiti</span>
            <br className="hidden sm:block" />
            ve arter siniflandirmasi.
          </h1>
          <p className="mt-4 max-w-xl text-balance text-sm leading-relaxed text-muted-foreground sm:text-base">
            EfficientNet-B3 ile inme/normal ayrimi, ardindan DenseNet-121 ile
            ACA / MCA / PCA arter siniflandirmasi. Tum sonuclar Grad-CAM dikkat
            haritalariyla aciklanir.
          </p>
          {backendError && (
            <p className="mt-3 inline-flex items-center gap-2 rounded-md bg-destructive/12 px-3 py-1.5 text-[11px] text-destructive">
              <ServerCrash className="size-3.5" />
              {backendError}
            </p>
          )}
          {!backendError && health && (
            <p className="mt-3 inline-flex items-center gap-2 rounded-md bg-success/12 px-3 py-1.5 text-[11px] text-success">
              <CheckCircle2 className="size-3.5" />
              Backend bagli — Stage 1:{" "}
              {health.stage1ModelExists ? "yuklu" : "bulunamadi"} · Stage 2:{" "}
              {health.stage2ModelExists ? "yuklu" : "bulunamadi"}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <KpiPill label="Stage 1 · Accuracy" value="95.5%" />
          <KpiPill label="Stage 1 · Stroke F1" value="0.973" tone="accent" />
          <KpiPill label="Stage 2 · Macro F1" value="0.853" tone="primary" />
        </div>
      </div>
    </div>
  )
}

function KpiPill({
  label,
  value,
  tone = "muted",
}: {
  label: string
  value: string
  tone?: "muted" | "primary" | "accent"
}) {
  const toneCls =
    tone === "primary"
      ? "border-primary/30 bg-primary/8 text-primary"
      : tone === "accent"
      ? "border-accent/30 bg-accent/10 text-accent"
      : "border-border bg-card text-foreground"
  return (
    <div className={cn("rounded-md border px-3 py-2 text-right", toneCls)}>
      <p className="text-[10px] font-medium uppercase tracking-[0.15em] opacity-80">
        {label}
      </p>
      <p className="font-mono-tnum text-lg font-semibold leading-tight">{value}</p>
    </div>
  )
}

function Panel({
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
    <div className="relative rounded-lg border border-border bg-card p-5 sm:p-6 shadow-xs">
      <SectionHeader
        number={number}
        eyebrow={eyebrow}
        title={title}
        description={description}
      />
      <div className="mt-5">{children}</div>
    </div>
  )
}

function SectionHeader({
  number,
  eyebrow,
  title,
  description,
}: {
  number: string
  eyebrow: string
  title: string
  description?: string
}) {
  return (
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
      <h2 className="font-display text-2xl leading-tight tracking-tight text-foreground sm:text-[26px]">
        {title}
      </h2>
      {description && (
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
    </header>
  )
}

function PipelineDiagram({
  mode,
  result,
}: {
  mode: Mode
  result: PredictResponse | null
}) {
  const stage1Active =
    mode !== "stage2_only" && result?.stage1 && !result.stage1.skipped
  const stage2Active =
    mode !== "stage1_only" &&
    (result?.stage2 ? !result.stage2.skipped : mode === "stage2_only")

  return (
    <div className="relative overflow-hidden rounded-lg border border-border bg-card p-5">
      <div className="absolute inset-0 bg-grid-sm opacity-40" />
      <div className="relative">
        <div className="flex items-center gap-2">
          <Badge variant="muted" className="font-mono-tnum text-[10px] normal-case">
            pipeline
          </Badge>
          <span className="text-[11px] text-muted-foreground">
            akis su anki moda gore yansir
          </span>
        </div>

        <div className="mt-4 grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2">
          <PipelineNode icon={Brain} label="MR-DWI" active />
          <PipelineEdge active={mode !== "stage2_only"} />
          <PipelineNode
            label="Stage 1"
            sub="EfficientNet-B3"
            active={mode !== "stage2_only"}
            highlight={!!stage1Active}
          />
          <PipelineEdge
            active={mode === "full_pipeline" || mode === "stage2_only"}
          />
          <PipelineNode
            label="Stage 2"
            sub="DenseNet-121"
            active={mode !== "stage1_only"}
            highlight={!!stage2Active}
          />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-[10px] text-muted-foreground">
          <span className="text-center">girdi</span>
          <span className="text-center">inme / normal</span>
          <span className="text-center">ACA · MCA · PCA</span>
        </div>
      </div>
    </div>
  )
}

function PipelineNode({
  icon: Icon,
  label,
  sub,
  active,
  highlight,
}: {
  icon?: React.ComponentType<{ className?: string }>
  label: string
  sub?: string
  active?: boolean
  highlight?: boolean
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center gap-1.5 rounded-md border bg-card px-2 py-3 text-center transition-all",
        active
          ? "border-foreground/15"
          : "border-dashed border-border opacity-50",
        highlight && "ring-2 ring-primary/30 border-primary/40"
      )}
    >
      {Icon ? (
        <span
          className={cn(
            "grid size-7 place-items-center rounded-md",
            highlight
              ? "bg-primary/15 text-primary"
              : active
              ? "bg-muted text-foreground"
              : "bg-muted text-muted-foreground"
          )}
        >
          <Icon className="size-4" />
        </span>
      ) : (
        <span
          className={cn(
            "h-7 w-full rounded bg-gradient-to-br",
            highlight ? "from-primary/30 to-accent/30" : "from-muted to-muted/50"
          )}
        />
      )}
      <p className="text-[11px] font-medium text-foreground">{label}</p>
      {sub && (
        <p className="font-mono-tnum text-[9px] text-muted-foreground">{sub}</p>
      )}
    </div>
  )
}

function PipelineEdge({ active }: { active?: boolean }) {
  return (
    <ArrowRight
      className={cn(
        "size-4 transition-colors",
        active ? "text-foreground/60" : "text-muted-foreground/40"
      )}
    />
  )
}

function SelectedPreview({
  tab,
  sample,
  upload,
}: {
  tab: "sample" | "upload"
  sample: SampleItem | null
  upload: UploadState
}) {
  const src =
    tab === "sample" && sample
      ? sample.imageUrl
      : tab === "upload" && upload
      ? upload.previewUrl
      : null

  const label =
    tab === "sample" && sample
      ? sample.displayName
      : tab === "upload" && upload
      ? "Yuklenen Gorsel"
      : "Henuz girdi yok"

  return (
    <div className="relative overflow-hidden rounded-lg border border-border bg-card">
      <div className="aspect-[4/3] w-full overflow-hidden bg-black/80">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={label}
            className="size-full object-cover transition-opacity duration-300"
          />
        ) : (
          <div className="grid size-full place-items-center text-center text-xs text-white/40">
            <p>
              Gorsel onizlemesi
              <br />
              burada gosterilir
            </p>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-border bg-card px-3 py-2">
        <p className="font-mono-tnum text-xs text-foreground">{label}</p>
        {tab === "upload" && upload && (
          <Badge variant="accent" className="font-mono-tnum text-[9px] normal-case">
            upload
          </Badge>
        )}
        {tab === "sample" && sample && (
          <Badge variant="default" className="font-mono-tnum text-[9px] normal-case">
            sample
          </Badge>
        )}
      </div>
    </div>
  )
}

function BackendCard({
  health,
  backendError,
}: {
  health: HealthResponse | null
  backendError: string | null
}) {
  const items = [
    { label: "Stage 1 model", ok: health?.stage1ModelExists, path: "best_efficientnet_b3_A_fullstroke.pth" },
    { label: "Stage 2 model", ok: health?.stage2ModelExists, path: "best_model_densenet_v1.pth" },
    { label: "Sample assets", ok: health?.samplesReady, path: "demo-assets/samples" },
    { label: "Runtime cache", ok: health?.runtimeReady, path: "demo-assets/runtime" },
  ]
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <Badge variant={backendError ? "destructive" : "success"} className="font-mono-tnum text-[10px] normal-case">
          {backendError ? "offline" : "online"}
        </Badge>
        <span className="font-mono-tnum text-[10px] text-muted-foreground">
          {API_BASE}
        </span>
      </div>
      <ul className="mt-3 space-y-1.5 text-[11px]">
        {items.map((it) => (
          <li key={it.label} className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">{it.label}</span>
            <span
              className={cn(
                "font-mono-tnum",
                backendError
                  ? "text-muted-foreground/60"
                  : it.ok
                  ? "text-success"
                  : "text-destructive"
              )}
            >
              {backendError ? "—" : it.ok ? "ready" : "missing"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function RunningSkeleton() {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)]">
      <div className="space-y-4">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="relative overflow-hidden rounded-lg border border-border bg-card p-5"
          >
            <div className="flex items-center gap-3">
              <div className="size-7 rounded-md bg-muted" />
              <div className="h-4 w-36 rounded bg-muted" />
            </div>
            <div className="mt-5 h-7 w-48 rounded bg-muted" />
            <div className="mt-4 space-y-2">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full w-1/2 animate-pulse rounded-full bg-primary/40" />
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full w-1/3 animate-pulse rounded-full bg-accent/40" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="aspect-square w-full animate-pulse rounded-md bg-muted" />
      </div>
    </div>
  )
}

function EmptyResults({ backendError }: { backendError: string | null }) {
  return (
    <div className="relative grid place-items-center overflow-hidden rounded-lg border border-dashed border-border bg-card/40 p-12">
      <div className="absolute inset-0 bg-dot opacity-50" />
      <div className="relative flex flex-col items-center gap-3 text-center">
        <div className="grid size-12 place-items-center rounded-full bg-gradient-to-br from-primary/15 to-accent/15 text-primary">
          <Brain className="size-5" />
        </div>
        <p className="text-sm font-medium text-foreground">
          {backendError
            ? "Backend ile baglanti kurulamadi"
            : "Tahmin sonuclari icin bir girdi sec ve baslat"}
        </p>
        <p className="max-w-md text-xs text-muted-foreground">
          {backendError
            ? `Lutfen FastAPI sunucusunu baslat: cd website/backend && uvicorn app.main:app --port 8000`
            : "Sol panelden bir ornek goruntu seciyor ya da kendi MR-DWI gorselini yukleyebilirsin. Calistirma stratejisini Pipeline modu altinda degistir."}
        </p>
      </div>
    </div>
  )
}
