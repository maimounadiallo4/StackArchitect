/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Download, Copy, Check, FileCode, FileText, Code2 } from "lucide-react";
import { ArchitectureModel } from "../types";
import {
  generateMermaidDiagram,
  generateC4StructurizrDSL,
  generateArchitectureDocument,
  downloadFile,
} from "../engine/exporter";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { cn } from "../lib/cn";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  model: ArchitectureModel;
}

const VIEW_LEVEL = "system" as const;

type ExportFormat = "mermaid" | "markdown" | "c4" | "json";

const FORMATS: { id: ExportFormat; label: string; icon: React.ReactNode }[] = [
  { id: "mermaid", label: "Mermaid.js", icon: <FileCode className="h-3.5 w-3.5" /> },
  { id: "markdown", label: "Markdown ADR", icon: <FileText className="h-3.5 w-3.5" /> },
  { id: "c4", label: "C4 / Structurizr", icon: <Code2 className="h-3.5 w-3.5" /> },
  { id: "json", label: "JSON Graph", icon: <Code2 className="h-3.5 w-3.5" /> },
];

const FORMAT_HINTS: Record<ExportFormat, string> = {
  mermaid: "Render directly in GitHub, Notion, or Mermaid Live Editor.",
  markdown: "Production-ready RFC / Technical Architecture Document.",
  c4: "Compliant with Structurizr and C4 model tooling.",
  json: "Machine-readable graph topology (nodes, edges, zones).",
};

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  model,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("mermaid");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const getExportContent = (): string => {
    switch (selectedFormat) {
      case "mermaid":
        return generateMermaidDiagram(model, VIEW_LEVEL);
      case "c4":
        return generateC4StructurizrDSL(model);
      case "markdown":
        return generateArchitectureDocument(model);
      case "json":
        return JSON.stringify(model, null, 2);
      default:
        return "";
    }
  };

  const handleCopy = () => {
    const text = getExportContent();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filenameBase = (model.project.name || "architecture")
      .toLowerCase()
      .replace(/\s+/g, "_");

    switch (selectedFormat) {
      case "mermaid":
        downloadFile(`${filenameBase}.mmd`, generateMermaidDiagram(model, VIEW_LEVEL), "text/plain");
        break;
      case "c4":
        downloadFile(`${filenameBase}.dsl`, generateC4StructurizrDSL(model), "text/plain");
        break;
      case "markdown":
        downloadFile(`${filenameBase}_ADR.md`, generateArchitectureDocument(model), "text/markdown");
        break;
      case "json":
        downloadFile(`${filenameBase}_model.json`, JSON.stringify(model, null, 2), "application/json");
        break;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      icon="Download"
      title="Export Architecture & Definitions"
      subtitle="Generate diagrams, C4 DSL models, and Architecture Decision Records."
      maxWidth="max-w-3xl"
      bodyClassName="flex flex-col"
      footer={
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div className="text-xs text-[var(--text-tertiary)]">{FORMAT_HINTS[selectedFormat]}</div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={handleCopy}>
              {copied ? <Check className="h-3.5 w-3.5 text-success-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "Copied!" : "Copy Code"}</span>
            </Button>

            <Button variant="primary" onClick={handleDownload}>
              <Download className="h-3.5 w-3.5" />
              <span>Download File</span>
            </Button>
          </div>
        </div>
      }
    >
      {/* Format Selector Pills */}
      <div className="flex gap-2 overflow-x-auto border-b border-[var(--border-subtle)] px-4 py-2 text-xs font-medium no-scrollbar sm:px-5">
        {FORMATS.map((fmt) => (
          <button
            key={fmt.id}
            onClick={() => setSelectedFormat(fmt.id)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-[var(--radius-md)] px-3 py-1.5 transition",
              selectedFormat === fmt.id
                ? "bg-accent-500 text-white"
                : "bg-[var(--surface-2)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            )}
          >
            {fmt.icon}
            <span>{fmt.label}</span>
          </button>
        ))}
      </div>

      {/* Code View Area */}
      <div className="p-4 sm:p-5">
        <textarea
          readOnly
          value={getExportContent()}
          className="h-72 w-full resize-none rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-0)] p-4 font-mono text-xs text-success-400 focus:outline-none sm:h-96"
        />
      </div>
    </Modal>
  );
};
