import React, { useMemo, useState } from "react";
import { Download, Copy, Check, FileCode, FileText, Code2, Image as ImageIcon, Loader2, Link2 } from "lucide-react";
import { ArchitectureModel, ValidationIssue } from "../types";
import {
  generateMermaidDiagram,
  generateC4StructurizrDSL,
  generateArchitectureDocument,
  downloadFile,
} from "../engine/exporter";
import { generateDiagramSVG, svgToPngBlob, downloadBlob } from "../engine/diagramImage";
import { encodeShareLink } from "../lib/shareLink";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { useLanguage } from "../i18n/LanguageContext";
import { cn } from "../lib/cn";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  model: ArchitectureModel;
  darkMode: boolean;
  issues?: ValidationIssue[];
}

const VIEW_LEVEL = "system" as const;

type ExportFormat = "mermaid" | "markdown" | "c4" | "json" | "svg" | "png";

const canCopyImages = typeof window !== "undefined" && "ClipboardItem" in window && !!navigator.clipboard?.write;

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  model,
  darkMode,
  issues = [],
}) => {
  const { t } = useLanguage();
  const FORMAT_HINTS: Record<ExportFormat, string> = t.exportModal.hints;
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("mermaid");
  const [copied, setCopied] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const handleCopyShareLink = () => {
    const link = encodeShareLink({ project: model.project, selectedTechIds: model.selectedTechs.map((t) => t.id) });
    navigator.clipboard.writeText(link);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const FORMATS: { id: ExportFormat; label: string; icon: React.ReactNode }[] = [
    { id: "mermaid", label: "Mermaid.js", icon: <FileCode className="h-3.5 w-3.5" /> },
    { id: "markdown", label: "Markdown ADR", icon: <FileText className="h-3.5 w-3.5" /> },
    { id: "c4", label: "C4 / Structurizr", icon: <Code2 className="h-3.5 w-3.5" /> },
    { id: "json", label: "JSON Graph", icon: <Code2 className="h-3.5 w-3.5" /> },
    { id: "svg", label: "SVG Image", icon: <ImageIcon className="h-3.5 w-3.5" /> },
    { id: "png", label: "PNG Image", icon: <ImageIcon className="h-3.5 w-3.5" /> },
  ];

  const diagramSvg = useMemo(
    () => generateDiagramSVG(model, darkMode ? "dark" : "light", t.lanes),
    [model, darkMode, t]
  );

  const isImageFormat = selectedFormat === "svg" || selectedFormat === "png";

  if (!isOpen) return null;

  const getExportContent = (): string => {
    switch (selectedFormat) {
      case "mermaid":
        return generateMermaidDiagram(model, VIEW_LEVEL);
      case "c4":
        return generateC4StructurizrDSL(model);
      case "markdown":
        return generateArchitectureDocument(model, issues);
      case "json":
        return JSON.stringify(model, null, 2);
      case "svg":
        return diagramSvg;
      default:
        return "";
    }
  };

  const filenameBase = (model.project.name || "architecture").toLowerCase().replace(/\s+/g, "_");

  const handleCopy = async () => {
    if (selectedFormat === "png") {
      if (!canCopyImages) return;
      setIsBusy(true);
      try {
        const blob = await svgToPngBlob(diagramSvg, 2);
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Copy image failed:", err);
      } finally {
        setIsBusy(false);
      }
      return;
    }

    navigator.clipboard.writeText(getExportContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    switch (selectedFormat) {
      case "mermaid":
        downloadFile(`${filenameBase}.mmd`, generateMermaidDiagram(model, VIEW_LEVEL), "text/plain");
        break;
      case "c4":
        downloadFile(`${filenameBase}.dsl`, generateC4StructurizrDSL(model), "text/plain");
        break;
      case "markdown":
        downloadFile(`${filenameBase}_ADR.md`, generateArchitectureDocument(model, issues), "text/markdown");
        break;
      case "json":
        downloadFile(`${filenameBase}_model.json`, JSON.stringify(model, null, 2), "application/json");
        break;
      case "svg":
        downloadFile(`${filenameBase}_diagram.svg`, diagramSvg, "image/svg+xml");
        break;
      case "png": {
        setIsBusy(true);
        try {
          const blob = await svgToPngBlob(diagramSvg, 2);
          downloadBlob(`${filenameBase}_diagram.png`, blob);
        } catch (err) {
          console.error("PNG export failed:", err);
        } finally {
          setIsBusy(false);
        }
        break;
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      icon="Download"
      title={t.exportModal.title}
      subtitle={t.exportModal.subtitle}
      maxWidth="max-w-3xl"
      bodyClassName="flex flex-col"
      footer={
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div className="text-xs text-[var(--text-tertiary)]">{FORMAT_HINTS[selectedFormat]}</div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={handleCopyShareLink}>
              {linkCopied ? <Check className="h-3.5 w-3.5 text-success-400" /> : <Link2 className="h-3.5 w-3.5" />}
              <span>{linkCopied ? t.exportModal.copied : t.exportModal.copyLink}</span>
            </Button>

            {(selectedFormat !== "png" || canCopyImages) && (
              <Button variant="secondary" onClick={handleCopy} disabled={isBusy}>
                {copied ? <Check className="h-3.5 w-3.5 text-success-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? t.exportModal.copied : selectedFormat === "png" ? t.exportModal.copyImage : t.exportModal.copy}</span>
              </Button>
            )}

            <Button variant="primary" onClick={handleDownload} disabled={isBusy}>
              {isBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              <span>{t.exportModal.download}</span>
            </Button>
          </div>
        </div>
      }
    >
      {/* Format Selector Pills */}
      <div
        className="flex gap-2 overflow-x-auto border-b border-[var(--border-subtle)] px-4 py-2 text-xs font-medium no-scrollbar sm:px-5"
        tabIndex={0}
        role="group"
        aria-label={t.exportModal.title}
      >
        {FORMATS.map((fmt) => (
          <button
            key={fmt.id}
            onClick={() => setSelectedFormat(fmt.id)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-[var(--radius-md)] px-3 py-1.5 transition",
              selectedFormat === fmt.id
                ? "bg-accent-500 text-[var(--text-on-accent)]"
                : "bg-[var(--surface-2)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            )}
          >
            {fmt.icon}
            <span>{fmt.label}</span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="p-4 sm:p-5">
        {isImageFormat ? (
          <div
            className="flex h-72 w-full items-center justify-center overflow-auto rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-0)] p-3 sm:h-96 [&_svg]:h-auto [&_svg]:max-w-full"
            dangerouslySetInnerHTML={{ __html: diagramSvg }}
          />
        ) : (
          <textarea
            readOnly
            value={getExportContent()}
            className="h-72 w-full resize-none rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-0)] p-4 font-mono text-xs text-success-400 focus:outline-none sm:h-96"
          />
        )}
      </div>
    </Modal>
  );
};
