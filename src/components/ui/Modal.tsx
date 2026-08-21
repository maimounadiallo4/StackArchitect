/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/cn";
import { IconTile } from "./IconTile";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  icon: string;
  title: string;
  subtitle?: string;
  maxWidth?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  bodyClassName?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  icon,
  title,
  subtitle,
  maxWidth = "max-w-xl",
  children,
  footer,
  bodyClassName,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--surface-overlay)] p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={cn(
          "flex max-h-[90vh] w-full flex-col rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-1)] text-[var(--text-primary)] shadow-[var(--elevation-overlay)]",
          maxWidth
        )}
      >
        <div className="flex items-center justify-between gap-3 border-b border-[var(--border-subtle)] p-4 sm:p-5">
          <div className="flex min-w-0 items-center gap-3">
            <IconTile icon={icon} size="lg" />
            <div className="min-w-0">
              <h3 className="font-display truncate text-sm font-semibold tracking-tight text-[var(--text-primary)] sm:text-base">
                {title}
              </h3>
              {subtitle && (
                <p className="truncate text-xs text-[var(--text-tertiary)]">{subtitle}</p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="shrink-0 rounded-[var(--radius-sm)] p-1.5 text-[var(--text-tertiary)] transition hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className={cn("flex-1 overflow-y-auto", bodyClassName)}>{children}</div>

        {footer && (
          <div className="border-t border-[var(--border-subtle)] p-4">{footer}</div>
        )}
      </div>
    </div>
  );
};
