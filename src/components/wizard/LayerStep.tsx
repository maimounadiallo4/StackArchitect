import React, { useMemo } from "react";
import { TechCategory } from "../../types";
import { TECH_CATALOG, CATEGORY_METADATA } from "../../engine/catalog";
import { IconHelper } from "../IconHelper";
import { TechCardGrid } from "./TechCardGrid";
import { useLanguage } from "../../i18n/LanguageContext";

interface LayerStepProps {
  category: TechCategory;
  required: boolean;
  selectedTechIds: string[];
  onToggleTech: (techId: string) => void;
}

export const LayerStep: React.FC<LayerStepProps> = ({ category, required, selectedTechIds, onToggleTech }) => {
  const { t } = useLanguage();
  const icon = CATEGORY_METADATA[category].icon;
  const meta = t.categories[category];
  const techs = useMemo(() => TECH_CATALOG.filter((tech) => tech.category === category), [category]);
  const selectedSet = useMemo(() => new Set(selectedTechIds), [selectedTechIds]);

  return (
    <div className="rise-in">
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-accent-500/30 bg-accent-500/10 text-accent-500">
          <IconHelper name={icon} size={20} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-2xl">{meta.label}</h2>
            {!required && (
              <span className="rounded-[var(--radius-sm)] border border-[var(--border-default)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--text-tertiary)]">
                {t.layer.optional}
              </span>
            )}
          </div>
          <p className="mt-1 max-w-xl text-sm text-[var(--text-secondary)]">{meta.description}</p>
        </div>
      </div>

      <TechCardGrid techs={techs} selectedSet={selectedSet} onToggle={onToggleTech} />
    </div>
  );
};
