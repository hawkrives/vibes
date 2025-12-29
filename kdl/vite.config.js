import { defineConfig } from 'vite';
import { playwright } from '@vitest/browser-playwright';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    open: true,
  },
  test: {
    // Use happy-dom for DOM environment in unit tests
    environment: 'happy-dom',
    // Browser mode configuration for when needed
    // Use --browser flag to enable: pnpm test --browser
    browser: {
      enabled: false,
      provider: playwright(),
      instances: [
        {
          browser: 'chromium',
          headless: true,
          screenshotOnFailure: true,
        },
      ],
    },
    include: ['**/*.test.js'],
  },
});
