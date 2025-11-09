import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import App from '../../src/App';
import unitReducer from '../../src/store/reducers/unitSlice';
import formationReducer from '../../src/store/reducers/formationSlice';

// Create stable mock references outside the mock to ensure consistent identity
const mockSetSearchParams = vi.fn();
const mockSearchParams = new URLSearchParams();

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  RouterProvider: ({ router }: { router: { routes: Array<{ path: string; element: React.ReactElement }> } }) => {
    return router.routes[0]?.element || <div>Router</div>;
  },
  createBrowserRouter: (routes: Array<{ path: string; element: React.ReactElement }>) => ({
    routes,
  }),
  useSearchParams: vi.fn(() => [mockSearchParams, mockSetSearchParams]),
}));

const createMockStore = () => {
  return configureStore({
    reducer: {
      unit: unitReducer,
      formation: formationReducer,
    },
    preloadedState: {
      unit: {
        units: [],
        filteredUnits: [],
        sortOption: 'level' as const,
        sortOption2: null,
        sortOption3: null,
        searchTerm: '',
      },
      formation: {
        currentFormation: {
          id: '1',
          name: 'Formation',
          tiles: Array(7)
            .fill(null)
            .map(() => Array(7).fill(null)),
          power: 0,
        },
        formations: [],
      },
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
        immutableCheck: false,
      }),
  });
};

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render app with providers', () => {
    const store = createMockStore();
    
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );
    
    // App should render without errors
    expect(document.body).toBeTruthy();
  });
});

