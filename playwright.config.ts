import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  fullyParallel: true,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: "http://127.0.0.1:43174",
    channel: "chrome",
    locale: "ru-BY",
    timezoneId: "Europe/Minsk",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "desktop-chrome",
      use: { viewport: { width: 1440, height: 1000 } },
    },
    {
      name: "mobile-chrome",
      use: { ...devices["iPhone 14"], browserName: "chromium", channel: "chrome" },
    },
  ],
  webServer: {
    command: "python3 -m http.server 43174 -d out",
    url: "http://127.0.0.1:43174",
    reuseExistingServer: false,
  },
});
