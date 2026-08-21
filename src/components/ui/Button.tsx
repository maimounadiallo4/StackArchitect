import React from "react";
import { cn } from "../../lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "icon";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  active?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-accent-500 text-white shadow-[var(--elevation-2)] hover:bg-accent-600 disabled:hover:bg-accent-500",
  secondary:
    "border border-[var(--border-default)] bg-[var(--surface-2)] text-[var(--text-primary)] hover:bg-[var(--surface-3)] hover:border-[var(--border-strong)]",
  ghost:
    "text-[var(--text-secondary)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]",
  danger:
    "border border-danger-500/30 bg-danger-500/10 text-danger-400 hover:bg-danger-500/20 hover:border-danger-500/50",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "gap-1.5 rounded-[var(--radius-md)] px-2.5 py-1 text-xs font-medium",
  md: "gap-1.5 rounded-[var(--radius-md)] px-3.5 py-2 text-xs font-semibold",
  icon: "h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)]",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "secondary", size = "md", active = false, className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center transition-all duration-150 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-45 disabled:active:scale-100",
          variantClasses[variant],
          sizeClasses[size],
          active && variant === "ghost" && "bg-[var(--surface-3)] text-[var(--text-primary)]",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
