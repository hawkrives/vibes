import { defineConfig } from 'vite';
import { playwright } from '@vitest/browser/providers/playwright';

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
    browser: {
      enabled: true,
      name: 'chromium',
      provider: playwright(),
      headless: true,
      screenshotOnFailure: true,
    },
    include: ['**/*.test.js'],
  },
});
