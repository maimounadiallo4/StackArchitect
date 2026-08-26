import { describe, it, expect } from "vitest";
import { generateArchitectureModel } from "./architectureEngine";
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

// Regression test for BUG-01 / BUG-11: the header counts selectedTechIds.length
// while the canvas used to count model.nodes.length, which silently includes
// implicit actor nodes (e.g. "Web User"). The two must stay reconcilable: every
// non-actor node in the model must correspond 1:1 to a selected tech id.
describe("generateArchitectureModel — component count reconciliation", () => {
  it("produces exactly one non-actor node per selected technology", () => {
    const project = makeProject();
    const selectedTechIds = ["react", "fastapi", "postgresql"];
    const model = generateArchitectureModel(project, selectedTechIds, "system");

    const actorNodes = model.nodes.filter((n) => n.category === "actor");
    const technicalNodes = model.nodes.filter((n) => n.category !== "actor");

    expect(actorNodes.length).toBeGreaterThan(0); // web project implies a Web User actor
    expect(technicalNodes.length).toBe(selectedTechIds.length);
  });

  it("keeps the actor count stable when a suggestion adds a new technology", () => {
    const project = makeProject();
    const before = generateArchitectureModel(project, ["react", "fastapi"], "system");
    const after = generateArchitectureModel(project, ["react", "fastapi", "clerk"], "system");

    const actorsBefore = before.nodes.filter((n) => n.category === "actor").length;
    const actorsAfter = after.nodes.filter((n) => n.category === "actor").length;

    expect(actorsAfter).toBe(actorsBefore);
    expect(after.nodes.filter((n) => n.category !== "actor").length).toBe(
      before.nodes.filter((n) => n.category !== "actor").length + 1
    );
  });
});
