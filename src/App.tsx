import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Header } from "./components/Header";
import { StackPicker } from "./components/StackPicker";
import { DiagramCanvas } from "./components/DiagramCanvas";
import { ComponentInspector } from "./components/ComponentInspector";
import { ValidationPanel } from "./components/ValidationPanel";
import { ProjectConfigModal } from "./components/ProjectConfigModal";
import { PresetsModal } from "./components/PresetsModal";
import { ExportModal } from "./components/ExportModal";
import { StackWizard } from "./components/wizard/StackWizard";

import { ProjectConfig, Technology, ValidationIssue, StackPreset } from "./types";
import { TECH_BY_ID } from "./engine/catalog";
import { generateArchitectureModel } from "./engine/architectureEngine";
import { validateArchitecture } from "./engine/validator";
import { Layers, SlidersHorizontal } from "lucide-react";
import { Sheet } from "./components/ui/Sheet";
import { useMediaQuery } from "./lib/useMediaQuery";
import { useLanguage } from "./i18n/LanguageContext";

type AppPhase = "wizard" | "diagram";

export default function App() {
  const { t } = useLanguage();
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const [appPhase, setAppPhase] = useState<AppPhase>("wizard");

  const [project, setProject] = useState<ProjectConfig>({
    id: "local",
    name: "",
    type: "saas",
    description: "",
    expectedTraffic: "medium",
    teamExperience: "intermediate",
    budgetConstraint: "moderate",
  });

  const [selectedTechIds, setSelectedTechIds] = useState<string[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isPresetsModalOpen, setIsPresetsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Below `lg` (1024px), side panels become full-screen overlay sheets.
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileStackSheetOpen, setIsMobileStackSheetOpen] = useState(false);

  const selectedTechs = useMemo(() => {
    return selectedTechIds.map((id) => TECH_BY_ID.get(id)).filter((t): t is Technology => Boolean(t));
  }, [selectedTechIds]);

  const model = useMemo(() => {
    return generateArchitectureModel(project, selectedTechs, "system");
  }, [project, selectedTechs]);

  const validationIssues = useMemo(() => {
    return validateArchitecture(project, selectedTechs);
  }, [project, selectedTechs]);

  const handleToggleTech = useCallback((techId: string) => {
    setSelectedTechIds((prev) =>
      prev.includes(techId) ? prev.filter((id) => id !== techId) : [...prev, techId]
    );
  }, []);

  const handleClearCategory = useCallback((category: string) => {
    setSelectedTechIds((prev) =>
      prev.filter((id) => {
        const tech = TECH_BY_ID.get(id);
        return tech ? tech.category !== category : true;
      })
    );
  }, []);

  const handleAutoFix = useCallback((action: NonNullable<ValidationIssue["autoFixAction"]>) => {
    if (action.type === "add_tech" && action.techId) {
      setSelectedTechIds((prev) => (prev.includes(action.techId!) ? prev : [...prev, action.techId!]));
    } else if (action.type === "remove_tech" && action.techId) {
      setSelectedTechIds((prev) => prev.filter((id) => id !== action.techId));
    }
  }, []);

  const handleApplyPreset = useCallback((preset: StackPreset) => {
    setProject((prev) => ({ ...prev, name: preset.name, type: preset.projectType, description: preset.description }));
    setSelectedTechIds(preset.techIds);
    setSelectedNodeId(null);
    setAppPhase("diagram");
  }, []);

  const handleWizardComplete = useCallback(() => {
    setAppPhase("diagram");
    setSelectedNodeId(null);
  }, []);

  const handleEditStack = useCallback(() => {
    setAppPhase("wizard");
    setSelectedNodeId(null);
  }, []);

  if (appPhase === "wizard") {
    return (
      <>
        <StackWizard
          project={project}
          onChangeProject={setProject}
          selectedTechIds={selectedTechIds}
          onToggleTech={handleToggleTech}
          onComplete={handleWizardComplete}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          onOpenTemplates={() => setIsPresetsModalOpen(true)}
          hasExistingStack={selectedTechIds.length > 0}
          onCancel={() => setAppPhase("diagram")}
        />
        <PresetsModal
          isOpen={isPresetsModalOpen}
          onClose={() => setIsPresetsModalOpen(false)}
          onApplyPreset={handleApplyPreset}
        />
      </>
    );
  }

  return (
    <div className="flex h-dvh w-screen flex-col overflow-hidden bg-[var(--surface-0)] font-sans text-[var(--text-primary)] antialiased">
      <div className="grain-overlay" aria-hidden="true" />
      <a href="#main-content" className="skip-link">Skip to content</a>
      <Header
        project={project}
        selectedCount={selectedTechIds.length}
        issues={validationIssues}
        onOpenProjectModal={() => setIsProjectModalOpen(true)}
        onOpenPresetsModal={() => setIsPresetsModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onEditStack={handleEditStack}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      />

      <main id="main-content" className="relative flex flex-1 overflow-hidden">
        {/* Left: add / remove components — docked on desktop */}
        <div
          className={`relative z-10 hidden flex-col transition-all duration-300 lg:flex ${
            isSidebarOpen ? "lg:w-80 xl:w-96" : "lg:w-0 lg:overflow-hidden"
          }`}
        >
          <StackPicker
            selectedTechIds={selectedTechIds}
            onToggleTech={handleToggleTech}
            onClearCategory={handleClearCategory}
          />
        </div>

        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`absolute top-1/2 z-20 hidden -translate-y-1/2 rounded-r-[var(--radius-md)] border border-l-0 border-[var(--border-default)] bg-[var(--surface-2)] p-1.5 text-[var(--text-tertiary)] shadow-[var(--elevation-2)] transition hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)] lg:block ${
            isSidebarOpen ? "lg:left-80 xl:left-96" : "left-0"
          }`}
          title={t.stackPicker.title}
        >
          <Layers className="h-3.5 w-3.5" />
        </button>

        {!isDesktop && (
          <Sheet isOpen={isMobileStackSheetOpen} onClose={() => setIsMobileStackSheetOpen(false)} side="left">
            <StackPicker
              selectedTechIds={selectedTechIds}
              onToggleTech={handleToggleTech}
              onClearCategory={handleClearCategory}
              onRequestClose={() => setIsMobileStackSheetOpen(false)}
            />
          </Sheet>
        )}

        <div className="flex flex-1 flex-col overflow-hidden">
          <DiagramCanvas
            model={model}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
          />

          <ValidationPanel issues={validationIssues} onAutoFix={handleAutoFix} />
        </div>

        {isDesktop && selectedNodeId && (
          <ComponentInspector
            nodeId={selectedNodeId}
            model={model}
            onClose={() => setSelectedNodeId(null)}
            onRemoveTech={(techId) => {
              handleToggleTech(techId);
              setSelectedNodeId(null);
            }}
            onSelectNode={setSelectedNodeId}
          />
        )}

        {!isDesktop && (
          <Sheet isOpen={Boolean(selectedNodeId)} onClose={() => setSelectedNodeId(null)} side="right">
            {selectedNodeId && (
              <ComponentInspector
                nodeId={selectedNodeId}
                model={model}
                onClose={() => setSelectedNodeId(null)}
                onRemoveTech={(techId) => {
                  handleToggleTech(techId);
                  setSelectedNodeId(null);
                }}
                onSelectNode={setSelectedNodeId}
              />
            )}
          </Sheet>
        )}
      </main>

      <div className="flex items-stretch border-t border-[var(--border-subtle)] bg-[var(--surface-1)] pb-[env(safe-area-inset-bottom)] lg:hidden">
        <button
          onClick={() => setIsMobileStackSheetOpen(true)}
          className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition ${
            isMobileStackSheetOpen ? "text-accent-500" : "text-[var(--text-tertiary)]"
          }`}
        >
          <Layers className="h-[18px] w-[18px]" />
          <span>{t.stackPicker.title} ({selectedTechIds.length})</span>
        </button>

        <button
          onClick={() => setSelectedNodeId((prev) => (prev ? null : prev))}
          disabled={!selectedNodeId}
          className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition disabled:opacity-40 ${
            selectedNodeId ? "text-accent-500" : "text-[var(--text-tertiary)]"
          }`}
        >
          <SlidersHorizontal className="h-[18px] w-[18px]" />
          <span>{t.inspector.panelTitle}</span>
        </button>
      </div>

      <ProjectConfigModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        config={project}
        onSave={setProject}
      />

      <PresetsModal
        isOpen={isPresetsModalOpen}
        onClose={() => setIsPresetsModalOpen(false)}
        onApplyPreset={handleApplyPreset}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        model={model}
        darkMode={darkMode}
      />
    </div>
  );
}
