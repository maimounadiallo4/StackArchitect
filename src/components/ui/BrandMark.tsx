import React from "react";
import { cn } from "../../lib/cn";

interface BrandMarkProps {
  size?: number;
  className?: string;
}

/**
 * The app's logo mark — three connected nodes, echoing an architecture
 * diagram. Matches the favicon exactly so the brand reads consistently
 * everywhere it appears (browser tab, header, wizard top bar).
 */
export const BrandMark: React.FC<BrandMarkProps> = ({ size = 20, className }) => (
  <div
    className={cn(
      "flex shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-gradient-to-br from-accent-400 to-accent-600",
      className
    )}
  >
    <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 32 32" fill="none">
      <path
        d="M9 10L23 10M9 10L16 23M23 10L16 23"
        stroke="var(--text-on-accent)"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
      <circle cx="9" cy="10" r="4" fill="var(--text-on-accent)" />
      <circle cx="23" cy="10" r="4" fill="var(--text-on-accent)" />
      <circle cx="16" cy="23" r="4" fill="var(--text-on-accent)" />
    </svg>
  </div>
);
