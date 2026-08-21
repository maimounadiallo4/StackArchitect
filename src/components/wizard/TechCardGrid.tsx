/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Check, Plus, ExternalLink } from "lucide-react";
import { Technology } from "../../types";
import { IconTile } from "../ui/IconTile";
import { cn } from "../../lib/cn";

interface TechCardGridProps {
  techs: Technology[];
  selectedSet: Set<string>;
  onToggle: (techId: string) => void;
}

export const TechCardGrid: React.FC<TechCardGridProps> = ({ techs, selectedSet, onToggle }) => {
  return (
    <div className="@container">
    <div className="grid grid-cols-1 gap-3 @sm:grid-cols-2 @xl:grid-cols-3">
      {techs.map((tech) => {
        const isSelected = selectedSet.has(tech.id);
        return (
          <button
            key={tech.id}
            type="button"
            onClick={() => onToggle(tech.id)}
            className={cn(
              "group relative flex flex-col gap-3 rounded-[var(--radius-lg)] border p-4 text-left transition-all duration-150",
              isSelected
                ? "border-accent-500 bg-accent-500/[0.07] shadow-[var(--elevation-2)]"
                : "border-[var(--border-subtle)] bg-[var(--surface-2)] hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:shadow-[var(--elevation-2)]"
            )}
          >
            {isSelected && (
              <span className="absolute inset-y-3 left-0 w-[3px] rounded-full bg-accent-500" />
            )}

            <div className="flex items-start justify-between gap-2">
              <IconTile techId={tech.id} icon={tech.iconName} accentColor={tech.accentColor} size="md" />
              <div
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition",
                  isSelected
                    ? "border-accent-500 bg-accent-500 text-[var(--text-on-accent)]"
                    : "border-[var(--border-default)] text-[var(--text-tertiary)] group-hover:border-accent-500"
                )}
              >
                {isSelected ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : <Plus className="h-3.5 w-3.5" />}
              </div>
            </div>

            <div>
              <h4 className="font-display text-sm font-semibold text-[var(--text-primary)]">{tech.name}</h4>
              <p className="mt-0.5 text-xs leading-relaxed text-[var(--text-tertiary)]">{tech.tagline}</p>
            </div>

            <div className="mt-auto flex items-center justify-between border-t border-[var(--border-subtle)] pt-2.5 text-[10px] text-[var(--text-tertiary)]">
              <span>{tech.pricingModel}</span>
              <a
                href={tech.documentationUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-0.5 hover:text-accent-400"
              >
                <span>Docs</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>
          </button>
        );
      })}
    </div>
    </div>
  );
};
