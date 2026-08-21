/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { cn } from "../../lib/cn";
import { IconHelper } from "../IconHelper";
import { TechLogo } from "./TechLogo";
import { getTechLogo } from "../../engine/logos";

type IconTileSize = "sm" | "md" | "lg";

interface IconTileProps {
  /** Catalog technology id — when it resolves to a known brand mark, the real logo renders on a neutral chip. */
  techId?: string;
  /** Lucide icon name used when no techId/brand mark is available. */
  icon: string;
  accentColor?: string;
  size?: IconTileSize;
  className?: string;
}

const sizeMap: Record<IconTileSize, { box: string; icon: number; logo: number }> = {
  sm: { box: "h-7 w-7 rounded-[var(--radius-sm)]", icon: 14, logo: 15 },
  md: { box: "h-9 w-9 rounded-[var(--radius-md)]", icon: 16, logo: 18 },
  lg: { box: "h-11 w-11 rounded-[var(--radius-md)]", icon: 19, logo: 22 },
};

export const IconTile: React.FC<IconTileProps> = ({ techId, icon, accentColor, size = "md", className }) => {
  const { box, icon: iconSize, logo: logoSize } = sizeMap[size];
  const logo = techId ? getTechLogo(techId) : undefined;

  if (logo) {
    return (
      <div
        className={cn(
          "flex shrink-0 items-center justify-center border border-black/5 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.08)]",
          box,
          className
        )}
      >
        <TechLogo logo={logo} size={logoSize} />
      </div>
    );
  }

  const color = accentColor || "var(--color-accent-500)";
  return (
    <div
      className={cn("flex shrink-0 items-center justify-center border", box, className)}
      style={{
        backgroundColor: `${color}1f`,
        color,
        borderColor: `${color}3d`,
      }}
    >
      <IconHelper name={icon} size={iconSize} />
    </div>
  );
};
