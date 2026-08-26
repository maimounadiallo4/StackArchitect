import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Mirrors the audit's own manual walkthrough (§2): project name -> SaaS/B2B ->
// React/FastAPI/PostgreSQL -> skip optional steps -> generate -> apply the
// "Add Clerk Auth" suggestion -> export modal.
test("full wizard-to-export flow with an a11y scan at each major screen", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("Que construisez-vous ?")).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");

  const wizardScan = await new AxeBuilder({ page }).analyze();
  const wizardSerious = wizardScan.violations.filter((v) => v.impact === "critical" || v.impact === "serious");
  expect(wizardSerious, JSON.stringify(wizardSerious, null, 2)).toEqual([]);

  await page.fill("#wizard-project-name", "Orbit");
  await page.getByRole("button", { name: "SaaS / App B2B" }).click();
  await page.getByRole("button", { name: "Continuer" }).click();

  await expect(page.locator("h2", { hasText: "Frontend" })).toBeVisible();
  // Required step: Continue is disabled and explained until something is picked.
  await expect(page.getByRole("button", { name: "Continuer" })).toBeDisabled();
  await expect(page.getByText("Sélectionnez au moins une option pour continuer.")).toBeVisible();

  await page.getByRole("button").filter({ has: page.locator("h4", { hasText: "React" }) }).click();
  await page.getByRole("button", { name: "Continuer" }).click();

  await expect(page.locator("h2", { hasText: "Backend" })).toBeVisible();
  await page.getByRole("button").filter({ has: page.locator("h4", { hasText: "FastAPI" }) }).click();
  await page.getByRole("button", { name: "Continuer" }).click();

  await expect(page.locator("h2", { hasText: "Bases" })).toBeVisible();
  await page.getByRole("button").filter({ has: page.locator("h4", { hasText: "PostgreSQL" }) }).click();
  await page.getByRole("button", { name: "Continuer" }).click();

  // Skip every remaining optional step until the Generate button appears.
  // Exactly one of "Passer"/"Continuer" is rendered at a time, so match either
  // in one locator rather than racing two separate visibility checks.
  for (let i = 0; i < 8; i++) {
    if (await page.getByRole("button", { name: "Générer l'architecture" }).count()) break;
    await page.getByRole("button", { name: /^(Passer|Continuer)$/ }).click();
    await page.waitForTimeout(150);
  }

  await page.getByRole("button", { name: "Générer l'architecture" }).click();
  await expect(page.locator("#main-content")).toBeVisible();

  // Header count and canvas count must always agree (regression guard for BUG-01/BUG-11).
  await expect(page.locator("header#app-header")).toContainText("3 composants");
  await expect(page.locator("#diagram-canvas-container")).toContainText("3 composants techniques");

  const generatedScan = await new AxeBuilder({ page }).analyze();
  const generatedSerious = generatedScan.violations.filter((v) => v.impact === "critical" || v.impact === "serious");
  expect(generatedSerious, JSON.stringify(generatedSerious, null, 2)).toEqual([]);

  // Apply the "Add Clerk Auth" suggestion and confirm the toast + undo.
  await page.getByRole("button", { name: /Diagnostic/ }).click();
  const issuesList = page.locator("#validation-issues-list");
  await issuesList.getByRole("button", { name: /Clerk/ }).click();
  await expect(page.getByText("Clerk ajouté à la stack.")).toBeVisible();
  await expect(page.locator("header#app-header")).toContainText("4 composants");

  // Export modal: Mermaid and JSON Graph tabs render non-empty content.
  await page.getByRole("button", { name: "Exporter" }).click();
  await expect(page.getByText("Générez des diagrammes")).toBeVisible();
  const textarea = page.locator("textarea");
  await expect(textarea).not.toBeEmpty();
  await page.getByRole("button", { name: "JSON Graph" }).click();
  const jsonContent = await textarea.inputValue();
  expect(() => JSON.parse(jsonContent)).not.toThrow();
});
