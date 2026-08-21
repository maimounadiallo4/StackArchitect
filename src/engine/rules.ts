/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Technology, ArchitectureEdge, ProtocolType, EdgeFlowNature } from "../types";

export interface ConnectionRule {
  id: string;
  sourceCategory: string;
  targetCategory: string;
  defaultProtocol: ProtocolType;
  nature: EdgeFlowNature;
  labelTemplate: (source: Technology | { name: string }, target: Technology) => string;
  descriptionTemplate: (source: Technology | { name: string }, target: Technology) => string;
  condition?: (selectedTechs: Technology[]) => boolean;
}

export const ARCHITECTURAL_RULES: ConnectionRule[] = [
  // 1. Frontend -> Backend
  {
    id: "frontend-to-backend",
    sourceCategory: "frontend",
    targetCategory: "backend",
    defaultProtocol: "HTTPS / REST",
    nature: "sync",
    labelTemplate: (src, tgt) => `API Requests (REST/JSON)`,
    descriptionTemplate: (src, tgt) => `${src.name} sends authenticated API calls to ${tgt.name} with Bearer JWT tokens.`,
  },
  // 2. Mobile -> Backend
  {
    id: "mobile-to-backend",
    sourceCategory: "mobile",
    targetCategory: "backend",
    defaultProtocol: "HTTPS / REST",
    nature: "sync",
    labelTemplate: (src, tgt) => `Mobile API Requests`,
    descriptionTemplate: (src, tgt) => `${src.name} mobile client interacts with ${tgt.name} REST/gRPC endpoints.`,
  },
  // 3. Frontend / Mobile -> Auth
  {
    id: "client-to-auth",
    sourceCategory: "frontend",
    targetCategory: "auth",
    defaultProtocol: "OIDC / OAuth 2.0",
    nature: "sync",
    labelTemplate: (src, tgt) => `OAuth / Sign-In Flow`,
    descriptionTemplate: (src, tgt) => `${src.name} executes login redirect and retrieves session JWT from ${tgt.name}.`,
    condition: (techs) => techs.some((t) => ["clerk", "auth0", "supabase_auth", "firebase_auth"].includes(t.id)),
  },
  {
    id: "mobile-to-auth",
    sourceCategory: "mobile",
    targetCategory: "auth",
    defaultProtocol: "OIDC / OAuth 2.0",
    nature: "sync",
    labelTemplate: (src, tgt) => `OAuth / Identity`,
    descriptionTemplate: (src, tgt) => `${src.name} verifies biometric / social credentials with ${tgt.name}.`,
    condition: (techs) => techs.some((t) => ["clerk", "auth0", "supabase_auth", "firebase_auth"].includes(t.id)),
  },
  // 4. Backend <-> Auth (Verification & Webhooks)
  {
    id: "auth-to-backend-webhooks",
    sourceCategory: "auth",
    targetCategory: "backend",
    defaultProtocol: "Webhook (HTTPS POST)",
    nature: "webhook",
    labelTemplate: (src, tgt) => `User Events (Webhooks)`,
    descriptionTemplate: (src, tgt) => `${src.name} notifies ${tgt.name} on user.created / org.updated events.`,
  },
  // 5. Backend -> Database
  {
    id: "backend-to-database",
    sourceCategory: "backend",
    targetCategory: "database",
    defaultProtocol: "SQL / Wire Protocol",
    nature: "sync",
    labelTemplate: (src, tgt) => `CRUD / Connection Pool`,
    descriptionTemplate: (src, tgt) => `${src.name} executes transactional queries, migrations, and joins on ${tgt.name}.`,
  },
  // 6. Frontend / Fullstack -> BaaS Database (e.g. Next.js / SvelteKit / Supabase)
  {
    id: "edge-to-database",
    sourceCategory: "frontend",
    targetCategory: "database",
    defaultProtocol: "SQL / Wire Protocol",
    nature: "sync",
    labelTemplate: (src, tgt) => `Server Queries`,
    descriptionTemplate: (src, tgt) => `${src.name} server actions / route handlers query ${tgt.name} directly.`,
    condition: (techs) => techs.some((t) => ["nextjs", "sveltekit", "remix", "nuxt"].includes(t.id) && !techs.some(b => b.category === "backend")),
  },
  // 7. Backend -> Cache
  {
    id: "backend-to-cache",
    sourceCategory: "backend",
    targetCategory: "cache",
    defaultProtocol: "Redis Protocol (RESP)",
    nature: "sync",
    labelTemplate: (src, tgt) => `Cache Read/Write & Rate Limit`,
    descriptionTemplate: (src, tgt) => `${src.name} caches frequent query responses and tracks rate limits in ${tgt.name}.`,
  },
  // 8. Backend -> Storage
  {
    id: "backend-to-storage",
    sourceCategory: "backend",
    targetCategory: "storage",
    defaultProtocol: "Signed HTTPS / S3 API",
    nature: "sync",
    labelTemplate: (src, tgt) => `Presigned URLs & Asset Management`,
    descriptionTemplate: (src, tgt) => `${src.name} creates presigned upload URLs and manages access policies in ${tgt.name}.`,
  },
  // 9. Client -> Storage (Direct Upload)
  {
    id: "client-to-storage",
    sourceCategory: "frontend",
    targetCategory: "storage",
    defaultProtocol: "Signed HTTPS / S3 API",
    nature: "async",
    labelTemplate: (src, tgt) => `Direct Multipart Upload`,
    descriptionTemplate: (src, tgt) => `${src.name} uploads large media directly to ${tgt.name} via presigned S3 URLs.`,
  },
  // 10. Backend <-> Payments
  {
    id: "backend-to-payments",
    sourceCategory: "backend",
    targetCategory: "payments",
    defaultProtocol: "HTTPS / REST",
    nature: "sync",
    labelTemplate: (src, tgt) => `Create Checkout Sessions`,
    descriptionTemplate: (src, tgt) => `${src.name} generates customer billing portal and checkout sessions in ${tgt.name}.`,
  },
  {
    id: "payments-to-backend",
    sourceCategory: "payments",
    targetCategory: "backend",
    defaultProtocol: "Webhook (HTTPS POST)",
    nature: "webhook",
    labelTemplate: (src, tgt) => `Payment Webhooks`,
    descriptionTemplate: (src, tgt) => `${src.name} pushes payment_intent.succeeded and invoice events to ${tgt.name}.`,
  },
  // 11. Backend -> Messaging / Queues
  {
    id: "backend-to-messaging",
    sourceCategory: "backend",
    targetCategory: "messaging",
    defaultProtocol: "AMQP / Kafka Protocol",
    nature: "event",
    labelTemplate: (src, tgt) => `Publish Events & Tasks`,
    descriptionTemplate: (src, tgt) => `${src.name} enqueues heavy background processing jobs to ${tgt.name}.`,
  },
  // 12. Messaging -> Backend (Worker Consumers)
  {
    id: "messaging-to-backend-workers",
    sourceCategory: "messaging",
    targetCategory: "backend",
    defaultProtocol: "AMQP / Kafka Protocol",
    nature: "event",
    labelTemplate: (src, tgt) => `Consume & Process Tasks`,
    descriptionTemplate: (src, tgt) => `Worker processes in ${tgt.name} consume and acknowledge jobs from ${src.name}.`,
  },
  // 13. Backend -> AI / LLM
  {
    id: "backend-to-ai",
    sourceCategory: "backend",
    targetCategory: "ai_llm",
    defaultProtocol: "HTTPS / REST",
    nature: "sync",
    labelTemplate: (src, tgt) => `Inference & Embeddings`,
    descriptionTemplate: (src, tgt) => `${src.name} streams prompt generation, reasoning, and multimodal inputs to ${tgt.name}.`,
  },
  // 14. AI Orchestration (LangChain) -> AI Models / Vector DB
  {
    id: "ai-to-vector-db",
    sourceCategory: "ai_llm",
    targetCategory: "ai_llm",
    defaultProtocol: "HTTPS / REST",
    nature: "sync",
    labelTemplate: (src, tgt) => `Semantic Vector Search (RAG)`,
    descriptionTemplate: (src, tgt) => `${src.name} queries vector embeddings in ${tgt.name} for context augmentation.`,
    condition: (techs) => techs.some((t) => t.id === "pinecone") && techs.some((t) => ["gemini", "openai", "langchain"].includes(t.id)),
  },
  // 15. Backend -> Search
  {
    id: "backend-to-search",
    sourceCategory: "backend",
    targetCategory: "search",
    defaultProtocol: "HTTPS / REST",
    nature: "sync",
    labelTemplate: (src, tgt) => `Sync & Index Records`,
    descriptionTemplate: (src, tgt) => `${src.name} pushes record mutations and re-indexes documents in ${tgt.name}.`,
  },
  // 16. Client -> Hosted Search (Algolia)
  {
    id: "client-to-search",
    sourceCategory: "frontend",
    targetCategory: "search",
    defaultProtocol: "HTTPS / REST",
    nature: "sync",
    labelTemplate: (src, tgt) => `Instant Search Queries (<50ms)`,
    descriptionTemplate: (src, tgt) => `${src.name} queries instant autocomplete index in ${tgt.name} with search-only key.`,
    condition: (techs) => techs.some((t) => t.id === "algolia" || t.id === "meilisearch"),
  },
  // 17. Backend -> Communications (Resend / Twilio)
  {
    id: "backend-to-communication",
    sourceCategory: "backend",
    targetCategory: "communication",
    defaultProtocol: "HTTPS / REST",
    nature: "async",
    labelTemplate: (src, tgt) => `Send Email / SMS`,
    descriptionTemplate: (src, tgt) => `${src.name} dispatches transactional notification requests via ${tgt.name}.`,
  },
  // 18. Frontend & Backend -> Monitoring (Sentry / Datadog / PostHog)
  {
    id: "frontend-to-monitoring",
    sourceCategory: "frontend",
    targetCategory: "monitoring",
    defaultProtocol: "HTTPS / REST",
    nature: "telemetry",
    labelTemplate: (src, tgt) => `Client Telemetry & Crashes`,
    descriptionTemplate: (src, tgt) => `${src.name} streams client error breadcrumbs and user session metrics to ${tgt.name}.`,
  },
  {
    id: "backend-to-monitoring",
    sourceCategory: "backend",
    targetCategory: "monitoring",
    defaultProtocol: "HTTPS / REST",
    nature: "telemetry",
    labelTemplate: (src, tgt) => `APM Traces & Exception Logs`,
    descriptionTemplate: (src, tgt) => `${src.name} reports distributed tracing and performance metrics to ${tgt.name}.`,
  },
  // 19. CI/CD -> Deployment
  {
    id: "cicd-to-deployment",
    sourceCategory: "cicd",
    targetCategory: "deployment",
    defaultProtocol: "HTTPS / REST",
    nature: "async",
    labelTemplate: (src, tgt) => `Deploy Container / Artifacts`,
    descriptionTemplate: (src, tgt) => `${src.name} builds and deploys release versions to ${tgt.name}.`,
  },
];
