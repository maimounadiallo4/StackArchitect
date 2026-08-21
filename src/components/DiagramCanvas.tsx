/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Cpu,
  Activity,
  Cloud,
  Eye,
  Play,
  Pause,
  CheckCircle2,
  Settings,
  Plus,
  ArrowRight,
  Maximize2,
  Workflow,
  Clock,
} from "lucide-react";
import {
  ArchitectureModel,
  ArchitectureNode,
  ArchitectureEdge,
  ViewLevel,
  NodeExecutionResult,
} from "../types";
import { IconHelper } from "./IconHelper";

interface DiagramCanvasProps {
  model: ArchitectureModel;
  viewLevel: ViewLevel;
  onChangeViewLevel: (view: ViewLevel) => void;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
  onNodePositionChange?: (nodeId: string, x: number, y: number) => void;
  onAutoLayout?: () => void;
  executionResults?: Record<string, NodeExecutionResult>;
  executingNodeId?: string | null;
}

export const DiagramCanvas: React.FC<DiagramCanvasProps> = ({
  model,
  viewLevel,
  onChangeViewLevel,
  selectedNodeId,
  onSelectNode,
  onNodePositionChange,
  onAutoLayout,
  executionResults = {},
  executingNodeId = null,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.85);
  const [pan, setPan] = useState({ x: 50, y: 40 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Dragging node state
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [animateFlows, setAnimateFlows] = useState(true);

  // Quick lookup for connected nodes and edges
  const activeFocusId = selectedNodeId || hoveredNodeId;

  const connectedEdgeIds = useMemo(() => {
    if (!activeFocusId) return new Set<string>();
    const edgeIds = new Set<string>();
    model.edges.forEach((e) => {
      if (e.source === activeFocusId || e.target === activeFocusId) {
        edgeIds.add(e.id);
      }
    });
    return edgeIds;
  }, [activeFocusId, model.edges]);

  const connectedNodeIds = useMemo(() => {
    if (!activeFocusId) return new Set<string>();
    const nodeIds = new Set<string>([activeFocusId]);
    model.edges.forEach((e) => {
      if (e.source === activeFocusId) nodeIds.add(e.target);
      if (e.target === activeFocusId) nodeIds.add(e.source);
    });
    return nodeIds;
  }, [activeFocusId, model.edges]);

  // Pan handlers on container background
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".n8n-node-card")) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    } else if (draggingNodeId) {
      const newX = (e.clientX - pan.x) / scale - dragOffset.x;
      const newY = (e.clientY - pan.y) / scale - dragOffset.y;
      if (onNodePositionChange) {
        onNodePositionChange(
          draggingNodeId,
          Math.max(20, Math.round(newX)),
          Math.max(20, Math.round(newY))
        );
      }
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingNodeId(null);
  };

  // Node drag start
  const handleNodeMouseDown = (e: React.MouseEvent, node: ArchitectureNode) => {
    e.stopPropagation();
    onSelectNode(node.id);
    setDraggingNodeId(node.id);
    const mouseCanvasX = (e.clientX - pan.x) / scale;
    const mouseCanvasY = (e.clientY - pan.y) / scale;
    setDragOffset({
      x: mouseCanvasX - node.x,
      y: mouseCanvasY - node.y,
    });
  };

  // Zoom controls
  const handleZoom = (delta: number) => {
    setScale((prev) => Math.min(2.2, Math.max(0.35, prev + delta)));
  };

  const handleResetView = () => {
    setScale(0.85);
    setPan({ x: 50, y: 40 });
    if (onAutoLayout) onAutoLayout();
  };

  // Wheel zoom / pan
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? -0.1 : 0.1;
      handleZoom(zoomFactor);
    } else {
      setPan((prev) => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY,
      }));
    }
  };

  // Node map for fast coordinate lookups
  const nodeMap = useMemo(() => {
    return new Map(model.nodes.map((n) => [n.id, n]));
  }, [model.nodes]);

  return (
    <div
      ref={containerRef}
      id="diagram-canvas-container"
      className="n8n-canvas-grid-dark relative flex-1 overflow-hidden select-none cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Top View Level Switcher (n8n View Tabs) */}
      <div className="absolute left-4 top-4 z-20 flex items-center gap-1 rounded-xl border border-[#303744] bg-[#1c2028]/95 p-1 shadow-2xl backdrop-blur-md">
        <button
          id="tab-view-overview"
          onClick={() => onChangeViewLevel("overview")}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
            viewLevel === "overview"
              ? "bg-[#ff6d5a] text-white shadow-xs"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          <Eye className="h-3.5 w-3.5" />
          <span>Overview</span>
        </button>

        <button
          id="tab-view-system"
          onClick={() => onChangeViewLevel("system")}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
            viewLevel === "system"
              ? "bg-[#ff6d5a] text-white shadow-xs"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          <Cpu className="h-3.5 w-3.5" />
          <span>Flow Graph</span>
        </button>

        <button
          id="tab-view-detailed"
          onClick={() => onChangeViewLevel("detailed")}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
            viewLevel === "detailed"
              ? "bg-[#ff6d5a] text-white shadow-xs"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          <Activity className="h-3.5 w-3.5" />
          <span>Protocols & Ports</span>
        </button>

        <button
          id="tab-view-deployment"
          onClick={() => onChangeViewLevel("deployment")}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
            viewLevel === "deployment"
              ? "bg-[#ff6d5a] text-white shadow-xs"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          <Cloud className="h-3.5 w-3.5" />
          <span>Deployment Zones</span>
        </button>
      </div>

      {/* Floating Canvas Controls (n8n Style) */}
      <div className="absolute right-4 top-4 z-20 flex items-center gap-1 rounded-xl border border-[#303744] bg-[#1c2028]/95 p-1 shadow-2xl backdrop-blur-md">
        <button
          onClick={() => setAnimateFlows(!animateFlows)}
          className={`rounded-lg p-1.5 transition ${
            animateFlows
              ? "bg-[#ff6d5a]/20 text-[#ff8a7a]"
              : "text-neutral-400 hover:text-white"
          }`}
          title={animateFlows ? "Pause Wire Flow Animation" : "Play Wire Flow Animation"}
        >
          {animateFlows ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>

        <div className="h-4 w-px bg-[#303744]" />

        <button
          onClick={() => handleZoom(0.15)}
          className="rounded-lg p-1.5 text-neutral-400 hover:bg-[#252b37] hover:text-white transition"
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </button>

        <button
          onClick={() => handleZoom(-0.15)}
          className="rounded-lg p-1.5 text-neutral-400 hover:bg-[#252b37] hover:text-white transition"
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </button>

        <button
          onClick={handleResetView}
          className="rounded-lg p-1.5 text-neutral-400 hover:bg-[#252b37] hover:text-white transition"
          title="Auto-Arrange & Center Canvas"
        >
          <RotateCcw className="h-4 w-4" />
        </button>

        <span className="px-2 text-[11px] font-mono font-medium text-neutral-400">
          {Math.round(scale * 100)}%
        </span>
      </div>

      {/* Main SVG & Nodes Layer */}
      <div
        className="absolute inset-0 origin-top-left transition-transform duration-75"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          width: "3800px",
          height: "2400px",
        }}
      >
        <svg
          className="absolute inset-0 pointer-events-none"
          width="3800"
          height="2400"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* n8n Style Wire Markers */}
            <marker
              id="n8n-arrow-default"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#ff6d5a" />
            </marker>

            <marker
              id="n8n-arrow-highlight"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#ffffff" />
            </marker>

            {/* Glowing filter for active execution path */}
            <filter id="n8n-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Render Deployment Zones */}
          {viewLevel === "deployment" &&
            model.zones.map((zone) => (
              <g key={zone.id}>
                <rect
                  x={zone.x}
                  y={zone.y}
                  width={zone.width}
                  height={zone.height}
                  rx="16"
                  ry="16"
                  fill={`${zone.color}0a`}
                  stroke={zone.color}
                  strokeWidth="1.5"
                  strokeDasharray="6 6"
                />
                <rect
                  x={zone.x + 16}
                  y={zone.y + 10}
                  width={Math.min(zone.width - 32, 240)}
                  height="24"
                  rx="6"
                  ry="6"
                  fill="#1c2028"
                  stroke={zone.color}
                  strokeWidth="1"
                />
                <text
                  x={zone.x + 26}
                  y={zone.y + 26}
                  fill={zone.color}
                  fontSize="11"
                  fontWeight="bold"
                  fontFamily="system-ui"
                >
                  {zone.title}
                </text>
              </g>
            ))}

          {/* Render Edges / Connections with n8n Smooth Cubic Curves */}
          {model.edges.map((edge) => {
            const srcNode = nodeMap.get(edge.source);
            const tgtNode = nodeMap.get(edge.target);
            if (!srcNode || !tgtNode) return null;

            // Connection Ports coordinates (right port of source -> left port of target)
            const isLeftToRight = tgtNode.x > srcNode.x;
            const x1 = isLeftToRight ? srcNode.x + srcNode.width : srcNode.x;
            const y1 = srcNode.y + srcNode.height / 2;
            const x2 = isLeftToRight ? tgtNode.x : tgtNode.x + tgtNode.width;
            const y2 = tgtNode.y + tgtNode.height / 2;

            // n8n style smooth bezier curve control points
            const distance = Math.abs(x2 - x1);
            const curvature = Math.max(distance * 0.45, 40);
            const cx1 = isLeftToRight ? x1 + curvature : x1 - curvature;
            const cy1 = y1;
            const cx2 = isLeftToRight ? x2 - curvature : x2 + curvature;
            const cy2 = y2;

            const pathD = `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;

            const isHighlighted =
              activeFocusId && (edge.source === activeFocusId || edge.target === activeFocusId);
            const isDimmed = activeFocusId && !isHighlighted;

            // Check if active execution flow travels on this edge
            const isExecutingSource = executingNodeId === edge.source;
            const isExecutedSource = executionResults[edge.source]?.status === "success";

            let strokeColor = "#ff6d5a";
            if (edge.nature === "webhook") strokeColor = "#f43f5e";
            if (edge.nature === "event") strokeColor = "#38bdf8";
            if (edge.nature === "telemetry") strokeColor = "#fb923c";

            if (isHighlighted) {
              strokeColor = "#ffffff";
            }

            return (
              <g
                key={edge.id}
                className={`transition-opacity duration-200 ${
                  isDimmed ? "opacity-20" : "opacity-100"
                }`}
              >
                {/* Thick background click/hover target */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="20"
                  className="pointer-events-auto cursor-pointer"
                />

                {/* Main Curve Wire */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={isHighlighted ? 3 : 2}
                  strokeDasharray={animateFlows ? "6 6" : undefined}
                  className={animateFlows ? "n8n-flow-active" : ""}
                  markerEnd={isHighlighted ? "url(#n8n-arrow-highlight)" : "url(#n8n-arrow-default)"}
                />

                {/* Midpoint Protocol Pill (n8n Badge Style) */}
                {viewLevel !== "overview" && (
                  <g transform={`translate(${midX}, ${midY})`}>
                    <rect
                      x="-70"
                      y="-12"
                      width="140"
                      height="24"
                      rx="8"
                      ry="8"
                      fill="#191d24"
                      stroke={strokeColor}
                      strokeWidth="1"
                      fillOpacity="0.95"
                    />
                    <text
                      x="0"
                      y="4"
                      fill="#e2e8f0"
                      fontSize="9.5"
                      fontWeight="bold"
                      textAnchor="middle"
                      fontFamily="system-ui"
                    >
                      {edge.label}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Render Interactive n8n Node Cards */}
        {model.nodes.map((node) => {
          const isSelected = selectedNodeId === node.id;
          const isHovered = hoveredNodeId === node.id;
          const isConnected = connectedNodeIds.has(node.id);
          const isDimmed = activeFocusId && !isConnected && !isSelected;

          const execution = executionResults[node.id];
          const isExecuting = executingNodeId === node.id;

          return (
            <div
              key={node.id}
              id={`n8n-node-${node.id}`}
              onMouseDown={(e) => handleNodeMouseDown(e, node)}
              onMouseEnter={() => setHoveredNodeId(node.id)}
              onMouseLeave={() => setHoveredNodeId(null)}
              onClick={() => onSelectNode(node.id)}
              style={{
                left: `${node.x}px`,
                top: `${node.y}px`,
                width: `${node.width}px`,
                height: `${node.height}px`,
              }}
              className={`n8n-node-card group absolute flex flex-col justify-between rounded-2xl border p-3.5 shadow-xl backdrop-blur-md transition-all cursor-pointer ${
                isDimmed
                  ? "opacity-30 scale-95"
                  : isExecuting
                  ? "border-[#ff6d5a] bg-[#242b38] ring-4 ring-[#ff6d5a]/40 n8n-executing-pulse scale-103"
                  : isSelected
                  ? "border-[#ff6d5a] bg-[#202632] ring-2 ring-[#ff6d5a] shadow-2xl scale-102"
                  : isHovered
                  ? "border-[#4a5568] bg-[#232936] shadow-xl scale-101"
                  : "border-[#303744] bg-[#1c2028]/95 hover:border-[#424d5f]"
              }`}
            >
              {/* Left Input Port (n8n Port Socket Pin) */}
              <div
                className="absolute -left-2 top-1/2 -translate-y-1/2 flex h-4 w-4 items-center justify-center rounded-full bg-[#14171d] border-2 border-[#ff6d5a] shadow-sm transition-transform hover:scale-130"
                title="Input Connection Port"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-[#ff6d5a]" />
              </div>

              {/* Right Output Port (n8n Port Socket Pin) */}
              <div
                className="absolute -right-2 top-1/2 -translate-y-1/2 flex h-4 w-4 items-center justify-center rounded-full bg-[#14171d] border-2 border-[#ff6d5a] shadow-sm transition-transform hover:scale-130"
                title="Output Connection Port"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-[#ff6d5a]" />
              </div>

              {/* Top Node Header: Icon Tile + Title & Subtitle + Action Badge */}
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    {/* Category Icon in n8n Rounded Tile */}
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl shadow-xs"
                      style={{
                        backgroundColor: `${node.accentColor}25`,
                        color: node.accentColor,
                        border: `1px solid ${node.accentColor}40`,
                      }}
                    >
                      <IconHelper name={node.iconName} size={17} />
                    </div>

                    <div className="overflow-hidden">
                      <h3 className="truncate text-xs font-bold text-white tracking-tight">
                        {node.title}
                      </h3>
                      <p className="truncate text-[10px] text-neutral-400">
                        {node.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Execution Status Pill or Category Pill */}
                  {execution?.status === "success" ? (
                    <span className="flex items-center gap-1 shrink-0 rounded-full bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 text-[9px] font-bold text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>{execution.latencyMs}ms</span>
                    </span>
                  ) : isExecuting ? (
                    <span className="flex items-center gap-1 shrink-0 rounded-full bg-[#ff6d5a]/20 border border-[#ff6d5a] px-2 py-0.5 text-[9px] font-bold text-[#ff8a7a] animate-pulse">
                      <Activity className="h-3 w-3 animate-spin" />
                      <span>Running</span>
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-md bg-[#252c38] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-neutral-400 border border-[#364052]">
                      {node.category}
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom: Zone / Tier Protocol & Settings Trigger */}
              <div className="flex items-center justify-between border-t border-[#2d3442] pt-2 text-[10px] text-neutral-400">
                <span className="truncate max-w-[140px] text-neutral-400 font-medium">
                  {viewLevel === "deployment" ? node.deploymentZone : node.tier.toUpperCase()}
                </span>

                <div className="flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: node.accentColor }}
                  />
                  <Settings className="h-3 w-3 text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Summary Bar (n8n Workflow Stats) */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-3 rounded-xl border border-[#303744] bg-[#1c2028]/95 px-4 py-2 text-xs text-neutral-300 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff6d5a]" />
          <span className="font-bold text-white">{model.nodes.length} Nodes</span>
        </div>
        <span className="text-neutral-600">•</span>
        <div>{model.edges.length} Wire Connections</div>
        <span className="text-neutral-600">•</span>
        <div className="text-[#ff8a7a] font-semibold">{model.stats.estimatedComplexity}</div>
      </div>
    </div>
  );
};
