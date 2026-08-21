/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import {
  Search,
  Check,
  Plus,
  ExternalLink,
  Info,
  Filter,
  Sparkles,
  Layers,
  ChevronRight,
  Workflow,
  Zap,
} from "lucide-react";
import { Technology, TechCategory } from "../types";
import { TECH_CATALOG, CATEGORY_METADATA } from "../engine/catalog";
import { IconHelper } from "./IconHelper";

interface StackPickerProps {
  selectedTechIds: string[];
  onToggleTech: (techId: string) => void;
  onSelectOnly: (techId: string) => void;
  onClearCategory: (category: TechCategory) => void;
  onGenerate: () => void;
  isGenerating?: boolean;
}

export const StackPicker: React.FC<StackPickerProps> = ({
  selectedTechIds,
  onToggleTech,
  onSelectOnly,
  onClearCategory,
  onGenerate,
  isGenerating = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<TechCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = useMemo(() => {
    return Object.keys(CATEGORY_METADATA) as TechCategory[];
  }, []);

  const filteredTechs = useMemo(() => {
    return TECH_CATALOG.filter((tech) => {
      const matchesCategory =
        selectedCategory === "all" || tech.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === "" ||
        tech.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tech.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tech.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tech.bestFor.some((b) => b.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const selectedSet = useMemo(() => new Set(selectedTechIds), [selectedTechIds]);

  // Count per category
  const selectedCountsByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    TECH_CATALOG.forEach((t) => {
      if (selectedSet.has(t.id)) {
        counts[t.category] = (counts[t.category] || 0) + 1;
      }
    });
    return counts;
  }, [selectedSet]);

  return (
    <div className="flex h-full flex-col border-r border-[#2c323f] bg-[#161920] text-neutral-200">
      {/* Node Search & Category Tabs (n8n Node Creator Header) */}
      <div className="border-b border-[#2c323f] bg-[#1a1e27] p-3">
        <div className="mb-2.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase tracking-wider">
            <Workflow className="h-3.5 w-3.5 text-[#ff6d5a]" />
            <span>Nodes & Services</span>
          </div>
          <span className="text-[11px] font-mono text-neutral-400">
            {selectedTechIds.length} added
          </span>
        </div>

        <div className="relative mb-2.5">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
          <input
            id="input-tech-search"
            type="text"
            placeholder="Search nodes (e.g. FastAPI, Redis, Stripe, Gemini)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-[#303744] bg-[#222732] py-2 pl-9 pr-3 text-xs text-white placeholder:text-neutral-400 focus:border-[#ff6d5a] focus:bg-[#262c38] focus:outline-none focus:ring-1 focus:ring-[#ff6d5a] transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-2 text-xs text-neutral-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
              selectedCategory === "all"
                ? "bg-[#ff6d5a] text-white shadow-xs"
                : "bg-[#252b37] text-neutral-300 hover:bg-[#2e3646] hover:text-white"
            }`}
          >
            <span>All</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                selectedCategory === "all"
                  ? "bg-white/20 text-white"
                  : "bg-[#333a4a] text-neutral-300"
              }`}
            >
              {selectedTechIds.length}
            </span>
          </button>

          {categories.map((cat) => {
            const meta = CATEGORY_METADATA[cat];
            const count = selectedCountsByCategory[cat] || 0;
            const isSelected = selectedCategory === cat;

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  isSelected
                    ? "bg-[#ff6d5a] text-white shadow-xs"
                    : "bg-[#252b37] text-neutral-300 hover:bg-[#2e3646] hover:text-white"
                }`}
              >
                <IconHelper name={meta.icon} size={13} className="shrink-0" />
                <span>{meta.label.split(" ")[0]}</span>
                {count > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                      isSelected
                        ? "bg-white text-[#ea4b34]"
                        : "bg-[#ff6d5a]/20 text-[#ff8a7a]"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Nodes List / Grid (n8n Node Style Cards) */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
        {selectedCategory !== "all" && (
          <div className="flex items-center justify-between rounded-xl bg-[#202530] border border-[#2d3543] px-3 py-2 text-xs">
            <div className="flex items-center gap-2">
              <IconHelper name={CATEGORY_METADATA[selectedCategory].icon} size={15} className="text-[#ff6d5a]" />
              <div>
                <span className="font-bold text-white">
                  {CATEGORY_METADATA[selectedCategory].label}
                </span>
                <p className="text-[10px] text-neutral-400">{CATEGORY_METADATA[selectedCategory].description}</p>
              </div>
            </div>
            {selectedCountsByCategory[selectedCategory] > 0 && (
              <button
                onClick={() => onClearCategory(selectedCategory)}
                className="text-[11px] font-semibold text-rose-400 hover:underline"
              >
                Clear
              </button>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 gap-2.5">
          {filteredTechs.map((tech) => {
            const isSelected = selectedSet.has(tech.id);

            return (
              <div
                key={tech.id}
                id={`tech-card-${tech.id}`}
                onClick={() => onToggleTech(tech.id)}
                className={`group relative flex cursor-pointer flex-col justify-between rounded-2xl border p-3 transition-all ${
                  isSelected
                    ? "border-[#ff6d5a] bg-[#222834] ring-1 ring-[#ff6d5a]/50 shadow-md"
                    : "border-[#2c3442] bg-[#1b1f29] hover:border-[#3d485a] hover:bg-[#202532]"
                }`}
              >
                {/* Node Title + Icon + Toggle Pill */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl shadow-xs"
                        style={{
                          backgroundColor: `${tech.accentColor}25`,
                          color: tech.accentColor,
                          border: `1px solid ${tech.accentColor}40`,
                        }}
                      >
                        <IconHelper name={tech.iconName} size={17} />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-white tracking-tight">
                            {tech.name}
                          </h4>
                          <span className="rounded bg-[#28303e] px-1.5 py-0.2 text-[9px] font-semibold uppercase text-neutral-400">
                            {tech.category}
                          </span>
                        </div>
                        <p className="line-clamp-1 text-[11px] text-neutral-400">
                          {tech.tagline}
                        </p>
                      </div>
                    </div>

                    {/* Selection Indicator Checkbox (n8n Coral Pill) */}
                    <div
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition ${
                        isSelected
                          ? "border-[#ff6d5a] bg-[#ff6d5a] text-white shadow-xs"
                          : "border-[#3b4455] bg-[#242b38] text-neutral-400 group-hover:border-[#ff6d5a] group-hover:text-white"
                      }`}
                    >
                      {isSelected ? (
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                      ) : (
                        <Plus className="h-3.5 w-3.5" />
                      )}
                    </div>
                  </div>

                  {/* Architectural Role */}
                  <p className="mt-2 text-[11px] leading-relaxed text-neutral-300 line-clamp-2">
                    {tech.roleInArchitecture}
                  </p>
                </div>

                {/* Bottom metadata tags & protocols */}
                <div className="mt-2.5 flex flex-wrap items-center justify-between gap-1 border-t border-[#2a313e] pt-2 text-[10px] text-neutral-400">
                  <div className="flex flex-wrap gap-1">
                    {tech.supportedProtocols.slice(0, 2).map((proto, pIdx) => (
                      <span
                        key={pIdx}
                        className="rounded bg-[#252b37] px-1.5 py-0.2 font-mono text-[9px] text-neutral-300 border border-[#343c4c]"
                      >
                        {proto.split(" ")[0]}
                      </span>
                    ))}
                  </div>

                  <a
                    href={tech.documentationUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-0.5 text-neutral-400 hover:text-[#ff8a7a] transition"
                    title="View Official Documentation"
                  >
                    <span>Docs</span>
                    <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {filteredTechs.length === 0 && (
          <div className="py-12 text-center text-xs text-neutral-400">
            <Search className="mx-auto mb-2 h-8 w-8 text-neutral-600" />
            <p className="font-bold text-white">No nodes found</p>
            <p className="mt-1">Try adjusting your search query or category filter.</p>
          </div>
        )}
      </div>

      {/* Sticky Bottom Bar: Generate Flow */}
      <div className="border-t border-[#2c323f] bg-[#1a1e27] p-3 shadow-2xl">
        <div className="mb-2 flex items-center justify-between text-xs text-neutral-400">
          <span>{selectedTechIds.length} nodes in workflow</span>
          <button
            onClick={() => onClearCategory("frontend")}
            className="text-[11px] text-neutral-400 hover:text-white"
          >
            Reset
          </button>
        </div>

        <button
          id="btn-generate-architecture"
          onClick={onGenerate}
          disabled={selectedTechIds.length === 0 || isGenerating}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ff6d5a] to-[#ea4b34] py-2.5 text-xs font-bold text-white shadow-lg shadow-[#ff6d5a]/25 transition hover:from-[#ff5540] hover:to-[#d83f2a] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Workflow className="h-4 w-4" />
          <span>Auto-Layout Graph</span>
        </button>
      </div>
    </div>
  );
};
