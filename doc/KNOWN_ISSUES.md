# Known Issues

**Date:** January 17, 2026  
**Version:** 0.11.0

## Test Failures

### Unit Tests - Toast Notification Migration
**Status:** ✅ RESOLVED  
**Resolution Date:** January 17, 2026

**Description:**
After replacing `alert()` calls with toast notifications, tests were updated to:
1. Mock the `useToast` hook with trackable functions
2. Verify `showError()` is called instead of `alert()`
3. Update test wrappers to include ToastProvider

**Changes Made:**
- Updated `useManageUnits.test.tsx` with proper toast mocks
- Updated `FormationPlanner.test.tsx` with toast verification
- Updated integration test utilities to include ToastProvider
- All 674 unit tests + 65 integration tests now pass

**Result:**
✅ All tests passing (739 total tests)

---

## PWA Icons Missing

**Status:** Low Priority  
**Description:**
The `manifest.json` references icon files (`icon-192.png`, `icon-512.png`) that don't exist yet.

**Impact:**
- PWA installation works but uses default browser icon
- No functional impact on the application

**Resolution:**
Create proper app icons in the required sizes:
- 192x192 pixels
- 512x512 pixels

---

## Linter Warning

**Status:** Non-Critical  
**File:** `src/contexts/ToastContext.tsx`

**Warning:**
```
Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components
```

**Impact:**
- No functional impact
- Fast refresh still works correctly

**Resolution:**
Split the file into:
- `ToastContext.tsx` - Context and Provider component only
- `useToastContext.ts` - Hook export

---

## Service Worker Limitations

**Status:** Enhancement Opportunity  
**Description:**
Current service worker implementation is basic and could be enhanced with:
- Workbox for better caching strategies
- Background sync for offline actions
- Push notification support
- More granular cache control

**Impact:**
- Basic offline functionality works
- Could be more robust for production use

**Resolution:**
Consider integrating Workbox in future release for production-grade PWA features.

---

## Integration Test Coverage Files

**Status:** Non-Critical  
**Files:** `tests/integration/coverage/*.js`

**Warning:**
```
Unused eslint-disable directive (no problems were reported)
```

**Impact:**
- No functional impact
- Generated coverage files have unnecessary eslint-disable comments

**Resolution:**
Update coverage report generation to exclude eslint-disable or add to .eslintignore

---

## Summary

- **Critical Issues:** 0
- **Non-Critical Issues:** 5
- **Overall Health:** Good ✅

All issues are either cosmetic, related to test infrastructure, or enhancement opportunities. No issues block deployment or affect end-user functionality.
