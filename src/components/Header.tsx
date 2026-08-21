/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  Sparkles,
  Download,
  FolderKanban,
  SlidersHorizontal,
  RefreshCw,
  AlertTriangle,
  Play,
  Moon,
  Sun,
  Share2,
  CheckCircle2,
  Workflow,
  Zap,
  Activity,
  Grid,
} from "lucide-react";
import { ProjectConfig, ValidationIssue } from "../types";

interface HeaderProps {
  project: ProjectConfig;
  selectedCount: number;
  issues: ValidationIssue[];
  isAiDrawerOpen: boolean;
  onToggleAiDrawer: () => void;
  onOpenProjectModal: () => void;
  onOpenPresetsModal: () => void;
  onOpenExportModal: () => void;
  onResetStack: () => void;
  onGenerate: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  isExecuting?: boolean;
  onExecuteWorkflow?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  project,
  selectedCount,
  issues,
  isAiDrawerOpen,
  onToggleAiDrawer,
  onOpenProjectModal,
  onOpenPresetsModal,
  onOpenExportModal,
  onResetStack,
  onGenerate,
  darkMode,
  onToggleDarkMode,
  isExecuting = false,
  onExecuteWorkflow,
}) => {
  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warningCount = issues.filter((i) => i.severity === "warning").length;

  return (
    <header
      id="app-header"
      className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#2c323f] bg-[#1a1e26] px-4 text-white shadow-md dark:border-[#2c323f] dark:bg-[#1a1e26] sm:px-5"
    >
      {/* Brand & Project Info (n8n Style) */}
      <div className="flex items-center gap-3">
        {/* n8n Style Coral Emblem */}
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff6d5a] to-[#ea4b34] text-white shadow-lg shadow-[#ff6d5a]/25">
          <Workflow className="h-5 w-5" />
        </div>

        <div className="flex items-center gap-2.5">
          <div>
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenProjectModal}
                className="group flex items-center gap-1.5 font-bold tracking-tight text-white hover:text-[#ff6d5a] transition"
              >
                <span className="text-sm font-bold sm:text-base">
                  {project.name || "My Architecture Workflow"}
                </span>
                <SlidersHorizontal className="h-3 w-3 text-neutral-400 opacity-60 group-hover:opacity-100 group-hover:text-[#ff6d5a]" />
              </button>

              <span className="hidden rounded-md bg-[#252b37] px-2 py-0.5 text-[10px] font-semibold text-[#ff8a7a] border border-[#363e4f] sm:inline-block">
                n8n Flow v2.5
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-neutral-400">
              <span className="capitalize">{project.type.replace("_", " ")}</span>
              <span>•</span>
              <span>{selectedCount} Nodes</span>
            </div>
          </div>

          {/* n8n Active Workflow Status Pill */}
          <div className="hidden lg:flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400 shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span>Active Flow</span>
          </div>
        </div>
      </div>

      {/* Center Actions / n8n Signature Execute Button */}
      <div className="flex items-center gap-2">
        {onExecuteWorkflow && (
          <button
            id="btn-execute-workflow"
            onClick={onExecuteWorkflow}
            disabled={isExecuting || selectedCount === 0}
            className={`flex items-center gap-2 rounded-xl px-4 py-1.5 text-xs font-bold text-white shadow-md shadow-[#ff6d5a]/25 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
              isExecuting
                ? "bg-[#28303d] border border-[#ff6d5a] text-[#ff8a7a]"
                : "bg-gradient-to-r from-[#ff6d5a] to-[#ea4b34] hover:from-[#ff5540] hover:to-[#d83f2a]"
            }`}
            title="Execute simulation of requests flowing through your architecture"
          >
            {isExecuting ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-[#ff6d5a]" />
                <span className="hidden sm:inline">Executing Flow...</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current" />
                <span className="hidden sm:inline">Test Architecture Flow</span>
                <span className="sm:hidden">Test</span>
              </>
            )}
          </button>
        )}

        <button
          id="btn-presets"
          onClick={onOpenPresetsModal}
          className="hidden md:flex items-center gap-1.5 rounded-xl border border-[#303744] bg-[#222732] px-3 py-1.5 text-xs font-medium text-neutral-200 transition hover:bg-[#2a313e] hover:border-[#3e4758]"
        >
          <FolderKanban className="h-3.5 w-3.5 text-[#ff8a7a]" />
          <span>Blueprints</span>
        </button>

        {/* Validation Status Indicator */}
        <div className="hidden xl:flex items-center gap-2 rounded-xl border border-[#303744] bg-[#1e232d] px-3 py-1.5 text-xs font-medium text-neutral-300">
          {errorCount > 0 ? (
            <span className="flex items-center gap-1 font-bold text-rose-400">
              <AlertTriangle className="h-3.5 w-3.5" />
              {errorCount} {errorCount === 1 ? "Error" : "Errors"}
            </span>
          ) : warningCount > 0 ? (
            <span className="flex items-center gap-1 font-bold text-amber-400">
              <AlertTriangle className="h-3.5 w-3.5" />
              {warningCount} Warnings
            </span>
          ) : (
            <span className="flex items-center gap-1 font-semibold text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Stack Valid
            </span>
          )}
        </div>
      </div>

      {/* Right Tools */}
      <div className="flex items-center gap-2">
        <button
          id="btn-ai-copilot"
          onClick={onToggleAiDrawer}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold shadow-xs transition ${
            isAiDrawerOpen
              ? "bg-[#ff6d5a] text-white shadow-[#ff6d5a]/30"
              : "border border-[#ff6d5a]/40 bg-[#ff6d5a]/10 text-[#ff8a7a] hover:bg-[#ff6d5a]/20"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">AI Copilot</span>
        </button>

        <button
          id="btn-export-diagram"
          onClick={onOpenExportModal}
          className="flex items-center gap-1.5 rounded-xl border border-[#303744] bg-[#222732] px-3 py-1.5 text-xs font-medium text-neutral-200 transition hover:bg-[#2a313e] hover:border-[#3e4758]"
          title="Export Diagram & ADR"
        >
          <Download className="h-3.5 w-3.5 text-neutral-400" />
          <span className="hidden sm:inline">Export</span>
        </button>

        <button
          id="btn-toggle-dark-mode"
          onClick={onToggleDarkMode}
          className="rounded-xl border border-[#303744] bg-[#222732] p-2 text-neutral-400 hover:text-white hover:bg-[#2a313e]"
          title={darkMode ? "Switch to Light Canvas" : "Switch to Dark Canvas"}
        >
          {darkMode ? <Sun className="h-3.5 w-3.5 text-amber-400" /> : <Moon className="h-3.5 w-3.5" />}
        </button>
      </div>
    </header>
  );
};
