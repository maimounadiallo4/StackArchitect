import {
  ProjectConfig,
  Technology,
  ArchitectureModel,
  ArchitectureNode,
  ArchitectureEdge,
  ArchitectureZone,
  ViewLevel,
  DeploymentZone,
  LaneKey,
} from "../types";
import { TECH_BY_ID } from "./catalog";
import { ARCHITECTURAL_RULES } from "./rules";

export interface GenerateArchitectureOptions {
  project: ProjectConfig;
  selectedTechIds?: string[];
  selectedTechs?: Technology[];
  viewLevel?: ViewLevel;
  customPositions?: Record<string, { x: number; y: number }>;
}

export function generateArchitectureModel(
  optionsOrProject: GenerateArchitectureOptions | ProjectConfig,
  selectedTechsOrIds?: Technology[] | string[],
  viewLevelArg: ViewLevel = "system",
  customPositionsArg: Record<string, { x: number; y: number }> = {}
): ArchitectureModel {
  let project: ProjectConfig;
  let selectedTechs: Technology[];
  let viewLevel: ViewLevel = "system";
  let customPositions: Record<string, { x: number; y: number }> = {};

  if ("name" in optionsOrProject && "type" in optionsOrProject && Array.isArray(selectedTechsOrIds)) {
    // Positional call
    project = optionsOrProject;
    viewLevel = viewLevelArg;
    customPositions = customPositionsArg;
    if (selectedTechsOrIds.length > 0 && typeof selectedTechsOrIds[0] === "string") {
      selectedTechs = (selectedTechsOrIds as string[])
        .map((id) => TECH_BY_ID.get(id))
        .filter((t): t is Technology => Boolean(t));
    } else {
      selectedTechs = selectedTechsOrIds as Technology[];
    }
  } else {
    // Options object call
    const opts = optionsOrProject as GenerateArchitectureOptions;
    project = opts.project;
    viewLevel = opts.viewLevel || "system";
    customPositions = opts.customPositions || {};
    if (opts.selectedTechs && opts.selectedTechs.length > 0) {
      selectedTechs = opts.selectedTechs;
    } else if (opts.selectedTechIds) {
      selectedTechs = opts.selectedTechIds
        .map((id) => TECH_BY_ID.get(id))
        .filter((t): t is Technology => Boolean(t));
    } else {
      selectedTechs = [];
    }
  }

  const hasFrontend = selectedTechs.some((t) => t.category === "frontend");
  const hasMobile = selectedTechs.some((t) => t.category === "mobile");
  const hasBackend = selectedTechs.some((t) => t.category === "backend");

  const nodes: ArchitectureNode[] = [];
  const edges: ArchitectureEdge[] = [];

  // --- 1. Synthesize Actor Nodes based on Project Type and Clients ---
  if (viewLevel !== "deployment") {
    if (hasFrontend || project.type === "web" || project.type === "saas" || project.type === "ecommerce") {
      nodes.push({
        id: "actor_web_user",
        title: "Web User",
        subtitle: "Web Browser Client",
        category: "actor",
        tier: "actor",
        deploymentZone: "Client Device / User Tier",
        iconName: "User",
        accentColor: "#3b82f6",
        badgeColor: "bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-800 dark:text-blue-400",
        description: "End user navigating web client via desktop or mobile browser.",
        x: 60,
        y: 120,
        width: 190,
        height: 80,
        tags: ["Actor", "Browser"],
      });
    }

    if (hasMobile || project.type === "mobile") {
      nodes.push({
        id: "actor_mobile_user",
        title: "Mobile User",
        subtitle: "iOS / Android Device",
        category: "actor",
        tier: "actor",
        deploymentZone: "Client Device / User Tier",
        iconName: "Smartphone",
        accentColor: "#8b5cf6",
        badgeColor: "bg-violet-500/10 text-violet-600 border-violet-200 dark:border-violet-800 dark:text-violet-400",
        description: "Mobile app user interacting with native gesture UI.",
        x: 60,
        y: 280,
        width: 190,
        height: 80,
        tags: ["Actor", "Mobile"],
      });
    }
  }

  // --- 2. Filter Techs according to View Level ---
  let activeTechs = [...selectedTechs];
  if (viewLevel === "overview") {
    // Overview focuses on core tiers: Frontends, Primary Backend, Primary Database, Primary Auth/Payment/AI
    activeTechs = selectedTechs.filter((t) => {
      if (["frontend", "mobile", "backend", "database"].includes(t.category)) return true;
      if (["stripe", "clerk", "gemini", "openai"].includes(t.id)) return true;
      return false;
    });
  }

  // --- 3. Instantiate Nodes for Selected Technologies ---
  activeTechs.forEach((tech) => {
    nodes.push({
      id: `tech_${tech.id}`,
      techId: tech.id,
      title: tech.name,
      subtitle: tech.tagline,
      category: tech.category,
      tier: tech.tier,
      deploymentZone: tech.defaultDeploymentZone,
      iconName: tech.iconName,
      accentColor: tech.accentColor,
      badgeColor: tech.badgeColor,
      description: tech.description,
      x: 0, // Computed by layout engine
      y: 0,
      width: 220,
      height: 96,
      tags: [tech.category, tech.tier, tech.pricingModel],
    });
  });

  // --- 4. Generate Semantic Edges & Connections ---
  // Actor connections
  const webClientNode = nodes.find((n) => n.category === "frontend");
  const mobileClientNode = nodes.find((n) => n.category === "mobile");
  const backendNodes = nodes.filter((n) => n.category === "backend");
  const authNodes = nodes.filter((n) => n.category === "auth");
  const dbNodes = nodes.filter((n) => n.category === "database");
  const cacheNodes = nodes.filter((n) => n.category === "cache");
  const storageNodes = nodes.filter((n) => n.category === "storage");
  const paymentNodes = nodes.filter((n) => n.category === "payments");
  const aiNodes = nodes.filter((n) => n.category === "ai_llm");
  const messagingNodes = nodes.filter((n) => n.category === "messaging");
  const searchNodes = nodes.filter((n) => n.category === "search");
  const monitoringNodes = nodes.filter((n) => n.category === "monitoring");
  const cicdNodes = nodes.filter((n) => n.category === "cicd");
  const deployNodes = nodes.filter((n) => n.category === "deployment");
  const commNodes = nodes.filter((n) => n.category === "communication");

  // Actor -> Frontend / Mobile
  if (nodes.some((n) => n.id === "actor_web_user") && webClientNode) {
    edges.push({
      id: "edge_user_to_web",
      source: "actor_web_user",
      target: webClientNode.id,
      label: "HTTPS / CDN Access",
      protocol: "HTTPS / REST",
      nature: "sync",
      description: "User navigates to web interface over encrypted HTTPS.",
    });
  }

  if (nodes.some((n) => n.id === "actor_mobile_user") && mobileClientNode) {
    edges.push({
      id: "edge_user_to_mobile",
      source: "actor_mobile_user",
      target: mobileClientNode.id,
      label: "Native Touch UI",
      protocol: "HTTPS / REST",
      nature: "sync",
      description: "User opens installed native mobile app.",
    });
  }

  // Frontends -> Backend(s)
  const clientNodes = [webClientNode, mobileClientNode].filter((n): n is ArchitectureNode => Boolean(n));

  clientNodes.forEach((client) => {
    backendNodes.forEach((backend) => {
      edges.push({
        id: `edge_${client.id}_to_${backend.id}`,
        source: client.id,
        target: backend.id,
        label: "REST / JSON API",
        protocol: "HTTPS / REST",
        nature: "sync",
        description: `${client.title} sends authenticated API calls to ${backend.title}.`,
      });
    });
  });

  // Client -> Auth
  clientNodes.forEach((client) => {
    authNodes.forEach((auth) => {
      edges.push({
        id: `edge_${client.id}_to_${auth.id}`,
        source: client.id,
        target: auth.id,
        label: "OAuth / Sign-In Flow",
        protocol: "OIDC / OAuth 2.0",
        nature: "sync",
        description: `${client.title} redirects to ${auth.title} login and acquires JWT access tokens.`,
      });
    });
  });

  // Backend <-> Auth (Webhooks & token validation)
  backendNodes.forEach((backend) => {
    authNodes.forEach((auth) => {
      edges.push({
        id: `edge_${auth.id}_to_${backend.id}`,
        source: auth.id,
        target: backend.id,
        label: "User Webhook Events",
        protocol: "Webhook (HTTPS POST)",
        nature: "webhook",
        description: `${auth.title} notifies ${backend.title} upon user signup / org updates.`,
      });
    });
  });

  // Backend -> Databases
  backendNodes.forEach((backend) => {
    dbNodes.forEach((db) => {
      edges.push({
        id: `edge_${backend.id}_to_${db.id}`,
        source: backend.id,
        target: db.id,
        label: "SQL Queries & Transactions",
        protocol: "SQL / Wire Protocol",
        nature: "sync",
        description: `${backend.title} executes read/write transactions on ${db.title}.`,
      });
    });
  });

  // Edge / SSR Frontend -> Database directly if no standalone backend exists (e.g. Next.js + Postgres)
  if (backendNodes.length === 0 && webClientNode) {
    dbNodes.forEach((db) => {
      edges.push({
        id: `edge_${webClientNode.id}_to_${db.id}`,
        source: webClientNode.id,
        target: db.id,
        label: "Server Actions / DB Pool",
        protocol: "SQL / Wire Protocol",
        nature: "sync",
        description: `${webClientNode.title} queries ${db.title} directly via Server Components / Edge functions.`,
      });
    });
  }

  // Backend -> Cache (Redis)
  backendNodes.forEach((backend) => {
    cacheNodes.forEach((cache) => {
      edges.push({
        id: `edge_${backend.id}_to_${cache.id}`,
        source: backend.id,
        target: cache.id,
        label: "Cache & Rate Limiting",
        protocol: "Redis Protocol (RESP)",
        nature: "sync",
        description: `${backend.title} caches hot database queries and tracks rate limits in ${cache.title}.`,
      });
    });
  });

  // Backend -> Storage (S3 / R2 / GCS)
  backendNodes.forEach((backend) => {
    storageNodes.forEach((storage) => {
      edges.push({
        id: `edge_${backend.id}_to_${storage.id}`,
        source: backend.id,
        target: storage.id,
        label: "Presigned URL Generation",
        protocol: "Signed HTTPS / S3 API",
        nature: "sync",
        description: `${backend.title} signs upload policies and manages media keys in ${storage.title}.`,
      });
    });
  });

  // Client -> Storage (Direct uploads in Detailed view)
  if (viewLevel === "detailed") {
    clientNodes.forEach((client) => {
      storageNodes.forEach((storage) => {
        edges.push({
          id: `edge_${client.id}_to_${storage.id}_upload`,
          source: client.id,
          target: storage.id,
          label: "Direct File Upload",
          protocol: "Signed HTTPS / S3 API",
          nature: "async",
          description: `${client.title} streams large user uploads directly to ${storage.title}.`,
        });
      });
    });
  }

  // Backend <-> Payments (Stripe / Lemon Squeezy)
  backendNodes.forEach((backend) => {
    paymentNodes.forEach((payment) => {
      edges.push({
        id: `edge_${backend.id}_to_${payment.id}`,
        source: backend.id,
        target: payment.id,
        label: "Create Checkout Session",
        protocol: "HTTPS / REST",
        nature: "sync",
        description: `${backend.title} creates checkout sessions and manages customer billing portals in ${payment.title}.`,
      });
      edges.push({
        id: `edge_${payment.id}_to_${backend.id}`,
        source: payment.id,
        target: backend.id,
        label: "Payment Webhooks",
        protocol: "Webhook (HTTPS POST)",
        nature: "webhook",
        description: `${payment.title} sends secure webhook events on invoice and subscription changes.`,
      });
    });
  });

  // Backend -> AI / LLMs (Gemini / OpenAI)
  backendNodes.forEach((backend) => {
    aiNodes.forEach((ai) => {
      if (ai.techId !== "pinecone") {
        edges.push({
          id: `edge_${backend.id}_to_${ai.id}`,
          source: backend.id,
          target: ai.id,
          label: "Inference & Embeddings",
          protocol: "HTTPS / REST",
          nature: "sync",
          description: `${backend.title} streams prompts and structured JSON generations from ${ai.title}.`,
        });
      }
    });
  });

  // AI <-> Vector DB (Pinecone)
  const pineconeNode = aiNodes.find((n) => n.techId === "pinecone");
  const aiLLMNodes = aiNodes.filter((n) => n.techId !== "pinecone");
  if (pineconeNode && (aiLLMNodes.length > 0 || backendNodes.length > 0)) {
    const sourceNode = backendNodes[0] || aiLLMNodes[0];
    if (sourceNode) {
      edges.push({
        id: `edge_${sourceNode.id}_to_${pineconeNode.id}`,
        source: sourceNode.id,
        target: pineconeNode.id,
        label: "Vector Similarity Query (RAG)",
        protocol: "HTTPS / REST",
        nature: "sync",
        description: `${sourceNode.title} queries high-dimensional embeddings in ${pineconeNode.title} for semantic search.`,
      });
    }
  }

  // Backend <-> Messaging (RabbitMQ / Kafka / SQS)
  backendNodes.forEach((backend) => {
    messagingNodes.forEach((msg) => {
      edges.push({
        id: `edge_${backend.id}_to_${msg.id}`,
        source: backend.id,
        target: msg.id,
        label: "Enqueue Task / Publish Event",
        protocol: "AMQP / Kafka Protocol",
        nature: "event",
        description: `${backend.title} dispatches async jobs and domain events to ${msg.title}.`,
      });
      if (viewLevel === "detailed") {
        edges.push({
          id: `edge_${msg.id}_to_${backend.id}_worker`,
          source: msg.id,
          target: backend.id,
          label: "Async Worker Consume",
          protocol: "AMQP / Kafka Protocol",
          nature: "event",
          description: `Background worker instances consume and process messages from ${msg.title}.`,
        });
      }
    });
  });

  // Backend -> Search (Sync index)
  backendNodes.forEach((backend) => {
    searchNodes.forEach((search) => {
      edges.push({
        id: `edge_${backend.id}_to_${search.id}`,
        source: backend.id,
        target: search.id,
        label: "Sync & Reindex Documents",
        protocol: "HTTPS / REST",
        nature: "sync",
        description: `${backend.title} synchronizes database mutations to ${search.title} index.`,
      });
    });
  });

  // Frontend -> Hosted Search (Algolia)
  if (webClientNode) {
    const algoliaNode = searchNodes.find((n) => n.techId === "algolia" || n.techId === "meilisearch");
    if (algoliaNode) {
      edges.push({
        id: `edge_${webClientNode.id}_to_${algoliaNode.id}`,
        source: webClientNode.id,
        target: algoliaNode.id,
        label: "Instant Search Query (<50ms)",
        protocol: "HTTPS / REST",
        nature: "sync",
        description: `${webClientNode.title} queries instant search index directly with read-only search key.`,
      });
    }
  }

  // Backend -> Communication (Resend / Twilio)
  backendNodes.forEach((backend) => {
    commNodes.forEach((comm) => {
      edges.push({
        id: `edge_${backend.id}_to_${comm.id}`,
        source: backend.id,
        target: comm.id,
        label: "Send Email / SMS Dispatch",
        protocol: "HTTPS / REST",
        nature: "async",
        description: `${backend.title} triggers transactional notification messages via ${comm.title}.`,
      });
    });
  });

  // Telemetry: Frontend & Backend -> Monitoring
  if (viewLevel === "detailed" || viewLevel === "system") {
    monitoringNodes.forEach((mon) => {
      if (webClientNode) {
        edges.push({
          id: `edge_${webClientNode.id}_to_${mon.id}`,
          source: webClientNode.id,
          target: mon.id,
          label: "Client Telemetry / Sentry",
          protocol: "HTTPS / REST",
          nature: "telemetry",
          description: `${webClientNode.title} sends error breadcrumbs and web vitals to ${mon.title}.`,
        });
      }
      backendNodes.forEach((backend) => {
        edges.push({
          id: `edge_${backend.id}_to_${mon.id}`,
          source: backend.id,
          target: mon.id,
          label: "APM Traces & Metrics",
          protocol: "HTTPS / REST",
          nature: "telemetry",
          description: `${backend.title} reports distributed tracing and exception logs to ${mon.title}.`,
        });
      });
    });
  }

  // CI/CD -> Deployment
  if (viewLevel === "detailed" || viewLevel === "deployment") {
    cicdNodes.forEach((cicd) => {
      deployNodes.forEach((dep) => {
        edges.push({
          id: `edge_${cicd.id}_to_${dep.id}`,
          source: cicd.id,
          target: dep.id,
          label: "Automated Build & Deploy",
          protocol: "HTTPS / REST",
          nature: "async",
          description: `${cicd.title} builds container images and rolls out releases to ${dep.title}.`,
        });
      });
    });
  }

  // --- 5. Compute Layout Coordinates ---
  // Tier-based column layout:
  // Col 0 (x: 60): Actors
  // Col 1 (x: 320): Client / Frontend / Mobile
  // Col 2 (x: 620): Edge Gateway & Backend APIs
  // Col 3 (x: 940): Primary Databases, Caches & Queues
  // Col 4 (x: 1260): External SaaS (Auth, Payments, AI, Storage, Comm)
  // Col 5 (x: 1560): Monitoring, CI/CD, Deployment

  if (viewLevel === "deployment") {
    // Organize by Deployment Zones
    layoutDeploymentView(nodes, customPositions);
  } else {
    layoutSystemView(nodes, customPositions);
  }

  // --- 6. Build Zones for visual boundary grouping ---
  const zones = computeZones(nodes, viewLevel);

  // --- 7. Calculate Statistics ---
  const dataStoresCount = nodes.filter((n) => n.category === "database" || n.category === "cache" || n.techId === "pinecone").length;
  const externalServicesCount = nodes.filter((n) => ["auth", "payments", "ai_llm", "communication", "storage"].includes(n.category)).length;

  let estimatedComplexity: ArchitectureModel["stats"]["estimatedComplexity"] = "Simple";
  if (nodes.length > 10 || edges.length > 12) {
    estimatedComplexity = "Enterprise Distributed";
  } else if (nodes.length > 6 || edges.length > 7) {
    estimatedComplexity = "Complex";
  } else if (nodes.length > 3) {
    estimatedComplexity = "Moderate";
  }

  return {
    project,
    nodes,
    edges,
    zones,
    selectedTechs,
    stats: {
      totalComponents: nodes.length,
      totalConnections: edges.length,
      dataStoresCount,
      externalServicesCount,
      estimatedComplexity,
    },
  };
}

function layoutSystemView(
  nodes: ArchitectureNode[],
  customPositions: Record<string, { x: number; y: number }>
) {
  // Columns by tier
  const columns: { [colIndex: number]: ArchitectureNode[] } = {
    0: [], // Actors
    1: [], // Clients (Web / Mobile)
    2: [], // APIs / Backends
    3: [], // Data & Caches & Queues
    4: [], // External SaaS (Auth, Payments, AI, Storage)
    5: [], // Observability & Infra
  };

  nodes.forEach((node) => {
    if (node.category === "actor") {
      columns[0].push(node);
    } else if (node.category === "frontend" || node.category === "mobile") {
      columns[1].push(node);
    } else if (node.category === "backend") {
      columns[2].push(node);
    } else if (node.category === "database" || node.category === "cache" || node.category === "messaging" || node.category === "search" || node.techId === "pinecone") {
      columns[3].push(node);
    } else if (["auth", "payments", "ai_llm", "storage", "communication"].includes(node.category)) {
      columns[4].push(node);
    } else {
      columns[5].push(node);
    }
  });

  const columnXOffsets = [60, 320, 620, 940, 1260, 1560];
  const nodeHeightWithGap = 130;

  Object.entries(columns).forEach(([colKey, colNodes]) => {
    const colIndex = Number(colKey);
    const xBase = columnXOffsets[colIndex] || 60 + colIndex * 300;

    colNodes.forEach((node, index) => {
      // Check for user-dragged position override
      if (customPositions[node.id]) {
        node.x = customPositions[node.id].x;
        node.y = customPositions[node.id].y;
      } else {
        node.x = xBase;
        node.y = 80 + index * nodeHeightWithGap;
      }
    });
  });
}

function layoutDeploymentView(
  nodes: ArchitectureNode[],
  customPositions: Record<string, { x: number; y: number }>
) {
  // Zone grouping
  const zonesMap: Record<DeploymentZone, ArchitectureNode[]> = {
    "Client Device / User Tier": [],
    "Edge / CDN Network": [],
    "Cloud Ingress / API Gateway": [],
    "Compute / VPC Cluster": [],
    "Managed Cloud Data": [],
    "External SaaS / APIs": [],
    "DevOps & CI/CD Pipeline": [],
  };

  nodes.forEach((node) => {
    const zone = node.deploymentZone || "Compute / VPC Cluster";
    if (!zonesMap[zone]) {
      zonesMap[zone] = [];
    }
    zonesMap[zone].push(node);
  });

  const zoneConfigs: { zone: DeploymentZone; x: number; y: number; cols: number }[] = [
    { zone: "Client Device / User Tier", x: 60, y: 80, cols: 1 },
    { zone: "Edge / CDN Network", x: 340, y: 80, cols: 1 },
    { zone: "Compute / VPC Cluster", x: 640, y: 80, cols: 2 },
    { zone: "Managed Cloud Data", x: 1140, y: 80, cols: 2 },
    { zone: "External SaaS / APIs", x: 1640, y: 80, cols: 2 },
    { zone: "DevOps & CI/CD Pipeline", x: 640, y: 560, cols: 3 },
  ];

  zoneConfigs.forEach((config) => {
    const zoneNodes = zonesMap[config.zone] || [];
    zoneNodes.forEach((node, idx) => {
      if (customPositions[node.id]) {
        node.x = customPositions[node.id].x;
        node.y = customPositions[node.id].y;
      } else {
        const col = idx % config.cols;
        const row = Math.floor(idx / config.cols);
        node.x = config.x + col * 240;
        node.y = config.y + 50 + row * 125;
      }
    });
  });
}

function computeZones(nodes: ArchitectureNode[], viewLevel: ViewLevel): ArchitectureZone[] {
  if (viewLevel !== "deployment") {
    return computeSystemLanes(nodes);
  }

  const zoneMap = new Map<DeploymentZone, ArchitectureNode[]>();
  nodes.forEach((node) => {
    const z = node.deploymentZone;
    if (!zoneMap.has(z)) zoneMap.set(z, []);
    zoneMap.get(z)!.push(node);
  });

  const zones: ArchitectureZone[] = [];
  const colors: Record<DeploymentZone, string> = {
    "Client Device / User Tier": "#3b82f6",
    "Edge / CDN Network": "#06b6d4",
    "Cloud Ingress / API Gateway": "#6366f1",
    "Compute / VPC Cluster": "#10b981",
    "Managed Cloud Data": "#f59e0b",
    "External SaaS / APIs": "#ec4899",
    "DevOps & CI/CD Pipeline": "#8b5cf6",
  };

  zoneMap.forEach((zoneNodes, zoneName) => {
    if (zoneNodes.length === 0) return;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    zoneNodes.forEach((node) => {
      minX = Math.min(minX, node.x);
      minY = Math.min(minY, node.y);
      maxX = Math.max(maxX, node.x + node.width);
      maxY = Math.max(maxY, node.y + node.height);
    });

    const padding = 24;
    zones.push({
      id: `zone_${zoneName.replace(/\s+/g, "_").toLowerCase()}`,
      title: zoneName,
      deploymentZone: zoneName,
      x: minX - padding,
      y: minY - padding - 20,
      width: Math.max(280, maxX - minX + padding * 2),
      height: Math.max(160, maxY - minY + padding * 2 + 20),
      color: colors[zoneName] || "#64748b",
      nodeIds: zoneNodes.map((n) => n.id),
    });
  });

  return zones;
}

/**
 * Frames each tier column from `layoutSystemView` in a labeled lane, so the
 * diagram reads as a structured layered architecture rather than a loose
 * scatter of cards. Mirrors the exact column classification used there.
 */
function computeSystemLanes(nodes: ArchitectureNode[]): ArchitectureZone[] {
  const columns: { key: LaneKey; title: string; color: string; nodes: ArchitectureNode[] }[] = [
    { key: "actors", title: "Actors", color: "#3a93b8", nodes: [] },
    { key: "client", title: "Client / Frontend", color: "#c9a227", nodes: [] },
    { key: "backend", title: "Backend & APIs", color: "#2fa876", nodes: [] },
    { key: "data", title: "Data & Queues", color: "#d99a2b", nodes: [] },
    { key: "external", title: "External Services", color: "#a855f7", nodes: [] },
    { key: "infrastructure", title: "Infrastructure", color: "#6b7280", nodes: [] },
  ];

  nodes.forEach((node) => {
    if (node.category === "actor") {
      columns[0].nodes.push(node);
    } else if (node.category === "frontend" || node.category === "mobile") {
      columns[1].nodes.push(node);
    } else if (node.category === "backend") {
      columns[2].nodes.push(node);
    } else if (node.category === "database" || node.category === "cache" || node.category === "messaging" || node.category === "search" || node.techId === "pinecone") {
      columns[3].nodes.push(node);
    } else if (["auth", "payments", "ai_llm", "storage", "communication"].includes(node.category)) {
      columns[4].nodes.push(node);
    } else {
      columns[5].nodes.push(node);
    }
  });

  const padding = 28;
  const labelHeight = 34;

  return columns
    .filter((col) => col.nodes.length > 0)
    .map((col) => {
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;

      col.nodes.forEach((node) => {
        minX = Math.min(minX, node.x);
        minY = Math.min(minY, node.y);
        maxX = Math.max(maxX, node.x + node.width);
        maxY = Math.max(maxY, node.y + node.height);
      });

      return {
        id: `lane_${col.key}`,
        title: col.title,
        laneKey: col.key,
        x: minX - padding,
        y: minY - padding - labelHeight,
        width: maxX - minX + padding * 2,
        height: maxY - minY + padding * 2 + labelHeight,
        color: col.color,
        nodeIds: col.nodes.map((n) => n.id),
      };
    });
}
