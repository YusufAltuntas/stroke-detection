import { toAbsoluteUrl, type GradcamResult } from "../api/client";

export function GradCamViewer({ gradcam }: { gradcam?: GradcamResult | null }) {
  if (!gradcam || gradcam.status === "skipped") {
    return (
      <section className="panel gradcam-panel">
        <h3>Grad-CAM</h3>
        <p className="muted">Bir sonuc uretildiginde model odak haritasi burada gosterilir.</p>
      </section>
    );
  }

  if (gradcam.status === "unavailable") {
    return (
      <section className="panel gradcam-panel">
        <h3>Grad-CAM</h3>
        <p className="warning-text">{gradcam.message ?? "Grad-CAM uretilemedi."}</p>
      </section>
    );
  }

  return (
    <section className="panel gradcam-panel">
      <div className="section-title">
        <div>
          <span className="eyebrow">{gradcam.stage === "stage2" ? "Artery classifier" : "Stroke detector"}</span>
          <h3>Grad-CAM Model Attention</h3>
        </div>
      </div>
      <div className="gradcam-grid">
        <figure>
          <img src={toAbsoluteUrl(gradcam.images.originalUrl)} alt="Original MRI-DWI" />
          <figcaption>Original</figcaption>
        </figure>
        <figure>
          <img src={toAbsoluteUrl(gradcam.images.overlayUrl)} alt="Grad-CAM overlay" />
          <figcaption>Overlay</figcaption>
        </figure>
        <figure>
          <img src={toAbsoluteUrl(gradcam.images.heatmapUrl)} alt="Grad-CAM heatmap" />
          <figcaption>Heatmap</figcaption>
        </figure>
      </div>
    </section>
  );
}
