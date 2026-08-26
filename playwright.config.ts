import { defineConfig, devices } from "@playwright/test";

const PORT = 5183;

export default defineConfig({
  testDir: "./e2e",
  timeout: 45000,
  fullyParallel: true,
  reporter: [["list"]],
  webServer: {
    command: `npm run dev -- --port ${PORT} --strictPort`,
    port: PORT,
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
  use: {
    baseURL: `http://localhost:${PORT}`,
    launchOptions: {
      args: ["--no-sandbox"],
    },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
