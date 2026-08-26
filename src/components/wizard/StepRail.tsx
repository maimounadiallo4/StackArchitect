import React from "react";
import { Check } from "lucide-react";
import { IconHelper } from "../IconHelper";
import { cn } from "../../lib/cn";

export interface RailStep {
  id: string;
  label: string;
  icon: string;
}

interface StepRailProps {
  steps: RailStep[];
  activeIndex: number;
  onJump?: (index: number) => void;
}

export const StepRail: React.FC<StepRailProps> = ({ steps, activeIndex, onJump }) => {
  return (
    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
      {steps.map((step, idx) => {
        const isDone = idx < activeIndex;
        const isActive = idx === activeIndex;
        const clickable = onJump && idx < activeIndex;

        return (
          <React.Fragment key={step.id}>
            {idx > 0 && (
              <div
                className={cn(
                  "h-px w-4 shrink-0 sm:w-8",
                  isDone ? "bg-accent-500" : "bg-[var(--border-default)]"
                )}
              />
            )}
            <button
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onJump?.(idx)}
              aria-current={isActive ? "step" : undefined}
              aria-label={step.label}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-1 text-[11px] font-medium transition sm:px-2.5 sm:py-1.5 sm:text-xs",
                isActive
                  ? "border-accent-500 bg-accent-500 text-[var(--text-on-accent)]"
                  : isDone
                  ? "border-accent-500/40 bg-accent-500/10 text-accent-400"
                  : "border-[var(--border-default)] text-[var(--text-tertiary)]",
                clickable && "cursor-pointer hover:border-accent-500/60"
              )}
            >
              {isDone ? (
                <Check className="h-3 w-3 stroke-[3]" />
              ) : (
                <IconHelper name={step.icon} size={12} />
              )}
              <span className="hidden sm:inline">{step.label}</span>
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
};
