/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  X,
  Download,
  Copy,
  Check,
  FileCode,
  FileText,
  Code2,
  Share2,
} from "lucide-react";
import { ArchitectureModel, ViewLevel } from "../types";
import {
  generateMermaidDiagram,
  generateC4StructurizrDSL,
  generateArchitectureDocument,
  downloadFile,
} from "../engine/exporter";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  model: ArchitectureModel;
  viewLevel: ViewLevel;
}

type ExportFormat = "mermaid" | "markdown" | "c4" | "json";

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  model,
  viewLevel,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("mermaid");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const getExportContent = (): string => {
    switch (selectedFormat) {
      case "mermaid":
        return generateMermaidDiagram(model, viewLevel);
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
        downloadFile(`${filenameBase}.mmd`, generateMermaidDiagram(model, viewLevel), "text/plain");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border border-[#2c323f] bg-[#181c24] text-neutral-200 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2c323f] bg-[#1d222c] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff6d5a] to-[#ea4b34] text-white shadow-md">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Export Architecture & Workflow Definition
              </h3>
              <p className="text-xs text-neutral-400">
                Generate diagrams, C4 DSL models, and Architecture Decision Records.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-[#28303e] hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Format Selector Pills */}
        <div className="flex border-b border-[#2c323f] bg-[#161921] px-4 py-2 text-xs font-semibold gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedFormat("mermaid")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 transition ${
              selectedFormat === "mermaid"
                ? "bg-[#ff6d5a] text-white shadow-xs"
                : "bg-[#222834] text-neutral-400 hover:text-white"
            }`}
          >
            <FileCode className="h-3.5 w-3.5" />
            <span>Mermaid.js</span>
          </button>

          <button
            onClick={() => setSelectedFormat("markdown")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 transition ${
              selectedFormat === "markdown"
                ? "bg-[#ff6d5a] text-white shadow-xs"
                : "bg-[#222834] text-neutral-400 hover:text-white"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Markdown ADR Document</span>
          </button>

          <button
            onClick={() => setSelectedFormat("c4")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 transition ${
              selectedFormat === "c4"
                ? "bg-[#ff6d5a] text-white shadow-xs"
                : "bg-[#222834] text-neutral-400 hover:text-white"
            }`}
          >
            <Code2 className="h-3.5 w-3.5" />
            <span>C4 / Structurizr DSL</span>
          </button>

          <button
            onClick={() => setSelectedFormat("json")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 transition ${
              selectedFormat === "json"
                ? "bg-[#ff6d5a] text-white shadow-xs"
                : "bg-[#222834] text-neutral-400 hover:text-white"
            }`}
          >
            <Code2 className="h-3.5 w-3.5" />
            <span>JSON Graph Model</span>
          </button>
        </div>

        {/* Code View Area */}
        <div className="relative flex-1 overflow-hidden p-4 bg-[#12151c]">
          <textarea
            readOnly
            value={getExportContent()}
            className="h-96 w-full resize-none rounded-xl border border-[#2c3442] bg-[#161a22] p-4 font-mono text-xs text-emerald-400 focus:outline-none"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-[#2c323f] bg-[#1d222c] p-4">
          <div className="text-xs text-neutral-400">
            {selectedFormat === "mermaid" && "Render directly in GitHub, Notion, or Mermaid Live Editor."}
            {selectedFormat === "markdown" && "Production-ready RFC / Technical Architecture Document."}
            {selectedFormat === "c4" && "Compliant with Structurizr and C4 model tooling."}
            {selectedFormat === "json" && "Machine-readable graph topology (nodes, edges, zones)."}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-xl border border-[#343e4f] bg-[#252c38] px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#2e3746]"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "Copied!" : "Copy Code"}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#ff6d5a] to-[#ea4b34] px-4 py-2 text-xs font-bold text-white shadow-md shadow-[#ff6d5a]/25 transition hover:from-[#ff5540] hover:to-[#d83f2a]"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
