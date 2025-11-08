import { takeEvery, put } from 'redux-saga/effects';
import { placeUnit, removeUnit } from '../reducers/formationSlice';
import { removeUnit as removeUnitFromList, addUnit } from '../reducers/unitSlice';

function* handlePlaceUnit(action: ReturnType<typeof placeUnit>) {
  const { unit } = action.payload;
  yield put(removeUnitFromList(unit.id));
}

function* handleRemoveUnit(action: ReturnType<typeof removeUnit>) {
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

