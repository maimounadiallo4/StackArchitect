import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy initialize Gemini AI client
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// 1. Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "Stack Architect Engine" });
});

// 2. AI Stack Suggester from Natural Language
app.post("/api/ai/suggest-stack", async (req, res) => {
  try {
    const { prompt, currentTechIds = [] } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const ai = getAI();
    const systemPrompt = `You are a Principal Software Architect.
Given a user's project idea or prompt, your job is to recommend the best technical stack and project parameters.
Return a structured JSON with:
- projectName (concise name)
- projectType (one of: "web", "mobile", "saas", "api", "ecommerce", "ai_app", "realtime", "marketplace", "microservices")
- description (1-2 sentences)
- recommendedTechIds: Array of technology IDs selected ONLY from the known catalog IDs below.
- rationale: A concise paragraph explaining why this stack fits the requirements, mentioning scale, developer velocity, and suitability.
- architecturalHighlights: Array of 3-4 bullet points describing key architectural decisions (e.g. async queues, auth flow, database choice).

CATALOG IDs TO PICK FROM:
Frontend: "react", "nextjs", "vue", "nuxt", "svelte", "sveltekit", "angular", "remix", "astro", "solidjs"
Backend: "fastapi", "nestjs", "express", "django", "laravel", "springboot", "gin", "rails", "aspnet", "phoenix"
Mobile: "reactnative", "flutter", "swift", "kotlin", "ionic"
Database: "postgresql", "mysql", "mongodb", "redis_db", "supabase_db", "dynamodb", "sqlite", "cockroachdb"
Authentication: "clerk", "auth0", "supabase_auth", "firebase_auth", "nextauth", "keycloak", "cognito"
Cache: "redis", "memcached", "dragonfly", "cloudflare_kv"
Storage: "s3", "gcs", "cloudflare_r2", "minio", "azure_blob"
Payments: "stripe", "lemonsqueezy", "paypal", "paddle"
Messaging: "rabbitmq", "kafka", "sqs", "redis_pubsub", "nats"
AI / LLM: "gemini", "openai", "anthropic", "langchain", "pinecone", "weaviate", "ollama"
Search: "meilisearch", "elasticsearch", "algolia", "typesense"
Monitoring: "datadog", "sentry", "prometheus_grafana", "posthog", "opentelemetry"
Deployment: "vercel", "aws_ecs", "gcp_cloudrun", "railway", "render", "flyio", "kubernetes"
CICD: "github_actions", "gitlab_ci", "docker", "terraform"
Communications: "resend", "sendgrid", "twilio", "postmark"
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: `Project description: "${prompt}"\nCurrently selected (if any): ${JSON.stringify(currentTechIds)}`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            projectName: { type: Type.STRING },
            projectType: { type: Type.STRING },
            description: { type: Type.STRING },
            recommendedTechIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            rationale: { type: Type.STRING },
            architecturalHighlights: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["projectName", "projectType", "description", "recommendedTechIds", "rationale", "architecturalHighlights"],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("AI Stack Suggester error:", error);
    res.status(500).json({ error: error.message || "Failed to generate stack recommendations" });
  }
});

// 3. AI Architecture Deep Dive & Review
app.post("/api/ai/review-architecture", async (req, res) => {
  try {
    const { project, selectedTechDetails, issues } = req.body;
    const ai = getAI();

    const promptText = `Analyze this technical architecture:
Project: ${JSON.stringify(project)}
Selected Technologies: ${JSON.stringify(selectedTechDetails)}
Detected Engine Issues: ${JSON.stringify(issues)}

Provide a comprehensive architectural critique including:
1. Executive Summary
2. Strengths of the stack
3. Potential Bottlenecks / Scaling Risks
4. Security & Compliance considerations
5. Cost & Operational Overhead evaluation
6. 3-4 Actionable Next-Step Recommendations for the engineering team.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: promptText,
      config: {
        systemInstruction: "You are a seasoned Principal System Architect and CTO advisor. Provide deeply pragmatic, actionable architectural insights.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            risks: { type: Type.ARRAY, items: { type: Type.STRING } },
            securityNotes: { type: Type.ARRAY, items: { type: Type.STRING } },
            costAssessment: { type: Type.STRING },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["summary", "strengths", "risks", "securityNotes", "costAssessment", "recommendations"],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("AI Review error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze architecture" });
  }
});

// 4. AI Architecture Q&A Copilot
app.post("/api/ai/copilot-chat", async (req, res) => {
  try {
    const { question, project, selectedTechDetails, history = [] } = req.body;
    const ai = getAI();

    const systemPrompt = `You are Stack Architect Copilot, an expert software architect helping developers build and optimize their system design.
The current project context is:
Project: ${JSON.stringify(project)}
Active Stack: ${JSON.stringify(selectedTechDetails)}

Give direct, structured, code-oriented and architectural answers. When explaining connections, mention protocols (HTTP, REST, Webhooks, gRPC, PubSub), data flows, caching strategies, and best practices.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: `${question}`,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    res.json({ answer: response.text || "No response generated." });
  } catch (error: any) {
    console.error("AI Copilot Chat error:", error);
    res.status(500).json({ error: error.message || "Failed to answer architecture question" });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Stack Architect Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
