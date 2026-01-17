/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  cacheDir: 'node_modules/.vite',
  resolve: {
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    passWithNoTests: true,
    setupFiles: ['./tests/integration/setup.ts'],
    include: ['tests/integration/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', 'tests/e2e/**', 'tests/unit/**'],
    isolate: true,
    maxConcurrency: 4,
    pool: 'threads',
    fileParallelism: true,
    sequence: {
      shuffle: false,
    },
    testTimeout: 30000,
    hookTimeout: 30000,
    environmentOptions: {
      jsdom: {
        resources: 'usable',
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './tests/integration/coverage',
      exclude: [
        'node_modules/',
        'tests/',
        'dist/',
        'scripts/',
        'src/assets/',
        '**/*.config.*',
        '**/*.d.ts',
        '**/index.ts',
        'src/utils/deviceUtils.ts'
      ],
    },
  },
})
