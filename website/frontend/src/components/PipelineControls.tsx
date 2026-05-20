import clsx from "clsx";
import type { PredictMode } from "../api/client";

const modes: Array<{ value: PredictMode; label: string; desc: string }> = [
  { value: "full_pipeline", label: "Full Pipeline", desc: "Stroke varsa arter siniflandirir" },
  { value: "stage1_only", label: "Stage 1 Only", desc: "Sadece var/yok" },
  { value: "stage2_only", label: "Stage 2 Only", desc: "ACA/MCA/PCA" },
];

export function PipelineControls({ mode, onMode }: { mode: PredictMode; onMode: (mode: PredictMode) => void }) {
  return (
    <section className="panel">
      <div className="section-title">
        <div>
          <span className="eyebrow">Pipeline controls</span>
          <h3>Model Akisi</h3>
        </div>
      </div>
      <div className="mode-grid">
        {modes.map((item) => (
          <button className={clsx("mode-button", mode === item.value && "active")} key={item.value} onClick={() => onMode(item.value)}>
            <strong>{item.label}</strong>
            <span>{item.desc}</span>
          </button>
        ))}
      </div>
      <div className="model-selectors">
        <div>
          <span>Stage 1 Model</span>
          <strong>EfficientNet-B3</strong>
        </div>
        <div>
          <span>Stage 2 Model</span>
          <strong>DenseNet-121 v1</strong>
        </div>
      </div>
    </section>
  );
}
