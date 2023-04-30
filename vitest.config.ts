import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,

    // This gets resolved *per project* (each package, plus the root)
    setupFiles: './setupTests.ts',

    coverage: {
      exclude: [...configDefaults.exclude, '**/__tests__/**', '**/legacy-types/**'],
      reporter: ['html', 'lcov'],
    },
  },
});
