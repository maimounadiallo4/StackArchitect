import React, { useState } from "react";
import { ProjectConfig } from "../types";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { useLanguage } from "../i18n/LanguageContext";

interface ProjectConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ProjectConfig;
  onSave: (newConfig: ProjectConfig) => void;
}

export const ProjectConfigModal: React.FC<ProjectConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
}) => {
  const { t } = useLanguage();
  const [name, setName] = useState(config.name);
  const [description, setDescription] = useState(config.description);
  const [expectedTraffic, setExpectedTraffic] = useState(config.expectedTraffic);
  const [budgetConstraint, setBudgetConstraint] = useState(config.budgetConstraint);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...config,
      name: name.trim() || config.name,
      description: description.trim(),
      expectedTraffic,
      budgetConstraint,
    });
    onClose();
  };

  const inputClass =
    "mt-1 w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-0)] px-3.5 py-2 text-xs text-[var(--text-primary)] focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      icon="SlidersHorizontal"
      title={t.projectConfigModal.title}
      subtitle={t.projectConfigModal.subtitle}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 p-4 text-xs sm:p-5">
        <div>
          <label htmlFor="project-config-name" className="block font-semibold text-[var(--text-secondary)]">{t.projectConfigModal.nameLabel}</label>
          <input
            id="project-config-name"
            name="project-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.projectConfigModal.namePlaceholder}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="project-config-description" className="block font-semibold text-[var(--text-secondary)]">{t.projectConfigModal.descriptionLabel}</label>
          <textarea
            id="project-config-description"
            name="project-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t.projectConfigModal.descriptionPlaceholder}
            rows={3}
            className={`${inputClass} resize-none`}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="project-config-traffic" className="block font-semibold text-[var(--text-secondary)]">{t.projectConfigModal.trafficLabel}</label>
            <select
              id="project-config-traffic"
              name="project-traffic"
              value={expectedTraffic}
              onChange={(e) => setExpectedTraffic(e.target.value as any)}
              className={inputClass}
            >
              <option value="low">{t.projectConfigModal.traffic.low}</option>
              <option value="medium">{t.projectConfigModal.traffic.medium}</option>
              <option value="high">{t.projectConfigModal.traffic.high}</option>
              <option value="enterprise">{t.projectConfigModal.traffic.enterprise}</option>
            </select>
          </div>

          <div>
            <label htmlFor="project-config-budget" className="block font-semibold text-[var(--text-secondary)]">{t.projectConfigModal.budgetLabel}</label>
            <select
              id="project-config-budget"
              name="project-budget"
              value={budgetConstraint}
              onChange={(e) => setBudgetConstraint(e.target.value as any)}
              className={inputClass}
            >
              <option value="free_tier">{t.projectConfigModal.budget.free_tier}</option>
              <option value="moderate">{t.projectConfigModal.budget.moderate}</option>
              <option value="scale_ready">{t.projectConfigModal.budget.scale_ready}</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2 border-t border-[var(--border-subtle)] pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            {t.projectConfigModal.cancel}
          </Button>
          <Button type="submit" variant="primary">
            {t.projectConfigModal.save}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
