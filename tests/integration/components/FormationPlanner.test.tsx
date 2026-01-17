import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FormationPlanner from '../../../src/pages/FormationPlanner';
import { renderWithStore } from '../utils/renderWithStore';
import { UnitRarity, type Unit } from '../../../src/types';
import { addUnit } from '../../../src/store/reducers/unitSlice';
import { DEFAULT_FORMATION_NAME, FORMATION_GRID_SIZE } from '../../../src/constants';

vi.mock('../../../src/hooks/useInitializeData', () => ({
  useInitializeData: () => {},
}));

vi.mock('../../../src/hooks/useUrlSync', () => ({
  useUrlSync: () => {},
}));

describe('FormationPlanner Integration Tests', () => {
  const createMockUnit = (overrides: Partial<Unit> = {}): Unit => ({
    id: `unit-${Date.now()}-${Math.random()}`,
    name: 'Archers',
    level: 1,
    rarity: UnitRarity.Common,
    power: 10,
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    document.title = '';
  });

  describe('Initial Rendering', () => {
    it('should render formation planner with all main sections', async () => {
      // Arrange & Act
      renderWithStore(<FormationPlanner />);

      // Assert
      await waitFor(() => {
        expect(screen.getByRole('main')).toBeInTheDocument();
      });
      expect(screen.getByText(DEFAULT_FORMATION_NAME)).toBeInTheDocument();
      expect(screen.getByLabelText(/formation grid/i)).toBeInTheDocument();
    });

    it('should render formation grid with correct number of tiles', async () => {
      // Arrange & Act
      renderWithStore(<FormationPlanner />);

      // Assert
      await waitFor(() => {
        const tiles = screen.getAllByRole('gridcell');
        expect(tiles).toHaveLength(FORMATION_GRID_SIZE * FORMATION_GRID_SIZE);
      });
    });

    it('should update page title with formation name', async () => {
      // Arrange & Act
      renderWithStore(<FormationPlanner />);

      // Assert
      await waitFor(() => {
        expect(document.title).toContain(DEFAULT_FORMATION_NAME);
      });
    });
  });

  describe('Unit Placement via Double-Click', () => {
    it('should place unit in formation when double-clicking from roster', async () => {
      // Arrange
      const user = userEvent.setup();
      const unit = createMockUnit({ id: 'test-unit-1', name: 'Archers', level: 5 });
      const { store } = renderWithStore(<FormationPlanner />);
      
      await act(async () => {
        store.dispatch(addUnit(unit));
      });

      // Act
      await waitFor(() => {
        expect(screen.getByLabelText(/5 Archers/i)).toBeInTheDocument();
      });
      const unitCard = screen.getByLabelText(/5 Archers/i);
      await user.dblClick(unitCard);

      // Assert
      await waitFor(() => {
        const state = store.getState();
        const hasUnitInFormation = state.formation.currentFormation?.tiles
          .flat()
          .some(tile => tile?.name === 'Archers');
        expect(hasUnitInFormation).toBe(true);
      });
    });

    it('should remove unit from roster when placed in formation', async () => {
      // Arrange
      const user = userEvent.setup();
      const unit = createMockUnit({ id: 'remove-test-unit', name: 'Infantry', level: 3 });
      const { store } = renderWithStore(<FormationPlanner />);
      
      await act(async () => {
        store.dispatch(addUnit(unit));
      });

      // Act
      await waitFor(() => {
        expect(screen.getByLabelText(/3 Infantry/i)).toBeInTheDocument();
      });
      const unitCard = screen.getByLabelText(/3 Infantry/i);
      await user.dblClick(unitCard);

      // Assert
      await waitFor(() => {
        const state = store.getState();
        expect(state.unit.units.find(u => u.id === 'remove-test-unit')).toBeUndefined();
      });
    });
  });

  describe('Formation Power Calculation', () => {
    it('should update formation power when unit is placed', async () => {
      // Arrange
      const user = userEvent.setup();
      const unit = createMockUnit({ id: 'power-test-unit', name: 'Archers', level: 5, power: 150 });
      const { store } = renderWithStore(<FormationPlanner />);
      
      await act(async () => {
        store.dispatch(addUnit(unit));
      });

      // Act
      await waitFor(() => {
        expect(screen.getByLabelText(/5 Archers/i)).toBeInTheDocument();
      });
      const unitCard = screen.getByLabelText(/5 Archers/i);
      await user.dblClick(unitCard);

      // Assert
      await waitFor(() => {
        const state = store.getState();
        expect(state.formation.currentFormation?.power).toBeGreaterThan(0);
      });
    });
  });

  describe('Search and Filter', () => {
    it('should filter available units by search term', async () => {
      // Arrange
      const user = userEvent.setup();
      const archer = createMockUnit({ id: 'archer-1', name: 'Archers', level: 1 });
      const infantry = createMockUnit({ id: 'infantry-1', name: 'Infantry', level: 1 });
      const { store } = renderWithStore(<FormationPlanner />);
      
      await act(async () => {
        store.dispatch(addUnit(archer));
        store.dispatch(addUnit(infantry));
      });

      // Act
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/search units/i)).toBeInTheDocument();
      });
      const searchInput = screen.getByPlaceholderText(/search units/i);
      await user.type(searchInput, 'arch');

      // Assert
      await waitFor(() => {
        expect(screen.getByLabelText(/1 Archers/i)).toBeInTheDocument();
        expect(screen.queryByLabelText(/1 Infantry/i)).not.toBeInTheDocument();
      });
    });

    it('should update store search term when typing', async () => {
      // Arrange
      const user = userEvent.setup();
      const { store } = renderWithStore(<FormationPlanner />);

      // Act
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/search units/i)).toBeInTheDocument();
      });
      const searchInput = screen.getByPlaceholderText(/search units/i);
      await user.type(searchInput, 'test');

      // Assert
      await waitFor(() => {
        const state = store.getState();
        expect(state.unit.searchTerm).toBe('test');
      });
    });
  });

  describe('Sort Controls', () => {
    it('should render sort controls', async () => {
      // Arrange & Act
      renderWithStore(<FormationPlanner />);

      // Assert - sort controls are rendered
      await waitFor(() => {
        expect(screen.getByLabelText(/sort units by \(primary\)/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/sort units by \(secondary\)/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/sort units by \(tertiary\)/i)).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should update store when sort option is dispatched', async () => {
      // Arrange
      const { store } = renderWithStore(<FormationPlanner />);
      
      // Verify initial sort option
      expect(store.getState().unit.sortOption).toBe('rarity');

      // Act - dispatch action to change sort option
      await act(async () => {
        const { setSortOption } = await import('../../../src/store/reducers/unitSlice');
        store.dispatch(setSortOption('level'));
      });

      // Assert
      expect(store.getState().unit.sortOption).toBe('level');
    });
  });

  describe('Withdraw All', () => {
    it('should withdraw all units from formation when clicking withdraw button', async () => {
      // Arrange
      const user = userEvent.setup();
      const unit1 = createMockUnit({ id: 'withdraw-1', name: 'Archers', level: 1 });
      const unit2 = createMockUnit({ id: 'withdraw-2', name: 'Infantry', level: 2 });
      const { store } = renderWithStore(<FormationPlanner />);
      
      await act(async () => {
        store.dispatch(addUnit(unit1));
        store.dispatch(addUnit(unit2));
      });

      await waitFor(() => {
        expect(screen.getByLabelText(/1 Archers/i)).toBeInTheDocument();
      });

      const archerCard = screen.getByLabelText(/1 Archers/i);
      await user.dblClick(archerCard);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/2 Infantry/i)).toBeInTheDocument();
      });
      const infantryCard = screen.getByLabelText(/2 Infantry/i);
      await user.dblClick(infantryCard);

      await waitFor(() => {
        const state = store.getState();
        const unitsInFormation = state.formation.currentFormation?.tiles.flat().filter(t => t !== null) || [];
        expect(unitsInFormation.length).toBe(2);
      });

      // Act
      const withdrawButton = screen.getByRole('button', { name: /withdraw/i });
      await user.click(withdrawButton);

      // Assert
      await waitFor(() => {
        const state = store.getState();
        const unitsInFormation = state.formation.currentFormation?.tiles.flat().filter(t => t !== null) || [];
        expect(unitsInFormation.length).toBe(0);
        expect(state.unit.units.length).toBe(2);
      });
    });
  });

  describe('Grid Size Slider', () => {
    it('should render grid size slider', async () => {
      // Arrange & Act
      renderWithStore(<FormationPlanner />);

      // Assert
      await waitFor(() => {
        const slider = screen.getAllByRole('slider')[0];
        expect(slider).toBeInTheDocument();
      });
    });
  });
});
