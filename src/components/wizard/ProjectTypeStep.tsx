/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Check, Wand2, Loader2, FolderKanban, ArrowRight } from "lucide-react";
import { ProjectType } from "../../types";
import { PROJECT_TYPE_META } from "../../engine/projectTypes";
import { IconHelper } from "../IconHelper";
import { cn } from "../../lib/cn";

interface ProjectTypeStepProps {
  projectName: string;
  onChangeName: (name: string) => void;
  selectedType: ProjectType;
  onSelectType: (type: ProjectType) => void;
  onOpenTemplates: () => void;
  isGeneratingAI: boolean;
  onAIQuickStart: (prompt: string) => Promise<void>;
}

export const ProjectTypeStep: React.FC<ProjectTypeStepProps> = ({
  projectName,
  onChangeName,
  selectedType,
  onSelectType,
  onOpenTemplates,
  isGeneratingAI,
  onAIQuickStart,
}) => {
  const [prompt, setPrompt] = useState("");

  const handleAISubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGeneratingAI) return;
    await onAIQuickStart(prompt.trim());
  };

  return (
    <div className="rise-in">
      <h2 className="font-display text-2xl font-semibold text-[var(--text-primary)] sm:text-3xl">
        What are you building?
      </h2>
      <p className="mt-2 max-w-xl text-sm text-[var(--text-secondary)]">
        Pick the closest match — we'll ask about the right layers next, one at a time.
      </p>

      <div className="mt-6 max-w-sm">
        <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">Project name</label>
        <input
          type="text"
          value={projectName}
          onChange={(e) => onChangeName(e.target.value)}
          placeholder="e.g. Orbit"
          className="w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-2)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {PROJECT_TYPE_META.map((pt) => {
          const isSelected = selectedType === pt.type;
          return (
            <button
              key={pt.type}
              type="button"
              onClick={() => onSelectType(pt.type)}
              className={cn(
                "group relative flex flex-col gap-3 rounded-[var(--radius-lg)] border p-4 text-left transition-all duration-150",
                isSelected
                  ? "border-accent-500 bg-accent-500/[0.07] shadow-[var(--elevation-2)]"
                  : "border-[var(--border-subtle)] bg-[var(--surface-2)] hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:shadow-[var(--elevation-2)]"
              )}
            >
              {isSelected && <span className="absolute inset-y-3 left-0 w-[3px] rounded-full bg-accent-500" />}
              <div className="flex items-center justify-between">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] border"
                  style={{ backgroundColor: `${pt.accentColor}1f`, color: pt.accentColor, borderColor: `${pt.accentColor}3d` }}
                >
                  <IconHelper name={pt.icon} size={17} />
                </div>
                {isSelected && (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-500 text-[var(--text-on-accent)]">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-display text-sm font-semibold text-[var(--text-primary)]">{pt.label}</h4>
                <p className="mt-0.5 text-xs leading-relaxed text-[var(--text-tertiary)]">{pt.tagline}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex flex-col gap-3 border-t border-[var(--border-subtle)] pt-6 sm:flex-row sm:items-center">
        <form onSubmit={handleAISubmit} className="flex flex-1 items-center gap-2">
          <div className="relative flex-1">
            <Wand2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-accent-500" />
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isGeneratingAI}
              placeholder="Or describe your idea and let AI pick a starting point..."
              className="w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-2)] py-2.5 pl-9 pr-3 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
            />
          </div>
          <button
            type="submit"
            disabled={!prompt.trim() || isGeneratingAI}
            className="flex items-center gap-1.5 rounded-[var(--radius-md)] bg-accent-500 px-3.5 py-2.5 text-xs font-semibold text-[var(--text-on-accent)] transition hover:bg-accent-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isGeneratingAI ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowRight className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{isGeneratingAI ? "Thinking..." : "Go"}</span>
          </button>
        </form>

        <button
          type="button"
          onClick={onOpenTemplates}
          className="flex items-center justify-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--border-default)] px-3.5 py-2.5 text-xs font-medium text-[var(--text-secondary)] transition hover:border-accent-500/50 hover:text-[var(--text-primary)]"
        >
          <FolderKanban className="h-3.5 w-3.5" />
          <span>Start from a template</span>
        </button>
      </div>
    </div>
  );
};
