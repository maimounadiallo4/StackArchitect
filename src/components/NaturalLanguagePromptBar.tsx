/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Sparkles, ArrowRight, Loader2, Wand2, Lightbulb, Workflow } from "lucide-react";

interface NaturalLanguagePromptBarProps {
  onGenerateFromPrompt: (prompt: string) => Promise<void>;
  isLoading: boolean;
}

const SAMPLE_PROMPTS = [
  "Application mobile de livraison avec commande, paiement Stripe et notifications",
  "SaaS B2B d'analyse de documents avec AI RAG, Clerk Auth et PostgreSQL",
  "Plateforme e-commerce haute performance avec recherche instantanée Algolia",
  "Outil collaboratif temps réel avec WebSockets, Go et Redis",
];

export const NaturalLanguagePromptBar: React.FC<NaturalLanguagePromptBarProps> = ({
  onGenerateFromPrompt,
  isLoading,
}) => {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    await onGenerateFromPrompt(prompt.trim());
  };

  const handleChipClick = (text: string) => {
    setPrompt(text);
    onGenerateFromPrompt(text);
  };

  return (
    <div className="relative border-b border-[#2c323f] bg-gradient-to-r from-[#1b1f28] via-[#202532] to-[#1b1f28] px-4 py-3 text-white sm:px-6">
      <form onSubmit={handleSubmit} className="mx-auto flex max-w-5xl items-center gap-2">
        <div className="relative flex flex-1 items-center">
          <div className="pointer-events-none absolute left-3.5 flex items-center text-[#ff6d5a]">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-[#ff6d5a]" />
            ) : (
              <Wand2 className="h-4 w-4 text-[#ff8a7a]" />
            )}
          </div>
          <input
            id="input-natural-language-prompt"
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isLoading}
            placeholder="Describe your architecture workflow in natural language (e.g. 'SaaS with Clerk auth, FastAPI backend, PostgreSQL and Celery queues')..."
            className="w-full rounded-xl border border-[#343d4d] bg-[#171a22] py-2.5 pl-10 pr-4 text-xs text-white placeholder:text-neutral-400 focus:border-[#ff6d5a] focus:bg-[#1c212c] focus:outline-none focus:ring-1 focus:ring-[#ff6d5a] transition sm:text-sm"
          />
        </div>

        <button
          id="btn-ai-generate-stack"
          type="submit"
          disabled={!prompt.trim() || isLoading}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#ff6d5a] to-[#ea4b34] px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-[#ff6d5a]/25 transition hover:from-[#ff5540] hover:to-[#d83f2a] disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="hidden sm:inline">Generating Flow...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>AI Stack Match</span>
              <ArrowRight className="hidden h-3.5 w-3.5 sm:inline" />
            </>
          )}
        </button>
      </form>

      {/* Quick Prompts Suggestions */}
      <div className="mx-auto mt-2.5 flex max-w-5xl items-center gap-1.5 overflow-x-auto text-[11px] text-neutral-400 no-scrollbar">
        <span className="flex items-center gap-1 font-semibold text-[#ff8a7a]">
          <Lightbulb className="h-3 w-3" />
          <span>Quick Flows:</span>
        </span>
        {SAMPLE_PROMPTS.map((sample, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleChipClick(sample)}
            className="shrink-0 rounded-lg border border-[#303848] bg-[#222834] px-2.5 py-0.5 text-neutral-300 transition hover:border-[#ff6d5a]/60 hover:bg-[#2a3242] hover:text-white"
          >
            {sample}
          </button>
        ))}
      </div>
    </div>
  );
};
