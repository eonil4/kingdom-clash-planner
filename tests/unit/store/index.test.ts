import { describe, it, expect } from 'vitest';
import { store } from '../../../src/store/index';
import type { RootState, AppDispatch } from '../../../src/store/index';

describe('store/index', () => {
  it('should export store', () => {
    expect(store).toBeDefined();
    expect(store.getState).toBeDefined();
    expect(store.dispatch).toBeDefined();
  });

  it('should have initial state', () => {
    const state = store.getState();
    expect(state).toBeDefined();
    expect(state.formation).toBeDefined();
    expect(state.unit).toBeDefined();
  });

  it('should export RootState type', () => {
    // Type check - if this compiles, the type is exported
    const state: RootState = store.getState();
    expect(state).toBeDefined();
  });

  it('should export AppDispatch type', () => {
    // Type check - if this compiles, the type is exported
    const dispatch: AppDispatch = store.dispatch;
    expect(dispatch).toBeDefined();
  });
});

