import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

/**
 * Mirrors the `@/*` → `src/*` alias in tsconfig.json so tests import with the
 * same specifiers as app code. Pure-logic tests only (no RN rendering yet).
 */
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/__tests__/**/*.test.ts'],
  },
});
