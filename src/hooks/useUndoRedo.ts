import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { undo, redo } from '../store/reducers/historySlice';
import { setCurrentFormation } from '../store/reducers/formationSlice';

export interface UseUndoRedoReturn {
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  undoCount: number;
  redoCount: number;
}

export function useUndoRedo(): UseUndoRedoReturn {
  const dispatch = useAppDispatch();
  const { past, present, future } = useAppSelector((state) => state.history);

  const canUndo = past.length > 0 && present !== null;
  const canRedo = future.length > 0;

  const handleUndo = useCallback(() => {
    if (!canUndo) return;
    
    const previousState = past[past.length - 1];
    /* istanbul ignore if -- @preserve defensive check, previousState always exists when canUndo is true */
    if (previousState) {
      dispatch(undo());
      dispatch(setCurrentFormation(previousState));
    }
  }, [dispatch, canUndo, past]);

  const handleRedo = useCallback(() => {
    if (!canRedo) return;
    
    const nextState = future[0];
    /* istanbul ignore if -- @preserve defensive check, nextState always exists when canRedo is true */
    if (nextState) {
      dispatch(redo());
      dispatch(setCurrentFormation(nextState));
    }
  }, [dispatch, canRedo, future]);

  return {
    canUndo,
    canRedo,
    undo: handleUndo,
    redo: handleRedo,
    undoCount: past.length,
    redoCount: future.length,
  };
}
