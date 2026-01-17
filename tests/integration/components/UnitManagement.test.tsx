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

describe('Unit Management Integration Tests', () => {
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

  describe('Manage Units Modal', () => {
    it('should open manage units modal when clicking manage button', async () => {
      // Arrange
      const user = userEvent.setup();
      renderWithStore(<FormationPlanner />);

      // Wait for component to fully render - give more time for lazy loading
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /manage/i })).toBeInTheDocument();
      }, { timeout: 10000 });
      
      // Act
      const manageButton = screen.getByRole('button', { name: /manage/i });
      await user.click(manageButton);

      // Assert - wait for dialog to appear
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      }, { timeout: 10000 });
    });

    it('should close modal when clicking close button', async () => {
      // Arrange
      const user = userEvent.setup();
      renderWithStore(<FormationPlanner />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /manage/i })).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: /manage/i }));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Act - the close button has aria-label="Close"
      const closeButton = screen.getByLabelText(/close/i);
      await user.click(closeButton);

      // Assert
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('should show add new unit form when clicking add button', async () => {
      // Arrange
      const user = userEvent.setup();
      renderWithStore(<FormationPlanner />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /manage/i })).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: /manage/i }));

      // Act
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /add new unit/i })).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: /add new unit/i }));

      // Assert
      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeInTheDocument();
      });
    });
  });

  describe('Adding Units', () => {
    it('should add unit to store when saving from modal', async () => {
      // Arrange
      const user = userEvent.setup();
      const { store } = renderWithStore(<FormationPlanner />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /manage/i })).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: /manage/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /add new unit/i })).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: /add new unit/i }));

      // Act
      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeInTheDocument();
      });
      const unitSelect = screen.getByRole('combobox');
      await user.click(unitSelect);

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
      await user.click(screen.getByRole('option', { name: /archers/i }));

      const level1Checkbox = screen.getByRole('checkbox', { name: '1' });
      await user.click(level1Checkbox);

      const addButton = screen.getByRole('button', { name: /add units/i });
      await user.click(addButton);

      // Assert
      await waitFor(() => {
        const state = store.getState();
        expect(state.unit.units.some(u => u.name === 'Archers')).toBe(true);
      });
    });

    it('should add multiple levels of same unit', async () => {
      // Arrange
      const user = userEvent.setup();
      const { store } = renderWithStore(<FormationPlanner />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /manage/i })).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: /manage/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /add new unit/i })).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: /add new unit/i }));

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeInTheDocument();
      });
      const unitSelect = screen.getByRole('combobox');
      await user.click(unitSelect);

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
      await user.click(screen.getByRole('option', { name: /infantry/i }));

      // Act
      await user.click(screen.getByRole('checkbox', { name: '1' }));
      await user.click(screen.getByRole('checkbox', { name: '5' }));
      await user.click(screen.getByRole('checkbox', { name: '10' }));

      const addButton = screen.getByRole('button', { name: /add units/i });
      await user.click(addButton);

      // Assert
      await waitFor(() => {
        const state = store.getState();
        const infantryUnits = state.unit.units.filter(u => u.name === 'Infantry');
        expect(infantryUnits).toHaveLength(3);
        const levels = infantryUnits.map(u => u.level).sort((a, b) => a - b);
        expect(levels).toEqual([1, 5, 10]);
      });
    });

    it('should select all levels when clicking select all', async () => {
      // Arrange
      const user = userEvent.setup();
      const { store } = renderWithStore(<FormationPlanner />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /manage/i })).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: /manage/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /add new unit/i })).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: /add new unit/i }));

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeInTheDocument();
      });
      const unitSelect = screen.getByRole('combobox');
      await user.click(unitSelect);

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
      await user.click(screen.getByRole('option', { name: /monk/i }));

      // Act
      const selectAllCheckbox = screen.getByLabelText(/select all levels/i);
      await user.click(selectAllCheckbox);

      const addButton = screen.getByRole('button', { name: /add units/i });
      await user.click(addButton);

      // Assert
      await waitFor(() => {
        const state = store.getState();
        const monkUnits = state.unit.units.filter(u => u.name === 'Monk');
        expect(monkUnits).toHaveLength(10);
      });
    });

    it('should cancel adding unit', async () => {
      // Arrange
      const user = userEvent.setup();
      const { store } = renderWithStore(<FormationPlanner />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /manage/i })).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: /manage/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /add new unit/i })).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: /add new unit/i }));

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeInTheDocument();
      });
      const unitSelect = screen.getByRole('combobox');
      await user.click(unitSelect);

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
      await user.click(screen.getByRole('option', { name: /archers/i }));
      await user.click(screen.getByRole('checkbox', { name: '5' }));

      // Act
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      // Assert
      const state = store.getState();
      expect(state.unit.units).toHaveLength(0);
    });
  });

  describe('Unit Display in Roster', () => {
    it('should display added units in available units grid', async () => {
      // Arrange
      const unit = createMockUnit({ id: 'display-test', name: 'Archers', level: 7 });
      const { store } = renderWithStore(<FormationPlanner />);
      
      await act(async () => {
        store.dispatch(addUnit(unit));
      });

      // Assert
      await waitFor(() => {
        expect(screen.getByLabelText(/7 Archers/i)).toBeInTheDocument();
      });
    });

    it('should display unit count badge', async () => {
      // Arrange
      const { store } = renderWithStore(<FormationPlanner />);
      
      await act(async () => {
        store.dispatch(addUnit(createMockUnit({ id: '1' })));
        store.dispatch(addUnit(createMockUnit({ id: '2' })));
        store.dispatch(addUnit(createMockUnit({ id: '3' })));
      });

      // Assert
      await waitFor(() => {
        expect(screen.getByText('3')).toBeInTheDocument();
      });
    });
  });

  describe('Clear Roster', () => {
    it('should clear roster when clicking clear button', async () => {
      // Arrange
      const user = userEvent.setup();
      const { store } = renderWithStore(<FormationPlanner />);
      
      // Mock window.confirm to return true
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      
      await act(async () => {
        store.dispatch(addUnit(createMockUnit({ id: '1', name: 'Archers' })));
        store.dispatch(addUnit(createMockUnit({ id: '2', name: 'Infantry' })));
      });

      // Wait for manage button to appear
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /manage/i })).toBeInTheDocument();
      }, { timeout: 10000 });
      
      await user.click(screen.getByRole('button', { name: /manage/i }));

      // Wait for dialog and clear button to appear
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      }, { timeout: 10000 });
      
      // Act - find and click clear roster button
      const clearButton = await screen.findByRole('button', { name: /clear roster/i });
      await user.click(clearButton);

      // Assert - wait for state to update
      await waitFor(() => {
        const state = store.getState();
        expect(state.unit.units).toHaveLength(0);
      }, { timeout: 5000 });
      
      confirmSpy.mockRestore();
    });
  });

  describe('Unit Count in Modal', () => {
    it('should display total unit count in modal header', async () => {
      // Arrange
      const user = userEvent.setup();
      const { store } = renderWithStore(<FormationPlanner />);
      
      await act(async () => {
        store.dispatch(addUnit(createMockUnit({ id: '1' })));
        store.dispatch(addUnit(createMockUnit({ id: '2' })));
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /manage/i })).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: /manage/i }));

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/2 total units/i)).toBeInTheDocument();
      });
    });
  });

  describe('Store State Consistency', () => {
    it('should maintain filteredUnits in sync with units', async () => {
      // Arrange
      const { store } = renderWithStore(<FormationPlanner />);
      
      await act(async () => {
        store.dispatch(addUnit(createMockUnit({ id: '1', name: 'Archers' })));
        store.dispatch(addUnit(createMockUnit({ id: '2', name: 'Infantry' })));
      });

      // Assert
      await waitFor(() => {
        const state = store.getState();
        expect(state.unit.units.length).toBe(state.unit.filteredUnits.length);
      });
    });

    it('should preserve sort order when adding units', async () => {
      // Arrange
      const { store } = renderWithStore(<FormationPlanner />);
      
      await act(async () => {
        store.dispatch(addUnit(createMockUnit({ id: '1', name: 'Archers', rarity: UnitRarity.Common })));
        store.dispatch(addUnit(createMockUnit({ id: '2', name: 'Monk', rarity: UnitRarity.Legendary })));
        store.dispatch(addUnit(createMockUnit({ id: '3', name: 'Iron Guards', rarity: UnitRarity.Rare })));
      });

      // Assert
      await waitFor(() => {
        const state = store.getState();
        expect(state.unit.filteredUnits[0].rarity).toBe(UnitRarity.Legendary);
      });
    });
  });
});
