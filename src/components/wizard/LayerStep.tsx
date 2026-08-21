/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from "react";
import { TechCategory } from "../../types";
import { TECH_CATALOG, CATEGORY_METADATA } from "../../engine/catalog";
import { IconHelper } from "../IconHelper";
import { TechCardGrid } from "./TechCardGrid";

interface LayerStepProps {
  category: TechCategory;
  required: boolean;
  selectedTechIds: string[];
  onToggleTech: (techId: string) => void;
}

export const LayerStep: React.FC<LayerStepProps> = ({ category, required, selectedTechIds, onToggleTech }) => {
  const meta = CATEGORY_METADATA[category];
  const techs = useMemo(() => TECH_CATALOG.filter((t) => t.category === category), [category]);
  const selectedSet = useMemo(() => new Set(selectedTechIds), [selectedTechIds]);

  return (
    <div className="rise-in">
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-accent-500/30 bg-accent-500/10 text-accent-500">
          <IconHelper name={meta.icon} size={20} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-xl font-semibold text-[var(--text-primary)] sm:text-2xl">{meta.label}</h2>
            {!required && (
              <span className="rounded-full border border-[var(--border-default)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--text-tertiary)]">
                Optional
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
