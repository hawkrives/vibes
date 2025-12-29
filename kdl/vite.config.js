import { defineConfig } from 'vite';

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
      name: 'playwright',
      provider: 'playwright',
      headless: true,
      screenshotOnFailure: true,
    },
    include: ['**/*.test.js'],
  },
});
