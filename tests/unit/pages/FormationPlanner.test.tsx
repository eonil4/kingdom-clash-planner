import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import FormationPlanner from '../../../src/pages/FormationPlanner';
import { useAppSelector, useAppDispatch } from '../../../src/store/hooks';
import { UnitRarity, type Unit } from '../../../src/types';

let capturedDropHandler: ((item: { unit: Unit; isInFormation?: boolean; sourceRow?: number; sourceCol?: number }, monitor?: { didDrop: () => boolean }) => void) | undefined;
const mockUseDrop = vi.fn((config?: { drop?: (item: unknown, monitor?: { didDrop: () => boolean }) => void }) => {
  if (config?.drop) {
    capturedDropHandler = config.drop as typeof capturedDropHandler;
  }
  return [
    { isOver: false },
    vi.fn(),
  ];
});

vi.mock('react-dnd', () => ({
  DndProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useDrop: (config?: { drop?: (item: unknown, monitor?: { didDrop: () => boolean }) => void }) => mockUseDrop(config),
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

vi.mock('../../../src/components/formation/FormationHeader', () => ({
  default: () => <div data-testid="formation-header">Formation Header</div>,
}));

vi.mock('../../../src/components/formation/FormationGrid', () => ({
  default: ({ onPlaceUnit, onRemoveUnit }: { onPlaceUnit: (row: number, col: number, unit: Unit) => void; onRemoveUnit: (row: number, col: number, unit: Unit | null) => void }) => {
    const testUnit = { id: '1', name: 'Test', level: 1, rarity: UnitRarity.Common };
    return (
      <div data-testid="formation-grid">
        <button
          data-testid="place-unit"
          onClick={() => onPlaceUnit(0, 0, testUnit)}
        >
          Place Unit
        </button>
        <button
          data-testid="remove-unit"
          onClick={() => onRemoveUnit(0, 0, testUnit)}
        >
          Remove Unit
        </button>
      </div>
    );
  },
}));

vi.mock('../../../src/components/unit/UnitList', () => ({
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
    capturedDropHandler = undefined;
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

  it('should not process drop if nested drop target already handled it (didDrop check)', async () => {
    const { removeUnit } = await import('../../../src/store/reducers/formationSlice');
    const unitFromFormation = { id: '1', name: 'FormationUnit', level: 5, rarity: UnitRarity.Epic };
    
    render(<FormationPlanner />);

    // Simulate a drop that was already handled by a nested drop target (like UnitList)
    // The monitor.didDrop() returns true, indicating a nested handler processed it
    if (capturedDropHandler) {
      capturedDropHandler(
        {
          unit: unitFromFormation,
          isInFormation: true,
          sourceRow: 2,
          sourceCol: 3,
        },
        {
          didDrop: () => true, // Simulate that a nested drop target handled it
        }
      );
    }

    // Should not dispatch removeUnit because didDrop() returned true
    expect(mockDispatch).not.toHaveBeenCalledWith(removeUnit(expect.anything()));
  });

  it('should process drop if nested drop target did not handle it (didDrop returns false)', async () => {
    const { removeUnit } = await import('../../../src/store/reducers/formationSlice');
    const unitFromFormation = { id: '1', name: 'FormationUnit', level: 5, rarity: UnitRarity.Epic };
    
    render(<FormationPlanner />);

    // Simulate a drop that was not handled by a nested drop target
    // The monitor.didDrop() returns false, so parent should handle it
    if (capturedDropHandler) {
      capturedDropHandler(
        {
          unit: unitFromFormation,
          isInFormation: true,
          sourceRow: 2,
          sourceCol: 3,
        },
        {
          didDrop: () => false, // Simulate that no nested drop target handled it
        }
      );
    }

    // Should dispatch removeUnit because didDrop() returned false
    expect(mockDispatch).toHaveBeenCalledWith(removeUnit({ row: 2, col: 3, unit: unitFromFormation }));
  });

  it('should update page title with formation name', () => {
    const { rerender } = render(<FormationPlanner />);

    expect(document.title).toBe('Test Formation - Kingdom Clash Planner');

    // Update formation name
    const newFormation = {
      ...mockFormation,
      name: 'New Formation Name',
    };

    (useAppSelector as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
      const state = {
        formation: {
          currentFormation: newFormation,
          formations: [],
        },
        unit: {
          units: [],
        },
      };
      return selector(state);
    });

    rerender(<FormationPlanner />);

    expect(document.title).toBe('New Formation Name - Kingdom Clash Planner');
  });

  it('should set default page title when formation is null', () => {
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

    expect(document.title).toBe('Kingdom Clash Planner');
  });
});

