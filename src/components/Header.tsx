/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  Sparkles,
  Download,
  FolderKanban,
  SlidersHorizontal,
  AlertTriangle,
  Moon,
  Sun,
  CheckCircle2,
  Workflow,
  MoreHorizontal,
  Pencil,
} from "lucide-react";
import { ProjectConfig, ValidationIssue } from "../types";
import { Button } from "./ui/Button";
import { cn } from "../lib/cn";

interface HeaderProps {
  project: ProjectConfig;
  selectedCount: number;
  issues: ValidationIssue[];
  isAiDrawerOpen: boolean;
  onToggleAiDrawer: () => void;
  onOpenProjectModal: () => void;
  onOpenPresetsModal: () => void;
  onOpenExportModal: () => void;
  onEditStack: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
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
  onEditStack,
  darkMode,
  onToggleDarkMode,
}) => {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warningCount = issues.filter((i) => i.severity === "warning").length;

  const statusTone: "danger" | "warning" | "success" = errorCount > 0 ? "danger" : warningCount > 0 ? "warning" : "success";
  const statusCount = errorCount > 0 ? errorCount : warningCount > 0 ? warningCount : 0;

  return (
    <header
      id="app-header"
      className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-[var(--border-subtle)] bg-[var(--surface-1)] px-3 text-[var(--text-primary)] sm:px-5"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-gradient-to-br from-accent-400 to-accent-600 text-[var(--text-on-accent)] shadow-[var(--elevation-2)]">
          <Workflow className="h-[18px] w-[18px]" />
        </div>

        <div className="min-w-0">
          <button
            onClick={onOpenProjectModal}
            className="group flex min-w-0 items-center gap-1.5 font-display font-semibold tracking-tight text-[var(--text-primary)] transition hover:text-accent-400"
          >
            <span className="truncate text-sm font-semibold sm:text-base">{project.name || "My Architecture"}</span>
            <SlidersHorizontal className="h-3 w-3 shrink-0 text-[var(--text-tertiary)] opacity-60 group-hover:opacity-100 group-hover:text-accent-400" />
          </button>
          <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-tertiary)]">
            <span className="capitalize">{project.type.replace("_", " ")}</span>
            <span>·</span>
            <span>{selectedCount} components</span>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <Button variant="secondary" size="sm" onClick={onEditStack} title="Reopen the guided stack builder">
          <Pencil className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Edit Stack</span>
        </Button>

        <div
          className={cn(
            "hidden items-center gap-1.5 rounded-[var(--radius-md)] border px-2.5 py-1.5 text-xs font-medium sm:flex",
            statusTone === "danger" && "border-danger-500/30 bg-danger-500/10 text-danger-400",
            statusTone === "warning" && "border-warning-500/30 bg-warning-500/10 text-warning-400",
            statusTone === "success" && "border-success-500/30 bg-success-500/10 text-success-400"
          )}
        >
          {statusTone === "success" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
          <span className="hidden lg:inline">
            {statusTone === "success" ? "Stack Valid" : `${statusCount} ${statusTone === "danger" ? "Errors" : "Warnings"}`}
          </span>
          {statusTone !== "success" && <span className="lg:hidden">{statusCount}</span>}
        </div>

        <Button id="btn-ai-copilot" variant={isAiDrawerOpen ? "primary" : "secondary"} size="sm" onClick={onToggleAiDrawer}>
          <Sparkles className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">AI Copilot</span>
        </Button>

        <Button variant="secondary" size="sm" onClick={onOpenPresetsModal} className="hidden md:inline-flex">
          <FolderKanban className="h-3.5 w-3.5 text-accent-400" />
          <span>Templates</span>
        </Button>

        <Button variant="secondary" size="sm" onClick={onOpenExportModal} title="Export Diagram & ADR" className="hidden md:inline-flex">
          <Download className="h-3.5 w-3.5" />
          <span>Export</span>
        </Button>

        <Button variant="secondary" size="icon" onClick={onToggleDarkMode} title={darkMode ? "Switch to light theme" : "Switch to dark theme"}>
          {darkMode ? <Sun className="h-3.5 w-3.5 text-warning-400" /> : <Moon className="h-3.5 w-3.5" />}
        </Button>

        <div className="relative md:hidden">
          <Button variant="secondary" size="icon" onClick={() => setIsMoreMenuOpen((v) => !v)}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>

          {isMoreMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsMoreMenuOpen(false)} />
              <div className="absolute right-0 top-11 z-50 w-48 overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-2)] py-1 shadow-[var(--elevation-3)]">
                <button
                  onClick={() => { onOpenPresetsModal(); setIsMoreMenuOpen(false); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--surface-3)]"
                >
                  <FolderKanban className="h-3.5 w-3.5 text-accent-400" />
                  <span>Templates</span>
                </button>
                <button
                  onClick={() => { onOpenExportModal(); setIsMoreMenuOpen(false); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--surface-3)]"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Export</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
