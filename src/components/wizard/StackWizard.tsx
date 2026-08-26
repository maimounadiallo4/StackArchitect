import React, { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Moon, Sun, SkipForward, Sparkles } from "lucide-react";
import { ProjectConfig, TechCategory } from "../../types";
import { getWizardLayers } from "../../engine/projectTypes";
import { TECH_CATALOG, CATEGORY_METADATA } from "../../engine/catalog";
import { ProjectTypeStep } from "./ProjectTypeStep";
import { LayerStep } from "./LayerStep";
import { ExtrasStep } from "./ExtrasStep";
import { StepRail, RailStep } from "./StepRail";
import { Button } from "../ui/Button";
import { BrandMark } from "../ui/BrandMark";
import { LanguageToggle } from "../ui/LanguageToggle";
import { useLanguage } from "../../i18n/LanguageContext";
import { formatTemplate } from "../../i18n/translations";

type WizardStep = { kind: "project_type" } | { kind: "layer"; category: TechCategory; required: boolean } | { kind: "extras" };

interface StackWizardProps {
  project: ProjectConfig;
  onChangeProject: (updater: (prev: ProjectConfig) => ProjectConfig) => void;
  selectedTechIds: string[];
  onToggleTech: (techId: string) => void;
  onComplete: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenTemplates: () => void;
  hasExistingStack: boolean;
  onCancel?: () => void;
}

export const StackWizard: React.FC<StackWizardProps> = ({
  project,
  onChangeProject,
  selectedTechIds,
  onToggleTech,
  onComplete,
  darkMode,
  onToggleDarkMode,
  onOpenTemplates,
  hasExistingStack,
  onCancel,
}) => {
  const { t } = useLanguage();
  const [stepIndex, setStepIndex] = useState(0);

  const steps: WizardStep[] = useMemo(() => {
    const layers = getWizardLayers(project.type);
    return [
      { kind: "project_type" },
      ...layers.map((l): WizardStep => ({ kind: "layer", category: l.category, required: l.required })),
      { kind: "extras" },
    ];
  }, [project.type]);

  const current = steps[Math.min(stepIndex, steps.length - 1)];
  const isLast = stepIndex === steps.length - 1;

  const selectedSet = useMemo(() => new Set(selectedTechIds), [selectedTechIds]);

  const canProceed = useMemo(() => {
    if (current.kind !== "layer" || !current.required) return true;
    return TECH_CATALOG.some((t) => t.category === current.category && selectedSet.has(t.id));
  }, [current, selectedSet]);

  const railSteps: RailStep[] = steps.map((s, idx) => {
    if (s.kind === "project_type") return { id: "project_type", label: t.wizard.projectRailLabel, icon: "Compass" };
    if (s.kind === "extras") return { id: "extras", label: t.wizard.extrasRailLabel, icon: "Plus" };
    return { id: `layer_${idx}`, label: t.categories[s.category].label.split(" ")[0], icon: CATEGORY_METADATA[s.category].icon };
  });

  const goNext = () => setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  const goBack = () => setStepIndex((i) => Math.max(i - 1, 0));

  const coveredCategories = steps.filter((s): s is Extract<WizardStep, { kind: "layer" }> => s.kind === "layer").map((s) => s.category);

  const nextIsSkip = current.kind === "layer" && !current.required && !TECH_CATALOG.some((t) => t.category === current.category && selectedSet.has(t.id));

  return (
    <div className="flex h-dvh w-screen flex-col overflow-hidden bg-[var(--surface-0)] text-[var(--text-primary)]">
      <div className="grain-overlay" aria-hidden="true" />
      <a href="#wizard-content" className="skip-link">Skip to content</a>
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 border-b border-[var(--border-subtle)] bg-[var(--surface-1)] px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <BrandMark size={32} className="h-8 w-8" />
          <h1 className="sr-only">{t.brand}</h1>
          <span aria-hidden="true" className="font-display hidden text-sm font-semibold sm:inline">{t.brand}</span>
        </div>

        <StepRail steps={railSteps} activeIndex={stepIndex} onJump={setStepIndex} ariaLabel={t.wizard.stepsNav} />

        <div className="flex items-center gap-1.5">
          {hasExistingStack && onCancel && (
            <button
              onClick={onCancel}
              className="hidden rounded-[var(--radius-md)] border border-[var(--border-default)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] sm:inline-flex"
            >
              {t.wizard.backToDiagram}
            </button>
          )}
          <LanguageToggle className="hidden sm:flex" />
          <button
            onClick={onToggleDarkMode}
            className="rounded-[var(--radius-md)] border border-[var(--border-default)] p-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            title={darkMode ? t.header.lightTheme : t.header.darkTheme}
          >
            {darkMode ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Content */}
      <main id="wizard-content" className="relative flex-1 overflow-y-auto">
        {current.kind === "project_type" && (
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-72"
            style={{
              background: "radial-gradient(60% 100% at 50% 0%, var(--accent-glow), transparent 70%)",
            }}
            aria-hidden="true"
          />
        )}
        <div className="relative mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
          {current.kind === "project_type" && (
            <ProjectTypeStep
              projectName={project.name}
              onChangeName={(name) => onChangeProject((p) => ({ ...p, name }))}
              selectedType={project.type}
              onSelectType={(type) => onChangeProject((p) => ({ ...p, type }))}
              onOpenTemplates={onOpenTemplates}
            />
          )}

          {current.kind === "layer" && (
            <LayerStep
              category={current.category}
              required={current.required}
              selectedTechIds={selectedTechIds}
              onToggleTech={onToggleTech}
            />
          )}

          {current.kind === "extras" && (
            <ExtrasStep
              coveredCategories={coveredCategories}
              selectedTechIds={selectedTechIds}
              onToggleTech={onToggleTech}
            />
          )}
        </div>
      </main>

      {/* Footer nav */}
      <div className="border-t border-[var(--border-subtle)] bg-[var(--surface-1)] px-4 py-3.5 sm:px-6">
        {!canProceed && (
          <p role="status" aria-live="polite" className="mb-2 text-right text-xs font-medium text-warning-400 sm:text-left">
            {t.wizard.selectAtLeastOne}
          </p>
        )}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={goBack} disabled={stepIndex === 0}>
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>{t.wizard.back}</span>
          </Button>

          <span className="hidden text-xs text-[var(--text-tertiary)] sm:inline">
            {formatTemplate(t.wizard.stepOf, { current: stepIndex + 1, total: steps.length })}
          </span>

          {isLast ? (
            <Button variant="primary" onClick={onComplete}>
              <Sparkles className="h-3.5 w-3.5" />
              <span>{t.wizard.generate}</span>
            </Button>
          ) : (
            <Button variant={nextIsSkip ? "secondary" : "primary"} onClick={goNext} disabled={!canProceed}>
              <span>{nextIsSkip ? t.wizard.skip : t.wizard.continueLabel}</span>
              {nextIsSkip ? <SkipForward className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
