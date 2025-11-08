import { combineReducers } from '@reduxjs/toolkit';
import formationReducer from './formationSlice';
import unitReducer from './unitSlice';

const rootReducer = combineReducers({
  formation: formationReducer,
  unit: unitReducer,
});

export default rootReducer;

