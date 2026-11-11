import { defineConfig, devices } from "@playwright/test";

/**
 * Automated browser tests.
 * - Port 3100: the real app, pointed at a FAKE AI server (tests/mock-anthropic-server.mjs).
 * - Port 3101: the real app with NO API key, to test the "not configured" message.
 * Run with: npm run build && npm test
 */
export default defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: { baseURL: "http://127.0.0.1:3100", trace: "off" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] }, grepInvert: /@mobile/ },
    { name: "mobile", use: { ...devices["Pixel 7"] }, grep: /@mobile/ },
  ],
  webServer: [
    {
      command: "node tests/mock-anthropic-server.mjs",
      url: "http://127.0.0.1:4010/__requests",
      reuseExistingServer: false,
    },
    {
      command: "npx next start -p 3100 -H 127.0.0.1",
      url: "http://127.0.0.1:3100",
      reuseExistingServer: false,
      env: {
        ANTHROPIC_API_KEY: "test-key-not-real",
        ANTHROPIC_BASE_URL: "http://127.0.0.1:4010",
        RATE_LIMIT_PER_HOUR: "1000",
      },
    },
    {
      command: "npx next start -p 3101 -H 127.0.0.1",
      url: "http://127.0.0.1:3101",
      reuseExistingServer: false,
      env: { ANTHROPIC_API_KEY: "", RATE_LIMIT_PER_HOUR: "1000" },
    },
  ],
});
