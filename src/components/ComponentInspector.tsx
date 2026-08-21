/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  X,
  ExternalLink,
  ArrowRight,
  ArrowLeft,
  Shield,
  Zap,
  Info,
  CheckCircle2,
  Trash2,
  Play,
  FileCode,
  Sliders,
  Share2,
  Copy,
  Terminal,
} from "lucide-react";
import { ArchitectureModel, ArchitectureNode, NodeExecutionResult } from "../types";
import { TECH_BY_ID } from "../engine/catalog";
import { IconHelper } from "./IconHelper";

interface ComponentInspectorProps {
  nodeId: string;
  model: ArchitectureModel;
  onClose: () => void;
  onRemoveTech?: (techId: string) => void;
  onSelectNode: (nodeId: string) => void;
  executionResult?: NodeExecutionResult;
  onTestNode?: (nodeId: string) => void;
}

export const ComponentInspector: React.FC<ComponentInspectorProps> = ({
  nodeId,
  model,
  onClose,
  onRemoveTech,
  onSelectNode,
  executionResult,
  onTestNode,
}) => {
  const [activeTab, setActiveTab] = useState<"params" | "data" | "connections" | "docs">("params");
  const [copiedJson, setCopiedJson] = useState(false);

  const node = model.nodes.find((n) => n.id === nodeId);
  if (!node) return null;

  const tech = node.techId ? TECH_BY_ID.get(node.techId) : null;

  // Inbound and outbound connections
  const inboundEdges = model.edges.filter((e) => e.target === node.id);
  const outboundEdges = model.edges.filter((e) => e.source === node.id);

  // Simulated node payload data (n8n JSON viewer format)
  const simulatedPayload = {
    nodeId: node.id,
    techName: node.title,
    category: node.category,
    tier: node.tier,
    zone: node.deploymentZone,
    status: executionResult?.status || "ready",
    latency: executionResult?.latencyMs ? `${executionResult.latencyMs}ms` : "32ms",
    endpoint: `https://${node.id.toLowerCase().replace(/[^a-z0-9]/g, "")}.internal/v1`,
    protocols: tech?.supportedProtocols || ["HTTPS / REST"],
    inboundConnectionsCount: inboundEdges.length,
    outboundConnectionsCount: outboundEdges.length,
    environmentConfig: {
      ENABLE_METRICS: "true",
      RETRY_COUNT: 3,
      TIMEOUT_MS: 5000,
      LOG_LEVEL: "info",
    },
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(simulatedPayload, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div
      id="component-inspector"
      className="flex h-full w-80 md:w-96 flex-col border-l border-[#2c323f] bg-[#181c24] text-neutral-200 shadow-2xl transition-all"
    >
      {/* Inspector Header (n8n Style) */}
      <div className="flex items-center justify-between border-b border-[#2c323f] bg-[#1d222c] p-3.5">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-xs"
            style={{
              backgroundColor: `${node.accentColor}25`,
              color: node.accentColor,
              border: `1px solid ${node.accentColor}40`,
            }}
          >
            <IconHelper name={node.iconName} size={18} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-white tracking-tight">{node.title}</h3>
              <span className="rounded bg-[#28303e] px-1.5 py-0.2 text-[9px] font-semibold uppercase text-neutral-400">
                {node.category}
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">{node.subtitle}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-neutral-400 hover:bg-[#28303e] hover:text-white transition"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* n8n Inspector Tabs */}
      <div className="flex items-center border-b border-[#2c323f] bg-[#161921] px-2 text-xs">
        <button
          onClick={() => setActiveTab("params")}
          className={`flex items-center gap-1.5 border-b-2 px-3 py-2 font-semibold transition ${
            activeTab === "params"
              ? "border-[#ff6d5a] text-white"
              : "border-transparent text-neutral-400 hover:text-neutral-200"
          }`}
        >
          <Sliders className="h-3.5 w-3.5" />
          <span>Parameters</span>
        </button>

        <button
          onClick={() => setActiveTab("data")}
          className={`flex items-center gap-1.5 border-b-2 px-3 py-2 font-semibold transition ${
            activeTab === "data"
              ? "border-[#ff6d5a] text-white"
              : "border-transparent text-neutral-400 hover:text-neutral-200"
          }`}
        >
          <Terminal className="h-3.5 w-3.5" />
          <span>Node Data (JSON)</span>
        </button>

        <button
          onClick={() => setActiveTab("connections")}
          className={`flex items-center gap-1.5 border-b-2 px-3 py-2 font-semibold transition ${
            activeTab === "connections"
              ? "border-[#ff6d5a] text-white"
              : "border-transparent text-neutral-400 hover:text-neutral-200"
          }`}
        >
          <Share2 className="h-3.5 w-3.5" />
          <span>Wires ({inboundEdges.length + outboundEdges.length})</span>
        </button>
      </div>

      {/* Content body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {activeTab === "params" && (
          <>
            {/* Quick Test Node Button */}
            {onTestNode && (
              <button
                onClick={() => onTestNode(node.id)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ff6d5a] to-[#ea4b34] py-2 text-xs font-bold text-white shadow-md shadow-[#ff6d5a]/20 hover:from-[#ff5540] hover:to-[#d83f2a] transition"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Test Step: {node.title}</span>
              </button>
            )}

            {/* Architectural Role */}
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Architectural Role
              </h4>
              <p className="mt-1 leading-relaxed text-neutral-300">
                {node.description}
              </p>
            </div>

            {/* Specifications Grid */}
            <div className="grid grid-cols-2 gap-2.5 rounded-xl border border-[#2d3442] bg-[#1e232d] p-3">
              <div>
                <span className="text-[10px] text-neutral-400">Tier</span>
                <p className="font-semibold uppercase text-white">
                  {node.tier}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400">Deployment Zone</span>
                <p className="font-semibold text-white truncate">
                  {node.deploymentZone}
                </p>
              </div>
              {tech && (
                <>
                  <div>
                    <span className="text-[10px] text-neutral-400">Pricing Model</span>
                    <p className="font-semibold text-white">
                      {tech.pricingModel}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400">Wire Protocol</span>
                    <p className="font-semibold text-[#ff8a7a]">
                      {tech.supportedProtocols[0]?.split(" ")[0] || "HTTPS"}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Best For Tags */}
            {tech && tech.bestFor && (
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  Optimal Workloads
                </h4>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {tech.bestFor.map((item, idx) => (
                    <span
                      key={idx}
                      className="rounded-lg bg-[#252c38] px-2 py-0.5 text-[10px] font-medium text-[#ff8a7a] border border-[#343e4f]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Data / Output JSON Tab */}
        {activeTab === "data" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-neutral-400">SIMULATED EXECUTION PAYLOAD</span>
              <button
                onClick={handleCopyJson}
                className="flex items-center gap-1 text-[11px] text-[#ff8a7a] hover:underline"
              >
                <Copy className="h-3 w-3" />
                <span>{copiedJson ? "Copied!" : "Copy JSON"}</span>
              </button>
            </div>
            <pre className="overflow-x-auto rounded-xl border border-[#2d3442] bg-[#12151b] p-3 font-mono text-[10.5px] leading-relaxed text-emerald-400">
              {JSON.stringify(simulatedPayload, null, 2)}
            </pre>
          </div>
        )}

        {/* Connections Tab */}
        {activeTab === "connections" && (
          <div className="space-y-4">
            {/* Inbound */}
            <div>
              <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                <ArrowLeft className="h-3 w-3 text-[#ff6d5a]" />
                <span>Inbound Inputs ({inboundEdges.length})</span>
              </div>
              {inboundEdges.length > 0 ? (
                <div className="mt-1.5 space-y-1.5">
                  {inboundEdges.map((edge) => {
                    const srcNode = model.nodes.find((n) => n.id === edge.source);
                    if (!srcNode) return null;

                    return (
                      <div
                        key={edge.id}
                        onClick={() => onSelectNode(srcNode.id)}
                        className="flex cursor-pointer items-center justify-between rounded-xl border border-[#2c3442] bg-[#202530] p-2.5 text-[11px] transition hover:border-[#ff6d5a]"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: srcNode.accentColor }}
                          />
                          <span className="font-semibold text-white">
                            {srcNode.title}
                          </span>
                        </div>
                        <span className="rounded bg-[#28303e] px-1.5 py-0.5 font-mono text-[9px] text-[#ff8a7a] border border-[#374254]">
                          {edge.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-1 text-neutral-400 italic">No incoming inputs.</p>
              )}
            </div>

            {/* Outbound */}
            <div>
              <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                <ArrowRight className="h-3 w-3 text-emerald-400" />
                <span>Outbound Outputs ({outboundEdges.length})</span>
              </div>
              {outboundEdges.length > 0 ? (
                <div className="mt-1.5 space-y-1.5">
                  {outboundEdges.map((edge) => {
                    const tgtNode = model.nodes.find((n) => n.id === edge.target);
                    if (!tgtNode) return null;

                    return (
                      <div
                        key={edge.id}
                        onClick={() => onSelectNode(tgtNode.id)}
                        className="flex cursor-pointer items-center justify-between rounded-xl border border-[#2c3442] bg-[#202530] p-2.5 text-[11px] transition hover:border-emerald-500"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: tgtNode.accentColor }}
                          />
                          <span className="font-semibold text-white">
                            {tgtNode.title}
                          </span>
                        </div>
                        <span className="rounded bg-[#28303e] px-1.5 py-0.5 font-mono text-[9px] text-emerald-400 border border-[#374254]">
                          {edge.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-1 text-neutral-400 italic">No outbound connections.</p>
              )}
            </div>
          </div>
        )}

        {/* Documentation Link */}
        {tech && (
          <div className="pt-2">
            <a
              href={tech.documentationUrl}
              target="_blank"
              rel="noreferrer"
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#303744] bg-[#222732] py-2 text-xs font-semibold text-white transition hover:bg-[#2a313e] hover:border-[#3e4758]"
            >
              <span>View Official Documentation</span>
              <ExternalLink className="h-3.5 w-3.5 text-neutral-400" />
            </a>
          </div>
        )}
      </div>

      {/* Bottom Remove button */}
      {tech && onRemoveTech && (
        <div className="border-t border-[#2c323f] p-3 bg-[#161921]">
          <button
            onClick={() => onRemoveTech(tech.id)}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-950/30 py-2 text-xs font-semibold text-rose-400 transition hover:bg-rose-950/60 hover:border-rose-500/60"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Remove Node from Workflow</span>
          </button>
        </div>
      )}
    </div>
  );
};
