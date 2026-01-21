import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const srcRoot = fileURLToPath(new URL('./src', import.meta.url));

export default defineConfig({
  resolve: {
    alias: [{ find: /^#(.*)$/, replacement: `${srcRoot}/$1` }],
  },
  test: {
    environment: 'node',
    setupFiles: ['dotenv/config'],
    coverage: {
      all: true,
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts'],
    },
  },
});
