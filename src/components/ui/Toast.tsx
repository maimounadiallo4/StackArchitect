import React, { useEffect } from "react";
import { CheckCircle2, X } from "lucide-react";
import { Button } from "./Button";

export interface ToastState {
  message: string;
  undoLabel?: string;
  onUndo?: () => void;
}

interface ToastProps {
  toast: ToastState | null;
  onDismiss: () => void;
  closeLabel: string;
  durationMs?: number;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss, closeLabel, durationMs = 6000 }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(onDismiss, durationMs);
    return () => clearTimeout(timer);
  }, [toast, onDismiss, durationMs]);

  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-2)] px-4 py-2.5 text-xs text-[var(--text-primary)] shadow-[var(--elevation-3)] lg:bottom-6"
    >
      <CheckCircle2 className="h-4 w-4 shrink-0 text-success-400" />
      <span className="font-medium">{toast.message}</span>
      {toast.onUndo && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            toast.onUndo?.();
            onDismiss();
          }}
        >
          {toast.undoLabel}
        </Button>
      )}
      <button
        onClick={onDismiss}
        aria-label={closeLabel}
        className="shrink-0 rounded-[var(--radius-sm)] p-1 text-[var(--text-tertiary)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};
