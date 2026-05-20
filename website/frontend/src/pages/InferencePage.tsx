import { useEffect, useMemo, useState } from "react";
import { Loader2, Play } from "lucide-react";
import {
  getHealth,
  getSamples,
  predictSample,
  predictUpload,
  type HealthResponse,
  type PredictMode,
  type PredictResponse,
  type SampleItem,
} from "../api/client";
import { GradCamViewer } from "../components/GradCamViewer";
import { PipelineControls } from "../components/PipelineControls";
import { SamplePicker } from "../components/SamplePicker";
import { StageResultCard } from "../components/StageResultCard";
import { UploadDropzone } from "../components/UploadDropzone";
import { ValidationAlert } from "../components/ValidationAlert";

type InputMode = "sample" | "upload";

export function InferencePage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [samples, setSamples] = useState<SampleItem[]>([]);
  const [inputMode, setInputMode] = useState<InputMode>("sample");
  const [mode, setMode] = useState<PredictMode>("full_pipeline");
  const [selected, setSelected] = useState<SampleItem | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getHealth(), getSamples()])
      .then(([healthPayload, samplePayload]) => {
        setHealth(healthPayload);
        setSamples(samplePayload);
        setSelected(samplePayload[0] ?? null);
      })
      .catch((exc: Error) => setError(exc.message));
  }, []);

  const canRun = useMemo(() => (inputMode === "sample" ? Boolean(selected) : Boolean(file)), [file, inputMode, selected]);

  const runPrediction = async () => {
    if (!canRun) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const payload =
        inputMode === "sample" && selected
          ? await predictSample(selected.id, mode)
          : file
            ? await predictUpload(file, mode)
            : null;
      setResult(payload);
    } catch (exc) {
      setError(exc instanceof Error ? exc.message : "Inference baslatilamadi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-stack">
      <section className="hero-panel">
        <div>
          <span className="eyebrow">Two-stage AI workflow</span>
          <h1>MRI-DWI Stroke Detection Pipeline</h1>
          <p>Once inme var/yok tespiti, ardindan gerekirse ACA / MCA / PCA arter siniflandirmasi.</p>
        </div>
        <div className="health-pill">
          <span className={health?.stage1ModelExists && health?.stage2ModelExists ? "dot ok" : "dot warn"} />
          {health ? "Backend online" : "Backend kontrol ediliyor"}
        </div>
      </section>

      <div className="inference-layout">
        <section className="panel input-panel">
          <div className="section-title">
            <div>
              <span className="eyebrow">Input</span>
              <h3>Girdi Secimi</h3>
            </div>
            <div className="segmented">
              <button className={inputMode === "sample" ? "active" : ""} onClick={() => setInputMode("sample")}>Ornek Gorsel</button>
              <button className={inputMode === "upload" ? "active" : ""} onClick={() => setInputMode("upload")}>Gorsel Yukle</button>
            </div>
          </div>
          {inputMode === "sample" ? (
            <SamplePicker samples={samples} selectedId={selected?.id} onSelect={setSelected} />
          ) : (
            <UploadDropzone file={file} onFile={setFile} />
          )}
        </section>

        <PipelineControls mode={mode} onMode={setMode} />

        <section className="panel action-panel">
          <button className="primary-action" disabled={!canRun || loading} onClick={runPrediction}>
            {loading ? <Loader2 className="spin" size={20} /> : <Play size={20} />}
            {loading ? "Calisiyor" : "Pipeline Calistir"}
          </button>
          <p>Hazir orneklerde cache kullanilir; yuklenen gorselde gercek inference ve Grad-CAM calisir.</p>
        </section>
      </div>

      <ValidationAlert message={error ?? result?.validationMessage} />

      <div className="results-layout">
        <StageResultCard title="Stage 1: Stroke Detection" result={result?.stage1} />
        <StageResultCard title="Stage 2: Artery Classification" result={result?.stage2} />
      </div>
      <GradCamViewer gradcam={result?.gradcam} />
    </div>
  );
}
