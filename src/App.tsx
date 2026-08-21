/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Header } from "./components/Header";
import { NaturalLanguagePromptBar } from "./components/NaturalLanguagePromptBar";
import { StackPicker } from "./components/StackPicker";
import { DiagramCanvas } from "./components/DiagramCanvas";
import { ComponentInspector } from "./components/ComponentInspector";
import { ValidationPanel } from "./components/ValidationPanel";
import { AICopilotDrawer } from "./components/AICopilotDrawer";
import { ProjectConfigModal } from "./components/ProjectConfigModal";
import { PresetsModal } from "./components/PresetsModal";
import { ExportModal } from "./components/ExportModal";

import {
  ProjectConfig,
  Technology,
  ViewLevel,
  ValidationIssue,
  StackPreset,
  NodeExecutionResult,
} from "./types";
import { TECH_BY_ID, TECH_CATALOG } from "./engine/catalog";
import { generateArchitectureModel } from "./engine/architectureEngine";
import { validateArchitecture } from "./engine/validator";
import { askAISuggestStack } from "./services/aiService";
import { ChevronLeft, ChevronRight, Layers, SlidersHorizontal } from "lucide-react";

export default function App() {
  // Dark mode state
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Project configuration
  const [project, setProject] = useState<ProjectConfig>({
    name: "Modern AI SaaS Platform",
    type: "ai_app",
    description:
      "Enterprise AI SaaS with RAG embeddings, multi-tenant authentication, and subscription billing.",
    expectedTraffic: "high",
    budgetConstraint: "balanced",
  });

  // Selected technology IDs (starting default stack)
  const [selectedTechIds, setSelectedTechIds] = useState<string[]>([
    "nextjs",
    "fastapi",
    "postgresql",
    "redis",
    "clerk",
    "stripe",
    "gemini",
    "pinecone",
    "s3",
    "vercel",
    "gcp_cloudrun",
    "sentry",
    "github_actions",
  ]);

  // View level & Selected node
  const [viewLevel, setViewLevel] = useState<ViewLevel>("system");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Workflow Execution / Testing Simulation state (n8n style)
  const [isExecutingWorkflow, setIsExecutingWorkflow] = useState(false);
  const [executingNodeId, setExecutingNodeId] = useState<string | null>(null);
  const [executionResults, setExecutionResults] = useState<Record<string, NodeExecutionResult>>({});

  // Layout UI states
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isPresetsModalOpen, setIsPresetsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Node position overrides for user manual dragging
  const [customNodePositions, setCustomNodePositions] = useState<Record<string, { x: number; y: number }>>({});

  // Resolve selected Technology objects
  const selectedTechs = useMemo(() => {
    return selectedTechIds
      .map((id) => TECH_BY_ID.get(id))
      .filter((t): t is Technology => Boolean(t));
  }, [selectedTechIds]);

  // Generate Architecture Model from Engine
  const baseModel = useMemo(() => {
    return generateArchitectureModel(project, selectedTechs, viewLevel);
  }, [project, selectedTechs, viewLevel]);

  // Apply custom positions if any
  const model = useMemo(() => {
    if (Object.keys(customNodePositions).length === 0) return baseModel;
    const updatedNodes = baseModel.nodes.map((node) => {
      const custom = customNodePositions[node.id];
      if (custom) {
        return { ...node, x: custom.x, y: custom.y };
      }
      return node;
    });
    return { ...baseModel, nodes: updatedNodes };
  }, [baseModel, customNodePositions]);

  // Real-time Architecture Validation issues
  const validationIssues = useMemo(() => {
    return validateArchitecture(project, selectedTechs);
  }, [project, selectedTechs]);

  // Handlers for technology selection
  const handleToggleTech = useCallback((techId: string) => {
    setSelectedTechIds((prev) => {
      if (prev.includes(techId)) {
        return prev.filter((id) => id !== techId);
      } else {
        return [...prev, techId];
      }
    });
  }, []);

  const handleSelectOnly = useCallback((techId: string) => {
    setSelectedTechIds([techId]);
  }, []);

  const handleClearCategory = useCallback((category: string) => {
    setSelectedTechIds((prev) =>
      prev.filter((id) => {
        const tech = TECH_BY_ID.get(id);
        return tech ? tech.category !== category : true;
      })
    );
  }, []);

  const handleResetStack = useCallback(() => {
    setSelectedTechIds([]);
    setCustomNodePositions({});
    setSelectedNodeId(null);
    setExecutionResults({});
    setExecutingNodeId(null);
    setIsExecutingWorkflow(false);
  }, []);

  const handleNodePositionChange = useCallback((nodeId: string, x: number, y: number) => {
    setCustomNodePositions((prev) => ({
      ...prev,
      [nodeId]: { x, y },
    }));
  }, []);

  const handleAutoLayout = useCallback(() => {
    setCustomNodePositions({});
  }, []);

  // 1-Click Auto-Fix Handler
  const handleAutoFix = useCallback((action: NonNullable<ValidationIssue["autoFixAction"]>) => {
    if (action.type === "add_tech" && action.techId) {
      setSelectedTechIds((prev) => {
        if (!prev.includes(action.techId!)) {
          return [...prev, action.techId!];
        }
        return prev;
      });
    } else if (action.type === "remove_tech" && action.techId) {
      setSelectedTechIds((prev) => prev.filter((id) => id !== action.techId));
    }
  }, []);

  // Apply Blueprint Preset
  const handleApplyPreset = useCallback((preset: StackPreset) => {
    setProject((prev) => ({
      ...prev,
      name: preset.name,
      type: preset.projectType,
      description: preset.description,
    }));
    setSelectedTechIds(preset.techIds);
    setCustomNodePositions({});
    setSelectedNodeId(null);
    setExecutionResults({});
  }, []);

  // Single Node Test Handler (e.g. from Inspector)
  const handleExecuteSingleNode = useCallback((nodeId: string) => {
    setExecutingNodeId(nodeId);
    setExecutionResults((prev) => ({
      ...prev,
      [nodeId]: {
        status: "running",
        startedAt: Date.now(),
      },
    }));

    setTimeout(() => {
      const node = model.nodes.find((n) => n.id === nodeId);
      const isIssue = validationIssues.some((issue) => issue.techIds.includes(node?.techId || ""));
      const executionTime = Math.floor(Math.random() * 45 + 12);

      setExecutionResults((prev) => ({
        ...prev,
        [nodeId]: {
          status: isIssue ? "warning" : "success",
          executionTimeMs: executionTime,
          startedAt: Date.now() - executionTime,
          outputData: {
            nodeId,
            tech: node?.label || "Node",
            status: isIssue ? "warning" : "active",
            latencyMs: executionTime,
            health: "healthy",
            timestamp: new Date().toISOString(),
          },
        },
      }));
      setExecutingNodeId(null);
    }, 600);
  }, [model.nodes, validationIssues]);

  // Full Workflow Simulation Execution Handler (n8n test run)
  const handleExecuteWorkflow = useCallback(async () => {
    if (isExecutingWorkflow || model.nodes.length === 0) return;

    setIsExecutingWorkflow(true);
    setExecutionResults({});

    // Sort nodes topologically or by zone/layer
    const zoneOrder: Record<string, number> = {
      client: 0,
      edge: 1,
      core: 2,
      data: 3,
      cloud: 4,
      security: 5,
    };

    const sortedNodes = [...model.nodes].sort((a, b) => {
      const orderA = zoneOrder[a.zone] ?? 2;
      const orderB = zoneOrder[b.zone] ?? 2;
      return orderA - orderB || a.x - b.x;
    });

    for (let i = 0; i < sortedNodes.length; i++) {
      const node = sortedNodes[i];
      setExecutingNodeId(node.id);
      
      setExecutionResults((prev) => ({
        ...prev,
        [node.id]: {
          status: "running",
          startedAt: Date.now(),
        },
      }));

      // Realistic step delay
      await new Promise((resolve) => setTimeout(resolve, 380));

      const isIssue = validationIssues.some((issue) => issue.techIds.includes(node.techId || ""));
      const executionTime = Math.floor(Math.random() * 35 + 8);

      setExecutionResults((prev) => ({
        ...prev,
        [node.id]: {
          status: isIssue ? "warning" : "success",
          executionTimeMs: executionTime,
          startedAt: Date.now() - executionTime,
          outputData: {
            nodeId: node.id,
            label: node.label,
            category: node.category,
            zone: node.zone,
            status: isIssue ? "warning" : "healthy",
            latencyMs: executionTime,
            timestamp: new Date().toISOString(),
          },
        },
      }));
    }

    setExecutingNodeId(null);
    setIsExecutingWorkflow(false);
  }, [isExecutingWorkflow, model.nodes, validationIssues]);

  // AI Natural Language Generator
  const handleAIGenerateFromPrompt = async (promptText: string) => {
    setIsGeneratingAI(true);
    try {
      const result = await askAISuggestStack(promptText, selectedTechIds);
      if (result.recommendedTechIds && result.recommendedTechIds.length > 0) {
        setSelectedTechIds(result.recommendedTechIds);
        setProject((prev) => ({
          ...prev,
          name: result.projectName || prev.name,
          type: result.projectType || prev.type,
          description: result.description || prev.description,
        }));
        setCustomNodePositions({});
        setSelectedNodeId(null);
        setExecutionResults({});
      }
    } catch (err: any) {
      console.error("AI Stack generation error:", err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-neutral-100 font-sans text-neutral-900 antialiased dark:bg-[#13161c] dark:text-neutral-100">
      {/* Top Application Header */}
      <Header
        project={project}
        selectedCount={selectedTechIds.length}
        issues={validationIssues}
        isAiDrawerOpen={isAiDrawerOpen}
        onToggleAiDrawer={() => setIsAiDrawerOpen(!isAiDrawerOpen)}
        onOpenProjectModal={() => setIsProjectModalOpen(true)}
        onOpenPresetsModal={() => setIsPresetsModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onResetStack={handleResetStack}
        onGenerate={() => setCustomNodePositions({})}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        isExecuting={isExecutingWorkflow}
        onExecuteWorkflow={handleExecuteWorkflow}
      />

      {/* Natural Language Prompt & Matcher Bar */}
      <NaturalLanguagePromptBar
        onGenerateFromPrompt={handleAIGenerateFromPrompt}
        isLoading={isGeneratingAI}
      />

      {/* Main Workspace Layout */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Left Side: Technology Stack Picker */}
        <div
          className={`relative z-10 flex flex-col transition-all duration-300 ${
            isSidebarOpen ? "w-80 md:w-96" : "w-0 overflow-hidden"
          }`}
        >
          <StackPicker
            selectedTechIds={selectedTechIds}
            onToggleTech={handleToggleTech}
            onSelectOnly={handleSelectOnly}
            onClearCategory={handleClearCategory}
            onGenerate={() => setCustomNodePositions({})}
            isGenerating={isGeneratingAI}
          />
        </div>

        {/* Sidebar Toggle Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`absolute left-0 top-1/2 z-20 -translate-y-1/2 rounded-r-lg border border-l-0 border-[#2c323f] bg-[#1d222b] p-1.5 text-neutral-400 shadow-xl transition hover:bg-[#28303e] hover:text-white ${
            isSidebarOpen ? "left-80 md:left-96" : "left-0"
          }`}
          title={isSidebarOpen ? "Collapse Stack Picker" : "Open Stack Picker"}
        >
          {isSidebarOpen ? <ChevronLeft className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        </button>

        {/* Center: Interactive Diagram Canvas & Diagnostics */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <DiagramCanvas
            model={model}
            viewLevel={viewLevel}
            onChangeViewLevel={setViewLevel}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
            onNodePositionChange={handleNodePositionChange}
            onAutoLayout={handleAutoLayout}
            executionResults={executionResults}
            executingNodeId={executingNodeId}
          />

          {/* Architecture Audit & Diagnostics Bottom Bar */}
          <ValidationPanel
            issues={validationIssues}
            onAutoFix={handleAutoFix}
          />
        </div>

        {/* Right Side: Component Inspector (when node is clicked) */}
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
            executionResult={executionResults[selectedNodeId]}
            onTestNode={handleExecuteSingleNode}
          />
        )}

        {/* AI Copilot Drawer */}
        <AICopilotDrawer
          isOpen={isAiDrawerOpen}
          onClose={() => setIsAiDrawerOpen(false)}
          project={project}
          selectedTechs={selectedTechs}
          issues={validationIssues}
          onAddTech={(techId) => {
            if (!selectedTechIds.includes(techId)) {
              setSelectedTechIds((prev) => [...prev, techId]);
            }
          }}
        />
      </div>

      {/* Modals */}
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
        viewLevel={viewLevel}
      />
    </div>
  );
}
