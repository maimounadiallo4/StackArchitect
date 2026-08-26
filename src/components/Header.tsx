import React, { useState } from "react";
import {
  Download,
  FolderKanban,
  SlidersHorizontal,
  AlertTriangle,
  Lightbulb,
  Moon,
  Sun,
  CheckCircle2,
  MoreHorizontal,
  Pencil,
} from "lucide-react";
import { ProjectConfig, ValidationIssue } from "../types";
import { Button } from "./ui/Button";
import { BrandMark } from "./ui/BrandMark";
import { LanguageToggle } from "./ui/LanguageToggle";
import { useLanguage } from "../i18n/LanguageContext";
import { cn } from "../lib/cn";

interface HeaderProps {
  project: ProjectConfig;
  selectedCount: number;
  issues: ValidationIssue[];
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
  onOpenProjectModal,
  onOpenPresetsModal,
  onOpenExportModal,
  onEditStack,
  darkMode,
  onToggleDarkMode,
}) => {
  const { t } = useLanguage();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warningCount = issues.filter((i) => i.severity === "warning").length;
  const suggestionCount = issues.filter((i) => i.severity === "suggestion").length;

  const statusTone: "danger" | "warning" | "info" | "success" =
    errorCount > 0 ? "danger" : warningCount > 0 ? "warning" : suggestionCount > 0 ? "info" : "success";
  const statusCount = errorCount > 0 ? errorCount : warningCount > 0 ? warningCount : suggestionCount > 0 ? suggestionCount : 0;

  return (
    <header
      id="app-header"
      className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-[var(--border-subtle)] bg-[var(--surface-1)] px-3 text-[var(--text-primary)] sm:px-5"
    >
      <div className="flex min-w-0 items-center gap-3">
        <BrandMark size={36} className="h-9 w-9 shadow-[var(--elevation-2)]" />

        <div className="min-w-0">
          <h1 className="min-w-0 font-display font-semibold tracking-tight text-[var(--text-primary)]">
            <button
              onClick={onOpenProjectModal}
              className="group flex min-w-0 items-center gap-1.5 transition hover:text-accent-400"
            >
              <span className="truncate text-sm font-semibold sm:text-base">{project.name || "—"}</span>
              <SlidersHorizontal className="h-3 w-3 shrink-0 text-[var(--text-tertiary)] opacity-60 group-hover:opacity-100 group-hover:text-accent-400" />
            </button>
          </h1>
          <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-tertiary)]">
            <span>{t.projectTypes[project.type].label}</span>
            <span>·</span>
            <span>{selectedCount} {t.header.components}</span>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <Button variant="secondary" size="sm" onClick={onEditStack} title={t.header.editStackTitle}>
          <Pencil className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{t.header.editStack}</span>
        </Button>

        <div
          className={cn(
            "hidden items-center gap-1.5 rounded-[var(--radius-md)] border px-2.5 py-1.5 text-xs font-medium sm:flex",
            statusTone === "danger" && "border-danger-500/30 bg-danger-500/10 text-danger-400",
            statusTone === "warning" && "border-warning-500/30 bg-warning-500/10 text-warning-400",
            statusTone === "info" && "border-accent-500/30 bg-accent-500/10 text-accent-400",
            statusTone === "success" && "border-success-500/30 bg-success-500/10 text-success-400"
          )}
        >
          {statusTone === "success" ? (
            <CheckCircle2 className="h-3.5 w-3.5" />
          ) : statusTone === "info" ? (
            <Lightbulb className="h-3.5 w-3.5" />
          ) : (
            <AlertTriangle className="h-3.5 w-3.5" />
          )}
          <span className="hidden lg:inline">
            {statusTone === "success"
              ? t.header.stackValid
              : statusTone === "info"
              ? t.header.stackReviewable
              : `${statusCount} ${statusTone === "danger" ? t.header.errors : t.header.warnings}`}
          </span>
          {statusTone !== "success" && <span className="lg:hidden">{statusCount}</span>}
        </div>

        <LanguageToggle className="hidden sm:flex" />

        <Button variant="secondary" size="sm" onClick={onOpenPresetsModal} className="hidden md:inline-flex">
          <FolderKanban className="h-3.5 w-3.5 text-accent-400" />
          <span>{t.header.templates}</span>
        </Button>

        <Button variant="secondary" size="sm" onClick={onOpenExportModal} title={t.header.exportTitle} className="hidden md:inline-flex">
          <Download className="h-3.5 w-3.5" />
          <span>{t.header.export}</span>
        </Button>

        <Button
          variant="secondary"
          size="icon"
          onClick={onToggleDarkMode}
          title={darkMode ? t.header.lightTheme : t.header.darkTheme}
          aria-label={darkMode ? t.header.lightTheme : t.header.darkTheme}
        >
          {darkMode ? <Sun className="h-3.5 w-3.5 text-warning-400" /> : <Moon className="h-3.5 w-3.5" />}
        </Button>

        <div className="relative md:hidden">
          <Button
            variant="secondary"
            size="icon"
            onClick={() => setIsMoreMenuOpen((v) => !v)}
            aria-label={t.header.moreOptions}
            aria-expanded={isMoreMenuOpen}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>

          {isMoreMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsMoreMenuOpen(false)} />
              <div className="absolute right-0 top-11 z-50 w-52 overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-2)] py-1 shadow-[var(--elevation-3)]">
                <button
                  onClick={() => { onOpenPresetsModal(); setIsMoreMenuOpen(false); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--surface-3)]"
                >
                  <FolderKanban className="h-3.5 w-3.5 text-accent-400" />
                  <span>{t.header.templates}</span>
                </button>
                <button
                  onClick={() => { onOpenExportModal(); setIsMoreMenuOpen(false); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--surface-3)]"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>{t.header.export}</span>
                </button>
                <div className="my-1 border-t border-[var(--border-subtle)]" />
                <div className="px-3 py-2">
                  <LanguageToggle />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
