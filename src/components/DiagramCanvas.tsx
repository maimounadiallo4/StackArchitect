import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { ZoomIn, ZoomOut, Maximize2, LayoutGrid, List, Info } from "lucide-react";
import { ArchitectureModel } from "../types";
import { IconTile } from "./ui/IconTile";
import { TECH_BY_ID } from "../engine/catalog";
import { useLanguage } from "../i18n/LanguageContext";
import { formatTemplate } from "../i18n/translations";
import { DiagramLegend } from "./DiagramLegend";
import { DiagramListView } from "./DiagramListView";
import { cn } from "../lib/cn";

interface DiagramCanvasProps {
  model: ArchitectureModel;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
}

const MIN_SCALE = 0.4;
const MAX_SCALE = 2;
const DEFAULT_SCALE = 0.9;
const DEFAULT_PAN = { x: 60, y: 50 };

export const DiagramCanvas: React.FC<DiagramCanvasProps> = ({ model, selectedNodeId, onSelectNode }) => {
  const { t, locale } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(DEFAULT_SCALE);
  const [pan, setPan] = useState(DEFAULT_PAN);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const activeFocusId = selectedNodeId || hoveredNodeId;

  const connectedNodeIds = useMemo(() => {
    if (!activeFocusId) return new Set<string>();
    const ids = new Set<string>([activeFocusId]);
    model.edges.forEach((e) => {
      if (e.source === activeFocusId) ids.add(e.target);
      if (e.target === activeFocusId) ids.add(e.source);
    });
    return ids;
  }, [activeFocusId, model.edges]);

  const nodeMap = useMemo(() => new Map(model.nodes.map((n) => [n.id, n])), [model.nodes]);

  const actorCount = useMemo(() => model.nodes.filter((n) => n.category === "actor").length, [model.nodes]);
  const technicalCount = model.nodes.length - actorCount;
  const selectedNode = selectedNodeId ? nodeMap.get(selectedNodeId) : null;

  const [viewMode, setViewMode] = useState<"diagram" | "list">("diagram");
  const [showLegend, setShowLegend] = useState(false);

  const startPan = useCallback((clientX: number, clientY: number) => {
    setIsPanning(true);
    setPanStart({ x: clientX - pan.x, y: clientY - pan.y });
  }, [pan]);

  const movePan = useCallback((clientX: number, clientY: number) => {
    setPan({ x: clientX - panStart.x, y: clientY - panStart.y });
  }, [panStart]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".diagram-node-card")) return;
    startPan(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) movePan(e.clientX, e.clientY);
  };

  const handleMouseUp = () => setIsPanning(false);

  const handleZoom = useCallback((delta: number) => {
    setScale((prev) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev + delta)));
  }, []);

  const handleResetView = () => {
    setScale(DEFAULT_SCALE);
    setPan(DEFAULT_PAN);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      handleZoom(e.deltaY > 0 ? -0.1 : 0.1);
    } else {
      setPan((prev) => ({ x: prev.x - e.deltaX, y: prev.y - e.deltaY }));
    }
  };

  // --- Touch: single-finger pan, two-finger pinch zoom ---
  const liveRef = useRef({ pan, scale });
  useEffect(() => {
    liveRef.current = { pan, scale };
  });

  const panGestureRef = useRef<{ active: boolean; startX: number; startY: number }>({ active: false, startX: 0, startY: 0 });
  const pinchRef = useRef<{
    active: boolean;
    initialDistance: number;
    initialScale: number;
    initialPan: { x: number; y: number };
    midpoint: { x: number; y: number };
  }>({ active: false, initialDistance: 0, initialScale: 1, initialPan: { x: 0, y: 0 }, midpoint: { x: 0, y: 0 } });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const distanceBetween = (t0: Touch, t1: Touch) => Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
    const midpointOf = (t0: Touch, t1: Touch) => ({ x: (t0.clientX + t1.clientX) / 2, y: (t0.clientY + t1.clientY) / 2 });

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        pinchRef.current = {
          active: true,
          initialDistance: distanceBetween(e.touches[0], e.touches[1]),
          initialScale: liveRef.current.scale,
          initialPan: { ...liveRef.current.pan },
          midpoint: midpointOf(e.touches[0], e.touches[1]),
        };
        panGestureRef.current.active = false;
        return;
      }
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      panGestureRef.current = {
        active: true,
        startX: touch.clientX - liveRef.current.pan.x,
        startY: touch.clientY - liveRef.current.pan.y,
      };
    };

    const onTouchMove = (e: TouchEvent) => {
      if (pinchRef.current.active && e.touches.length === 2) {
        e.preventDefault();
        const { initialDistance, initialScale, initialPan, midpoint } = pinchRef.current;
        const newDistance = distanceBetween(e.touches[0], e.touches[1]);
        const ratio = initialDistance > 0 ? newDistance / initialDistance : 1;
        const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, initialScale * ratio));
        const scaleRatio = newScale / initialScale;
        setScale(newScale);
        setPan({
          x: midpoint.x - (midpoint.x - initialPan.x) * scaleRatio,
          y: midpoint.y - (midpoint.y - initialPan.y) * scaleRatio,
        });
        return;
      }
      if (panGestureRef.current.active && e.touches.length === 1) {
        e.preventDefault();
        const touch = e.touches[0];
        setPan({ x: touch.clientX - panGestureRef.current.startX, y: touch.clientY - panGestureRef.current.startY });
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) pinchRef.current.active = false;
      if (e.touches.length === 0) panGestureRef.current.active = false;
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    el.addEventListener("touchcancel", onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
    };
  }, []);

  if (model.nodes.length === 0) {
    return (
      <div className="canvas-grid relative flex flex-1 items-center justify-center overflow-hidden">
        <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] bg-[var(--surface-1)]/80 px-6 py-5 text-center text-sm text-[var(--text-tertiary)]">
          {t.diagram.empty}
        </div>
      </div>
    );
  }

  const viewToggle = (
    <div className="absolute left-3 top-3 z-20 flex items-center gap-1 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-1)]/95 p-1 shadow-[var(--elevation-3)] backdrop-blur-md sm:left-4 sm:top-4">
      <button
        onClick={() => setViewMode("diagram")}
        aria-pressed={viewMode === "diagram"}
        title={t.diagram.diagramView}
        aria-label={t.diagram.diagramView}
        className={cn(
          "rounded-[var(--radius-sm)] p-1.5 transition",
          viewMode === "diagram" ? "bg-accent-500 text-[var(--text-on-accent)]" : "text-[var(--text-tertiary)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]"
        )}
      >
        <LayoutGrid className="h-4 w-4" />
      </button>
      <button
        onClick={() => setViewMode("list")}
        aria-pressed={viewMode === "list"}
        title={t.diagram.listView}
        aria-label={t.diagram.listView}
        className={cn(
          "rounded-[var(--radius-sm)] p-1.5 transition",
          viewMode === "list" ? "bg-accent-500 text-[var(--text-on-accent)]" : "text-[var(--text-tertiary)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]"
        )}
      >
        <List className="h-4 w-4" />
      </button>
      {viewMode === "diagram" && (
        <button
          onClick={() => setShowLegend((v) => !v)}
          aria-pressed={showLegend}
          title={t.diagram.legend}
          aria-label={t.diagram.legend}
          className={cn(
            "rounded-[var(--radius-sm)] p-1.5 transition",
            showLegend ? "bg-accent-500 text-[var(--text-on-accent)]" : "text-[var(--text-tertiary)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]"
          )}
        >
          <Info className="h-4 w-4" />
        </button>
      )}
    </div>
  );

  if (viewMode === "list") {
    return (
      <div className="relative flex flex-1 flex-col overflow-hidden">
        {viewToggle}
        <div className="flex-1 overflow-hidden pt-14">
          <DiagramListView model={model} selectedNodeId={selectedNodeId} onSelectNode={onSelectNode} t={t} />
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      id="diagram-canvas-container"
      className="canvas-grid relative flex-1 overflow-hidden select-none cursor-grab active:cursor-grabbing"
      style={{ touchAction: "none" }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {viewToggle}
      {showLegend && <DiagramLegend zones={model.zones} lanes={t.lanes} />}
      {/* Floating zoom controls */}
      <div className="absolute right-3 top-3 z-20 flex items-center gap-1 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-1)]/95 p-1 shadow-[var(--elevation-3)] backdrop-blur-md sm:right-4 sm:top-4">
        <button
          onClick={() => handleZoom(0.15)}
          className="rounded-[var(--radius-sm)] p-1.5 text-[var(--text-tertiary)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)] transition"
          title={t.diagram.zoomIn}
          aria-label={t.diagram.zoomIn}
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          onClick={() => handleZoom(-0.15)}
          className="rounded-[var(--radius-sm)] p-1.5 text-[var(--text-tertiary)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)] transition"
          title={t.diagram.zoomOut}
          aria-label={t.diagram.zoomOut}
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          onClick={handleResetView}
          className="rounded-[var(--radius-sm)] p-1.5 text-[var(--text-tertiary)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)] transition"
          title={t.diagram.resetView}
          aria-label={t.diagram.resetView}
        >
          <Maximize2 className="h-4 w-4" />
        </button>
        <span className="hidden px-2 text-[11px] font-mono font-medium text-[var(--text-tertiary)] sm:inline">
          {Math.round(scale * 100)}%
        </span>
      </div>

      <div
        className="absolute inset-0 origin-top-left transition-transform duration-75"
        style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`, width: "2600px", height: "1600px" }}
      >
        <svg className="absolute inset-0 pointer-events-none" width="2600" height="1600" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <marker id="diagram-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="var(--border-strong)" />
            </marker>
            <marker id="diagram-arrow-highlight" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="var(--color-accent-500)" />
            </marker>
          </defs>

          {/* Layer lanes — frame each architectural tier */}
          {model.zones.map((zone) => {
            const label = zone.laneKey ? t.lanes[zone.laneKey] : zone.title;
            const labelWidth = Math.min(zone.width - 16, Math.max(70, label.length * 6.5 + 28));
            return (
              <g key={zone.id}>
                <rect
                  x={zone.x}
                  y={zone.y}
                  width={zone.width}
                  height={zone.height}
                  rx="18"
                  ry="18"
                  fill={`${zone.color}0c`}
                  stroke={`${zone.color}45`}
                  strokeWidth="1.5"
                  strokeDasharray="7 6"
                />
                <rect
                  x={zone.x + 12}
                  y={zone.y + 10}
                  width={labelWidth}
                  height="22"
                  rx="7"
                  ry="7"
                  fill="var(--surface-1)"
                  stroke={`${zone.color}55`}
                  strokeWidth="1"
                />
                <text
                  x={zone.x + 12 + labelWidth / 2}
                  y={zone.y + 25}
                  fill={zone.color}
                  fontSize="10.5"
                  fontWeight="700"
                  textAnchor="middle"
                  fontFamily="system-ui, sans-serif"
                  style={{ letterSpacing: "0.03em", textTransform: "uppercase" }}
                >
                  {label}
                </text>
              </g>
            );
          })}

          {model.edges.map((edge) => {
            const srcNode = nodeMap.get(edge.source);
            const tgtNode = nodeMap.get(edge.target);
            if (!srcNode || !tgtNode) return null;

            const isLeftToRight = tgtNode.x > srcNode.x;
            const x1 = isLeftToRight ? srcNode.x + srcNode.width : srcNode.x;
            const y1 = srcNode.y + srcNode.height / 2;
            const x2 = isLeftToRight ? tgtNode.x : tgtNode.x + tgtNode.width;
            const y2 = tgtNode.y + tgtNode.height / 2;

            const curvature = Math.max(Math.abs(x2 - x1) * 0.45, 40);
            const cx1 = isLeftToRight ? x1 + curvature : x1 - curvature;
            const cx2 = isLeftToRight ? x2 - curvature : x2 + curvature;

            const pathD = `M ${x1} ${y1} C ${cx1} ${y1}, ${cx2} ${y2}, ${x2} ${y2}`;
            const isHighlighted = activeFocusId != null && (edge.source === activeFocusId || edge.target === activeFocusId);
            const isDimmed = activeFocusId != null && !isHighlighted;

            return (
              <g key={edge.id} className={cn("transition-opacity duration-200", isDimmed ? "opacity-15" : "opacity-100")}>
                <path
                  d={pathD}
                  fill="none"
                  stroke={isHighlighted ? "var(--color-accent-500)" : "var(--border-strong)"}
                  strokeWidth={isHighlighted ? 2.25 : 1.5}
                  strokeDasharray="5 5"
                  className="flow-active"
                  markerEnd={isHighlighted ? "url(#diagram-arrow-highlight)" : "url(#diagram-arrow)"}
                />
              </g>
            );
          })}
        </svg>

        {model.nodes.map((node) => {
          const isSelected = selectedNodeId === node.id;
          const isHovered = hoveredNodeId === node.id;
          const isConnected = connectedNodeIds.has(node.id);
          const isDimmed = activeFocusId != null && !isConnected && !isSelected;

          const nodeTech = node.techId ? TECH_BY_ID.get(node.techId) : null;
          const nodeSubtitle = nodeTech ? nodeTech.tagline[locale] : node.subtitle;

          return (
            <div
              key={node.id}
              id={`diagram-node-${node.id}`}
              data-node-id={node.id}
              role="button"
              tabIndex={0}
              aria-pressed={isSelected}
              aria-label={`${node.title} — ${nodeSubtitle}`}
              onMouseEnter={() => setHoveredNodeId(node.id)}
              onMouseLeave={() => setHoveredNodeId(null)}
              onClick={() => onSelectNode(node.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectNode(node.id);
                }
              }}
              style={{ left: `${node.x}px`, top: `${node.y}px`, width: `${node.width}px`, height: `${node.height}px` }}
              className={cn(
                "diagram-node-card group absolute flex flex-col justify-center gap-2.5 rounded-[var(--radius-lg)] border p-3.5 shadow-[var(--elevation-1)] transition-all cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500",
                isDimmed
                  ? "opacity-25 scale-95"
                  : isSelected
                  ? "border-accent-500 bg-[var(--surface-2)] ring-2 ring-accent-500/50 shadow-[var(--elevation-3)] scale-[1.02]"
                  : isHovered
                  ? "border-[var(--border-strong)] bg-[var(--surface-2)] shadow-[var(--elevation-2)] -translate-y-0.5"
                  : "border-[var(--border-default)] bg-[var(--surface-2)]"
              )}
            >
              <div className="flex items-center gap-2.5">
                <IconTile techId={node.techId} icon={node.iconName} accentColor={node.accentColor} size="md" />
                <div className="min-w-0">
                  <h3 className="truncate text-xs font-semibold text-[var(--text-primary)] tracking-tight">{node.title}</h3>
                  <p className="truncate text-[10px] text-[var(--text-tertiary)]">{nodeSubtitle}</p>
                </div>
              </div>
              <span className="w-fit rounded-[var(--radius-sm)] bg-[var(--surface-3)] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                {t.categories[node.category as keyof typeof t.categories]?.label.split(" ")[0] ?? node.category}
              </span>
            </div>
          );
        })}
      </div>

      <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2.5 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-1)]/95 px-3.5 py-2 text-xs text-[var(--text-secondary)] shadow-[var(--elevation-3)] backdrop-blur-md sm:bottom-4 sm:left-4">
        <span className="font-semibold text-[var(--text-primary)]">{technicalCount} {t.diagram.components}</span>
        {actorCount > 0 && (
          <>
            <span className="text-[var(--text-tertiary)]">+</span>
            <span className="font-semibold text-[var(--text-primary)]">
              {actorCount} {actorCount === 1 ? t.diagram.actorSingular : t.diagram.actorPlural}
            </span>
          </>
        )}
        <span className="text-[var(--text-tertiary)]">·</span>
        <span className="font-medium text-accent-400">{t.complexity[model.stats.estimatedComplexity] ?? model.stats.estimatedComplexity}</span>
      </div>

      <div aria-live="polite" className="sr-only">
        {selectedNode
          ? formatTemplate(t.diagram.nodeSelected, {
              title: selectedNode.title,
              subtitle: (selectedNode.techId ? TECH_BY_ID.get(selectedNode.techId)?.tagline[locale] : null) ?? selectedNode.subtitle,
            })
          : ""}
      </div>
    </div>
  );
};
