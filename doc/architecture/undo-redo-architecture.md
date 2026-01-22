# Undo/Redo Architecture Plan

**Date:** January 17, 2026  
**Version:** 0.13.0 (Implemented)  
**Status:** IMPLEMENTATION COMPLETE

---

## Overview

This document outlines the architecture for implementing undo/redo functionality in the Kingdom Clash Planner application. The system will allow users to undo and redo actions that modify the formation state.

---

## Goals

1. **User Experience**: Enable users to undo/redo formation modifications (place, remove, swap, edit units, rename formation)
2. **Performance**: Efficient memory usage with configurable history limit
3. **State Management**: Integrate seamlessly with existing Redux Toolkit architecture
4. **Accessibility**: Keyboard shortcuts (Ctrl+Z / Cmd+Z for undo, Ctrl+Shift+Z / Cmd+Shift+Z for redo)

---

## Scope

### Actions to Track (Undoable)

**Formation Actions:**
- `placeUnit` - Place a unit on the formation grid
- `removeUnit` - Remove a unit from the formation grid
- `swapUnits` - Swap two units in the formation
- `updateUnitInFormation` - Edit a unit's properties in the formation
- `updateFormationName` - Rename the formation

**Actions NOT to Track:**
- `setCurrentFormation` - Loading/resetting formation (explicit user action)
- `setUnits` - Bulk unit operations (managed separately)
- `setSortOption`, `setSearchTerm` - UI state, not formation state
- Unit roster management (add/edit/delete units) - Separate concern

### Actions to Track (Future Consideration)

- Unit roster modifications (add/edit/delete units) - Could be added in Phase 2

---

## Architecture Design

### Approach: Redux Middleware with History Stack

**Why Middleware?**
- Intercepts actions before they reach reducers
- Can capture state snapshots efficiently
- Non-invasive to existing code
- Works seamlessly with Redux Toolkit

**Alternative Considered:**
- Redux-undo library - Adds complexity, may conflict with Immer
- Action replay - Requires action serialization, more complex
- Command pattern - Over-engineered for current needs

### State Structure

```typescript
interface HistoryState {
  past: Formation[];        // Stack of previous states (for undo)
  present: Formation | null; // Current formation state
  future: Formation[];       // Stack of future states (for redo)
  maxHistorySize: number;    // Configurable limit (default: 50)
}
```

**Memory Optimization:**
- Store only formation state (not entire app state)
- Limit history to 50 actions (configurable)
- Use shallow comparison to detect actual changes

### Redux Store Structure

```
RootState
├── formation (existing)
│   └── currentFormation: Formation | null
├── history (new)
│   ├── past: Formation[]
│   ├── present: Formation | null
│   ├── future: Formation[]
│   └── maxHistorySize: number
└── unit (existing)
    └── ...
```

---

## Implementation Plan

### Phase 1: Core Undo/Redo Infrastructure

#### 1.1 Create History Slice (`src/store/reducers/historySlice.ts`)

**Actions:**
- `undo()` - Move present to future, pop from past
- `redo()` - Move present to past, pop from future
- `clearHistory()` - Reset history state
- `setMaxHistorySize(number)` - Configure history limit

**State:**
```typescript
interface HistoryState {
  past: Formation[];
  present: Formation | null;
  future: Formation[];
  maxHistorySize: number;
}
```

#### 1.2 Create History Middleware (`src/store/middleware/historyMiddleware.ts`)

**Responsibilities:**
- Intercept formation-modifying actions
- Capture formation state before action
- Push to `past` stack
- Clear `future` stack on new action
- Enforce `maxHistorySize` limit

**Intercepted Actions:**
- `formation/placeUnit`
- `formation/removeUnit`
- `formation/swapUnits`
- `formation/updateUnitInFormation`
- `formation/updateFormationName`

**Logic:**
```typescript
// Pseudo-code
if (action.type matches undoable actions) {
  const currentFormation = getState().formation.currentFormation;
  if (currentFormation) {
    // Push current state to past
    dispatch(addToHistory(currentFormation));
    // Clear future (new action breaks redo chain)
    dispatch(clearFuture());
  }
}
// Continue with original action
```

#### 1.3 Update Root Reducer

Add `history` reducer to root reducer:
```typescript
const rootReducer = combineReducers({
  formation: formationReducer,
  unit: unitReducer,
  history: historyReducer, // NEW
});
```

#### 1.4 Register Middleware

Update store configuration:
```typescript
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: false,
    })
      .concat(sagaMiddleware)
      .concat(historyMiddleware), // NEW
});
```

### Phase 2: UI Integration

#### 2.1 Create Undo/Redo Hooks (`src/hooks/useUndoRedo.ts`)

**API:**
```typescript
interface UseUndoRedoReturn {
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  undoCount: number;
  redoCount: number;
}
```

**Implementation:**
- Read `history` state from Redux
- Dispatch `history/undo` and `history/redo` actions
- Update formation state when undo/redo occurs

#### 2.2 Add Undo/Redo to Formation Header

**UI Elements:**
- Undo button (disabled when `canUndo === false`)
- Redo button (disabled when `canRedo === false`)
- Keyboard shortcuts indicator (tooltip)

**Location:** `src/components/organisms/FormationHeader/FormationHeader.tsx`

#### 2.3 Keyboard Shortcuts

**Implementation:**
- Global keyboard event listener
- `Ctrl+Z` / `Cmd+Z` → Undo
- `Ctrl+Shift+Z` / `Cmd+Shift+Z` → Redo
- Prevent default browser undo behavior

**Location:** `src/hooks/useKeyboardShortcuts.ts` (new) or integrate into existing hook

### Phase 3: Edge Cases & Optimization

#### 3.1 Batch Actions

**Problem:** Multiple rapid actions (e.g., drag-and-drop) should be grouped

**Solution:**
- Debounce history entries (300ms window)
- Or: Detect action sequences and group them
- Or: Use action metadata to mark batched actions

**Decision:** Start with simple approach (each action = one history entry), optimize later if needed

#### 3.2 State Comparison

**Problem:** Avoid storing duplicate states (e.g., place then immediately remove)

**Solution:**
- Shallow comparison of formation tiles
- Skip history entry if state unchanged
- Use `JSON.stringify` for quick comparison (or deep equality check)

#### 3.3 Memory Management

**Problem:** Large history stacks consume memory

**Solution:**
- Configurable `maxHistorySize` (default: 50)
- Remove oldest entries when limit exceeded
- Consider compression for very large formations (future)

#### 3.4 URL Synchronization

**Problem:** Undo/redo should update URL parameters

**Solution:**
- History middleware should trigger URL update
- Use existing URL sync mechanism in `useInitializeData.ts`
- Ensure undo/redo doesn't conflict with URL loading

---

## Technical Details

### Action Flow

```
User Action (e.g., placeUnit)
  ↓
History Middleware intercepts
  ↓
Captures current formation state
  ↓
Pushes to past stack
  ↓
Clears future stack
  ↓
Original action proceeds to reducer
  ↓
Formation state updated
```

### Undo Flow

```
User clicks Undo (or Ctrl+Z)
  ↓
Dispatch history/undo action
  ↓
History reducer:
  - Pop from past → present
  - Push current present → future
  ↓
Dispatch formation/setCurrentFormation with past state
  ↓
Formation state restored
  ↓
URL updated (via existing sync)
```

### Redo Flow

```
User clicks Redo (or Ctrl+Shift+Z)
  ↓
Dispatch history/redo action
  ↓
History reducer:
  - Pop from future → present
  - Push current present → past
  ↓
Dispatch formation/setCurrentFormation with future state
  ↓
Formation state restored
  ↓
URL updated (via existing sync)
```

---

## File Structure

```
src/
├── store/
│   ├── reducers/
│   │   ├── historySlice.ts          # NEW - History state management
│   │   ├── formationSlice.ts        # EXISTING - No changes needed
│   │   └── index.ts                  # MODIFY - Add history reducer
│   ├── middleware/
│   │   └── historyMiddleware.ts      # NEW - Capture state changes
│   └── index.ts                      # MODIFY - Register middleware
├── hooks/
│   ├── useUndoRedo.ts                # NEW - Undo/redo hook
│   └── useKeyboardShortcuts.ts       # NEW - Keyboard shortcuts
└── components/
    └── organisms/
        └── FormationHeader/
            └── FormationHeader.tsx   # MODIFY - Add undo/redo buttons
```

---

## Testing Strategy

### Unit Tests

1. **historySlice.test.ts**
   - Test undo/redo actions
   - Test history limit enforcement
   - Test state transitions

2. **historyMiddleware.test.ts**
   - Test action interception
   - Test state capture
   - Test future clearing on new action

3. **useUndoRedo.test.ts**
   - Test hook return values
   - Test undo/redo execution
   - Test disabled states

### Integration Tests

1. **Undo/Redo Flow**
   - Place unit → undo → verify unit removed
   - Place unit → remove unit → undo → verify unit back
   - Multiple undos → verify state restoration
   - Undo → new action → verify redo disabled

2. **Keyboard Shortcuts**
   - Test Ctrl+Z undo
   - Test Ctrl+Shift+Z redo
   - Test disabled states

3. **URL Synchronization**
   - Undo → verify URL updated
   - Redo → verify URL updated

---

## Performance Considerations

### Memory Usage

**Estimated per History Entry:**
- Formation object: ~2-5 KB (7x7 grid, ~49 units max)
- 50 entries: ~100-250 KB total
- Acceptable for modern browsers

**Optimization Strategies:**
- Store only changed tiles (delta compression) - Future enhancement
- Use Immutable.js for structural sharing - Consider if memory becomes issue
- Limit history size based on device memory - Future enhancement

### Performance Impact

**Middleware Overhead:**
- Minimal: Only intercepts 5 action types
- State capture: Shallow copy of formation object
- History push: O(1) array operation

**Expected Impact:**
- < 5ms overhead per undoable action
- Negligible user-perceived impact

---

## Accessibility

### Keyboard Shortcuts

- **Undo:** `Ctrl+Z` (Windows/Linux) / `Cmd+Z` (Mac)
- **Redo:** `Ctrl+Shift+Z` (Windows/Linux) / `Cmd+Shift+Z` (Mac)

### Screen Reader Support

- Undo/redo buttons have proper ARIA labels
- Announce state changes (e.g., "Undone: Unit placed")
- Disabled state properly communicated

### Visual Indicators

- Undo/redo buttons show disabled state
- Tooltip shows keyboard shortcut
- Optional: History count indicator

---

## Future Enhancements

### Phase 2: Extended History

- Track unit roster modifications
- Track formation template operations
- Cross-session history persistence (localStorage)

### Phase 3: Advanced Features

- History visualization (timeline view)
- Named checkpoints (save points)
- History search/filter
- Export/import history

---

## Migration Path

### Backward Compatibility

- No breaking changes to existing APIs
- History feature is additive
- Existing functionality unchanged

### Rollout Strategy

1. Implement core infrastructure (Phase 1)
2. Add UI controls (Phase 2)
3. Test thoroughly
4. Enable by default
5. Monitor performance and memory usage

---

## Success Criteria

✅ Users can undo formation modifications  
✅ Users can redo undone actions  
✅ Keyboard shortcuts work as expected  
✅ History limit prevents excessive memory usage  
✅ No performance degradation  
✅ URL synchronization works correctly  
✅ All existing tests pass  
✅ New tests achieve 100% coverage  

---

## References

- [Redux Toolkit Middleware](https://redux-toolkit.js.org/api/getDefaultMiddleware)
- [Command Pattern](https://refactoring.guru/design-patterns/command)
- [Redux Undo Library](https://github.com/omnidan/redux-undo) - Reference implementation
- [WCAG Keyboard Accessibility](https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html)

---

**Next Steps:**
1. Review and approve architecture
2. Implement Phase 1 (Core Infrastructure)
3. Add unit tests
4. Implement Phase 2 (UI Integration)
5. Integration testing
6. Performance testing
7. Documentation updates
