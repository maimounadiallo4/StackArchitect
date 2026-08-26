import React, { useState } from "react";
import { X, ExternalLink, ArrowRight, ArrowLeft, Trash2, Share2, Info } from "lucide-react";
import { ArchitectureModel } from "../types";
import { TECH_BY_ID } from "../engine/catalog";
import { IconTile } from "./ui/IconTile";
import { Tabs } from "./ui/Tabs";
import { Button } from "./ui/Button";
import { useLanguage } from "../i18n/LanguageContext";

interface ComponentInspectorProps {
  nodeId: string;
  model: ArchitectureModel;
  onClose: () => void;
  onRemoveTech?: (techId: string) => void;
  onSelectNode: (nodeId: string) => void;
}

export const ComponentInspector: React.FC<ComponentInspectorProps> = ({
  nodeId,
  model,
  onClose,
  onRemoveTech,
  onSelectNode,
}) => {
  const { t, locale } = useLanguage();
  const [activeTab, setActiveTab] = useState<"about" | "connections">("about");

  const node = model.nodes.find((n) => n.id === nodeId);
  if (!node) return null;

  const tech = node.techId ? TECH_BY_ID.get(node.techId) : null;
  const inboundEdges = model.edges.filter((e) => e.target === node.id);
  const outboundEdges = model.edges.filter((e) => e.source === node.id);
  const categoryLabel = t.categories[node.category as keyof typeof t.categories]?.label ?? node.category;
  const localizedDescription = tech ? tech.description[locale] : t.actorDescriptions[node.id] ?? node.description;

  return (
    <div
      id="component-inspector"
      className="flex h-full w-full flex-col border-l border-[var(--border-subtle)] bg-[var(--surface-1)] text-[var(--text-primary)] lg:w-80 xl:w-96"
    >
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] p-3.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <IconTile techId={node.techId} icon={node.iconName} accentColor={node.accentColor} size="lg" />
          <div className="min-w-0">
            <h2 className="truncate font-display text-sm font-semibold text-[var(--text-primary)] tracking-tight">{node.title}</h2>
            <p className="truncate text-[11px] text-[var(--text-tertiary)]">{tech ? tech.tagline[locale] : node.subtitle}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          aria-label={t.inspector.closeLabel}
          className="shrink-0 rounded-[var(--radius-sm)] p-1.5 text-[var(--text-tertiary)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)] transition"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <Tabs
        activeId={activeTab}
        onChange={(id) => setActiveTab(id as typeof activeTab)}
        items={[
          { id: "about", label: t.inspector.about, icon: <Info className="h-3.5 w-3.5" /> },
          { id: "connections", label: `${t.inspector.connections} (${inboundEdges.length + outboundEdges.length})`, icon: <Share2 className="h-3.5 w-3.5" /> },
        ]}
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {activeTab === "about" && (
          <>
            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">{t.inspector.role}</h3>
              <p className="mt-1 leading-relaxed text-[var(--text-secondary)]">{localizedDescription}</p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-2)] p-3">
              <div>
                <span className="text-[10px] text-[var(--text-tertiary)]">{t.inspector.category}</span>
                <p className="font-semibold text-[var(--text-primary)]">{categoryLabel}</p>
              </div>
              {tech && (
                <div>
                  <span className="text-[10px] text-[var(--text-tertiary)]">{t.inspector.pricing}</span>
                  <p className="font-semibold text-[var(--text-primary)]">{t.pricingModel[tech.pricingModel] ?? tech.pricingModel}</p>
                </div>
              )}
            </div>

            {tech && tech.bestFor && (
              <div>
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">{t.inspector.bestFor}</h3>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {tech.bestFor.map((item, idx) => (
                    <span
                      key={idx}
                      className="rounded-[var(--radius-sm)] bg-[var(--surface-2)] px-2 py-0.5 text-[10px] font-medium text-accent-400 border border-[var(--border-subtle)]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {tech && (
              <a
                href={tech.documentationUrl}
                target="_blank"
                rel="noreferrer"
                className="flex w-full items-center justify-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-2)] py-2 text-xs font-semibold text-[var(--text-primary)] transition hover:bg-[var(--surface-3)]"
              >
                <span>{t.inspector.viewDocs}</span>
                <ExternalLink className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
              </a>
            )}
          </>
        )}

        {activeTab === "connections" && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                <ArrowLeft className="h-3 w-3 text-accent-500" />
                <span>{t.inspector.inbound} ({inboundEdges.length})</span>
              </div>
              {inboundEdges.length > 0 ? (
                <div className="mt-1.5 space-y-1.5">
                  {inboundEdges.map((edge) => {
                    const srcNode = model.nodes.find((n) => n.id === edge.source);
                    if (!srcNode) return null;
                    return (
                      <button
                        key={edge.id}
                        type="button"
                        onClick={() => onSelectNode(srcNode.id)}
                        className="flex w-full items-center gap-2 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-2)] p-2.5 text-left text-[11px] transition hover:border-accent-500"
                      >
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: srcNode.accentColor }} />
                        <span className="font-semibold text-[var(--text-primary)]">{srcNode.title}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-1 text-[var(--text-tertiary)] italic">{t.inspector.noInbound}</p>
              )}
            </div>

            <div>
              <div className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                <ArrowRight className="h-3 w-3 text-success-400" />
                <span>{t.inspector.outbound} ({outboundEdges.length})</span>
              </div>
              {outboundEdges.length > 0 ? (
                <div className="mt-1.5 space-y-1.5">
                  {outboundEdges.map((edge) => {
                    const tgtNode = model.nodes.find((n) => n.id === edge.target);
                    if (!tgtNode) return null;
                    return (
                      <button
                        key={edge.id}
                        type="button"
                        onClick={() => onSelectNode(tgtNode.id)}
                        className="flex w-full items-center gap-2 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-2)] p-2.5 text-left text-[11px] transition hover:border-success-500"
                      >
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: tgtNode.accentColor }} />
                        <span className="font-semibold text-[var(--text-primary)]">{tgtNode.title}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-1 text-[var(--text-tertiary)] italic">{t.inspector.noOutbound}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {tech && onRemoveTech && (
        <div className="border-t border-[var(--border-subtle)] p-3">
          <Button variant="danger" onClick={() => onRemoveTech(tech.id)} className="w-full py-2">
            <Trash2 className="h-3.5 w-3.5" />
            <span>{t.inspector.removeFromStack}</span>
          </Button>
        </div>
      )}
    </div>
  );
};
