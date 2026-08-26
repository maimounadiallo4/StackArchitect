import { describe, it, expect, afterEach } from "vitest";
import { encodeShareLink, decodeShareStateFromLocation } from "./shareLink";
import { ProjectConfig } from "../types";

const project: ProjectConfig = {
  id: "local",
  name: "Orbit — été 2026",
  type: "saas",
  description: "Un projet avec des caractères accentués & spéciaux.",
  expectedTraffic: "high",
  teamExperience: "senior",
  budgetConstraint: "scale_ready",
};

function setLocationSearch(search: string) {
  window.history.replaceState({}, "", `${window.location.pathname}${search}`);
}

afterEach(() => {
  setLocationSearch("");
});

describe("shareLink", () => {
  it("round-trips project config and selected tech ids through the URL, including non-ASCII text", () => {
    const link = encodeShareLink({ project, selectedTechIds: ["react", "fastapi", "postgresql"] });
    const url = new URL(link);
    setLocationSearch(url.search);

    const decoded = decodeShareStateFromLocation();
    expect(decoded).not.toBeNull();
    expect(decoded?.project).toEqual(project);
    expect(decoded?.selectedTechIds).toEqual(["react", "fastapi", "postgresql"]);
  });

  it("returns null when there is no share param", () => {
    setLocationSearch("");
    expect(decodeShareStateFromLocation()).toBeNull();
  });

  it("returns null for a malformed share param instead of throwing", () => {
    setLocationSearch("?s=not-valid-base64!!!");
    expect(decodeShareStateFromLocation()).toBeNull();
  });
});
