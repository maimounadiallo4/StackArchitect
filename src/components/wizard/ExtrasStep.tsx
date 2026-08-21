import React, { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { TechCategory } from "../../types";
import { TECH_CATALOG, CATEGORY_METADATA } from "../../engine/catalog";
import { IconHelper } from "../IconHelper";
import { TechCardGrid } from "./TechCardGrid";
import { useLanguage } from "../../i18n/LanguageContext";
import { cn } from "../../lib/cn";

interface ExtrasStepProps {
  coveredCategories: TechCategory[];
  selectedTechIds: string[];
  onToggleTech: (techId: string) => void;
}

export const ExtrasStep: React.FC<ExtrasStepProps> = ({ coveredCategories, selectedTechIds, onToggleTech }) => {
  const { t } = useLanguage();
  const remainingCategories = useMemo(() => {
    const covered = new Set(coveredCategories);
    return (Object.keys(CATEGORY_METADATA) as TechCategory[]).filter((c) => !covered.has(c));
  }, [coveredCategories]);

  const [expanded, setExpanded] = useState<Set<TechCategory>>(new Set());
  const selectedSet = useMemo(() => new Set(selectedTechIds), [selectedTechIds]);

  const toggleExpanded = (cat: TechCategory) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const countFor = (cat: TechCategory) =>
    TECH_CATALOG.filter((t) => t.category === cat && selectedSet.has(t.id)).length;

  return (
    <div className="rise-in">
      <div className="mb-6">
        <h2 className="font-display text-xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-2xl">{t.extras.heading}</h2>
        <p className="mt-1 max-w-xl text-sm text-[var(--text-secondary)]">
          {t.extras.subheading}
        </p>
      </div>

      <div className="space-y-2.5">
        {remainingCategories.map((cat) => {
          const icon = CATEGORY_METADATA[cat].icon;
          const meta = t.categories[cat];
          const isOpen = expanded.has(cat);
          const count = countFor(cat);
          const techs = TECH_CATALOG.filter((t) => t.category === cat);

          return (
            <div
              key={cat}
              className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-2)]"
            >
              <button
                type="button"
                onClick={() => toggleExpanded(cat)}
                className="flex w-full items-center justify-between gap-3 p-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-3)] text-[var(--text-secondary)]">
                    <IconHelper name={icon} size={16} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[var(--text-primary)]">{meta.label}</span>
                      {count > 0 && (
                        <span className="rounded-full bg-accent-500/15 px-1.5 text-[10px] font-semibold text-accent-400">
                          {count}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--text-tertiary)]">{meta.description}</p>
                  </div>
                </div>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-[var(--text-tertiary)] transition-transform",
                    isOpen && "rotate-180"
                  )}
                />
              </button>

              {isOpen && (
                <div className="border-t border-[var(--border-subtle)] p-4">
                  <TechCardGrid techs={techs} selectedSet={selectedSet} onToggle={onToggleTech} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
