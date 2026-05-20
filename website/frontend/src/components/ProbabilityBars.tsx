import type { ProbabilityItem } from "../api/client";

export function ProbabilityBars({ items }: { items: ProbabilityItem[] }) {
  if (!items.length) return <p className="muted">Probability verisi yok.</p>;
  return (
    <div className="probability-bars">
      {items.map((item) => (
        <div className="prob-row" key={item.label}>
          <div className="prob-label">
            <span>{item.label}</span>
            <strong>{Math.round(item.probability * 100)}%</strong>
          </div>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${Math.max(2, item.probability * 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
