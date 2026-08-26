import { ArchitectureModel, ViewLevel, ValidationIssue } from "../types";

export interface ExportResult {
  filename: string;
  mimeType: string;
  data: string;
}

// 1. Generate Mermaid.js syntax
export function generateMermaidDiagram(model: ArchitectureModel, viewLevel: ViewLevel = "system"): string {
  const lines: string[] = [];
  lines.push("flowchart LR");
  lines.push("  %% Stack Architect Generated Diagram");
  lines.push("  classDef actor fill:#3b82f615,stroke:#3b82f6,stroke-width:2px,color:#1e40af;");
  lines.push("  classDef client fill:#06b6d415,stroke:#06b6d4,stroke-width:2px,color:#0e7490;");
  lines.push("  classDef api fill:#10b98115,stroke:#10b981,stroke-width:2px,color:#047857;");
  lines.push("  classDef data fill:#f59e0b15,stroke:#f59e0b,stroke-width:2px,color:#b45309;");
  lines.push("  classDef external fill:#8b5cf615,stroke:#8b5cf6,stroke-width:2px,color:#6d28d9;");
  lines.push("  classDef obs fill:#ef444415,stroke:#ef4444,stroke-width:2px,color:#b91c1c;");
  lines.push("");

  // Subgraph groupings by Tier / Zone
  const clients = model.nodes.filter((n) => n.category === "frontend" || n.category === "mobile" || n.category === "actor");
  const apis = model.nodes.filter((n) => n.category === "backend");
  const data = model.nodes.filter((n) => ["database", "cache", "search", "messaging"].includes(n.category) || n.techId === "pinecone");
  const external = model.nodes.filter((n) => ["auth", "payments", "ai_llm", "storage", "communication"].includes(n.category) && n.techId !== "pinecone");
  const infra = model.nodes.filter((n) => ["monitoring", "deployment", "cicd"].includes(n.category));

  if (clients.length > 0) {
    lines.push("  subgraph Tier_Clients [Client & User Layer]");
    clients.forEach((n) => {
      const cleanTitle = n.title.replace(/[^\w\s]/gi, "");
      const cleanSub = n.subtitle.replace(/[^\w\s]/gi, "");
      lines.push(`    ${n.id}["<b>${cleanTitle}</b><br/>${cleanSub}"]:::client`);
    });
    lines.push("  end");
    lines.push("");
  }

  if (apis.length > 0) {
    lines.push("  subgraph Tier_APIs [API & Compute Services]");
    apis.forEach((n) => {
      const cleanTitle = n.title.replace(/[^\w\s]/gi, "");
      const cleanSub = n.subtitle.replace(/[^\w\s]/gi, "");
      lines.push(`    ${n.id}["<b>${cleanTitle}</b><br/>${cleanSub}"]:::api`);
    });
    lines.push("  end");
    lines.push("");
  }

  if (data.length > 0) {
    lines.push("  subgraph Tier_Data [Data Stores & Messaging]");
    data.forEach((n) => {
      const cleanTitle = n.title.replace(/[^\w\s]/gi, "");
      const cleanSub = n.subtitle.replace(/[^\w\s]/gi, "");
      lines.push(`    ${n.id}[("<b>${cleanTitle}</b><br/>${cleanSub}")]:::data`);
    });
    lines.push("  end");
    lines.push("");
  }

  if (external.length > 0) {
    lines.push("  subgraph Tier_External [External Managed SaaS & AI]");
    external.forEach((n) => {
      const cleanTitle = n.title.replace(/[^\w\s]/gi, "");
      const cleanSub = n.subtitle.replace(/[^\w\s]/gi, "");
      lines.push(`    ${n.id}["<b>${cleanTitle}</b><br/>${cleanSub}"]:::external`);
    });
    lines.push("  end");
    lines.push("");
  }

  if (infra.length > 0) {
    lines.push("  subgraph Tier_Infra [Observability & DevOps]");
    infra.forEach((n) => {
      const cleanTitle = n.title.replace(/[^\w\s]/gi, "");
      const cleanSub = n.subtitle.replace(/[^\w\s]/gi, "");
      lines.push(`    ${n.id}["<b>${cleanTitle}</b><br/>${cleanSub}"]:::obs`);
    });
    lines.push("  end");
    lines.push("");
  }

  // Connections
  lines.push("  %% Inter-service Connections");
  model.edges.forEach((edge) => {
    const cleanLabel = edge.label.replace(/[^\w\s]/gi, "");
    if (edge.nature === "webhook") {
      lines.push(`  ${edge.source} -.->|"${cleanLabel}"| ${edge.target}`);
    } else if (edge.nature === "event") {
      lines.push(`  ${edge.source} ==>|"${cleanLabel}"| ${edge.target}`);
    } else {
      lines.push(`  ${edge.source} -->|"${cleanLabel}"| ${edge.target}`);
    }
  });

  return lines.join("\n");
}

// 2. Generate C4 Model / Structurizr DSL
export function generateC4StructurizrDSL(model: ArchitectureModel): string {
  const projectName = model.project.name || "Software System";
  const lines: string[] = [];

  lines.push("workspace {");
  lines.push("    model {");
  lines.push(`        user = person "End User" "A user of ${projectName}."`);
  lines.push(`        system = softwareSystem "${projectName}" "${model.project.description || "Production system"}" {`);

  // Containers
  model.nodes.forEach((node) => {
    if (node.category !== "actor") {
      lines.push(`            container_${node.id} = container "${node.title}" "${node.subtitle}" "${node.category.toUpperCase()}"`);
    }
  });

  lines.push("        }");
  lines.push("");

  // External Systems
  const externalNodes = model.nodes.filter((n) => ["auth", "payments", "ai_llm", "storage", "communication"].includes(n.category));
  externalNodes.forEach((node) => {
    lines.push(`        ext_${node.id} = softwareSystem "${node.title}" "${node.subtitle}" "Existing System"`);
  });

  lines.push("");
  lines.push("        # Relationships");
  model.edges.forEach((edge) => {
    const src = edge.source.startsWith("actor") ? "user" : `container_${edge.source}`;
    const tgt = `container_${edge.target}`;
    lines.push(`        ${src} -> ${tgt} "${edge.label}" "${edge.protocol}"`);
  });

  lines.push("    }");
  lines.push("");
  lines.push("    views {");
  lines.push(`        systemContext system "SystemContext" {`);
  lines.push("            include *");
  lines.push("            autoLayout lr");
  lines.push("        }");
  lines.push(`        container system "Containers" {`);
  lines.push("            include *");
  lines.push("            autoLayout lr");
  lines.push("        }");
  lines.push("        theme default");
  lines.push("    }");
  lines.push("}");

  return lines.join("\n");
}

// 3. Generate Architecture Decision Record (Markdown RFC)
export function generateArchitectureDocument(model: ArchitectureModel, issues: ValidationIssue[] = []): string {
  const dateStr = new Date().toISOString().split("T")[0];
  const doc: string[] = [];

  doc.push(`# Technical Architecture Design: ${model.project.name || "System Design"}`);
  doc.push(`**Date:** ${dateStr} | **Status:** Approved Draft | **Complexity:** ${model.stats.estimatedComplexity}`);
  doc.push("");
  doc.push("## 1. Executive Summary & Project Context");
  doc.push(`- **Application Type:** ${model.project.type.toUpperCase()}`);
  doc.push(`- **Expected Traffic Tier:** ${model.project.expectedTraffic}`);
  doc.push(`- **Budget Profile:** ${model.project.budgetConstraint}`);
  doc.push(`- **Description:** ${model.project.description || "Production modern software architecture."}`);
  doc.push("");

  doc.push("## 2. Technology Stack Breakdown");
  doc.push("| Category | Technology | Architectural Role | Deployment Tier |");
  doc.push("|---|---|---|---|");
  model.selectedTechs.forEach((tech) => {
    doc.push(`| **${tech.category.toUpperCase()}** | ${tech.name} | ${tech.roleInArchitecture} | ${tech.defaultDeploymentZone} |`);
  });
  doc.push("");

  doc.push("## 3. Communication Protocols & Inter-Service Flows");
  doc.push("| Source Component | Target Component | Protocol | Interaction Nature | Description |");
  doc.push("|---|---|---|---|---|");
  model.edges.forEach((edge) => {
    const src = model.nodes.find((n) => n.id === edge.source)?.title || edge.source;
    const tgt = model.nodes.find((n) => n.id === edge.target)?.title || edge.target;
    doc.push(`| ${src} | ${tgt} | \`${edge.protocol}\` | ${edge.nature.toUpperCase()} | ${edge.description} |`);
  });
  doc.push("");

  doc.push("## 4. Key Architectural Decisions (ADR)");
  doc.push(`1. **Decoupled Client & Server:** Independent deployment lifecycle between frontend and backend APIs.`);
  doc.push(`2. **Data Consistency & Isolation:** Primary data managed in dedicated ACID compliant datastores with isolated network boundaries.`);
  doc.push(`3. **Third-Party SaaS Delegation:** Authentication, payments, and AI foundation models delegated to specialized managed providers with webhook validation.`);
  doc.push("");

  doc.push("```mermaid");
  doc.push(generateMermaidDiagram(model));
  doc.push("```");

  const openSuggestions = issues.filter((i) => i.severity === "suggestion");
  if (openSuggestions.length > 0) {
    doc.push("");
    doc.push("## 5. Open Recommendations");
    doc.push("The following suggestions were not applied to this stack at export time:");
    doc.push("");
    openSuggestions.forEach((issue) => {
      doc.push(`- **${issue.title}** — ${issue.recommendation}`);
    });
  }

  return doc.join("\n");
}

// 4. Download helper for browser
export function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
