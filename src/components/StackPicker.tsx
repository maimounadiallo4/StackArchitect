import React, { useState, useMemo } from "react";
import { Search, X, Layers } from "lucide-react";
import { TechCategory } from "../types";
import { TECH_CATALOG, CATEGORY_METADATA } from "../engine/catalog";
import { IconHelper } from "./IconHelper";
import { TechCardGrid } from "./wizard/TechCardGrid";
import { useLanguage } from "../i18n/LanguageContext";
import { cn } from "../lib/cn";

interface StackPickerProps {
  selectedTechIds: string[];
  onToggleTech: (techId: string) => void;
  onClearCategory: (category: TechCategory) => void;
  /** Present only when rendered inside the mobile/tablet sheet — shows a close affordance. */
  onRequestClose?: () => void;
}

export const StackPicker: React.FC<StackPickerProps> = ({
  selectedTechIds,
  onToggleTech,
  onClearCategory,
  onRequestClose,
}) => {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<TechCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = useMemo(() => Object.keys(CATEGORY_METADATA) as TechCategory[], []);

  const filteredTechs = useMemo(() => {
    return TECH_CATALOG.filter((tech) => {
      const matchesCategory = selectedCategory === "all" || tech.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === "" ||
        tech.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tech.tagline.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const selectedSet = useMemo(() => new Set(selectedTechIds), [selectedTechIds]);

  const selectedCountsByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    TECH_CATALOG.forEach((t) => {
      if (selectedSet.has(t.id)) counts[t.category] = (counts[t.category] || 0) + 1;
    });
    return counts;
  }, [selectedSet]);

  return (
    <div className="flex h-full flex-col border-r border-[var(--border-subtle)] bg-[var(--surface-1)] text-[var(--text-primary)]">
      <div className="border-b border-[var(--border-subtle)] p-3.5">
        <div className="mb-2.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            <Layers className="h-3.5 w-3.5 text-accent-500" />
            <h2>{t.stackPicker.title}</h2>
          </div>
          {onRequestClose && (
            <button
              onClick={onRequestClose}
              aria-label={t.stackPicker.closeLabel}
              className="rounded-[var(--radius-sm)] p-1 text-[var(--text-tertiary)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="relative mb-2.5">
          <label htmlFor="tech-search-input" className="sr-only">{t.stackPicker.searchPlaceholder}</label>
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-[var(--text-tertiary)]" />
          <input
            id="tech-search-input"
            name="tech-search"
            type="text"
            placeholder={t.stackPicker.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape" && searchQuery) {
                e.stopPropagation();
                setSearchQuery("");
              }
            }}
            className="w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-2)] py-2 pl-9 pr-3 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] transition focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedCategory("all")}
            className={cn(
              "shrink-0 rounded-[var(--radius-sm)] px-2.5 py-1 text-xs font-medium transition",
              selectedCategory === "all"
                ? "bg-accent-500 text-[var(--text-on-accent)]"
                : "bg-[var(--surface-2)] text-[var(--text-secondary)] hover:bg-[var(--surface-3)]"
            )}
          >
            {t.stackPicker.all}
          </button>
          {categories.map((cat) => {
            const icon = CATEGORY_METADATA[cat].icon;
            const label = t.categories[cat].label;
            const count = selectedCountsByCategory[cat] || 0;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "flex shrink-0 items-center gap-1 rounded-[var(--radius-sm)] px-2.5 py-1 text-xs font-medium transition",
                  isSelected
                    ? "bg-accent-500 text-[var(--text-on-accent)]"
                    : "bg-[var(--surface-2)] text-[var(--text-secondary)] hover:bg-[var(--surface-3)]"
                )}
              >
                <IconHelper name={icon} size={13} />
                <span>{label.split(" ")[0]}</span>
                {count > 0 && (
                  <span
                    className={cn(
                      "rounded-full px-1.5 text-[10px] font-bold",
                      isSelected ? "bg-white/20" : "bg-accent-500/15 text-accent-400"
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3.5">
        {selectedCategory !== "all" && selectedCountsByCategory[selectedCategory] > 0 && (
          <button
            onClick={() => onClearCategory(selectedCategory)}
            className="mb-2.5 text-[11px] font-semibold text-danger-400 hover:underline"
          >
            {t.stackPicker.clearLayer}
          </button>
        )}

        <TechCardGrid techs={filteredTechs} selectedSet={selectedSet} onToggle={onToggleTech} />

        {filteredTechs.length === 0 && (
          <div className="py-12 text-center text-xs text-[var(--text-tertiary)]">
            <Search className="mx-auto mb-2 h-8 w-8 opacity-40" />
            <p className="font-semibold text-[var(--text-primary)]">{t.stackPicker.noResults}</p>
          </div>
        )}
      </div>
    </div>
  );
};
