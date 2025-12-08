# Dependency Audit Report

## Security Vulnerabilities Found

### High Severity
1. **glob CLI: Command injection** (via @vitest/coverage-v8>test-exclude>glob)
   - Vulnerable: >=10.2.0 <10.5.0
   - Patched: >=10.5.0
   - Fix: Update vitest and related packages

### Moderate Severity
1. **esbuild: Development server vulnerability** (via vitest>vite>esbuild)
   - Vulnerable: <=0.24.2
   - Patched: >=0.25.0
   - Fix: Update vite/vitest

2. **js-yaml: Prototype pollution** (via eslint>@eslint/eslintrc>js-yaml)
   - Vulnerable: >=4.0.0 <4.1.1
   - Patched: >=4.1.1
   - Fix: Update eslint

## Outdated Packages

### Major Version Updates Available
- vitest: 2.1.9 → 4.0.13 (major update)
- @vitest/coverage-v8: 2.1.9 → 4.0.13 (major update)
- @vitest/ui: 2.1.9 → 4.0.13 (major update)
- @mui/material: 6.5.0 → 7.3.5 (major update)
- @mui/icons-material: 6.5.0 → 7.3.5 (major update)
- tailwindcss: 3.4.18 → 4.1.17 (major update)

### Minor/Patch Updates Available
- @types/node: 24.10.0 → 24.10.1
- @types/react: 19.2.2 → 19.2.7
- @types/react-dom: 19.2.2 → 19.2.3
- @vitejs/plugin-react: 5.1.0 → 5.1.1
- autoprefixer: 10.4.21 → 10.4.22
- react-router-dom: 7.9.5 → 7.9.6
- vite: 7.2.2 → 7.2.4
- @reduxjs/toolkit: 2.10.1 → 2.11.0
- jsdom: 27.1.0 → 27.2.0
- typescript: 5.8.3 → 5.9.3
- typescript-eslint: 8.46.3 → 8.47.0
- eslint-plugin-react-hooks: 5.2.0 → 7.0.1

## Upgrade Strategy

1. **Priority 1: Fix Security Vulnerabilities**
   - Update vitest ecosystem to latest (4.x) to fix glob and esbuild issues
   - Update eslint to fix js-yaml issue

2. **Priority 2: Update Minor/Patch Versions**
   - Safe to update without breaking changes

3. **Priority 3: Evaluate Major Version Updates**
   - Test thoroughly after major version updates
   - MUI v7 and Tailwind v4 may require code changes

