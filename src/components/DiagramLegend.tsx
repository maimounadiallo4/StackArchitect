import React from "react";
import { ArchitectureZone, LaneKey } from "../types";
import { Translations } from "../i18n/translations";

interface DiagramLegendProps {
  zones: ArchitectureZone[];
  lanes: Translations["lanes"];
}

export const DiagramLegend: React.FC<DiagramLegendProps> = ({ zones, lanes }) => {
  if (zones.length === 0) return null;

  return (
    <div
      role="list"
      aria-label="Legend"
      className="absolute bottom-14 left-3 z-20 flex max-w-[220px] flex-col gap-1.5 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-1)]/95 p-3 text-[11px] shadow-[var(--elevation-3)] backdrop-blur-md sm:bottom-16 sm:left-4"
    >
      {zones.map((zone) => {
        const label = zone.laneKey ? lanes[zone.laneKey as LaneKey] : zone.title;
        return (
          <div key={zone.id} role="listitem" className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: zone.color }} />
            <span className="truncate text-[var(--text-secondary)]">{label}</span>
          </div>
        );
      })}
    </div>
  );
};
