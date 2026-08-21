import React from "react";
import { cn } from "../../lib/cn";

interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  selected?: boolean;
}

export const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
  ({ interactive = false, selected = false, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-[var(--radius-lg)] border bg-[var(--surface-2)] shadow-[var(--elevation-1)] transition-all duration-150",
          selected
            ? "border-accent-500 ring-1 ring-accent-500/40 shadow-[var(--elevation-2)]"
            : "border-[var(--border-subtle)]",
          interactive &&
            !selected &&
            "cursor-pointer hover:border-[var(--border-strong)] hover:shadow-[var(--elevation-2)]",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Panel.displayName = "Panel";
