import clsx from "clsx";
import { toAbsoluteUrl, type SampleItem } from "../api/client";

export function SamplePicker({
  samples,
  selectedId,
  onSelect,
}: {
  samples: SampleItem[];
  selectedId?: string;
  onSelect: (sample: SampleItem) => void;
}) {
  return (
    <div className="sample-grid">
      {samples.map((sample) => (
        <button
          className={clsx("sample-card", selectedId === sample.id && "selected")}
          key={sample.id}
          onClick={() => onSelect(sample)}
        >
          <img src={toAbsoluteUrl(sample.thumbnailUrl)} alt={sample.displayName} />
          <span>{sample.displayName}</span>
          <small>{sample.labelGroup}</small>
        </button>
      ))}
    </div>
  );
}
