/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Moon, Sun, Workflow, SkipForward, Sparkles } from "lucide-react";
import { ProjectConfig, TechCategory } from "../../types";
import { getWizardLayers } from "../../engine/projectTypes";
import { TECH_CATALOG, CATEGORY_METADATA } from "../../engine/catalog";
import { ProjectTypeStep } from "./ProjectTypeStep";
import { LayerStep } from "./LayerStep";
import { ExtrasStep } from "./ExtrasStep";
import { StepRail, RailStep } from "./StepRail";
import { Button } from "../ui/Button";

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
  isGeneratingAI: boolean;
  onAIQuickStart: (prompt: string) => Promise<void>;
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
  isGeneratingAI,
  onAIQuickStart,
  hasExistingStack,
  onCancel,
}) => {
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
    if (s.kind === "project_type") return { id: "project_type", label: "Project", icon: "Rocket" };
    if (s.kind === "extras") return { id: "extras", label: "Extras", icon: "Plus" };
    return { id: `layer_${idx}`, label: CATEGORY_METADATA[s.category].label.split(" ")[0], icon: CATEGORY_METADATA[s.category].icon };
  });

  const goNext = () => setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  const goBack = () => setStepIndex((i) => Math.max(i - 1, 0));

  const handleAIQuickStart = async (prompt: string) => {
    await onAIQuickStart(prompt);
    setStepIndex(steps.length - 1);
  };

  const coveredCategories = steps.filter((s): s is Extract<WizardStep, { kind: "layer" }> => s.kind === "layer").map((s) => s.category);

  const nextIsSkip = current.kind === "layer" && !current.required && !TECH_CATALOG.some((t) => t.category === current.category && selectedSet.has(t.id));

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[var(--surface-0)] text-[var(--text-primary)]">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 border-b border-[var(--border-subtle)] bg-[var(--surface-1)] px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] bg-gradient-to-br from-accent-400 to-accent-600 text-[var(--text-on-accent)]">
            <Workflow className="h-4 w-4" />
          </div>
          <span className="font-display hidden text-sm font-semibold sm:inline">Stack Architect</span>
        </div>

        <StepRail steps={railSteps} activeIndex={stepIndex} onJump={setStepIndex} />

        <div className="flex items-center gap-1.5">
          {hasExistingStack && onCancel && (
            <button
              onClick={onCancel}
              className="hidden rounded-[var(--radius-md)] border border-[var(--border-default)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] sm:inline-flex"
            >
              Back to diagram
            </button>
          )}
          <button
            onClick={onToggleDarkMode}
            className="rounded-[var(--radius-md)] border border-[var(--border-default)] p-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
          >
            {darkMode ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
          {current.kind === "project_type" && (
            <ProjectTypeStep
              projectName={project.name}
              onChangeName={(name) => onChangeProject((p) => ({ ...p, name }))}
              selectedType={project.type}
              onSelectType={(type) => onChangeProject((p) => ({ ...p, type }))}
              onOpenTemplates={onOpenTemplates}
              isGeneratingAI={isGeneratingAI}
              onAIQuickStart={handleAIQuickStart}
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
      </div>

      {/* Footer nav */}
      <div className="flex items-center justify-between border-t border-[var(--border-subtle)] bg-[var(--surface-1)] px-4 py-3.5 sm:px-6">
        <Button variant="ghost" onClick={goBack} disabled={stepIndex === 0}>
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back</span>
        </Button>

        <span className="text-xs text-[var(--text-tertiary)]">
          Step {stepIndex + 1} of {steps.length}
        </span>

        {isLast ? (
          <Button variant="primary" onClick={onComplete}>
            <Sparkles className="h-3.5 w-3.5" />
            <span>Generate Architecture</span>
          </Button>
        ) : (
          <Button variant={nextIsSkip ? "secondary" : "primary"} onClick={goNext} disabled={!canProceed}>
            <span>{nextIsSkip ? "Skip" : "Continue"}</span>
            {nextIsSkip ? <SkipForward className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}
          </Button>
        )}
      </div>
    </div>
  );
};
