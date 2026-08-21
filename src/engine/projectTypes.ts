/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProjectType, TechCategory } from "../types";

export interface ProjectTypeMeta {
  type: ProjectType;
  label: string;
  tagline: string;
  icon: string;
  accentColor: string;
}

export const PROJECT_TYPE_META: ProjectTypeMeta[] = [
  { type: "saas", label: "SaaS / B2B App", tagline: "Subscriptions, workspaces, team accounts", icon: "Layers", accentColor: "#6366f1" },
  { type: "ai_app", label: "AI / LLM App", tagline: "RAG, embeddings, model inference", icon: "Sparkles", accentColor: "#a855f7" },
  { type: "mobile", label: "Mobile App", tagline: "iOS, Android, cross-platform", icon: "Smartphone", accentColor: "#0ea5e9" },
  { type: "ecommerce", label: "E-Commerce", tagline: "Checkout, catalog, instant search", icon: "ShoppingCart", accentColor: "#2fa876" },
  { type: "marketplace", label: "Marketplace", tagline: "Two-sided buyers, sellers, payouts", icon: "Store", accentColor: "#c9a227" },
  { type: "realtime", label: "Real-Time App", tagline: "Live sync, sockets, collaboration", icon: "Zap", accentColor: "#d99a2b" },
  { type: "microservices", label: "Microservices", tagline: "Decoupled services, event bus", icon: "Network", accentColor: "#e2574c" },
  { type: "api", label: "API / Backend", tagline: "REST or GraphQL service, no UI", icon: "Server", accentColor: "#3a93b8" },
  { type: "web", label: "Website", tagline: "Content site or simple web app", icon: "Globe", accentColor: "#8c8163" },
];

/**
 * The step-by-step layers offered per project type, in the order they're
 * asked. Each layer is either required (must pick at least one technology
 * to continue) or optional (can be skipped).
 */
export interface WizardLayer {
  category: TechCategory;
  required: boolean;
}

const CORE_CLIENT: WizardLayer = { category: "frontend", required: true };
const CORE_MOBILE: WizardLayer = { category: "mobile", required: true };
const CORE_BACKEND: WizardLayer = { category: "backend", required: true };
const CORE_DATABASE: WizardLayer = { category: "database", required: true };
const CORE_AUTH: WizardLayer = { category: "auth", required: false };
const CORE_DEPLOY: WizardLayer = { category: "deployment", required: false };

export const WIZARD_RECIPES: Record<ProjectType, WizardLayer[]> = {
  saas: [CORE_CLIENT, CORE_BACKEND, CORE_DATABASE, CORE_AUTH, { category: "payments", required: false }, CORE_DEPLOY],
  ai_app: [CORE_CLIENT, CORE_BACKEND, CORE_DATABASE, { category: "ai_llm", required: true }, CORE_AUTH, CORE_DEPLOY],
  mobile: [CORE_MOBILE, CORE_BACKEND, CORE_DATABASE, CORE_AUTH, CORE_DEPLOY],
  ecommerce: [CORE_CLIENT, CORE_BACKEND, CORE_DATABASE, { category: "payments", required: true }, { category: "search", required: false }, CORE_DEPLOY],
  marketplace: [CORE_CLIENT, CORE_BACKEND, CORE_DATABASE, { category: "auth", required: true }, { category: "payments", required: true }, { category: "search", required: false }, CORE_DEPLOY],
  realtime: [CORE_CLIENT, CORE_BACKEND, CORE_DATABASE, { category: "messaging", required: false }, { category: "cache", required: false }, CORE_DEPLOY],
  microservices: [CORE_BACKEND, CORE_DATABASE, { category: "messaging", required: true }, { category: "monitoring", required: false }, CORE_DEPLOY],
  api: [CORE_BACKEND, CORE_DATABASE, CORE_AUTH, { category: "cache", required: false }, CORE_DEPLOY],
  web: [CORE_CLIENT, { category: "backend", required: false }, { category: "database", required: false }, CORE_DEPLOY],
};

export function getWizardLayers(type: ProjectType): WizardLayer[] {
  return WIZARD_RECIPES[type] || WIZARD_RECIPES.saas;
}
