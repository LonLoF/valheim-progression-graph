import { defineConfig, devices } from "@playwright/test";

const phone = devices["iPhone 13"];

export default defineConfig({
  testDir: "tests",
  timeout: 120_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:4173",
  },
  webServer: {
    command: "npm run preview",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: false,
    timeout: 60_000,
  },
  projects: [
    {
      name: "desktop",
      use: {
        browserName: "chromium",
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      name: "phone",
      use: {
        browserName: "chromium",
        userAgent: phone.userAgent,
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: phone.deviceScaleFactor,
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
});
