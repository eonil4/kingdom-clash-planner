/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  cacheDir: 'node_modules/.vite',
  resolve: {
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],
  },
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify('0.11.0'),
  },
  test: {
    globals: true,
    environment: 'jsdom',
    passWithNoTests: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/unit/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', 'tests/e2e/**', 'tests/integration/**'],
    isolate: true,
    maxConcurrency: 8,
    pool: 'threads',
    fileParallelism: true,
    sequence: {
      shuffle: false,
    },
    testTimeout: 10000,
    hookTimeout: 10000,
    environmentOptions: {
      jsdom: {
        resources: 'usable',
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
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
