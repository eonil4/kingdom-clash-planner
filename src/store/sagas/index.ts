import { all, fork } from 'redux-saga/effects';
import formationSaga from './formationSaga';
import unitSaga from './unitSaga';

export default function* rootSaga() {
  yield all([fork(formationSaga), fork(unitSaga)]);
}

