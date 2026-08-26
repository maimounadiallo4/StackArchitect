export type ProjectType =
  | "saas"
  | "web"
  | "mobile"
  | "api"
  | "ecommerce"
  | "ai_app"
  | "realtime"
  | "marketplace"
  | "microservices";

export interface ProjectConfig {
  id: string;
  name: string;
  type: ProjectType;
  description: string;
  expectedTraffic: "low" | "medium" | "high" | "enterprise";
  teamExperience: "junior" | "intermediate" | "senior";
  budgetConstraint: "free_tier" | "moderate" | "scale_ready";
}

export type TechCategory =
  | "frontend"
  | "backend"
  | "mobile"
  | "database"
  | "auth"
  | "cache"
  | "storage"
  | "payments"
  | "messaging"
  | "ai_llm"
  | "search"
  | "monitoring"
  | "deployment"
  | "cicd"
  | "communication";

export type ArchitectureTier =
  | "actor"
  | "client"
  | "edge"
  | "api"
  | "compute"
  | "data"
  | "cache"
  | "async"
  | "external"
  | "observability"
  | "infrastructure";

export type DeploymentZone =
  | "Client Device / User Tier"
  | "Edge / CDN Network"
  | "Cloud Ingress / API Gateway"
  | "Compute / VPC Cluster"
  | "Managed Cloud Data"
  | "External SaaS / APIs"
  | "DevOps & CI/CD Pipeline";

export type ProtocolType =
  | "HTTPS / REST"
  | "GraphQL"
  | "gRPC"
  | "WebSocket"
  | "TCP / Connection Pool"
  | "SQL / Wire Protocol"
  | "Redis Protocol (RESP)"
  | "AMQP / Kafka Protocol"
  | "Signed HTTPS / S3 API"
  | "OIDC / OAuth 2.0"
  | "Webhook (HTTPS POST)"
  | "SDK / Internal RPC"
  | "OpenTelemetry / gRPC";

export interface LocalizedText {
  en: string;
  fr: string;
}

export interface Technology {
  id: string;
  name: string;
  category: TechCategory;
  tier: ArchitectureTier;
  description: LocalizedText;
  tagline: LocalizedText;
  badgeColor: string; // Tailwind color or hex
  accentColor: string;
  iconName: string; // lucide icon identifier
  roleInArchitecture: string;
  defaultDeploymentZone: DeploymentZone;
  supportedProtocols: ProtocolType[];
  typicalOutboundTo: TechCategory[]; // Which categories this tech naturally talks to
  dependencies?: string[]; // IDs or Category requirements
  conflictsWith?: string[]; // Redundant / conflicting tech IDs
  bestFor: string[];
  pricingModel: "Open Source" | "Freemium" | "Managed SaaS" | "Cloud Resource";
  documentationUrl: string;
}

export type ViewLevel = "overview" | "system" | "detailed" | "deployment";

export type EdgeFlowNature = "sync" | "async" | "bidirectional" | "event" | "webhook" | "telemetry";

export interface ArchitectureEdge {
  id: string;
  source: string; // Node ID
  target: string; // Node ID
  label: string;
  protocol: ProtocolType;
  nature: EdgeFlowNature;
  description: string;
  isOptional?: boolean;
  highlighted?: boolean;
}

export interface ArchitectureNode {
  id: string;
  techId?: string;
  title: string;
  subtitle: string;
  category: TechCategory | "actor" | "gateway";
  tier: ArchitectureTier;
  deploymentZone: DeploymentZone;
  iconName: string;
  accentColor: string;
  badgeColor: string;
  description: string;
  x: number;
  y: number;
  width: number;
  height: number;
  metadata?: Record<string, any>;
  tags: string[];
}

export type LaneKey = "actors" | "client" | "backend" | "data" | "external" | "infrastructure";

export interface ArchitectureZone {
  id: string;
  /** English fallback title (also used by non-React consumers like SVG/PNG export). */
  title: string;
  /** Stable key for UI-layer i18n lookup, set for system-view lanes only. */
  laneKey?: LaneKey;
  deploymentZone?: DeploymentZone;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  nodeIds: string[];
}

export interface ArchitectureModel {
  project: ProjectConfig;
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
  zones: ArchitectureZone[];
  selectedTechs: Technology[];
  stats: {
    totalComponents: number;
    totalConnections: number;
    dataStoresCount: number;
    externalServicesCount: number;
    estimatedComplexity: "Simple" | "Moderate" | "Complex" | "Enterprise Distributed";
  };
}

export type IssueSeverity = "error" | "warning" | "suggestion";

export interface ValidationIssue {
  id: string;
  severity: IssueSeverity;
  title: string;
  message: string;
  affectedTechIds: string[];
  recommendation: string;
  /** Interpolation values for the localized copy in translations.ts (see `validationMessages`). */
  values?: Record<string, string>;
  autoFixAction?: {
    type: "add_tech" | "remove_tech" | "replace_tech";
    techId: string;
    label: string;
  };
}

export interface StackPreset {
  id: string;
  name: string;
  badge: string;
  description: string;
  projectType: ProjectType;
  techIds: string[];
  highlights: string[];
}


