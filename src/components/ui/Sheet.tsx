import React from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/cn";

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  side: "left" | "right";
  children: React.ReactNode;
  /** Overrides the default responsive width (full-screen on mobile, capped on tablet+). */
  widthClassName?: string;
  className?: string;
  /** z-index for the overlay; higher = above other sheets (e.g. AI Copilot sits above panels). */
  zIndex?: number;
}

/**
 * Full-screen / slide-over overlay used for panels that dock in-flow on
 * desktop but must become an overlay below the `lg` breakpoint (StackPicker,
 * ComponentInspector) or that are always an overlay (AICopilotDrawer).
 */
export const Sheet: React.FC<SheetProps> = ({
  isOpen,
  onClose,
  side,
  children,
  widthClassName = "sm:max-w-sm lg:max-w-md",
  className,
  zIndex = 40,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0" style={{ zIndex }}>
      <div
        className="absolute inset-0 bg-[var(--surface-overlay)] backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          "absolute inset-y-0 flex h-full w-full flex-col border-[var(--border-default)] bg-[var(--surface-1)] shadow-[var(--elevation-overlay)]",
          widthClassName,
          side === "left" ? "left-0 border-r" : "right-0 border-l",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
};

interface SheetCloseButtonProps {
  onClose: () => void;
  className?: string;
}

export const SheetCloseButton: React.FC<SheetCloseButtonProps> = ({ onClose, className }) => (
  <button
    onClick={onClose}
    className={cn(
      "rounded-[var(--radius-sm)] p-1.5 text-[var(--text-tertiary)] transition hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]",
      className
    )}
  >
    <X className="h-4 w-4" />
  </button>
);
