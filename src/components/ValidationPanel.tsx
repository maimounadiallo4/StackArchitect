/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  AlertTriangle,
  AlertCircle,
  Lightbulb,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Wand2,
  Plus,
  Workflow,
} from "lucide-react";
import { ValidationIssue } from "../types";

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
      <div className="flex items-center justify-between border-t border-[#2c323f] bg-[#171b22] px-4 py-2 text-xs text-emerald-400">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span className="font-bold">Workflow Validation Passed:</span>
          <span className="text-neutral-300">All connected node interfaces and protocol pipelines are valid.</span>
        </div>
      </div>
    );
  }

  return (
    <div
      id="architecture-validation-panel"
      className="border-t border-[#2c323f] bg-[#171a22] text-neutral-200 shadow-xl"
    >
      {/* Header bar */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex cursor-pointer items-center justify-between px-4 py-2.5 text-xs transition hover:bg-[#1f2430]"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold text-white">
            <Workflow className="h-3.5 w-3.5 text-[#ff6d5a]" />
            <span>Architecture Diagnostics</span>
          </div>

          <div className="flex items-center gap-1.5">
            {errors.length > 0 && (
              <span className="flex items-center gap-1 rounded-full bg-rose-950/80 border border-rose-500/40 px-2 py-0.5 text-[10px] font-bold text-rose-400">
                <AlertCircle className="h-3 w-3" />
                {errors.length} {errors.length === 1 ? "Error" : "Errors"}
              </span>
            )}
            {warnings.length > 0 && (
              <span className="flex items-center gap-1 rounded-full bg-amber-950/80 border border-amber-500/40 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                <AlertTriangle className="h-3 w-3" />
                {warnings.length} {warnings.length === 1 ? "Warning" : "Warnings"}
              </span>
            )}
            {suggestions.length > 0 && (
              <span className="flex items-center gap-1 rounded-full bg-[#ff6d5a]/20 border border-[#ff6d5a]/40 px-2 py-0.5 text-[10px] font-bold text-[#ff8a7a]">
                <Lightbulb className="h-3 w-3" />
                {suggestions.length} Suggestions
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-neutral-400">
          <span className="text-[11px] font-medium">{isExpanded ? "Collapse" : "Expand Details"}</span>
          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </div>
      </div>

      {/* Expanded Issue Cards List */}
      {isExpanded && (
        <div className="max-h-72 overflow-y-auto border-t border-[#2a313e] p-4 space-y-3 bg-[#13161c]">
          {issues.map((issue) => {
            let bgClass = "border-[#2c3442] bg-[#1a1f29]";
            let icon = <Lightbulb className="h-4 w-4 text-[#ff8a7a]" />;
            let badgeClass = "bg-[#ff6d5a]/20 text-[#ff8a7a] border border-[#ff6d5a]/40";

            if (issue.severity === "error") {
              bgClass = "border-rose-900/50 bg-rose-950/20";
              icon = <AlertCircle className="h-4 w-4 text-rose-400" />;
              badgeClass = "bg-rose-950 text-rose-400 border border-rose-500/40";
            } else if (issue.severity === "warning") {
              bgClass = "border-amber-900/50 bg-amber-950/20";
              icon = <AlertTriangle className="h-4 w-4 text-amber-400" />;
              badgeClass = "bg-amber-950 text-amber-400 border border-amber-500/40";
            }

            return (
              <div
                key={issue.id}
                className={`flex flex-col sm:flex-row items-start justify-between gap-3 rounded-2xl border p-3.5 text-xs ${bgClass}`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 shrink-0">{icon}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white">
                        {issue.title}
                      </h4>
                      <span className={`rounded px-1.5 py-0.2 text-[9px] font-bold uppercase ${badgeClass}`}>
                        {issue.severity}
                      </span>
                    </div>
                    <p className="mt-1 leading-relaxed text-neutral-300">
                      {issue.message}
                    </p>
                    <p className="mt-1.5 font-medium text-neutral-200">
                      <span className="text-neutral-400">Recommendation:</span> {issue.recommendation}
                    </p>
                  </div>
                </div>

                {/* 1-Click Auto Fix Button with n8n Coral */}
                {issue.autoFixAction && (
                  <button
                    onClick={() => onAutoFix(issue.autoFixAction!)}
                    className="shrink-0 flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#ff6d5a] to-[#ea4b34] px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-[#ff6d5a]/20 transition hover:from-[#ff5540] hover:to-[#d83f2a]"
                  >
                    <Plus className="h-3.5 w-3.5 stroke-[3]" />
                    <span>{issue.autoFixAction.label}</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
