import { describe, it, expect } from "vitest";
import { generateArchitectureModel } from "./architectureEngine";
import { generateDiagramSVG } from "./diagramImage";
import { ProjectConfig } from "../types";
import { translations } from "../i18n/translations";

// Note: svgToPngBlob rasterizes via a real browser <canvas>, which jsdom does
// not implement — it is covered by the Playwright E2E smoke test instead.
describe("generateDiagramSVG (BUG-09 export validity)", () => {
  it("produces a well-formed standalone SVG document with a title/subtitle per node", () => {
    const project: ProjectConfig = {
      id: "test",
      name: "Orbit",
      type: "saas",
      description: "",
      expectedTraffic: "medium",
      teamExperience: "intermediate",
      budgetConstraint: "moderate",
    };
    const model = generateArchitectureModel(project, ["react", "fastapi", "postgresql"], "system");
    const svg = generateDiagramSVG(model, "dark", translations.en.lanes);

    expect(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg"')).toBe(true);
    expect(svg.endsWith("</svg>")).toBe(true);
    expect((svg.match(/<rect/g) ?? []).length).toBeGreaterThanOrEqual(model.nodes.length);
    for (const node of model.nodes) {
      expect(svg).toContain(node.title.length > 22 ? node.title.slice(0, 21) : node.title);
    }
  });
});
