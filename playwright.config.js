// Smoke tests for the static page. `npm test` serves the repo root and runs
// them in Chromium; Supabase responses are mocked in tests/smoke.spec.js.
const { defineConfig, devices } = require('@playwright/test')

module.exports = defineConfig({
  testDir: 'tests',
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    ...devices['Pixel 7'],
  },
  webServer: {
    command: 'python3 -m http.server 4173 --bind 127.0.0.1',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    stderr: 'ignore',
  },
})
