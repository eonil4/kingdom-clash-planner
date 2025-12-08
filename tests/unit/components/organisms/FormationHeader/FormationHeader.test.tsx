import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { FormationHeader } from '../../../../../src/components/organisms';
import unitReducer from '../../../../../src/store/reducers/unitSlice';
import formationReducer from '../../../../../src/store/reducers/formationSlice';

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

    expect(header).toHaveClass('w-full', 'p-4', 'bg-gray-800');
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

    expect(screen.getByText('Application Guide')).toBeInTheDocument();
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

    expect(screen.getByText('Application Guide')).toBeInTheDocument();

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
});
