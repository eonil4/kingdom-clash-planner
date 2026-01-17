import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FormationPlanner from '../../../src/pages/FormationPlanner';
import { renderWithStore } from '../utils/renderWithStore';
import { UnitRarity, type Unit } from '../../../src/types';
import { addUnit } from '../../../src/store/reducers/unitSlice';

vi.mock('../../../src/hooks/useInitializeData', () => ({
  useInitializeData: () => {},
}));

vi.mock('../../../src/hooks/useUrlSync', () => ({
  useUrlSync: () => {},
}));

describe('Drag and Drop Integration Tests', () => {
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
  });

  describe('Unit Placement Alternatives', () => {
    it('should place unit in first empty tile via double-click', async () => {
      // Arrange
      const user = userEvent.setup();
      const unit = createMockUnit({ id: 'dblclick-test', name: 'Archers', level: 5 });
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
        const tile00 = state.formation.currentFormation?.tiles[0][0];
        expect(tile00?.name).toBe('Archers');
        expect(tile00?.level).toBe(5);
      });
    });

    it('should place units sequentially when double-clicking multiple', async () => {
      // Arrange
      const user = userEvent.setup();
      const { store } = renderWithStore(<FormationPlanner />);
      
      await act(async () => {
        store.dispatch(addUnit(createMockUnit({ id: '1', name: 'Archers', level: 1 })));
        store.dispatch(addUnit(createMockUnit({ id: '2', name: 'Infantry', level: 2 })));
        store.dispatch(addUnit(createMockUnit({ id: '3', name: 'Monk', level: 3, rarity: UnitRarity.Legendary })));
      });

      // Act
      await waitFor(() => {
        expect(screen.getByLabelText(/1 Archers/i)).toBeInTheDocument();
      });
      
      const archer = screen.getByLabelText(/1 Archers/i);
      await user.dblClick(archer);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/2 Infantry/i)).toBeInTheDocument();
      });
      const infantry = screen.getByLabelText(/2 Infantry/i);
      await user.dblClick(infantry);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/3 Monk/i)).toBeInTheDocument();
      });
      const monk = screen.getByLabelText(/3 Monk/i);
      await user.dblClick(monk);

      // Assert
      await waitFor(() => {
        const state = store.getState();
        expect(state.formation.currentFormation?.tiles[0][0]?.name).toBe('Archers');
        expect(state.formation.currentFormation?.tiles[0][1]?.name).toBe('Infantry');
        expect(state.formation.currentFormation?.tiles[0][2]?.name).toBe('Monk');
      });
    });
  });

  describe('Unit Removal from Formation', () => {
    it('should remove unit from formation via double-click on formation tile', async () => {
      // Arrange
      const user = userEvent.setup();
      const unit = createMockUnit({ id: 'remove-dblclick', name: 'Archers', level: 5 });
      const { store } = renderWithStore(<FormationPlanner />);
      
      await act(async () => {
        store.dispatch(addUnit(unit));
      });

      await waitFor(() => {
        expect(screen.getByLabelText(/5 Archers/i)).toBeInTheDocument();
      });
      await user.dblClick(screen.getByLabelText(/5 Archers/i));

      await waitFor(() => {
        const state = store.getState();
        expect(state.formation.currentFormation?.tiles[0][0]).not.toBeNull();
      });

      // Act - find the unit card in the formation tile and double-click it
      const tile = screen.getByLabelText(/at row 1 column 1/i);
      const unitInTile = tile.querySelector('[role="button"]');
      if (unitInTile) {
        await user.dblClick(unitInTile);
      }

      // Assert
      await waitFor(() => {
        const state = store.getState();
        expect(state.formation.currentFormation?.tiles[0][0]).toBeNull();
        expect(state.unit.units.find(u => u.id === 'remove-dblclick')).toBeDefined();
      });
    });
  });

  describe('Formation State Updates', () => {
    it('should update formation power when unit is placed', async () => {
      // Arrange
      const user = userEvent.setup();
      const unit = createMockUnit({ id: 'power-dnd', name: 'Archers', level: 5, power: 150 });
      const { store } = renderWithStore(<FormationPlanner />);
      
      await act(async () => {
        store.dispatch(addUnit(unit));
      });

      // Act
      await waitFor(() => {
        expect(screen.getByLabelText(/5 Archers/i)).toBeInTheDocument();
      });
      await user.dblClick(screen.getByLabelText(/5 Archers/i));

      // Assert
      await waitFor(() => {
        const state = store.getState();
        expect(state.formation.currentFormation?.power).toBe(150);
      });
    });

    it('should decrease formation power when unit is removed', async () => {
      // Arrange
      const user = userEvent.setup();
      const unit = createMockUnit({ id: 'power-decrease', name: 'Archers', level: 5, power: 150 });
      const { store } = renderWithStore(<FormationPlanner />);
      
      await act(async () => {
        store.dispatch(addUnit(unit));
      });

      await waitFor(() => {
        expect(screen.getByLabelText(/5 Archers/i)).toBeInTheDocument();
      });
      await user.dblClick(screen.getByLabelText(/5 Archers/i));

      await waitFor(() => {
        const state = store.getState();
        expect(state.formation.currentFormation?.power).toBe(150);
      });

      // Act - find the unit card in the formation tile and double-click it
      const tile = screen.getByLabelText(/at row 1 column 1/i);
      const unitInTile = tile.querySelector('[role="button"]');
      if (unitInTile) {
        await user.dblClick(unitInTile);
      }

      // Assert
      await waitFor(() => {
        const state = store.getState();
        expect(state.formation.currentFormation?.power).toBe(0);
      });
    });
  });

  describe('Saga Integration (Unit Movement)', () => {
    it('should transfer unit from roster to formation via saga', async () => {
      // Arrange
      const user = userEvent.setup();
      const unit = createMockUnit({ id: 'saga-transfer', name: 'Infantry', level: 3 });
      const { store } = renderWithStore(<FormationPlanner />);
      
      await act(async () => {
        store.dispatch(addUnit(unit));
      });

      // Verify unit is in roster
      let state = store.getState();
      expect(state.unit.units.find(u => u.id === 'saga-transfer')).toBeDefined();

      // Act
      await waitFor(() => {
        expect(screen.getByLabelText(/3 Infantry/i)).toBeInTheDocument();
      });
      await user.dblClick(screen.getByLabelText(/3 Infantry/i));

      // Assert - unit should be removed from roster (via saga) and in formation
      await waitFor(() => {
        state = store.getState();
        expect(state.unit.units.find(u => u.id === 'saga-transfer')).toBeUndefined();
        expect(state.formation.currentFormation?.tiles[0][0]?.id).toBe('saga-transfer');
      });
    });

    it('should transfer unit from formation back to roster via saga', async () => {
      // Arrange
      const user = userEvent.setup();
      const unit = createMockUnit({ id: 'saga-back', name: 'Infantry', level: 3 });
      const { store } = renderWithStore(<FormationPlanner />);
      
      await act(async () => {
        store.dispatch(addUnit(unit));
      });

      await waitFor(() => {
        expect(screen.getByLabelText(/3 Infantry/i)).toBeInTheDocument();
      });
      await user.dblClick(screen.getByLabelText(/3 Infantry/i));

      await waitFor(() => {
        const state = store.getState();
        expect(state.formation.currentFormation?.tiles[0][0]?.id).toBe('saga-back');
      });

      // Act - find the unit card in the formation tile and double-click it
      const tile = screen.getByLabelText(/at row 1 column 1/i);
      const unitInTile = tile.querySelector('[role="button"]');
      if (unitInTile) {
        await user.dblClick(unitInTile);
      }

      // Assert - unit should be back in roster (via saga)
      await waitFor(() => {
        const state = store.getState();
        expect(state.unit.units.find(u => u.id === 'saga-back')).toBeDefined();
        expect(state.formation.currentFormation?.tiles[0][0]).toBeNull();
      });
    });
  });

  describe('Formation Grid Tiles', () => {
    it('should render all formation tiles', async () => {
      // Arrange & Act
      renderWithStore(<FormationPlanner />);

      // Assert
      await waitFor(() => {
        const tiles = screen.getAllByRole('gridcell');
        expect(tiles).toHaveLength(49);
      });
    });

    it('should show unit in correct tile after placement', async () => {
      // Arrange
      const user = userEvent.setup();
      const { store } = renderWithStore(<FormationPlanner />);
      const unit = createMockUnit({ id: 'tile-test', name: 'Archers', level: 7 });
      
      await act(async () => {
        store.dispatch(addUnit(unit));
      });

      // Act
      await waitFor(() => {
        expect(screen.getByLabelText(/7 Archers/i)).toBeInTheDocument();
      });
      await user.dblClick(screen.getByLabelText(/7 Archers/i));

      // Assert
      await waitFor(() => {
        const tile = screen.getByLabelText(/at row 1 column 1/i);
        expect(tile.querySelector('[role="button"]')).toBeInTheDocument();
      });
    });
  });

  describe('Multiple Units Workflow', () => {
    it('should handle rapid placement of multiple units', async () => {
      // Arrange
      const user = userEvent.setup();
      const { store } = renderWithStore(<FormationPlanner />);
      
      await act(async () => {
        for (let i = 1; i <= 5; i++) {
          store.dispatch(addUnit(createMockUnit({ 
            id: `rapid-${i}`, 
            name: 'Archers', 
            level: i 
          })));
        }
      });

      // Act
      for (let i = 1; i <= 5; i++) {
        await waitFor(() => {
          expect(screen.getByLabelText(new RegExp(`${i} Archers`, 'i'))).toBeInTheDocument();
        });
        await user.dblClick(screen.getByLabelText(new RegExp(`${i} Archers`, 'i')));
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Assert
      await waitFor(() => {
        const state = store.getState();
        const unitsInFormation = state.formation.currentFormation?.tiles
          .flat()
          .filter(t => t !== null) || [];
        expect(unitsInFormation.length).toBe(5);
        expect(state.unit.units.length).toBe(0);
      });
    });
  });
});
