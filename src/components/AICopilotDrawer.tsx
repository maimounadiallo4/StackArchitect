/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  Sparkles,
  X,
  Send,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  DollarSign,
  ArrowRight,
  RefreshCw,
  Bot,
  User,
  Plus,
} from "lucide-react";
import {
  ProjectConfig,
  Technology,
  ValidationIssue,
  AIReviewResult,
  AICopilotMessage,
} from "../types";
import { askAIReviewArchitecture, askAICopilot } from "../services/aiService";

interface AICopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectConfig;
  selectedTechs: Technology[];
  issues: ValidationIssue[];
  onAddTech: (techId: string) => void;
}

export const AICopilotDrawer: React.FC<AICopilotDrawerProps> = ({
  isOpen,
  onClose,
  project,
  selectedTechs,
  issues,
  onAddTech,
}) => {
  const [activeTab, setActiveTab] = useState<"review" | "chat">("review");
  const [reviewResult, setReviewResult] = useState<AIReviewResult | null>(null);
  const [isLoadingReview, setIsLoadingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  // Chat state
  const [messages, setMessages] = useState<AICopilotMessage[]>([
    {
      id: "welcome",
      sender: "copilot",
      timestamp: "Just now",
      content:
        "Hello! I am your Architecture Copilot. Ask me anything about workflow wiring, throughput bottlenecks, security boundaries, or scaling strategies for your active stack.",
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

  if (!isOpen) return null;

  return (
    <div
      id="ai-copilot-drawer"
      className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-[#2c323f] bg-[#181c24] text-neutral-200 shadow-2xl transition-all"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#2c323f] bg-[#1d222c] p-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff6d5a] to-[#ea4b34] text-white shadow-sm">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              AI Architecture Copilot
            </h3>
            <p className="text-[11px] text-neutral-400">
              System Design & Topology Intelligence
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

      {/* Mode Switcher Tabs */}
      <div className="flex border-b border-[#2c323f] bg-[#161921] px-4 pt-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab("review")}
          className={`flex items-center gap-1.5 border-b-2 px-4 py-2 transition ${
            activeTab === "review"
              ? "border-[#ff6d5a] text-white"
              : "border-transparent text-neutral-400 hover:text-neutral-200"
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>System Audit</span>
        </button>

        <button
          onClick={() => setActiveTab("chat")}
          className={`flex items-center gap-1.5 border-b-2 px-4 py-2 transition ${
            activeTab === "chat"
              ? "border-[#ff6d5a] text-white"
              : "border-transparent text-neutral-400 hover:text-neutral-200"
          }`}
        >
          <Bot className="h-3.5 w-3.5" />
          <span>Copilot Q&A</span>
        </button>
      </div>

      {/* Tab: Architectural Review */}
      {activeTab === "review" && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {!reviewResult && !isLoadingReview && (
            <div className="rounded-2xl border border-[#2c3442] bg-[#1a1f29] p-6 text-center">
              <Sparkles className="mx-auto h-10 w-10 text-[#ff6d5a]" />
              <h4 className="mt-3 text-sm font-bold text-white">
                Deep-Dive Architecture Audit
              </h4>
              <p className="mt-1 text-xs text-neutral-400">
                Let AI evaluate scalability bottlenecks, security boundaries, maintenance overhead, and operational costs for your selected {selectedTechs.length} technologies.
              </p>
              <button
                onClick={handleRunReview}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#ff6d5a] to-[#ea4b34] px-4 py-2 text-xs font-bold text-white shadow-md shadow-[#ff6d5a]/25 hover:from-[#ff5540] hover:to-[#d83f2a] transition"
              >
                <Sparkles className="h-4 w-4" />
                <span>Run System Audit</span>
              </button>
            </div>
          )}

          {isLoadingReview && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#ff6d5a]" />
              <p className="mt-3 text-xs font-semibold text-white">
                Evaluating system architecture against enterprise patterns...
              </p>
              <p className="mt-1 text-[11px] text-neutral-400">
                Analyzing data flows, caching boundaries, and security attack surfaces.
              </p>
            </div>
          )}

          {reviewError && (
            <div className="rounded-xl border border-rose-900/50 bg-rose-950/40 p-4 text-rose-300">
              <p className="font-semibold">Review Error</p>
              <p className="mt-1 text-[11px]">{reviewError}</p>
              <button
                onClick={handleRunReview}
                className="mt-2 text-xs font-bold text-rose-400 underline"
              >
                Retry Audit
              </button>
            </div>
          )}

          {reviewResult && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  Audit Report
                </span>
                <button
                  onClick={handleRunReview}
                  className="flex items-center gap-1 text-[11px] font-semibold text-[#ff8a7a] hover:underline"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Re-audit</span>
                </button>
              </div>

              {/* Executive Summary */}
              <div className="rounded-xl border border-[#343e4f] bg-[#1d222c] p-3.5">
                <h5 className="font-bold text-[#ff8a7a]">
                  Executive Summary
                </h5>
                <p className="mt-1 leading-relaxed text-neutral-300">
                  {reviewResult.summary}
                </p>
              </div>

              {/* Strengths */}
              <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-3.5">
                <h5 className="flex items-center gap-1.5 font-bold text-emerald-400">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Key Strengths</span>
                </h5>
                <ul className="mt-2 space-y-1.5 text-neutral-300">
                  {reviewResult.strengths.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Potential Risks & Bottlenecks */}
              <div className="rounded-xl border border-amber-900/40 bg-amber-950/20 p-3.5">
                <h5 className="flex items-center gap-1.5 font-bold text-amber-400">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <span>Scaling Risks & Bottlenecks</span>
                </h5>
                <ul className="mt-2 space-y-1.5 text-neutral-300">
                  {reviewResult.risks.map((r, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Security Considerations */}
              <div className="rounded-xl border border-[#2c3442] bg-[#1d222c] p-3.5">
                <h5 className="flex items-center gap-1.5 font-bold text-white">
                  <ShieldCheck className="h-4 w-4 text-[#ff6d5a]" />
                  <span>Security & Compliance</span>
                </h5>
                <ul className="mt-2 space-y-1.5 text-neutral-300">
                  {reviewResult.securityNotes.map((sec, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-[#ff6d5a] font-bold">•</span>
                      <span>{sec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cost Assessment */}
              <div className="rounded-xl border border-[#2c3442] bg-[#1d222c] p-3.5">
                <h5 className="flex items-center gap-1.5 font-bold text-white">
                  <DollarSign className="h-4 w-4 text-emerald-400" />
                  <span>Cost & Operational Profile</span>
                </h5>
                <p className="mt-1 leading-relaxed text-neutral-300">
                  {reviewResult.costAssessment}
                </p>
              </div>

              {/* Recommendations */}
              <div>
                <h5 className="font-bold text-white">
                  Recommended Next Steps
                </h5>
                <ul className="mt-2 space-y-1.5">
                  {reviewResult.recommendations.map((rec, idx) => (
                    <li
                      key={idx}
                      className="rounded-xl border border-[#2c3442] bg-[#1a1f29] p-2.5 text-neutral-300"
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
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#ff6d5a] text-white">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl p-3 leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-[#ff6d5a] text-white"
                      : "border border-[#2c3442] bg-[#1d222c] text-neutral-200"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
                {msg.sender === "user" && (
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#2c3442] text-white">
                    <User className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>
            ))}
            {isAsking && (
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#ff6d5a]" />
                <span>Copilot is reasoning...</span>
              </div>
            )}
          </div>

          {/* Prompt input */}
          <form
            onSubmit={handleSendMessage}
            className="border-t border-[#2c323f] bg-[#181c24] p-3"
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={questionInput}
                onChange={(e) => setQuestionInput(e.target.value)}
                placeholder="Ask about Redis caching, Clerk webhooks, DB scaling..."
                disabled={isAsking}
                className="flex-1 rounded-xl border border-[#343d4d] bg-[#13161c] px-3 py-2 text-xs text-white placeholder:text-neutral-400 focus:border-[#ff6d5a] focus:bg-[#1a1f29] focus:outline-none"
              />
              <button
                type="submit"
                disabled={!questionInput.trim() || isAsking}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-r from-[#ff6d5a] to-[#ea4b34] text-white transition hover:from-[#ff5540] hover:to-[#d83f2a] disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
