import type { Middleware, AnyAction } from '@reduxjs/toolkit';
import { addToHistory } from '../reducers/historySlice';
import { placeUnit, removeUnit, swapUnits, updateFormationName, updateUnitInFormation } from '../reducers/formationSlice';

const UNDOABLE_ACTIONS: string[] = [
  placeUnit.type,
  removeUnit.type,
  swapUnits.type,
  updateFormationName.type,
  updateUnitInFormation.type,
];

export const historyMiddleware: Middleware = (store) => (next) => (action: unknown) => {
  const typedAction = action as AnyAction;
  const isUndoableAction = UNDOABLE_ACTIONS.includes(typedAction.type);
  
  if (isUndoableAction) {
    const state = store.getState();
    const currentFormation = state.formation.currentFormation;
    
    if (currentFormation) {
      const formationSnapshot: typeof currentFormation = JSON.parse(JSON.stringify(currentFormation));
      store.dispatch(addToHistory(formationSnapshot));
    }
  }
  
  return next(action);
};
