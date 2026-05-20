import { CheckCircle2, CircleAlert, MinusCircle } from "lucide-react";
import type { StageResult } from "../api/client";
import { ProbabilityBars } from "./ProbabilityBars";

export function StageResultCard({ title, result }: { title: string; result?: StageResult | null }) {
  if (!result) {
    return (
      <section className="result-card empty">
        <h3>{title}</h3>
        <p>Sonuc bekleniyor.</p>
      </section>
    );
  }

  const Icon = result.skipped ? MinusCircle : result.label.includes("No Stroke") ? CircleAlert : CheckCircle2;
  return (
    <section className="result-card">
      <div className="result-heading">
        <div>
          <span className="eyebrow">{result.modelName}</span>
          <h3>{title}</h3>
        </div>
        <Icon size={24} />
      </div>
      <div className="decision-line">
        <strong>{result.label}</strong>
        {!result.skipped && <span>{Math.round(result.confidence * 100)}% Confidence</span>}
      </div>
      {result.message && <p className="notice-text">{result.message}</p>}
      <ProbabilityBars items={result.probabilities} />
    </section>
  );
}
