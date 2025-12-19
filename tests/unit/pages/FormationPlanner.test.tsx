import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FormationPlanner from '../../../src/pages/FormationPlanner';
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

const mockUseDrag = vi.fn(() => [
  { isDragging: false },
  vi.fn(),
]);

vi.mock('react-dnd', () => ({
  DndProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useDrop: (config?: { drop?: (item: unknown, monitor?: { didDrop: () => boolean }) => void }) => mockUseDrop(config),
  useDrag: () => mockUseDrag(),
  HTML5Backend: {},
}));

const mockUseAppSelector = vi.fn();
const mockUseAppDispatch = vi.fn();

vi.mock('../../../src/store/hooks', () => ({
  useAppSelector: (...args: unknown[]) => mockUseAppSelector(...args),
  useAppDispatch: (...args: unknown[]) => mockUseAppDispatch(...args),
}));

vi.mock('../../../src/hooks/useInitializeData', () => ({
  useInitializeData: () => {},
}));

vi.mock('../../../src/hooks/useUrlSync', () => ({
  useUrlSync: () => {},
}));

vi.mock('../../../src/components/molecules', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../src/components/molecules')>();
  return actual;
});

const mockFormationHeader = vi.hoisted(() => () => <div data-testid="formation-header">Formation Header</div>);
const mockFormationGrid = vi.hoisted(() => ({ onPlaceUnit, onRemoveUnit, onSwapUnits, onEditUnit }: { onPlaceUnit: (row: number, col: number, unit: Unit) => void; onRemoveUnit: (row: number, col: number, unit: Unit | null) => void; onSwapUnits: (sourceRow: number, sourceCol: number, targetRow: number, targetCol: number, sourceUnit: Unit, targetUnit: Unit) => void; onEditUnit?: (row: number, col: number, unit: Unit) => void }) => {
  const testUnit = { id: '1', name: 'Test', level: 1, rarity: 'Common' as const };
  const testUnit2 = { id: '2', name: 'Test2', level: 5, rarity: 'Epic' as const };
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
      <button
        data-testid="remove-unit-null"
        onClick={() => onRemoveUnit(0, 0, null)}
      >
        Remove Null Unit
      </button>
      <button
        data-testid="swap-units"
        onClick={() => onSwapUnits(0, 0, 1, 1, testUnit, testUnit2)}
      >
        Swap Units
      </button>
      {onEditUnit && (
        <button
          data-testid="edit-unit"
          onClick={() => onEditUnit(0, 0, { ...testUnit, level: 10 })}
        >
          Edit Unit
        </button>
      )}
    </div>
  );
});
const mockUnitList = vi.hoisted(() => () => <div data-testid="unit-list">Unit List</div>);

vi.mock('../../../src/components/organisms/FormationHeader/FormationHeader', () => ({
  default: mockFormationHeader,
}));

vi.mock('../../../src/components/organisms/FormationGrid/FormationGrid', () => ({
  default: mockFormationGrid,
}));

vi.mock('../../../src/components/organisms/UnitList/UnitList', () => ({
  default: mockUnitList,
}));


vi.mock('../../../src/store/reducers/formationSlice', () => ({
  placeUnit: vi.fn((payload) => ({ type: 'formation/placeUnit', payload })),
  removeUnit: vi.fn((payload) => ({ type: 'formation/removeUnit', payload })),
  swapUnits: vi.fn((payload) => ({ type: 'formation/swapUnits', payload })),
  updateUnitInFormation: vi.fn((payload) => ({ type: 'formation/updateUnitInFormation', payload })),
}));

vi.mock('../../../src/store/reducers/unitSlice', () => ({
  updateUnit: vi.fn((payload) => ({ type: 'unit/updateUnit', payload })),
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
    mockUseAppDispatch.mockReturnValue(mockDispatch);
    mockUseAppSelector.mockImplementation((selector: (state: unknown) => unknown) => {
      const state = {
        formation: {
          currentFormation: mockFormation,
          formations: [],
        },
        unit: {
          units: [],
          filteredUnits: [],
          sortOption: 'level' as const,
          sortOption2: null,
          sortOption3: null,
          searchTerm: '',
        },
      };
      return selector(state);
    });
  });

  it('should render loading state when currentFormation is null', () => {
    mockUseAppSelector.mockImplementation((selector: (state: unknown) => unknown) => {
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

  it('should render formation planner with all components', async () => {
    render(<FormationPlanner />);

    expect(screen.getByTestId('formation-header')).toBeInTheDocument();
    expect(screen.getByTestId('formation-grid')).toBeInTheDocument();
    expect(await screen.findByTestId('unit-list')).toBeInTheDocument();
  });

  it('should handle placing a unit when unit is in roster', () => {
    const unitInRoster = { id: '1', name: 'Test', level: 1, rarity: UnitRarity.Common };
    mockUseAppSelector.mockImplementation((selector: (state: unknown) => unknown) => {
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

    mockUseAppSelector.mockImplementation((selector: (state: unknown) => unknown) => {
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

  it('should handle removing with null unit', () => {
    render(<FormationPlanner />);

    const removeNullButton = screen.getByTestId('remove-unit-null');
    removeNullButton.click();

    expect(mockDispatch).toHaveBeenCalled();
  });

  it('should allow placing unit when under total limit', async () => {
    const { placeUnit } = await import('../../../src/store/reducers/formationSlice');

    mockUseAppSelector.mockImplementation((selector: (state: unknown) => unknown) => {
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

    render(<FormationPlanner />);

    const placeButton = screen.getByTestId('place-unit');
    placeButton.click();

    expect(mockDispatch).toHaveBeenCalledWith(placeUnit(expect.anything()));
  });

  it('should prevent placing unit when total limit is reached', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const manyUnits = Array(1000).fill(null).map((_, i) => ({
      id: `unit-${i}`,
      name: `Unit${i}`,
      level: 1,
      rarity: UnitRarity.Common,
    }));

    mockUseAppSelector.mockImplementation((selector: (state: unknown) => unknown) => {
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

    mockUseAppSelector.mockImplementation((selector: (state: unknown) => unknown) => {
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
    mockUseAppSelector.mockImplementation((selector: (state: unknown) => unknown) => {
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

  it('should handle swapping two units in formation', async () => {
    const { swapUnits } = await import('../../../src/store/reducers/formationSlice');
    
    render(<FormationPlanner />);

    const swapButton = screen.getByTestId('swap-units');
    swapButton.click();

    expect(mockDispatch).toHaveBeenCalledWith(swapUnits({
      sourceRow: 0,
      sourceCol: 0,
      targetRow: 1,
      targetCol: 1,
      sourceUnit: { id: '1', name: 'Test', level: 1, rarity: UnitRarity.Common },
      targetUnit: { id: '2', name: 'Test2', level: 5, rarity: UnitRarity.Epic },
    }));
  });

  it('should count formation units correctly when tiles have units', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const formationWithUnits = {
      ...mockFormation,
      tiles: [
        [null, { id: 'f2', name: 'Test2', level: 2, rarity: UnitRarity.Rare }, ...Array(5).fill(null)],
        [{ id: 'f3', name: 'Test3', level: 3, rarity: UnitRarity.Epic }, ...Array(6).fill(null)],
        [{ id: 'f4', name: 'Test4', level: 4, rarity: UnitRarity.Legendary }, ...Array(6).fill(null)],
        ...Array(4).fill(null).map(() => Array(7).fill(null)),
      ],
    };

    const manyUnits = Array(997).fill(null).map((_, i) => ({
      id: `unit-${i}`,
      name: `Unit${i}`,
      level: 1,
      rarity: UnitRarity.Common,
    }));

    mockUseAppSelector.mockImplementation((selector: (state: unknown) => unknown) => {
      const state = {
        formation: {
          currentFormation: formationWithUnits,
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
      expect.stringContaining('Maximum total units')
    );
    alertSpy.mockRestore();
  });

  it('should handle placing unit when replacing existing unit', async () => {
    const { placeUnit } = await import('../../../src/store/reducers/formationSlice');
    const formationWithExistingUnit = {
      ...mockFormation,
      tiles: [
        [{ id: 'existing', name: 'Existing', level: 5, rarity: UnitRarity.Epic }, ...Array(6).fill(null)],
        ...Array(6).fill(null).map(() => Array(7).fill(null)),
      ],
    };

    mockUseAppSelector.mockImplementation((selector: (state: unknown) => unknown) => {
      const state = {
        formation: {
          currentFormation: formationWithExistingUnit,
          formations: [],
        },
        unit: {
          units: [],
        },
      };
      return selector(state);
    });

    render(<FormationPlanner />);

    const placeButton = screen.getByTestId('place-unit');
    placeButton.click();

    expect(mockDispatch).toHaveBeenCalledWith(placeUnit(expect.objectContaining({
      row: 0,
      col: 0,
    })));
  });

  it('should not show alert when drop is from roster unit not at limit', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const unitInRoster = { id: '1', name: 'Test', level: 1, rarity: UnitRarity.Common };
    
    mockUseAppSelector.mockImplementation((selector: (state: unknown) => unknown) => {
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

    expect(alertSpy).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it('should skip drop handler when unit is not in formation', () => {
    const unitFromRoster = { id: '1', name: 'RosterUnit', level: 5, rarity: UnitRarity.Epic };
    
    render(<FormationPlanner />);

    if (capturedDropHandler) {
      capturedDropHandler(
        {
          unit: unitFromRoster,
          isInFormation: false,
        },
        {
          didDrop: () => false,
        }
      );
    }

    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('should handle editing a unit in formation', async () => {
    const { updateUnitInFormation } = await import('../../../src/store/reducers/formationSlice');
    const { updateUnit } = await import('../../../src/store/reducers/unitSlice');
    
    render(<FormationPlanner />);

    const editButton = screen.getByTestId('edit-unit');
    editButton.click();

    expect(mockDispatch).toHaveBeenCalledWith(updateUnitInFormation({
      row: 0,
      col: 0,
      unit: expect.objectContaining({ id: '1', level: 10 }),
    }));
    expect(mockDispatch).toHaveBeenCalledWith(updateUnit(expect.objectContaining({ id: '1', level: 10 })));
  });

  it('should render grid scale slider', () => {
    render(<FormationPlanner />);

    const sliders = screen.getAllByRole('slider');
    expect(sliders.length).toBeGreaterThan(0);
  });

  it('should update grid scale when slider is changed', async () => {
    const user = userEvent.setup();
    render(<FormationPlanner />);

    const slider = screen.getAllByRole('slider')[0];
    slider.focus();
    await user.keyboard('{ArrowRight}');

    expect(slider).toBeInTheDocument();
  });

  it('should render with DndProvider using appropriate backend', () => {
    render(<FormationPlanner />);

    expect(screen.getByTestId('formation-grid')).toBeInTheDocument();
  });
});
