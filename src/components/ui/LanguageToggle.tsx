import React from "react";
import { useLanguage } from "../../i18n/LanguageContext";
import { cn } from "../../lib/cn";

export const LanguageToggle: React.FC<{ className?: string }> = ({ className }) => {
  const { locale, setLocale, t } = useLanguage();

  return (
    <div
      className={cn(
        "flex items-center overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-default)] text-[11px] font-semibold",
        className
      )}
      role="group"
      aria-label={t.header.language}
    >
      {(["fr", "en"] as const).map((code) => (
        <button
          key={code}
          onClick={() => setLocale(code)}
          className={cn(
            "px-2 py-1.5 uppercase transition",
            locale === code
              ? "bg-accent-500 text-[var(--text-on-accent)]"
              : "text-[var(--text-tertiary)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]"
          )}
          aria-pressed={locale === code}
        >
          {code}
        </button>
      ))}
    </div>
  );
};
