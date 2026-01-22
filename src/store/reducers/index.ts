import { combineReducers } from '@reduxjs/toolkit';
import formationReducer from './formationSlice';
import unitReducer from './unitSlice';
import historyReducer from './historySlice';

const rootReducer = combineReducers({
  formation: formationReducer,
  unit: unitReducer,
  history: historyReducer,
});

export default rootReducer;

