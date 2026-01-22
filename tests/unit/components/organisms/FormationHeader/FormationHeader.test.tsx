import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

vi.mock('../../../../../src/components/organisms/HelpOverlay/HelpOverlay', () => ({
  default: ({ open, onClose }: { open: boolean; onClose: () => void }) =>
    open ? (
      <div role="dialog" aria-label="Help dialog">
        <span>Application Guide</span>
        <button aria-label="Close help overlay" onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

import FormationHeader from '../../../../../src/components/organisms/FormationHeader/FormationHeader';
import unitReducer from '../../../../../src/store/reducers/unitSlice';
import formationReducer from '../../../../../src/store/reducers/formationSlice';
import historyReducer from '../../../../../src/store/reducers/historySlice';

const createMockStore = (currentFormation: {
  id: string;
  name: string;
  tiles: (unknown | null)[][];
  power: number;
} | null = null) => {
  return configureStore({
    reducer: {
      unit: unitReducer,
      formation: formationReducer,
      history: historyReducer,
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
        currentFormation: currentFormation || {
          id: '1',
          name: 'Formation',
          tiles: Array(7).fill(null).map(() => Array(7).fill(null)),
          power: 0,
        },
      },
      history: {
        past: [],
        present: null,
        future: [],
        maxHistorySize: 50,
      },
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
        immutableCheck: false,
      }),
  });
};

describe('FormationHeader', () => {
  beforeEach(() => {
  });

  it('should render default formation name when currentFormation is null', () => {
    const store = createMockStore(null);
    render(
      <Provider store={store}>
        <FormationHeader />
      </Provider>
    );

    expect(screen.getByText('Formation')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('should handle null currentFormation gracefully for unitsInFormation', () => {
    const store = configureStore({
      reducer: {
        unit: unitReducer,
        formation: formationReducer,
        history: historyReducer,
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
          currentFormation: null,
        },
        history: {
          past: [],
          present: null,
          future: [],
          maxHistorySize: 50,
        },
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          serializableCheck: false,
          immutableCheck: false,
        }),
    });

    render(
      <Provider store={store}>
        <FormationHeader />
      </Provider>
    );

    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('should render formation name and power when currentFormation exists', () => {
    const mockFormation = {
      id: '1',
      name: 'Test Formation',
      power: 12345,
      tiles: Array(7).fill(null).map(() => Array(7).fill(null)),
    };

    const store = createMockStore(mockFormation);
    render(
      <Provider store={store}>
        <FormationHeader />
      </Provider>
    );

    expect(screen.getByText('Test Formation')).toBeInTheDocument();
    expect(screen.getByText('12 345')).toBeInTheDocument();
  });

  it('should render with correct styling classes', () => {
    const store = createMockStore(null);
    const { container } = render(
      <Provider store={store}>
        <FormationHeader />
      </Provider>
    );
    const header = container.querySelector('header');

    expect(header).toHaveClass('w-full', 'p-3', 'bg-gray-800');
  });

  it('should render power badge with correct styling', () => {
    const mockFormation = {
      id: '1',
      name: 'Test',
      power: 5000,
      tiles: Array(7).fill(null).map(() => Array(7).fill(null)),
    };

    const store = createMockStore(mockFormation);
    render(
      <Provider store={store}>
        <FormationHeader />
      </Provider>
    );

    const powerElement = screen.getByText('5 000');
    expect(powerElement).toBeInTheDocument();
    expect(powerElement.closest('.bg-gray-700')).toBeInTheDocument();
  });

  it('should show edit icon next to formation name', () => {
    const mockFormation = {
      id: '1',
      name: 'Test Formation',
      power: 100,
      tiles: Array(7).fill(null).map(() => Array(7).fill(null)),
    };

    const store = createMockStore(mockFormation);
    render(
      <Provider store={store}>
        <FormationHeader />
      </Provider>
    );

    const editButton = screen.getByLabelText('Edit formation name');
    expect(editButton).toBeInTheDocument();
  });

  it('should show input field when edit icon is clicked', async () => {
    const user = userEvent.setup();
    const mockFormation = {
      id: '1',
      name: 'Test Formation',
      power: 100,
      tiles: Array(7).fill(null).map(() => Array(7).fill(null)),
    };

    const store = createMockStore(mockFormation);
    render(
      <Provider store={store}>
        <FormationHeader />
      </Provider>
    );

    const editButton = screen.getByLabelText('Edit formation name');
    await user.click(editButton);

    const input = screen.getByDisplayValue('Test Formation');
    expect(input).toBeInTheDocument();
    expect(screen.queryByText('Test Formation')).not.toBeInTheDocument();
  });

  it('should save formation name when Enter is pressed', async () => {
    const user = userEvent.setup();
    const mockFormation = {
      id: '1',
      name: 'Test Formation',
      power: 100,
      tiles: Array(7).fill(null).map(() => Array(7).fill(null)),
    };

    const store = createMockStore(mockFormation);
    render(
      <Provider store={store}>
        <FormationHeader />
      </Provider>
    );

    const editButton = screen.getByLabelText('Edit formation name');
    await user.click(editButton);

    const input = screen.getByDisplayValue('Test Formation');
    await user.clear(input);
    await user.type(input, 'New Formation Name');
    await user.keyboard('{Enter}');

    const state = store.getState();
    expect(state.formation.currentFormation?.name).toBe('New Formation Name');
  });

  it('should save formation name when input loses focus', async () => {
    const user = userEvent.setup();
    const mockFormation = {
      id: '1',
      name: 'Test Formation',
      power: 100,
      tiles: Array(7).fill(null).map(() => Array(7).fill(null)),
    };

    const store = createMockStore(mockFormation);
    render(
      <Provider store={store}>
        <FormationHeader />
      </Provider>
    );

    const editButton = screen.getByLabelText('Edit formation name');
    await user.click(editButton);

    const input = screen.getByDisplayValue('Test Formation');
    await user.clear(input);
    await user.type(input, 'New Formation Name');
    await user.tab();

    const state = store.getState();
    expect(state.formation.currentFormation?.name).toBe('New Formation Name');
  });

  it('should cancel editing when Escape is pressed', async () => {
    const user = userEvent.setup();
    const mockFormation = {
      id: '1',
      name: 'Test Formation',
      power: 100,
      tiles: Array(7).fill(null).map(() => Array(7).fill(null)),
    };

    const store = createMockStore(mockFormation);
    render(
      <Provider store={store}>
        <FormationHeader />
      </Provider>
    );

    const editButton = screen.getByLabelText('Edit formation name');
    await user.click(editButton);

    const input = screen.getByDisplayValue('Test Formation');
    await user.clear(input);
    await user.type(input, 'New Formation Name');
    await user.keyboard('{Escape}');

    const state = store.getState();
    expect(state.formation.currentFormation?.name).toBe('Test Formation');
    expect(screen.getByText('Test Formation')).toBeInTheDocument();
  });

  it('should trim whitespace from formation name before saving', async () => {
    const user = userEvent.setup();
    const mockFormation = {
      id: '1',
      name: 'Test Formation',
      power: 100,
      tiles: Array(7).fill(null).map(() => Array(7).fill(null)),
    };

    const store = createMockStore(mockFormation);
    render(
      <Provider store={store}>
        <FormationHeader />
      </Provider>
    );

    const editButton = screen.getByLabelText('Edit formation name');
    await user.click(editButton);

    const input = screen.getByDisplayValue('Test Formation');
    await user.clear(input);
    await user.type(input, '  New Formation Name  ');
    await user.keyboard('{Enter}');

    const state = store.getState();
    expect(state.formation.currentFormation?.name).toBe('New Formation Name');
  });

  it('should show help icon next to formation name', () => {
    const mockFormation = {
      id: '1',
      name: 'Test Formation',
      power: 100,
      tiles: Array(7).fill(null).map(() => Array(7).fill(null)),
    };

    const store = createMockStore(mockFormation);
    render(
      <Provider store={store}>
        <FormationHeader />
      </Provider>
    );

    const helpButton = screen.getByLabelText('Open help overlay');
    expect(helpButton).toBeInTheDocument();
  });

  it('should open help overlay when help icon is clicked', async () => {
    const user = userEvent.setup();
    const mockFormation = {
      id: '1',
      name: 'Test Formation',
      power: 100,
      tiles: Array(7).fill(null).map(() => Array(7).fill(null)),
    };

    const store = createMockStore(mockFormation);
    render(
      <Provider store={store}>
        <FormationHeader />
      </Provider>
    );

    const helpButton = screen.getByLabelText('Open help overlay');
    await user.click(helpButton);

    expect(await screen.findByText('Application Guide')).toBeInTheDocument();
  });

  it('should not show help icon when editing formation name', async () => {
    const user = userEvent.setup();
    const mockFormation = {
      id: '1',
      name: 'Test Formation',
      power: 100,
      tiles: Array(7).fill(null).map(() => Array(7).fill(null)),
    };

    const store = createMockStore(mockFormation);
    render(
      <Provider store={store}>
        <FormationHeader />
      </Provider>
    );

    const editButton = screen.getByLabelText('Edit formation name');
    await user.click(editButton);

    expect(screen.queryByLabelText('Open help overlay')).not.toBeInTheDocument();
  });

  it('should close help overlay when close button is clicked', async () => {
    const user = userEvent.setup();
    const mockFormation = {
      id: '1',
      name: 'Test Formation',
      power: 100,
      tiles: Array(7).fill(null).map(() => Array(7).fill(null)),
    };

    const store = createMockStore(mockFormation);
    render(
      <Provider store={store}>
        <FormationHeader />
      </Provider>
    );

    const helpButton = screen.getByLabelText('Open help overlay');
    await user.click(helpButton);

    expect(await screen.findByText('Application Guide')).toBeInTheDocument();

    const closeButton = screen.getByLabelText('Close help overlay');
    await user.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('should render default "Formation" when currentFormation.name is empty string', () => {
    const mockFormation = {
      id: '1',
      name: '',
      power: 100,
      tiles: Array(7).fill(null).map(() => Array(7).fill(null)),
    };

    const store = createMockStore(mockFormation);
    render(
      <Provider store={store}>
        <FormationHeader />
      </Provider>
    );

    expect(screen.getByText('Formation')).toBeInTheDocument();
  });

  it('should render auto-fill button', () => {
    const store = createMockStore(null);
    render(
      <Provider store={store}>
        <FormationHeader />
      </Provider>
    );

    const autoFillButton = screen.getByLabelText('Auto-fill formation with available units');
    expect(autoFillButton).toBeInTheDocument();
  });

  it('should auto-fill empty tiles when auto-fill button is clicked', async () => {
    const user = userEvent.setup();
    const mockUnits = [
      { id: '1', name: 'Unit1', level: 5, rarity: 'Common' as const, power: 100 },
      { id: '2', name: 'Unit2', level: 3, rarity: 'Rare' as const, power: 200 },
    ];
    const mockFormation = {
      id: '1',
      name: 'Test Formation',
      power: 0,
      tiles: Array(7).fill(null).map(() => Array(7).fill(null)),
    };

    const store = configureStore({
      reducer: {
        unit: unitReducer,
        formation: formationReducer,
        history: historyReducer,
      },
      preloadedState: {
        unit: {
          units: mockUnits,
          filteredUnits: mockUnits,
          sortOption: 'level' as const,
          sortOption2: null,
          sortOption3: null,
          searchTerm: '',
        },
        formation: {
          currentFormation: mockFormation,
        },
        history: {
          past: [],
          present: null,
          future: [],
          maxHistorySize: 50,
        },
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          serializableCheck: false,
          immutableCheck: false,
        }),
    });

    render(
      <Provider store={store}>
        <FormationHeader />
      </Provider>
    );

    const autoFillButton = screen.getByLabelText('Auto-fill formation with available units');
    await user.click(autoFillButton);

    const state = store.getState();
    expect(state.formation.currentFormation?.tiles[0][0]).toEqual(mockUnits[0]);
    expect(state.formation.currentFormation?.tiles[0][1]).toEqual(mockUnits[1]);
  });

  it('should not auto-fill when formation is full', () => {
    const mockUnits = [
      { id: 'new', name: 'NewUnit', level: 1, rarity: 'Common' as const, power: 50 },
    ];
    const existingUnit = { id: 'existing', name: 'Existing', level: 5, rarity: 'Rare' as const, power: 100 };
    const mockFormation = {
      id: '1',
      name: 'Full Formation',
      power: 4900,
      tiles: Array(7).fill(null).map(() => Array(7).fill(existingUnit)),
    };

    const store = configureStore({
      reducer: {
        unit: unitReducer,
        formation: formationReducer,
        history: historyReducer,
      },
      preloadedState: {
        unit: {
          units: mockUnits,
          filteredUnits: mockUnits,
          sortOption: 'level' as const,
          sortOption2: null,
          sortOption3: null,
          searchTerm: '',
        },
        formation: {
          currentFormation: mockFormation,
        },
        history: {
          past: [],
          present: null,
          future: [],
          maxHistorySize: 50,
        },
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          serializableCheck: false,
          immutableCheck: false,
        }),
    });

    render(
      <Provider store={store}>
        <FormationHeader />
      </Provider>
    );

    const autoFillButton = screen.getByLabelText('Auto-fill formation with available units');
    expect(autoFillButton).toBeDisabled();
  });

  it('should filter out units already in formation from available units for auto-fill', async () => {
    const user = userEvent.setup();
    const unitInFormation = { id: '1', name: 'Unit1', level: 5, rarity: 'Common' as const, power: 100 };
    const availableUnit = { id: '2', name: 'Unit2', level: 3, rarity: 'Rare' as const, power: 200 };
    const mockUnits = [unitInFormation, availableUnit];
    const mockFormation = {
      id: '1',
      name: 'Test Formation',
      power: 100,
      tiles: [
        [unitInFormation, ...Array(6).fill(null)],
        ...Array(6).fill(null).map(() => Array(7).fill(null)),
      ],
    };

    const store = configureStore({
      reducer: {
        unit: unitReducer,
        formation: formationReducer,
        history: historyReducer,
      },
      preloadedState: {
        unit: {
          units: mockUnits,
          filteredUnits: mockUnits,
          sortOption: 'level' as const,
          sortOption2: null,
          sortOption3: null,
          searchTerm: '',
        },
        formation: {
          currentFormation: mockFormation,
        },
        history: {
          past: [],
          present: null,
          future: [],
          maxHistorySize: 50,
        },
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          serializableCheck: false,
          immutableCheck: false,
        }),
    });

    render(
      <Provider store={store}>
        <FormationHeader />
      </Provider>
    );

    const autoFillButton = screen.getByLabelText('Auto-fill formation with available units');
    await user.click(autoFillButton);

    const state = store.getState();
    expect(state.formation.currentFormation?.tiles[0][1]).toEqual(availableUnit);
  });

  it('should not auto-fill when no available units', () => {
    const unitInFormation = { id: '1', name: 'Unit1', level: 5, rarity: 'Common' as const, power: 100 };
    const mockUnits = [unitInFormation];
    const mockFormation = {
      id: '1',
      name: 'Test Formation',
      power: 100,
      tiles: [
        [unitInFormation, ...Array(6).fill(null)],
        ...Array(6).fill(null).map(() => Array(7).fill(null)),
      ],
    };

    const store = configureStore({
      reducer: {
        unit: unitReducer,
        formation: formationReducer,
        history: historyReducer,
      },
      preloadedState: {
        unit: {
          units: mockUnits,
          filteredUnits: mockUnits,
          sortOption: 'level' as const,
          sortOption2: null,
          sortOption3: null,
          searchTerm: '',
        },
        formation: {
          currentFormation: mockFormation,
        },
        history: {
          past: [],
          present: null,
          future: [],
          maxHistorySize: 50,
        },
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          serializableCheck: false,
          immutableCheck: false,
        }),
    });

    render(
      <Provider store={store}>
        <FormationHeader />
      </Provider>
    );

    const autoFillButton = screen.getByLabelText('Auto-fill formation with available units');
    expect(autoFillButton).toBeDisabled();
  });

  it('should count empty tiles correctly with multiple units in formation', () => {
    const unit1 = { id: '1', name: 'Unit1', level: 5, rarity: 'Common' as const, power: 100 };
    const unit2 = { id: '2', name: 'Unit2', level: 3, rarity: 'Rare' as const, power: 200 };
    const unit3 = { id: '3', name: 'Unit3', level: 7, rarity: 'Epic' as const, power: 500 };
    const mockFormation = {
      id: '1',
      name: 'Test Formation',
      power: 800,
      tiles: [
        [unit1, unit2, unit3, null, null, null, null],
        [null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null],
      ],
    };

    const store = configureStore({
      reducer: {
        unit: unitReducer,
        formation: formationReducer,
        history: historyReducer,
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
          currentFormation: mockFormation,
        },
        history: {
          past: [],
          present: null,
          future: [],
          maxHistorySize: 50,
        },
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          serializableCheck: false,
          immutableCheck: false,
        }),
    });

    render(
      <Provider store={store}>
        <FormationHeader />
      </Provider>
    );

    const autoFillButton = screen.getByLabelText('Auto-fill formation with available units');
    expect(autoFillButton).toBeDisabled();
  });

  it('should handle undo keyboard shortcut (Ctrl+Z)', async () => {
    const mockFormation1 = {
      id: '1',
      name: 'Formation 1',
      power: 100,
      tiles: Array(7).fill(null).map(() => Array(7).fill(null)),
    };
    const mockFormation2 = {
      id: '2',
      name: 'Formation 2',
      power: 200,
      tiles: Array(7).fill(null).map(() => Array(7).fill(null)),
    };

    const store = createMockStore(mockFormation1);
    
    store.dispatch({
      type: 'history/addToHistory',
      payload: mockFormation1,
    });
    store.dispatch({
      type: 'history/addToHistory',
      payload: mockFormation2,
    });

    render(
      <Provider store={store}>
        <FormationHeader />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Undo last action')).toBeInTheDocument();
    });

    const preventDefaultSpy = vi.fn();
    const event = new KeyboardEvent('keydown', {
      key: 'z',
      ctrlKey: true,
      shiftKey: false,
      bubbles: true,
    });
    Object.defineProperty(event, 'preventDefault', { value: preventDefaultSpy });

    await act(async () => {
      window.dispatchEvent(event);
    });

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('should handle redo keyboard shortcut (Ctrl+Shift+Z)', async () => {
    const mockFormation1 = {
      id: '1',
      name: 'Formation 1',
      power: 100,
      tiles: Array(7).fill(null).map(() => Array(7).fill(null)),
    };
    const mockFormation2 = {
      id: '2',
      name: 'Formation 2',
      power: 200,
      tiles: Array(7).fill(null).map(() => Array(7).fill(null)),
    };

    const store = createMockStore(mockFormation1);
    
    store.dispatch({
      type: 'history/addToHistory',
      payload: mockFormation1,
    });
    store.dispatch({
      type: 'history/addToHistory',
      payload: mockFormation2,
    });
    store.dispatch({
      type: 'history/undo',
    });

    render(
      <Provider store={store}>
        <FormationHeader />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Redo last undone action')).toBeInTheDocument();
    });

    const preventDefaultSpy = vi.fn();
    const event = new KeyboardEvent('keydown', {
      key: 'z',
      ctrlKey: true,
      shiftKey: true,
      bubbles: true,
    });
    Object.defineProperty(event, 'preventDefault', { value: preventDefaultSpy });

    await act(async () => {
      window.dispatchEvent(event);
    });

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('should handle Mac undo keyboard shortcut (Cmd+Z)', async () => {
    const originalPlatform = navigator.platform;
    Object.defineProperty(navigator, 'platform', {
      value: 'MacIntel',
      configurable: true,
    });

    const mockFormation1 = {
      id: '1',
      name: 'Formation 1',
      power: 100,
      tiles: Array(7).fill(null).map(() => Array(7).fill(null)),
    };
    const mockFormation2 = {
      id: '2',
      name: 'Formation 2',
      power: 200,
      tiles: Array(7).fill(null).map(() => Array(7).fill(null)),
    };

    const store = createMockStore(mockFormation1);
    
    store.dispatch({
      type: 'history/addToHistory',
      payload: mockFormation1,
    });
    store.dispatch({
      type: 'history/addToHistory',
      payload: mockFormation2,
    });

    render(
      <Provider store={store}>
        <FormationHeader />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Undo last action')).toBeInTheDocument();
    });

    const preventDefaultSpy = vi.fn();
    const event = new KeyboardEvent('keydown', {
      key: 'z',
      metaKey: true,
      shiftKey: false,
      bubbles: true,
    });
    Object.defineProperty(event, 'preventDefault', { value: preventDefaultSpy });

    await act(async () => {
      window.dispatchEvent(event);
    });

    expect(preventDefaultSpy).toHaveBeenCalled();

    Object.defineProperty(navigator, 'platform', {
      value: originalPlatform,
      configurable: true,
    });
  });

  it('should handle Mac redo keyboard shortcut (Cmd+Shift+Z)', async () => {
    const originalPlatform = navigator.platform;
    Object.defineProperty(navigator, 'platform', {
      value: 'MacIntel',
      configurable: true,
    });

    const mockFormation1 = {
      id: '1',
      name: 'Formation 1',
      power: 100,
      tiles: Array(7).fill(null).map(() => Array(7).fill(null)),
    };
    const mockFormation2 = {
      id: '2',
      name: 'Formation 2',
      power: 200,
      tiles: Array(7).fill(null).map(() => Array(7).fill(null)),
    };

    const store = createMockStore(mockFormation1);
    
    store.dispatch({
      type: 'history/addToHistory',
      payload: mockFormation1,
    });
    store.dispatch({
      type: 'history/addToHistory',
      payload: mockFormation2,
    });
    store.dispatch({
      type: 'history/undo',
    });

    render(
      <Provider store={store}>
        <FormationHeader />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Redo last undone action')).toBeInTheDocument();
    });

    const preventDefaultSpy = vi.fn();
    const event = new KeyboardEvent('keydown', {
      key: 'z',
      metaKey: true,
      shiftKey: true,
      bubbles: true,
    });
    Object.defineProperty(event, 'preventDefault', { value: preventDefaultSpy });

    await act(async () => {
      window.dispatchEvent(event);
    });

    expect(preventDefaultSpy).toHaveBeenCalled();

    Object.defineProperty(navigator, 'platform', {
      value: originalPlatform,
      configurable: true,
    });
  });
});
