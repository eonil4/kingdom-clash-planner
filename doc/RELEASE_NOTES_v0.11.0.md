# Release Notes - Version 0.11.0

**Release Date:** January 17, 2026  
**Previous Version:** 0.10.0

---

## 🎉 Highlights

This release focuses on **performance optimization**, **user experience improvements**, and **progressive web app capabilities**. All improvements maintain 100% test coverage with 739 passing tests.

---

## ✨ New Features

### Toast Notification System
- Replaced intrusive `alert()` dialogs with elegant toast notifications
- Non-blocking error messages with automatic dismissal
- Consistent styling with Material-UI design system
- Accessible notifications with proper ARIA attributes

### Progressive Web App (PWA)
- **Install as App:** Can now be installed on mobile and desktop devices
- **Offline Support:** Works offline after first visit with service worker caching
- **App Shortcuts:** Quick actions from home screen
- **Standalone Mode:** Runs as a native-like application

### Enhanced Accessibility
- **Visible Focus Indicators:** 3:1 contrast ratio for keyboard navigation
- **High Contrast Mode:** Automatic support for users with visual impairments
- **Reduced Motion:** Respects user preferences for animations
- **WCAG AAA Compliance:** Enhanced accessibility standards

---

## 🚀 Performance Improvements

### Image Optimization
- **89.6% size reduction:** All 37 unit images converted from PNG to WebP
- **Before:** 1,248 KB total
- **After:** 130 KB total
- **Faster loading:** Especially noticeable on mobile and slow connections

### Loading Performance
- **DNS Prefetch:** Faster external resource loading
- **Font Optimization:** Added `font-display: swap` for faster text rendering
- **Critical CSS:** Enhanced inline styles for faster first paint
- **Build Optimization:** ES2020 target with improved code splitting

### Runtime Performance
- **React Window:** Package installed for virtual scrolling (ready for large rosters)
- **Improved Containment:** Better browser optimization with CSS containment
- **Animation Optimization:** Added `will-change` for smoother transitions

---

## 🔧 Technical Improvements

### Test Infrastructure
- **New Scripts:** `test` and `test:coverage` for combined unit + integration tests
- **739 Total Tests:** 674 unit tests + 65 integration tests
- **100% Coverage:** Maintained across all improvements
- **Fixed Test Isolation:** Proper mocking of toast notifications

### Code Quality
- **Zero Linter Errors:** Clean codebase
- **1 Non-Critical Warning:** Fast refresh in ToastContext (cosmetic)
- **Build Time:** ~30 seconds (optimized)

---

## 📦 Dependencies

### Added
- `react-window@2.2.5` - Virtual scrolling for large lists

### Updated
- Build configuration optimized for production

---

## 🐛 Bug Fixes

- Fixed test failures after toast notification migration
- Improved error handling throughout the application
- Better user feedback for validation errors

---

## 📝 Documentation

### New Documents
- `doc/IMPROVEMENT_PLAN.md` - Comprehensive improvement roadmap
- `doc/IMPLEMENTATION_SUMMARY.md` - Detailed implementation details
- `doc/KNOWN_ISSUES.md` - Known issues and resolutions
- `doc/RELEASE_NOTES_v0.11.0.md` - This document

---

## 🔄 Migration Guide

### For Users
No action required - all changes are backward compatible. Existing formations in URLs will continue to work.

### For Developers
1. **Toast Notifications:** Use `useToast()` hook instead of `alert()`
   ```typescript
   const { showError, showSuccess } = useToast();
   showError('Error message');
   ```

2. **Test Wrappers:** Include `ToastProvider` in test wrappers
   ```typescript
   <Provider store={store}>
     <ToastProvider>
       {children}
     </ToastProvider>
   </Provider>
   ```

3. **PWA Testing:** Test offline functionality after building
   ```bash
   pnpm build
   pnpm preview
   # Open DevTools > Application > Service Workers
   ```

---

## 🎯 Success Metrics

### Performance
- ✅ Build succeeds in ~30 seconds
- ✅ Image payload reduced by 89.6%
- ✅ Critical rendering path optimized
- ⏳ Lighthouse scores (to be measured post-deployment)

### Quality
- ✅ 100% test coverage maintained
- ✅ 739 tests passing (674 unit + 65 integration)
- ✅ Zero linter errors
- ✅ Zero build errors

### User Experience
- ✅ Non-blocking error notifications
- ✅ Offline functionality
- ✅ App installation support
- ✅ Enhanced keyboard navigation

---

## 🔮 What's Next (v0.12.0)

### Planned Features
1. **Undo/Redo System** - Comprehensive action history
2. **Formation Templates** - Predefined and custom templates
3. **Statistics Dashboard** - Unit usage analytics
4. **Internationalization** - Multi-language support

### Performance Goals
- Lighthouse Performance score > 95
- First Contentful Paint < 1.5s
- Largest Contentful Paint < 2.0s

---

## 🙏 Acknowledgments

This release implements improvements from the comprehensive project analysis and improvement plan created on January 17, 2026.

---

## 📞 Support

For issues or questions:
- Check `doc/KNOWN_ISSUES.md` for known issues
- Review `doc/IMPROVEMENT_PLAN.md` for future roadmap
- See `README.md` for usage instructions

---

**Full Changelog:** v0.10.0...v0.11.0
