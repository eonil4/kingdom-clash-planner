import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import FormationPlanner from '../../../src/pages/FormationPlanner';
import { useAppSelector, useAppDispatch } from '../../../src/store/hooks';
import { UnitRarity, type Unit } from '../../../src/types';

const mockUseDrop = vi.fn(() => [
  { isOver: false },
  vi.fn(),
]);

vi.mock('react-dnd', () => ({
  DndProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useDrop: () => mockUseDrop(),
  HTML5Backend: {},
}));

vi.mock('../../../src/store/hooks', () => ({
  useAppSelector: vi.fn(),
  useAppDispatch: vi.fn(),
}));

vi.mock('../../../src/hooks/useInitializeData', () => ({
  useInitializeData: vi.fn(),
}));

vi.mock('../../../src/hooks/useUrlSync', () => ({
  useUrlSync: vi.fn(),
}));

vi.mock('../../../src/components/FormationHeader', () => ({
  default: () => <div data-testid="formation-header">Formation Header</div>,
}));

vi.mock('../../../src/components/FormationGrid', () => ({
  default: ({ onPlaceUnit, onRemoveUnit }: { onPlaceUnit: (row: number, col: number, unit: Unit) => void; onRemoveUnit: (row: number, col: number) => void }) => (
    <div data-testid="formation-grid">
      <button
        data-testid="place-unit"
        onClick={() => onPlaceUnit(0, 0, { id: '1', name: 'Test', level: 1, rarity: UnitRarity.Common })}
      >
        Place Unit
      </button>
      <button
        data-testid="remove-unit"
        onClick={() => onRemoveUnit(0, 0)}
      >
        Remove Unit
      </button>
    </div>
  ),
}));

vi.mock('../../../src/components/UnitList', () => ({
  default: () => <div data-testid="unit-list">Unit List</div>,
}));

vi.mock('../../../src/store/reducers/formationSlice', () => ({
  placeUnit: vi.fn((payload) => ({ type: 'formation/placeUnit', payload })),
  removeUnit: vi.fn((payload) => ({ type: 'formation/removeUnit', payload })),
}));

describe('FormationPlanner', () => {
  const mockDispatch = vi.fn();
  const mockFormation = {
    id: '1',
    name: 'Test Formation',
    power: 100,
    tiles: Array(7).fill(null).map(() => Array(7).fill(null)),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useAppDispatch as ReturnType<typeof vi.fn>).mockReturnValue(mockDispatch);
    (useAppSelector as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
      const state = {
        formation: {
          currentFormation: mockFormation,
          formations: [],
        },
        unit: {
          units: [],
        },
      };
      return selector(state);
    });
  });

  it('should render loading state when currentFormation is null', () => {
    (useAppSelector as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
      const state = {
        formation: {
          currentFormation: null,
          formations: [],
        },
        unit: {
          units: [],
        },
      };
      return selector(state);
    });

    render(<FormationPlanner />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render formation planner with all components', () => {
    render(<FormationPlanner />);

    expect(screen.getByTestId('formation-header')).toBeInTheDocument();
    expect(screen.getByTestId('formation-grid')).toBeInTheDocument();
    expect(screen.getByTestId('unit-list')).toBeInTheDocument();
  });

  it('should handle placing a unit when unit is in roster', () => {
    const unitInRoster = { id: '1', name: 'Test', level: 1, rarity: UnitRarity.Common };
    (useAppSelector as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
      const state = {
        formation: {
          currentFormation: mockFormation,
          formations: [],
        },
        unit: {
          units: [unitInRoster],
        },
      };
      return selector(state);
    });

    render(<FormationPlanner />);

    const placeButton = screen.getByTestId('place-unit');
    placeButton.click();

    expect(mockDispatch).toHaveBeenCalled();
  });

  it('should handle removing a unit', () => {
    const formationWithUnit = {
      ...mockFormation,
      tiles: [
        [{ id: '1', name: 'Test', level: 1, rarity: UnitRarity.Common }, ...Array(6).fill(null)],
        ...Array(6).fill(null).map(() => Array(7).fill(null)),
      ],
    };

    (useAppSelector as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
      const state = {
        formation: {
          currentFormation: formationWithUnit,
          formations: [],
        },
        unit: {
          units: [],
        },
      };
      return selector(state);
    });

    render(<FormationPlanner />);

    const removeButton = screen.getByTestId('remove-unit');
    removeButton.click();

    expect(mockDispatch).toHaveBeenCalled();
  });

  it('should prevent placing unit when total limit is reached', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const manyUnits = Array(1000).fill(null).map((_, i) => ({
      id: `unit-${i}`,
      name: `Unit${i}`,
      level: 1,
      rarity: UnitRarity.Common,
    }));

    (useAppSelector as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
      const state = {
        formation: {
          currentFormation: mockFormation,
          formations: [],
        },
        unit: {
          units: manyUnits,
        },
      };
      return selector(state);
    });

    render(<FormationPlanner />);

    const placeButton = screen.getByTestId('place-unit');
    placeButton.click();

    expect(alertSpy).toHaveBeenCalledWith(
      expect.stringContaining('Maximum total units (roster + formation) is 1000')
    );

    alertSpy.mockRestore();
  });
});

