/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  Sparkles,
  Send,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  DollarSign,
  RefreshCw,
  Bot,
  User,
} from "lucide-react";
import {
  ProjectConfig,
  Technology,
  ValidationIssue,
  AIReviewResult,
  AICopilotMessage,
} from "../types";
import { askAIReviewArchitecture, askAICopilot } from "../services/aiService";
import { Sheet, SheetCloseButton } from "./ui/Sheet";
import { Tabs } from "./ui/Tabs";
import { Button } from "./ui/Button";

interface AICopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectConfig;
  selectedTechs: Technology[];
  issues: ValidationIssue[];
}

export const AICopilotDrawer: React.FC<AICopilotDrawerProps> = ({
  isOpen,
  onClose,
  project,
  selectedTechs,
  issues,
}) => {
  const [activeTab, setActiveTab] = useState<"review" | "chat">("review");
  const [reviewResult, setReviewResult] = useState<AIReviewResult | null>(null);
  const [isLoadingReview, setIsLoadingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const [messages, setMessages] = useState<AICopilotMessage[]>([
    {
      id: "welcome",
      sender: "copilot",
      timestamp: "Just now",
      content:
        "Hello! I am your Architecture Copilot. Ask me anything about component wiring, throughput bottlenecks, security boundaries, or scaling strategies for your active stack.",
    },
  ]);
  const [questionInput, setQuestionInput] = useState("");
  const [isAsking, setIsAsking] = useState(false);

  const handleRunReview = async () => {
    setIsLoadingReview(true);
    setReviewError(null);
    try {
      const result = await askAIReviewArchitecture(project, selectedTechs, issues);
      setReviewResult(result);
    } catch (err: any) {
      setReviewError(err.message || "Failed to generate AI review");
    } finally {
      setIsLoadingReview(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = questionInput.trim();
    if (!text || isAsking) return;

    const userMsg: AICopilotMessage = {
      id: `user_${Date.now()}`,
      sender: "user",
      timestamp: "Just now",
      content: text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuestionInput("");
    setIsAsking(true);

    try {
      const answer = await askAICopilot(text, project, selectedTechs);
      const botMsg: AICopilotMessage = {
        id: `bot_${Date.now()}`,
        sender: "copilot",
        timestamp: "Just now",
        content: answer,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: AICopilotMessage = {
        id: `bot_${Date.now()}`,
        sender: "copilot",
        timestamp: "Just now",
        content: `Error: ${err.message || "Could not retrieve answer. Please try again."}`,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <Sheet isOpen={isOpen} onClose={onClose} side="right" zIndex={50} widthClassName="sm:max-w-lg lg:max-w-lg">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] p-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] bg-gradient-to-br from-accent-500 to-accent-700 text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-display text-sm font-semibold text-[var(--text-primary)]">
              AI Architecture Copilot
            </h3>
            <p className="text-[11px] text-[var(--text-tertiary)]">
              System design & topology intelligence
            </p>
          </div>
        </div>

        <SheetCloseButton onClose={onClose} />
      </div>

      <Tabs
        activeId={activeTab}
        onChange={(id) => setActiveTab(id as typeof activeTab)}
        items={[
          { id: "review", label: "System Audit", icon: <ShieldCheck className="h-3.5 w-3.5" /> },
          { id: "chat", label: "Copilot Q&A", icon: <Bot className="h-3.5 w-3.5" /> },
        ]}
        className="px-2"
      />

      {/* Tab: Architectural Review */}
      {activeTab === "review" && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {!reviewResult && !isLoadingReview && (
            <div className="rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-2)] p-6 text-center">
              <Sparkles className="mx-auto h-10 w-10 text-accent-500" />
              <h4 className="mt-3 text-sm font-semibold text-[var(--text-primary)]">
                Deep-Dive Architecture Audit
              </h4>
              <p className="mt-1 text-xs text-[var(--text-tertiary)]">
                Let AI evaluate scalability bottlenecks, security boundaries, maintenance overhead, and operational costs for your selected {selectedTechs.length} technologies.
              </p>
              <Button variant="primary" onClick={handleRunReview} className="mt-4 mx-auto py-2">
                <Sparkles className="h-4 w-4" />
                <span>Run System Audit</span>
              </Button>
            </div>
          )}

          {isLoadingReview && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-accent-500" />
              <p className="mt-3 text-xs font-semibold text-[var(--text-primary)]">
                Evaluating system architecture against enterprise patterns...
              </p>
              <p className="mt-1 text-[11px] text-[var(--text-tertiary)]">
                Analyzing data flows, caching boundaries, and security attack surfaces.
              </p>
            </div>
          )}

          {reviewError && (
            <div className="rounded-[var(--radius-lg)] border border-danger-500/25 bg-danger-500/5 p-4 text-danger-300">
              <p className="font-semibold">Review Error</p>
              <p className="mt-1 text-[11px]">{reviewError}</p>
              <button
                onClick={handleRunReview}
                className="mt-2 text-xs font-semibold text-danger-400 underline"
              >
                Retry Audit
              </button>
            </div>
          )}

          {reviewResult && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                  Audit Report
                </span>
                <button
                  onClick={handleRunReview}
                  className="flex items-center gap-1 text-[11px] font-semibold text-accent-400 hover:underline"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Re-audit</span>
                </button>
              </div>

              <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-2)] p-3.5">
                <h5 className="font-semibold text-accent-400">
                  Executive Summary
                </h5>
                <p className="mt-1 leading-relaxed text-[var(--text-secondary)]">
                  {reviewResult.summary}
                </p>
              </div>

              <div className="rounded-[var(--radius-lg)] border border-success-500/25 bg-success-500/5 p-3.5">
                <h5 className="flex items-center gap-1.5 font-semibold text-success-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Key Strengths</span>
                </h5>
                <ul className="mt-2 space-y-1.5 text-[var(--text-secondary)]">
                  {reviewResult.strengths.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="font-bold text-success-400">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-[var(--radius-lg)] border border-warning-500/25 bg-warning-500/5 p-3.5">
                <h5 className="flex items-center gap-1.5 font-semibold text-warning-400">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Scaling Risks & Bottlenecks</span>
                </h5>
                <ul className="mt-2 space-y-1.5 text-[var(--text-secondary)]">
                  {reviewResult.risks.map((r, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="font-bold text-warning-400">•</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-2)] p-3.5">
                <h5 className="flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
                  <ShieldCheck className="h-4 w-4 text-accent-500" />
                  <span>Security & Compliance</span>
                </h5>
                <ul className="mt-2 space-y-1.5 text-[var(--text-secondary)]">
                  {reviewResult.securityNotes.map((sec, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="font-bold text-accent-500">•</span>
                      <span>{sec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-2)] p-3.5">
                <h5 className="flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
                  <DollarSign className="h-4 w-4 text-success-400" />
                  <span>Cost & Operational Profile</span>
                </h5>
                <p className="mt-1 leading-relaxed text-[var(--text-secondary)]">
                  {reviewResult.costAssessment}
                </p>
              </div>

              <div>
                <h5 className="font-semibold text-[var(--text-primary)]">
                  Recommended Next Steps
                </h5>
                <ul className="mt-2 space-y-1.5">
                  {reviewResult.recommendations.map((rec, idx) => (
                    <li
                      key={idx}
                      className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-2)] p-2.5 text-[var(--text-secondary)]"
                    >
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Architecture Q&A Chat */}
      {activeTab === "chat" && (
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 text-xs ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.sender === "copilot" && (
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-accent-500 text-white">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-[var(--radius-lg)] p-3 leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-accent-500 text-white"
                      : "border border-[var(--border-subtle)] bg-[var(--surface-2)] text-[var(--text-secondary)]"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
                {msg.sender === "user" && (
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--surface-3)] text-[var(--text-primary)]">
                    <User className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>
            ))}
            {isAsking && (
              <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-accent-500" />
                <span>Copilot is reasoning...</span>
              </div>
            )}
          </div>

          <form
            onSubmit={handleSendMessage}
            className="border-t border-[var(--border-subtle)] p-3"
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={questionInput}
                onChange={(e) => setQuestionInput(e.target.value)}
                placeholder="Ask about Redis caching, Clerk webhooks, DB scaling..."
                disabled={isAsking}
                className="flex-1 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-0)] px-3 py-2 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-accent-500 focus:outline-none"
              />
              <Button
                type="submit"
                variant="primary"
                size="icon"
                disabled={!questionInput.trim() || isAsking}
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          </form>
        </div>
      )}
    </Sheet>
  );
};
