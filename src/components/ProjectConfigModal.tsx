/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ProjectConfig } from "../types";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";

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
  const [name, setName] = useState(config.name);
  const [description, setDescription] = useState(config.description);
  const [expectedTraffic, setExpectedTraffic] = useState(config.expectedTraffic);
  const [budgetConstraint, setBudgetConstraint] = useState(config.budgetConstraint);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...config,
      name: name.trim() || "Untitled Architecture",
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
      title="Project Profile"
      subtitle="Fine-tune the context used to validate your architecture."
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 p-4 text-xs sm:p-5">
        <div>
          <label className="block font-semibold text-[var(--text-secondary)]">Project Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Orbit"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block font-semibold text-[var(--text-secondary)]">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does this project do?"
            rows={3}
            className={`${inputClass} resize-none`}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block font-semibold text-[var(--text-secondary)]">Expected Traffic</label>
            <select
              value={expectedTraffic}
              onChange={(e) => setExpectedTraffic(e.target.value as any)}
              className={inputClass}
            >
              <option value="low">Low (&lt; 10k req/day)</option>
              <option value="medium">Medium (100k req/day)</option>
              <option value="high">High (1M+ req/day)</option>
              <option value="enterprise">Enterprise scale</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-[var(--text-secondary)]">Budget</label>
            <select
              value={budgetConstraint}
              onChange={(e) => setBudgetConstraint(e.target.value as any)}
              className={inputClass}
            >
              <option value="free_tier">Free tier / cost efficiency</option>
              <option value="moderate">Balanced production</option>
              <option value="scale_ready">Scale-ready priority</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2 border-t border-[var(--border-subtle)] pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
};
