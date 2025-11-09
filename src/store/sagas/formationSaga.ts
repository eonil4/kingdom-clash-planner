import { takeEvery, put } from 'redux-saga/effects';
import { placeUnit, removeUnit } from '../reducers/formationSlice';
import { removeUnit as removeUnitFromList, addUnit } from '../reducers/unitSlice';

export function* handlePlaceUnit(action: ReturnType<typeof placeUnit>) {
  const { unit } = action.payload;
  yield put(removeUnitFromList(unit.id));
}

export function* handleRemoveUnit(action: ReturnType<typeof removeUnit>) {
  // Get unit from payload - it should always be provided by the caller
  const { unit } = action.payload;
  if (unit) {
    // Add unit back to available units list
    yield put(addUnit(unit));
  }
}

export default function* formationSaga() {
  yield takeEvery(placeUnit.type, handlePlaceUnit);
  yield takeEvery(removeUnit.type, handleRemoveUnit);
}

