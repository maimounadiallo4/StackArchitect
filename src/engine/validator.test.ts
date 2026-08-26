import { describe, it, expect } from "vitest";
import { validateArchitecture } from "./validator";
import { TECH_BY_ID } from "./catalog";
import { ProjectConfig, Technology } from "../types";

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

function techs(ids: string[]): Technology[] {
  return ids.map((id) => TECH_BY_ID.get(id)).filter((t): t is Technology => Boolean(t));
}

describe("validateArchitecture", () => {
  it("never emits duplicate issue ids for a given stack", () => {
    const issues = validateArchitecture(makeProject(), techs(["react", "fastapi", "postgresql"]));
    const ids = issues.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("suggests adding auth for a SaaS project with no auth layer (matches the 'Add Clerk Auth' audit scenario)", () => {
    const issues = validateArchitecture(makeProject({ type: "saas" }), techs(["react", "fastapi", "postgresql"]));
    const authSuggestion = issues.find((i) => i.id === "sug_saas_no_auth");
    expect(authSuggestion).toBeDefined();
    expect(authSuggestion?.severity).toBe("suggestion");
    expect(authSuggestion?.autoFixAction?.techId).toBe("clerk");
  });
});
