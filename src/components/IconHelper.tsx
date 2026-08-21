import React from "react";
import * as LucideIcons from "lucide-react";

interface IconHelperProps {
  name: string;
  className?: string;
  size?: number;
  color?: string;
}

export const IconHelper: React.FC<IconHelperProps> = ({
  name,
  className = "w-5 h-5",
  size = 20,
  color,
}) => {
  const IconComponent = (LucideIcons as any)[name] || LucideIcons.Cpu;
  return <IconComponent className={className} size={size} color={color} />;
};
