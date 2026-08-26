import React from "react";
import { ArchitectureModel } from "../types";
import { Translations } from "../i18n/translations";
import { cn } from "../lib/cn";

interface DiagramListViewProps {
  model: ArchitectureModel;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
  t: Translations;
}

export const DiagramListView: React.FC<DiagramListViewProps> = ({ model, selectedNodeId, onSelectNode, t }) => {
  const edgeCountByNode = new Map<string, number>();
  model.edges.forEach((edge) => {
    edgeCountByNode.set(edge.source, (edgeCountByNode.get(edge.source) ?? 0) + 1);
    edgeCountByNode.set(edge.target, (edgeCountByNode.get(edge.target) ?? 0) + 1);
  });

  return (
    <div className="h-full overflow-auto p-4">
      <table className="w-full border-collapse text-left text-xs">
        <thead>
          <tr className="border-b border-[var(--border-default)] text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">
            <th scope="col" className="py-2 pr-3 font-semibold">{t.diagram.listViewColumns.component}</th>
            <th scope="col" className="py-2 pr-3 font-semibold">{t.diagram.listViewColumns.category}</th>
            <th scope="col" className="py-2 pr-3 font-semibold">{t.diagram.listViewColumns.deploymentZone}</th>
            <th scope="col" className="py-2 pr-3 font-semibold">{t.diagram.listViewColumns.connections}</th>
          </tr>
        </thead>
        <tbody>
          {model.nodes.map((node) => {
            const categoryLabel = t.categories[node.category as keyof typeof t.categories]?.label ?? node.category;
            const isSelected = node.id === selectedNodeId;
            return (
              <tr
                key={node.id}
                onClick={() => onSelectNode(node.id)}
                aria-selected={isSelected}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectNode(node.id);
                  }
                }}
                className={cn(
                  "cursor-pointer border-b border-[var(--border-subtle)] transition hover:bg-[var(--surface-2)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-500",
                  isSelected && "bg-[var(--surface-2)]"
                )}
              >
                <td className="flex items-center gap-2 py-2.5 pr-3">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: node.accentColor }} />
                  <span className="font-semibold text-[var(--text-primary)]">{node.title}</span>
                </td>
                <td className="py-2.5 pr-3 text-[var(--text-secondary)]">{categoryLabel}</td>
                <td className="py-2.5 pr-3 text-[var(--text-secondary)]">{node.deploymentZone}</td>
                <td className="py-2.5 pr-3 text-[var(--text-secondary)]">{edgeCountByNode.get(node.id) ?? 0}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
