import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import rootReducer from '../../../src/store/reducers';
import rootSaga from '../../../src/store/sagas';
import type { RootState } from '../../../src/store';

export type TestStore = ReturnType<typeof createTestStore>;

export function createTestStore(preloadedState?: Partial<RootState>) {
  const sagaMiddleware = createSagaMiddleware();

  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: false,
        serializableCheck: false,
      }).concat(sagaMiddleware),
    preloadedState: preloadedState as RootState | undefined,
  });

  sagaMiddleware.run(rootSaga);

  return store;
}

export function createTestStoreWithoutSaga(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: false,
        serializableCheck: false,
      }),
    preloadedState: preloadedState as RootState | undefined,
  });
}
