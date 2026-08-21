/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Check, ArrowRight } from "lucide-react";
import { StackPreset } from "../types";
import { STACK_PRESETS } from "../engine/presets";
import { TECH_BY_ID } from "../engine/catalog";
import { Modal } from "./ui/Modal";
import { Panel } from "./ui/Panel";
import { Button } from "./ui/Button";
import { IconTile } from "./ui/IconTile";

interface PresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyPreset: (preset: StackPreset) => void;
}

export const PresetsModal: React.FC<PresetsModalProps> = ({
  isOpen,
  onClose,
  onApplyPreset,
}) => {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      icon="LayoutTemplate"
      title="Battle-Tested Architecture Templates"
      subtitle="Instantly load proven, production-ready stack topologies."
      maxWidth="max-w-3xl"
      bodyClassName="bg-[var(--surface-0)]"
    >
      <div className="grid grid-cols-1 gap-4 p-4 text-xs sm:p-5 md:grid-cols-2">
        {STACK_PRESETS.map((preset) => {
          const techs = preset.techIds
            .map((id) => TECH_BY_ID.get(id))
            .filter(Boolean);

          return (
            <Panel key={preset.id} interactive className="flex flex-col justify-between p-4">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                    {preset.name}
                  </h4>
                  <span className="rounded-full bg-accent-500/10 border border-accent-500/30 px-2 py-0.5 text-[10px] font-semibold text-accent-400">
                    {preset.badge}
                  </span>
                </div>

                <p className="mt-1.5 text-[var(--text-secondary)] leading-relaxed">
                  {preset.description}
                </p>

                <div className="mt-3 space-y-1">
                  {preset.highlights.slice(0, 2).map((h, hIdx) => (
                    <div key={hIdx} className="flex items-start gap-1.5 text-[11px] text-[var(--text-tertiary)]">
                      <Check className="h-3 w-3 text-success-400 shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-1.5">
                  {techs.slice(0, 7).map((t) => (
                    <div key={t!.id} title={t!.name}>
                      <IconTile techId={t!.id} icon={t!.iconName} accentColor={t!.accentColor} size="sm" />
                    </div>
                  ))}
                  {techs.length > 7 && (
                    <span className="text-[10px] font-semibold text-[var(--text-tertiary)]">
                      +{techs.length - 7} more
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 border-t border-[var(--border-subtle)] pt-3">
                <Button
                  variant="primary"
                  onClick={() => {
                    onApplyPreset(preset);
                    onClose();
                  }}
                  className="w-full py-2"
                >
                  <span>Load Blueprint</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Panel>
          );
        })}
      </div>
    </Modal>
  );
};
