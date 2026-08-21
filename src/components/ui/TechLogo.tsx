import React from "react";
import { BrandLogo } from "../../engine/logos";

interface TechLogoProps {
  logo: BrandLogo;
  size?: number;
  className?: string;
}

export const TechLogo: React.FC<TechLogoProps> = ({ logo, size = 18, className }) => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    className={className}
    fill={`#${logo.hex}`}
  >
    <title>{logo.title}</title>
    <path d={logo.path} />
  </svg>
);
