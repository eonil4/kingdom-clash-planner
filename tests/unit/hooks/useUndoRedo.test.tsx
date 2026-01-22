import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useUndoRedo } from '../../../src/hooks/useUndoRedo';
import historyReducer from '../../../src/store/reducers/historySlice';
import formationReducer from '../../../src/store/reducers/formationSlice';
import type { Formation } from '../../../src/types';

const createMockFormation = (id: string, name: string): Formation => ({
  id,
  name,
  tiles: Array(7)
    .fill(null)
    .map(() => Array(7).fill(null)),
  power: 0,
});

const createMockStore = (historyState: {
  past: Formation[];
  present: Formation | null;
  future: Formation[];
  maxHistorySize: number;
}) => {
  return configureStore({
    reducer: {
      history: historyReducer,
      formation: formationReducer,
    },
    preloadedState: {
      history: historyState,
      formation: {
        currentFormation: historyState.present,
      },
    },
  });
};

describe('useUndoRedo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return correct canUndo and canRedo when history is empty', () => {
    const store = createMockStore({
      past: [],
      present: null,
      future: [],
      maxHistorySize: 50,
    });

    const { result } = renderHook(() => useUndoRedo(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
    expect(result.current.undoCount).toBe(0);
    expect(result.current.redoCount).toBe(0);
  });

  it('should return correct canUndo when past has items and present is not null', () => {
    const formation1 = createMockFormation('1', 'Formation 1');
    const formation2 = createMockFormation('2', 'Formation 2');

    const store = createMockStore({
      past: [formation1],
      present: formation2,
      future: [],
      maxHistorySize: 50,
    });

    const { result } = renderHook(() => useUndoRedo(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);
    expect(result.current.undoCount).toBe(1);
    expect(result.current.redoCount).toBe(0);
  });

  it('should return correct canRedo when future has items', () => {
    const formation1 = createMockFormation('1', 'Formation 1');
    const formation2 = createMockFormation('2', 'Formation 2');

    const store = createMockStore({
      past: [],
      present: formation1,
      future: [formation2],
      maxHistorySize: 50,
    });

    const { result } = renderHook(() => useUndoRedo(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(true);
    expect(result.current.undoCount).toBe(0);
    expect(result.current.redoCount).toBe(1);
  });

  it('should not call dispatch when undo is called but canUndo is false', () => {
    const store = createMockStore({
      past: [],
      present: null,
      future: [],
      maxHistorySize: 50,
    });

    const dispatchSpy = vi.spyOn(store, 'dispatch');

    const { result } = renderHook(() => useUndoRedo(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    act(() => {
      result.current.undo();
    });

    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it('should not call dispatch when redo is called but canRedo is false', () => {
    const store = createMockStore({
      past: [],
      present: null,
      future: [],
      maxHistorySize: 50,
    });

    const dispatchSpy = vi.spyOn(store, 'dispatch');

    const { result } = renderHook(() => useUndoRedo(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    act(() => {
      result.current.redo();
    });

    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it('should call dispatch when undo is called and canUndo is true', () => {
    const formation1 = createMockFormation('1', 'Formation 1');
    const formation2 = createMockFormation('2', 'Formation 2');

    const store = createMockStore({
      past: [formation1],
      present: formation2,
      future: [],
      maxHistorySize: 50,
    });

    const dispatchSpy = vi.spyOn(store, 'dispatch');

    const { result } = renderHook(() => useUndoRedo(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    act(() => {
      result.current.undo();
    });

    expect(dispatchSpy).toHaveBeenCalledTimes(2);
  });

  it('should call dispatch when redo is called and canRedo is true', () => {
    const formation1 = createMockFormation('1', 'Formation 1');
    const formation2 = createMockFormation('2', 'Formation 2');

    const store = createMockStore({
      past: [],
      present: formation1,
      future: [formation2],
      maxHistorySize: 50,
    });

    const dispatchSpy = vi.spyOn(store, 'dispatch');

    const { result } = renderHook(() => useUndoRedo(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    act(() => {
      result.current.redo();
    });

    expect(dispatchSpy).toHaveBeenCalledTimes(2);
  });

  it('should call dispatch when undo is called and previousState exists', () => {
    const formation1 = createMockFormation('1', 'Formation 1');
    const formation2 = createMockFormation('2', 'Formation 2');

    const store = createMockStore({
      past: [formation1],
      present: formation2,
      future: [],
      maxHistorySize: 50,
    });

    const dispatchSpy = vi.spyOn(store, 'dispatch');

    const { result } = renderHook(() => useUndoRedo(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    act(() => {
      result.current.undo();
    });

    expect(dispatchSpy).toHaveBeenCalledTimes(2);
  });

  it('should call dispatch when redo is called and nextState exists', () => {
    const formation1 = createMockFormation('1', 'Formation 1');
    const formation2 = createMockFormation('2', 'Formation 2');

    const store = createMockStore({
      past: [],
      present: formation1,
      future: [formation2],
      maxHistorySize: 50,
    });

    const dispatchSpy = vi.spyOn(store, 'dispatch');

    const { result } = renderHook(() => useUndoRedo(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    act(() => {
      result.current.redo();
    });

    expect(dispatchSpy).toHaveBeenCalledTimes(2);
  });

  it('should not call dispatch when redo is called but nextState is null', () => {
    const formation1 = createMockFormation('1', 'Formation 1');

    const store = createMockStore({
      past: [],
      present: formation1,
      future: [],
      maxHistorySize: 50,
    });

    const dispatchSpy = vi.spyOn(store, 'dispatch');

    const { result } = renderHook(() => useUndoRedo(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    act(() => {
      result.current.redo();
    });

    expect(dispatchSpy).not.toHaveBeenCalled();
  });
});
