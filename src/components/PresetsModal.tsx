/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { X, FolderKanban, Check, Sparkles, ArrowRight, Layers, Workflow } from "lucide-react";
import { StackPreset } from "../types";
import { STACK_PRESETS } from "../engine/presets";
import { TECH_BY_ID } from "../engine/catalog";
import { IconHelper } from "./IconHelper";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
      <div className="flex max-h-[85vh] w-full max-w-3xl flex-col rounded-2xl border border-[#2c323f] bg-[#181c24] text-neutral-200 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2c323f] bg-[#1d222c] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff6d5a] to-[#ea4b34] text-white shadow-md">
              <Workflow className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Battle-Tested Architecture Templates
              </h3>
              <p className="text-xs text-neutral-400">
                Instantly load proven, production-ready stack topologies and workflows.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-[#28303e] hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Preset Cards Grid */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-[#13161c]">
          {STACK_PRESETS.map((preset) => {
            const techs = preset.techIds
              .map((id) => TECH_BY_ID.get(id))
              .filter(Boolean);

            return (
              <div
                key={preset.id}
                className="flex flex-col justify-between rounded-2xl border border-[#2c3442] bg-[#1a1f29] p-4 transition-all hover:border-[#ff6d5a] hover:bg-[#202633] hover:shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-white">
                      {preset.name}
                    </h4>
                    <span className="rounded-full bg-[#ff6d5a]/20 border border-[#ff6d5a]/40 px-2 py-0.5 text-[10px] font-bold text-[#ff8a7a]">
                      {preset.badge}
                    </span>
                  </div>

                  <p className="mt-1.5 text-neutral-300 leading-relaxed">
                    {preset.description}
                  </p>

                  {/* Highlights */}
                  <div className="mt-3 space-y-1">
                    {preset.highlights.slice(0, 2).map((h, hIdx) => (
                      <div key={hIdx} className="flex items-start gap-1.5 text-[11px] text-neutral-400">
                        <Check className="h-3 w-3 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>

                  {/* Tech Icons Preview */}
                  <div className="mt-4 flex flex-wrap items-center gap-1.5">
                    {techs.slice(0, 7).map((t) => (
                      <div
                        key={t!.id}
                        className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#252c38] p-1 border border-[#343e4f]"
                        title={t!.name}
                      >
                        <IconHelper name={t!.iconName} size={13} color={t!.accentColor} />
                      </div>
                    ))}
                    {techs.length > 7 && (
                      <span className="text-[10px] font-bold text-neutral-400">
                        +{techs.length - 7} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Apply Preset Button */}
                <div className="mt-4 pt-3 border-t border-[#2c3442]">
                  <button
                    onClick={() => {
                      onApplyPreset(preset);
                      onClose();
                    }}
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#ff6d5a] to-[#ea4b34] py-2 font-bold text-white shadow-md shadow-[#ff6d5a]/20 transition hover:from-[#ff5540] hover:to-[#d83f2a]"
                  >
                    <span>Load Blueprint Workflow</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
