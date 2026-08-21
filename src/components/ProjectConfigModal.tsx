/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { X, SlidersHorizontal, Check, Globe, Smartphone, Server, ShoppingCart, Bot, Zap, Network, Workflow } from "lucide-react";
import { ProjectConfig, ProjectType } from "../types";

interface ProjectConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ProjectConfig;
  onSave: (newConfig: ProjectConfig) => void;
}

const PROJECT_TYPES: { type: ProjectType; label: string; icon: React.ReactNode; desc: string }[] = [
  { type: "saas", label: "SaaS / B2B Web App", icon: <Globe className="h-4 w-4 text-[#ff6d5a]" />, desc: "Multi-tenant subscriptions, workspaces, and team RBAC." },
  { type: "ai_app", label: "AI / LLM Application", icon: <Bot className="h-4 w-4 text-purple-400" />, desc: "RAG embeddings, vector retrieval, and model inference." },
  { type: "mobile", label: "Mobile App (iOS & Android)", icon: <Smartphone className="h-4 w-4 text-cyan-400" />, desc: "Native/hybrid clients with push notifications and sync." },
  { type: "ecommerce", label: "E-Commerce Platform", icon: <ShoppingCart className="h-4 w-4 text-emerald-400" />, desc: "High checkout throughput, inventory, and instant search." },
  { type: "realtime", label: "Real-Time / Collaborative", icon: <Zap className="h-4 w-4 text-amber-400" />, desc: "Low-latency WebSockets, state sync, and live feeds." },
  { type: "microservices", label: "Microservices Architecture", icon: <Network className="h-4 w-4 text-rose-400" />, desc: "Decoupled domain services with Kafka event bus." },
  { type: "api", label: "API / Backend Service", icon: <Server className="h-4 w-4 text-indigo-400" />, desc: "REST / GraphQL endpoints with rate limiting & caching." },
  { type: "web", label: "Web Application", icon: <Globe className="h-4 w-4 text-sky-400" />, desc: "Content-driven or standard web portal." },
];

export const ProjectConfigModal: React.FC<ProjectConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
}) => {
  const [name, setName] = useState(config.name);
  const [type, setType] = useState<ProjectType>(config.type);
  const [description, setDescription] = useState(config.description);
  const [expectedTraffic, setExpectedTraffic] = useState(config.expectedTraffic);
  const [budgetConstraint, setBudgetConstraint] = useState(config.budgetConstraint);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: name.trim() || "Untitled Architecture",
      type,
      description: description.trim(),
      expectedTraffic,
      budgetConstraint,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
      <div className="w-full max-w-xl rounded-2xl border border-[#2c323f] bg-[#181c24] text-neutral-200 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#2c323f] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ff6d5a]/20 border border-[#ff6d5a]/40 text-[#ff8a7a]">
              <SlidersHorizontal className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Project Profile & Topology Scope
              </h3>
              <p className="text-xs text-neutral-400">
                Define functional requirements for accurate architecture modeling.
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

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Project Name */}
          <div>
            <label className="block font-bold text-neutral-300">
              Project Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. NextGen Logistics Platform"
              className="mt-1 w-full rounded-xl border border-[#343d4d] bg-[#13161c] px-3.5 py-2 text-xs text-white focus:border-[#ff6d5a] focus:bg-[#1a1f29] focus:outline-none"
            />
          </div>

          {/* Project Type */}
          <div>
            <label className="block font-bold text-neutral-300">
              Application Type
            </label>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              {PROJECT_TYPES.map((pt) => {
                const isSelected = type === pt.type;
                return (
                  <button
                    key={pt.type}
                    type="button"
                    onClick={() => setType(pt.type)}
                    className={`flex items-start gap-2.5 rounded-xl border p-2.5 text-left transition ${
                      isSelected
                        ? "border-[#ff6d5a] bg-[#ff6d5a]/10 ring-1 ring-[#ff6d5a]"
                        : "border-[#2c3442] bg-[#1c212c] hover:bg-[#242b38]"
                    }`}
                  >
                    <div className="mt-0.5">{pt.icon}</div>
                    <div className="flex-1 overflow-hidden">
                      <div className="font-semibold text-white">
                        {pt.label}
                      </div>
                      <div className="line-clamp-1 text-[10px] text-neutral-400">
                        {pt.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Traffic & Budget Controls */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-neutral-300">
                Expected Traffic Tier
              </label>
              <select
                value={expectedTraffic}
                onChange={(e) => setExpectedTraffic(e.target.value as any)}
                className="mt-1 w-full rounded-xl border border-[#343d4d] bg-[#13161c] px-3 py-2 text-xs text-white focus:border-[#ff6d5a] focus:bg-[#1a1f29] focus:outline-none"
              >
                <option value="mvp">MVP / Low Concurrency (&lt; 10k req/day)</option>
                <option value="moderate">Moderate Concurrency (100k req/day)</option>
                <option value="high">High Concurrency (1M+ req/day)</option>
                <option value="enterprise">Enterprise Ultra-Scale (Global Active-Active)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-neutral-300">
                Budget & Complexity
              </label>
              <select
                value={budgetConstraint}
                onChange={(e) => setBudgetConstraint(e.target.value as any)}
                className="mt-1 w-full rounded-xl border border-[#343d4d] bg-[#13161c] px-3 py-2 text-xs text-white focus:border-[#ff6d5a] focus:bg-[#1a1f29] focus:outline-none"
              >
                <option value="free_tier">Free Tier / Maximum Cost Efficiency</option>
                <option value="balanced">Balanced Production Tier</option>
                <option value="enterprise">Enterprise Scalability Priority</option>
              </select>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex items-center justify-end gap-2 border-t border-[#2c323f] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-neutral-400 hover:bg-[#28303e] hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-[#ff6d5a] to-[#ea4b34] px-4 py-2 text-xs font-bold text-white shadow-md shadow-[#ff6d5a]/25 hover:from-[#ff5540] hover:to-[#d83f2a] transition"
            >
              Update Project Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
