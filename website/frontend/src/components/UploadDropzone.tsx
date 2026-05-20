import { UploadCloud } from "lucide-react";

export function UploadDropzone({
  file,
  onFile,
}: {
  file?: File | null;
  onFile: (file: File | null) => void;
}) {
  return (
    <label className="upload-zone">
      <input
        type="file"
        accept="image/png,image/jpeg,image/jpg"
        onChange={(event) => onFile(event.target.files?.[0] ?? null)}
      />
      <UploadCloud size={26} />
      <strong>{file ? file.name : "MRI-DWI goruntusu yukle"}</strong>
      <span>JPEG veya PNG. Uygunluk kontrolu inference oncesi calisir.</span>
    </label>
  );
}
