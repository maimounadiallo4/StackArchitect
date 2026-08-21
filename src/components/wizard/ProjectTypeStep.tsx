import React from "react";
import { Check, FolderKanban } from "lucide-react";
import { ProjectType } from "../../types";
import { PROJECT_TYPE_META } from "../../engine/projectTypes";
import { IconHelper } from "../IconHelper";
import { useLanguage } from "../../i18n/LanguageContext";
import { cn } from "../../lib/cn";

interface ProjectTypeStepProps {
  projectName: string;
  onChangeName: (name: string) => void;
  selectedType: ProjectType;
  onSelectType: (type: ProjectType) => void;
  onOpenTemplates: () => void;
}

export const ProjectTypeStep: React.FC<ProjectTypeStepProps> = ({
  projectName,
  onChangeName,
  selectedType,
  onSelectType,
  onOpenTemplates,
}) => {
  const { t } = useLanguage();

  return (
    <div className="rise-in">
      <h2 className="font-display text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-3xl">
        {t.projectType.heading}
      </h2>
      <p className="mt-2 max-w-xl text-sm text-[var(--text-secondary)]">
        {t.projectType.subheading}
      </p>

      <div className="mt-6 max-w-sm">
        <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">{t.projectType.nameLabel}</label>
        <input
          type="text"
          value={projectName}
          onChange={(e) => onChangeName(e.target.value)}
          placeholder={t.projectType.namePlaceholder}
          className="w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-2)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {PROJECT_TYPE_META.map((pt) => {
          const isSelected = selectedType === pt.type;
          const meta = t.projectTypes[pt.type];
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
                <h4 className="font-display text-sm font-semibold text-[var(--text-primary)]">{meta.label}</h4>
                <p className="mt-0.5 text-xs leading-relaxed text-[var(--text-tertiary)]">{meta.tagline}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex justify-end border-t border-[var(--border-subtle)] pt-6">
        <button
          type="button"
          onClick={onOpenTemplates}
          className="flex items-center justify-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--border-default)] px-3.5 py-2.5 text-xs font-medium text-[var(--text-secondary)] transition hover:border-accent-500/50 hover:text-[var(--text-primary)]"
        >
          <FolderKanban className="h-3.5 w-3.5" />
          <span>{t.projectType.startFromTemplate}</span>
        </button>
      </div>
    </div>
  );
};
