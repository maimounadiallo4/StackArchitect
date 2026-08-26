import { ProjectConfig, Technology, ValidationIssue } from "../types";

export function validateArchitecture(
  project: ProjectConfig,
  selectedTechs: Technology[]
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const selectedIds = new Set(selectedTechs.map((t) => t.id));
  const categories = new Set(selectedTechs.map((t) => t.category));

  const hasFrontend = categories.has("frontend");
  const hasMobile = categories.has("mobile");
  const hasBackend = categories.has("backend");
  const hasDatabase = categories.has("database");
  const hasAuth = categories.has("auth");
  const hasPayments = categories.has("payments");
  const hasCache = categories.has("cache");
  const hasStorage = categories.has("storage");
  const hasAI = categories.has("ai_llm");
  const hasMessaging = categories.has("messaging");
  const hasSearch = categories.has("search");
  const hasMonitoring = categories.has("monitoring");
  const hasCicd = categories.has("cicd");
  const hasDeploy = categories.has("deployment");

  // Check if frontend has SSR / Server capabilities
  const isFullstackFrontend =
    selectedIds.has("nextjs") ||
    selectedIds.has("sveltekit") ||
    selectedIds.has("remix") ||
    selectedIds.has("nuxt");

  const hasServerCapability = hasBackend || isFullstackFrontend;

  // 1. Critical: Payments selected without backend for webhooks
  if (hasPayments && !hasServerCapability) {
    issues.push({
      id: "err_payments_no_backend",
      severity: "error",
      title: "Missing Server for Payment Webhooks",
      message:
        "Payment providers like Stripe or Lemon Squeezy require a backend API to safely store API secrets, create checkout sessions, and receive asynchronous payment webhooks.",
      affectedTechIds: selectedTechs.filter((t) => t.category === "payments").map((t) => t.id),
      recommendation: "Add a backend service like FastAPI, NestJS, or Next.js to handle payment webhooks securely.",
      autoFixAction: {
        type: "add_tech",
        techId: "fastapi",
        label: "Add FastAPI Backend",
      },
    });
  }

  // 2. Critical: Client-only SPA connected directly to Database without Backend or BaaS
  if (hasFrontend && !isFullstackFrontend && !hasBackend && hasDatabase && !selectedIds.has("supabase_db")) {
    issues.push({
      id: "err_spa_direct_db",
      severity: "error",
      title: "Direct Client-to-Database Connection Anti-Pattern",
      message:
        "Connecting a browser SPA (such as React or Vue) directly to a relational database (PostgreSQL/MySQL) leaks database credentials to the public internet.",
      affectedTechIds: selectedTechs.filter((t) => t.category === "database").map((t) => t.id),
      recommendation:
        "Introduce an API backend (e.g. FastAPI, NestJS) or switch to a Backend-as-a-Service with Row Level Security (e.g. Supabase).",
      autoFixAction: {
        type: "add_tech",
        techId: "nestjs",
        label: "Add NestJS API Gateway",
      },
    });
  }

  // 3. Warning: Redis / Cache selected but no backend to manage it
  if (hasCache && !hasServerCapability) {
    issues.push({
      id: "warn_redis_no_backend",
      severity: "warning",
      title: "Unused In-Memory Cache Tier",
      message:
        "Redis / Dragonfly is selected, but no backend service exists to handle cache read/write operations or session state.",
      affectedTechIds: selectedTechs.filter((t) => t.category === "cache").map((t) => t.id),
      recommendation: "Attach a backend service or remove the cache layer if building a static/edge frontend.",
      autoFixAction: {
        type: "add_tech",
        techId: "fastapi",
        label: "Add FastAPI Service",
      },
    });
  }

  // 4. Warning: SaaS or E-commerce without Database
  if (["saas", "ecommerce", "marketplace"].includes(project.type) && !hasDatabase) {
    issues.push({
      id: "warn_saas_no_db",
      severity: "warning",
      title: "Missing Primary Database for Transactional SaaS",
      message:
        `Projects of type "${project.type.toUpperCase()}" require a reliable persistent database for user records, orders, subscriptions, and transactions.`,
      affectedTechIds: [],
      recommendation: "Add PostgreSQL or Supabase for relational data consistency.",
      values: { projectType: project.type.toUpperCase() },
      autoFixAction: {
        type: "add_tech",
        techId: "postgresql",
        label: "Add PostgreSQL Database",
      },
    });
  }

  // 5. Warning: Multiple Redundant Auth Providers
  const authTechs = selectedTechs.filter((t) => t.category === "auth");
  if (authTechs.length > 1) {
    issues.push({
      id: "warn_duplicate_auth",
      severity: "warning",
      title: "Multiple Authentication Providers Detected",
      message: `You have selected multiple auth providers (${authTechs.map((t) => t.name).join(", ")}). Running multiple auth systems simultaneously causes identity fragmentation unless using an enterprise federation bridge.`,
      affectedTechIds: authTechs.map((t) => t.id),
      recommendation: `Choose one primary identity provider (e.g. ${authTechs[0].name}) to simplify user session management.`,
      values: { authNames: authTechs.map((t) => t.name).join(", "), primaryAuthName: authTechs[0].name },
    });
  }

  // 6. Suggestion: SaaS project without Auth
  if (["saas", "marketplace"].includes(project.type) && !hasAuth) {
    issues.push({
      id: "sug_saas_no_auth",
      severity: "suggestion",
      title: "Authentication Recommended for SaaS",
      message: "Most SaaS applications require user accounts, organization workspaces, and role-based access control.",
      affectedTechIds: [],
      recommendation: "Add Clerk or Supabase Auth to enable user onboarding, JWT sessions, and organization management.",
      autoFixAction: {
        type: "add_tech",
        techId: "clerk",
        label: "Add Clerk Auth",
      },
    });
  }

  // 7. Suggestion: AI App without Vector DB / Embeddings Index
  if (project.type === "ai_app" && hasAI && !selectedIds.has("pinecone")) {
    issues.push({
      id: "sug_ai_vector_db",
      severity: "suggestion",
      title: "Vector Database for RAG & Semantic Retrieval",
      message:
        "For AI applications requiring document knowledge, chatbots, or contextual search, a dedicated vector index ensures high-speed similarity search.",
      affectedTechIds: selectedTechs.filter((t) => t.category === "ai_llm").map((t) => t.id),
      recommendation: "Add Pinecone or pgvector in PostgreSQL for RAG document embeddings.",
      autoFixAction: {
        type: "add_tech",
        techId: "pinecone",
        label: "Add Pinecone Vector DB",
      },
    });
  }

  // 8. Suggestion: E-Commerce without Storage for Product Images
  if (project.type === "ecommerce" && !hasStorage) {
    issues.push({
      id: "sug_ecom_storage",
      severity: "suggestion",
      title: "Object Storage for Product Assets & Media",
      message: "E-commerce catalogs generate heavy image uploads for merchandise, thumbnails, and invoices.",
      affectedTechIds: [],
      recommendation: "Add AWS S3 or Cloudflare R2 for fast media asset hosting and zero-egress delivery.",
      autoFixAction: {
        type: "add_tech",
        techId: "cloudflare_r2",
        label: "Add Cloudflare R2 Storage",
      },
    });
  }

  // 9. Suggestion: Production Monitoring & Observability
  if (!hasMonitoring && (project.expectedTraffic === "high" || project.expectedTraffic === "enterprise")) {
    issues.push({
      id: "sug_missing_monitoring",
      severity: "suggestion",
      title: "Missing Observability for High-Traffic Stack",
      message: "High-throughput systems benefit from real-time error tracking and APM tracing before launch.",
      affectedTechIds: [],
      recommendation: "Integrate Sentry for crash monitoring and Datadog for APM metrics.",
      autoFixAction: {
        type: "add_tech",
        techId: "sentry",
        label: "Add Sentry APM",
      },
    });
  }

  // 10. Suggestion: High Traffic with no Cache layer
  if (project.expectedTraffic === "high" && !hasCache && hasDatabase && hasBackend) {
    issues.push({
      id: "sug_high_traffic_cache",
      severity: "suggestion",
      title: "Add In-Memory Cache Tier for Scalability",
      message: "Under high concurrency, caching database queries and session states in Redis reduces database CPU pressure by up to 80%.",
      affectedTechIds: [],
      recommendation: "Add Redis Cache to buffer frequent database reads.",
      autoFixAction: {
        type: "add_tech",
        techId: "redis",
        label: "Add Redis Cache",
      },
    });
  }

  // 11. Suggestion: Missing CI/CD workflow
  if (!hasCicd && !hasDeploy) {
    issues.push({
      id: "sug_cicd_pipeline",
      severity: "suggestion",
      title: "Automate Build & Deployment Pipeline",
      message: "Setting up continuous integration ensures code quality and automatic cloud deployments.",
      affectedTechIds: [],
      recommendation: "Add GitHub Actions and Docker containerization.",
      autoFixAction: {
        type: "add_tech",
        techId: "github_actions",
        label: "Add GitHub Actions",
      },
    });
  }

  return issues;
}
