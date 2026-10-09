import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './smoke-tests',
  testMatch: '**/*.smoke.ts',
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  timeout: 30_000,
  globalTimeout: 5 * 60_000,
  expect: { timeout: 15_000 },
  outputDir: '.smoke-results/artifacts',
  reporter: [
    ['list'],
    ['html', { outputFolder: '.smoke-results/report', open: 'never' }],
    ['junit', { outputFile: '.smoke-results/junit.xml' }],
  ],
  use: {
    browserName: 'chromium',
    viewport: { width: 1280, height: 800 },
    actionTimeout: 15_000,
    navigationTimeout: 20_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
});
