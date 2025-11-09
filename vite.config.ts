import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  cacheDir: 'node_modules/.vite',
  server: {
    port: 3000,
    open: true
  },
  // @ts-expect-error - vitest config extension
  test: {
    globals: true,
    environment: 'jsdom',
    passWithNoTests: true,
    setupFiles: ['./tests/setup.ts'],
    // File-level isolation (faster than per-test isolation while still safe)
    isolate: false,
    // Increase concurrency for better parallelization
    maxConcurrency: 8,
    // Use threads pool with proper isolation
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        isolate: true, // Keep isolation for test safety
      },
    },
    // Run more files in parallel
    fileParallelism: true,
    // Disable test shuffling to avoid overhead
    sequence: {
      shuffle: false,
    },
    // Test timeout
    testTimeout: 10000,
    // Hook timeout
    hookTimeout: 10000,
    // Optimize JSDOM environment
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
        '**/*.config.*',
        '**/mockData.ts',
        '**/*.d.ts',
      ],
    },
  },
})

