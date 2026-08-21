/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProjectConfig, Technology, ValidationIssue, AIReviewResult } from "../types";

export interface AISuggestionResponse {
  projectName: string;
  projectType: ProjectConfig["type"];
  description: string;
  recommendedTechIds: string[];
  rationale: string;
  architecturalHighlights: string[];
}

export async function askAISuggestStack(
  prompt: string,
  currentTechIds: string[] = []
): Promise<AISuggestionResponse> {
  const response = await fetch("/api/ai/suggest-stack", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, currentTechIds }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Server responded with ${response.status}`);
  }

  return response.json();
}

export async function askAIReviewArchitecture(
  project: ProjectConfig,
  selectedTechs: Technology[],
  issues: ValidationIssue[]
): Promise<AIReviewResult> {
  const response = await fetch("/api/ai/review-architecture", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      project,
      selectedTechDetails: selectedTechs.map((t) => ({
        id: t.id,
        name: t.name,
        category: t.category,
        role: t.roleInArchitecture,
      })),
      issues: issues.map((i) => ({
        severity: i.severity,
        title: i.title,
        message: i.message,
      })),
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Server responded with ${response.status}`);
  }

  return response.json();
}

export async function askAICopilot(
  question: string,
  project: ProjectConfig,
  selectedTechs: Technology[]
): Promise<string> {
  const response = await fetch("/api/ai/copilot-chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question,
      project,
      selectedTechDetails: selectedTechs.map((t) => ({
        name: t.name,
        category: t.category,
        role: t.roleInArchitecture,
        protocols: t.supportedProtocols,
      })),
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Server responded with ${response.status}`);
  }

  const data = await response.json();
  return data.answer;
}
