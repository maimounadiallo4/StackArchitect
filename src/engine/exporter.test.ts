import { describe, it, expect } from "vitest";
import { generateArchitectureModel } from "./architectureEngine";
import { validateArchitecture } from "./validator";
import { generateMermaidDiagram, generateC4StructurizrDSL, generateArchitectureDocument, computeStackSignature } from "./exporter";
import { ProjectConfig } from "../types";

function makeProject(overrides: Partial<ProjectConfig> = {}): ProjectConfig {
  return {
    id: "test",
    name: "Orbit",
    type: "saas",
    description: "",
    expectedTraffic: "medium",
    teamExperience: "intermediate",
    budgetConstraint: "moderate",
    ...overrides,
  };
}

describe("export format validity (BUG-09)", () => {
  const project = makeProject();
  const model = generateArchitectureModel(project, ["react", "fastapi", "postgresql"], "system");
  const issues = validateArchitecture(project, model.selectedTechs);

  it("Mermaid output references every node id and stays free of unescaped node titles", () => {
    const mermaid = generateMermaidDiagram(model);
    expect(mermaid.startsWith("flowchart LR")).toBe(true);
    for (const node of model.nodes) {
      expect(mermaid).toContain(node.id);
    }
  });

  it("C4/Structurizr DSL is a balanced, well-formed workspace block", () => {
    const dsl = generateC4StructurizrDSL(model);
    expect(dsl.startsWith("workspace {")).toBe(true);
    const opens = (dsl.match(/{/g) ?? []).length;
    const closes = (dsl.match(/}/g) ?? []).length;
    expect(opens).toBe(closes);
    expect(dsl).toContain(project.name);
  });

  it("JSON graph export round-trips through JSON.parse with the same node count", () => {
    const json = JSON.stringify(model, null, 2);
    const parsed = JSON.parse(json);
    expect(parsed.nodes.length).toBe(model.nodes.length);
    expect(parsed.edges.length).toBe(model.edges.length);
  });

  it("Markdown ADR includes project metadata and an Open Recommendations section listing pending suggestions", () => {
    const doc = generateArchitectureDocument(model, issues);
    expect(doc).toContain(project.name);
    expect(doc).toContain("## 2. Technology Stack Breakdown");
    const suggestions = issues.filter((i) => i.severity === "suggestion");
    if (suggestions.length > 0) {
      expect(doc).toContain("## 5. Open Recommendations");
      suggestions.forEach((s) => expect(doc).toContain(s.title));
    }
  });

  it("Markdown ADR omits the Open Recommendations section when there are no pending suggestions", () => {
    const doc = generateArchitectureDocument(model, []);
    expect(doc).not.toContain("## 5. Open Recommendations");
  });

  it("Markdown ADR includes a stack signature", () => {
    const doc = generateArchitectureDocument(model, issues);
    expect(doc).toMatch(/\*\*Stack Signature:\*\* `[0-9a-z]+`/);
  });
});

describe("computeStackSignature", () => {
  const project = makeProject();

  it("is deterministic and independent of selection order", () => {
    const modelA = generateArchitectureModel(project, ["react", "fastapi", "postgresql"], "system");
    const modelB = generateArchitectureModel(project, ["postgresql", "react", "fastapi"], "system");
    expect(computeStackSignature(modelA)).toBe(computeStackSignature(modelB));
  });

  it("changes when the stack changes", () => {
    const before = generateArchitectureModel(project, ["react", "fastapi"], "system");
    const after = generateArchitectureModel(project, ["react", "fastapi", "clerk"], "system");
    expect(computeStackSignature(before)).not.toBe(computeStackSignature(after));
  });
});
