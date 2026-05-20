import { AlertTriangle } from "lucide-react";

export function ValidationAlert({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <div className="validation-alert">
      <AlertTriangle size={18} />
      <span>{message}</span>
    </div>
  );
}
