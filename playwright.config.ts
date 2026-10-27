import { defineConfig, devices } from '@playwright/test';

// Tests run against the built site (`pnpm build` first), served by `astro preview`.
export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  // A full axe scan is CPU-heavy; two at a time keeps it within WSL's 4 GB and CI runners.
  workers: 2,
  timeout: 90_000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: 'http://127.0.0.1:4322' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    // --ignore-lock: a throwaway test server; don't clash with a dev's own `astro preview`.
    command: 'node_modules/.bin/astro preview --host 127.0.0.1 --port 4322 --ignore-lock',
    url: 'http://127.0.0.1:4322',
    reuseExistingServer: !process.env.CI,
  },
});
