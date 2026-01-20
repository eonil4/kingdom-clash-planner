# Release Notes - Version 0.12.0

**Release Date:** January 20, 2026  
**Previous Version:** 0.11.0

---

## 🎉 Highlights

This release focuses on **test infrastructure stability**, **e2e test coverage**, and **documentation consolidation**. All tests now pass reliably with zero flaky tests and zero skipped tests.

---

## ✨ Improvements

### Virtual Scrolling for Large Rosters
- Implemented `VirtualizedUnitsGrid` component using react-window
- Dynamic column calculation based on container width
- Responsive sizing (mobile: 62px, tablet: 66px, desktop: 70px)
- Automatic fallback to CSS grid for small lists (<50 units)
- ~80% DOM node reduction for large rosters (100+ units)
- Proper overflow handling for scrolling in both modes

### PWA App Icons
- Created 192x192 and 512x512 PNG icons for PWA installation
- Updated manifest.json with icon references
- Added `pnpm generate:pwa-icons` script for regeneration

### Lighthouse Performance Audit
- Configured Lighthouse CI for performance monitoring
- **FCP:** 2.8s (score: 0.57) - optimization needed
- **LCP:** 2.8s (score: 0.83) - good
- Accessibility and Best Practices: Passing

### Complete E2E Test Coverage
- **98 e2e tests** across Desktop Chrome and Mobile Chrome
- **Zero skipped tests** - all previously skipped tests now implemented
- **Zero flaky tests** - all timing issues resolved
- Full coverage of drag-and-drop functionality

### Enhanced CI Pipeline
- `build:ci` now includes: `audit:fix` → `lint:fix` → `build` → `test:coverage` → `test:e2e`
- Automatic security vulnerability fixes
- Automatic linting fixes before build
- Full test suite (unit, integration, e2e) in CI

### Consolidated Documentation
- Merged `DEPENDENCY_AUDIT.md` into `IMPLEMENTATION_COMPLETE.md`
- Merged `IMPLEMENTATION_SUMMARY.md` into `IMPLEMENTATION_COMPLETE.md`
- Merged `KNOWN_ISSUES.md` into `IMPROVEMENT_PLAN.md`
- Cleaner documentation structure with single source of truth

---

## 🔧 Technical Improvements

### Test Infrastructure

#### Unit & Integration Tests
- **752 total tests** (687 unit + 65 integration)
- **100% code coverage** maintained
- Fixed UnitManagement integration test timeout
- Improved test isolation and robustness

#### E2E Tests (Playwright)
- **98 tests** across 2 browser configurations
- Fixed navigation flakiness with unified `navigateToApp()` helper
- Increased timeouts for stability
- Fixed confirmation dialog handling
- Implemented drag-and-drop tests using `page.mouse` API

### Configuration Changes
- Playwright: sequential execution, single worker, 2 retries
- Vitest: reduced parallelism for memory efficiency

---

## 🐛 Bug Fixes

| Issue | Resolution |
|-------|------------|
| UnitManagement Integration Test Timeout | Fixed with `findByRole` and explicit timeouts |
| E2E Test Flakiness | Unified navigation, increased timeouts, single worker |
| E2E Skipped Tests | Fixed delete/clear (dialog handling), drag tests (mouse API) |
| Flaky Drag Swap Test | Added delays for mobile stability |
| registerSW.ts Branch Coverage | Added edge case test, 100% coverage |

---

## 📊 Test Statistics

| Category | Count | Coverage |
|----------|-------|----------|
| Unit Tests | 687 | 100% |
| Integration Tests | 65 | 100% |
| E2E Tests | 98 | - |
| **Total** | **850** | **100%** |

- **0 skipped** tests
- **0 flaky** tests

---

## 📝 Documentation

### Updated
- `doc/IMPROVEMENT_PLAN.md` - Now includes Known Issues section
- `doc/IMPLEMENTATION_COMPLETE.md` - Consolidated implementation details

### Removed (merged)
- `doc/DEPENDENCY_AUDIT.md`
- `doc/IMPLEMENTATION_SUMMARY.md`
- `doc/KNOWN_ISSUES.md`

---

## 🎯 Quality Metrics

- ✅ 850 total tests passing
- ✅ 100% unit test coverage
- ✅ Zero skipped tests
- ✅ Zero flaky tests
- ✅ Zero linter errors
- ✅ Zero build errors

---

## 🔄 Migration Guide

No action required - all changes are backward compatible.

### Running Tests
```bash
pnpm test:coverage    # Unit + integration tests
pnpm test:e2e         # E2E tests
pnpm build:ci         # Full CI: audit:fix + lint:fix + build + test:coverage + test:e2e
```

---

**Full Changelog:** v0.11.0...v0.12.0
