/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  cacheDir: 'node_modules/.vite',
  resolve: {
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split React and React DOM into separate chunk
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Split MUI into separate chunk
          'mui-vendor': [
            '@mui/material',
            '@mui/icons-material',
            '@emotion/react',
            '@emotion/styled',
          ],
          // Split Redux into separate chunk
          'redux-vendor': ['@reduxjs/toolkit', 'react-redux', 'redux-saga'],
          // Split react-dnd into separate chunk
          'dnd-vendor': ['react-dnd', 'react-dnd-html5-backend'],
        },
      },
    },
    // Increase chunk size warning limit to 1000kb (default is 500kb)
    // This is reasonable for a game planner app with many assets
    chunkSizeWarningLimit: 1000,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    passWithNoTests: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/unit/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', 'tests/e2e/**', 'tests/integration/**'],
    // Enable test file isolation to prevent mock leakage between files
    isolate: true,
    // Increase concurrency for better parallelization
    maxConcurrency: 8,
    // Use threads pool (default in Vitest 4.0)
    pool: 'threads',
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
        'src/assets/',
        '**/*.config.*',
        '**/*.d.ts',
        '**/index.ts'
      ],
    },
  },
})

