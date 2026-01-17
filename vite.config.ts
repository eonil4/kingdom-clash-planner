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
    open: '/?formation=HuN|eonil%20-%20Arena%201%20(2025-11-09);14,10;14,10;14,10;24,10;14,10;14,10;14,10;15,10;26,10;33,10;33,8;33,10;26,9;15,10;11,10;11,10;23,10;23,9;23,10;11,10;11,10;11,10;11,10;31,10;27,10;31,10;11,10;11,10;11,10;11,10;25,10;6,6;25,10;11,10;11,10;6,10;1,10;1,9;6,7;1,6;1,10;6,10;22,10;18,10;18,9;22,8;18,7;18,10;22,10&units=0,10,2;21,10,1;29,10,1;30,10,1;34,10,1;3,10,15;5,10,14;9,10,15;11,10,3;12,10,13;14,10,8;17,10,14;20,10,14;35,10,14;32,10,1;21,9,1;27,9,1;34,9,1;3,9,1;12,9,1;35,9,1;28,8,1;0,8,1;21,8,1;24,8,1;3,8,1;5,8,1;11,8,1;12,8,1;14,8,1;17,8,1;20,8,1;15,7,1;26,7,1;0,7,1;21,7,1;24,7,1;27,7,1;29,7,1;11,7,1;12,7,1;14,7,1;6,6,1;31,6,1;1,6,1;24,6,1;29,6,1;34,6,1;9,6,1;17,6,1;20,6,1;35,6,1;15,5,1;26,5,1;31,5,1;1,5,1;24,5,1;27,5,1;34,5,1;5,5,1;9,5,1;12,5,1;14,5,1;20,5,1;35,5,1;6,4,1;15,4,1;16,4,1;18,4,1;21,4,1;22,4,1;23,4,1;24,4,1;25,4,1;30,4,1;3,4,1;5,4,1;35,4,1;16,3,1;0,3,1;1,3,1;21,3,1;27,3,1;29,3,1;30,3,1;34,3,1;3,3,1;9,3,1;11,3,1;17,3,1;20,3,1;35,3,1;15,2,1;26,2,1;0,2,1;1,2,1;18,2,1;21,2,1;22,2,1;23,2,1;25,2,1;27,2,1;30,2,1;34,2,1;12,2,1'
  },
  define: {
    // Map the package version to a Vite-accessible environment variable
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(process.env.npm_package_version),
  },
  build: {
    target: 'es2020',
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
          'dnd-vendor': ['react-dnd', 'react-dnd-html5-backend', 'react-dnd-touch-backend'],
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    cssCodeSplit: true,
    sourcemap: false,
    // Increase chunk size warning limit to 1000kb (default is 500kb)
    // This is reasonable for a game planner app with many assets
    chunkSizeWarningLimit: 1000,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    passWithNoTests: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/{unit,integration}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', 'tests/e2e/**'],
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
    // Test timeout (increased for integration tests)
    testTimeout: 30000,
    // Hook timeout
    hookTimeout: 30000,
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
        '**/index.ts',
        'src/utils/deviceUtils.ts'
      ],
    },
  },
})
