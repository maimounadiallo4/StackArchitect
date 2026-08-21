/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  AlertTriangle,
  AlertCircle,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { ValidationIssue } from "../types";
import { Button } from "./ui/Button";
import { cn } from "../lib/cn";

interface ValidationPanelProps {
  issues: ValidationIssue[];
  onAutoFix: (action: NonNullable<ValidationIssue["autoFixAction"]>) => void;
}

export const ValidationPanel: React.FC<ValidationPanelProps> = ({
  issues,
  onAutoFix,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const errors = issues.filter((i) => i.severity === "error");
  const warnings = issues.filter((i) => i.severity === "warning");
  const suggestions = issues.filter((i) => i.severity === "suggestion");

  if (issues.length === 0) {
    return (
      <div className="flex items-center gap-2 border-t border-[var(--border-subtle)] bg-[var(--surface-1)] px-4 py-2 text-xs text-success-400">
        <ShieldCheck className="h-4 w-4" />
        <span className="font-semibold">Validation passed</span>
        <span className="hidden text-[var(--text-tertiary)] sm:inline">— all component interfaces and protocol pipelines are valid.</span>
      </div>
    );
  }

  return (
    <div
      id="architecture-validation-panel"
      className="border-t border-[var(--border-subtle)] bg-[var(--surface-1)] text-[var(--text-primary)]"
    >
      {/* Header bar */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex cursor-pointer items-center justify-between px-4 py-2.5 text-xs transition hover:bg-[var(--surface-2)]"
      >
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-1.5 font-semibold text-[var(--text-primary)] sm:flex">
            <ShieldCheck className="h-3.5 w-3.5 text-accent-500" />
            <span>Architecture Diagnostics</span>
          </div>

          <div className="flex items-center gap-1.5">
            {errors.length > 0 && (
              <span className="flex items-center gap-1 rounded-full bg-danger-500/10 border border-danger-500/30 px-2 py-0.5 text-[10px] font-semibold text-danger-400">
                <AlertCircle className="h-3 w-3" />
                {errors.length} {errors.length === 1 ? "Error" : "Errors"}
              </span>
            )}
            {warnings.length > 0 && (
              <span className="flex items-center gap-1 rounded-full bg-warning-500/10 border border-warning-500/30 px-2 py-0.5 text-[10px] font-semibold text-warning-400">
                <AlertTriangle className="h-3 w-3" />
                {warnings.length} {warnings.length === 1 ? "Warning" : "Warnings"}
              </span>
            )}
            {suggestions.length > 0 && (
              <span className="flex items-center gap-1 rounded-full bg-accent-500/10 border border-accent-500/30 px-2 py-0.5 text-[10px] font-semibold text-accent-400">
                <Lightbulb className="h-3 w-3" />
                {suggestions.length} <span className="hidden sm:inline">Suggestions</span>
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-[var(--text-tertiary)]">
          <span className="hidden text-[11px] font-medium sm:inline">{isExpanded ? "Collapse" : "Expand Details"}</span>
          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </div>
      </div>

      {/* Expanded Issue Cards List */}
      {isExpanded && (
        <div className="max-h-72 overflow-y-auto border-t border-[var(--border-subtle)] p-4 space-y-3 bg-[var(--surface-0)]">
          {issues.map((issue) => {
            let toneClass = "border-[var(--border-subtle)] bg-[var(--surface-2)]";
            let icon = <Lightbulb className="h-4 w-4 text-accent-400" />;
            let badgeClass = "bg-accent-500/10 text-accent-400 border border-accent-500/30";

            if (issue.severity === "error") {
              toneClass = "border-danger-500/25 bg-danger-500/5";
              icon = <AlertCircle className="h-4 w-4 text-danger-400" />;
              badgeClass = "bg-danger-500/10 text-danger-400 border border-danger-500/30";
            } else if (issue.severity === "warning") {
              toneClass = "border-warning-500/25 bg-warning-500/5";
              icon = <AlertTriangle className="h-4 w-4 text-warning-400" />;
              badgeClass = "bg-warning-500/10 text-warning-400 border border-warning-500/30";
            }

            return (
              <div
                key={issue.id}
                className={cn("flex flex-col sm:flex-row items-start justify-between gap-3 rounded-[var(--radius-lg)] border p-3.5 text-xs", toneClass)}
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 shrink-0">{icon}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-[var(--text-primary)]">
                        {issue.title}
                      </h4>
                      <span className={cn("rounded px-1.5 py-0.2 text-[9px] font-bold uppercase", badgeClass)}>
                        {issue.severity}
                      </span>
                    </div>
                    <p className="mt-1 leading-relaxed text-[var(--text-secondary)]">
                      {issue.message}
                    </p>
                    <p className="mt-1.5 font-medium text-[var(--text-primary)]">
                      <span className="text-[var(--text-tertiary)]">Recommendation:</span> {issue.recommendation}
                    </p>
                  </div>
                </div>

                {issue.autoFixAction && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onAutoFix(issue.autoFixAction!)}
                    className="shrink-0"
                  >
                    <Plus className="h-3.5 w-3.5 stroke-[3]" />
                    <span>{issue.autoFixAction.label}</span>
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
