import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UnitList from '../../../src/components/UnitList';
import { useAppSelector, useAppDispatch } from '../../../src/store/hooks';
import { UnitRarity } from '../../../src/types';

const mockUseDrop = vi.fn(() => [
  { isOver: false },
  vi.fn(),
]);

vi.mock('react-dnd', () => ({
  useDrop: () => mockUseDrop(),
  useDrag: vi.fn(() => [
    { isDragging: false },
    vi.fn(),
  ]),
}));

vi.mock('../../../src/store/hooks', () => ({
  useAppSelector: vi.fn(),
  useAppDispatch: vi.fn(),
}));

vi.mock('../../../src/store/reducers/unitSlice', () => ({
  setSortOption: vi.fn((option) => ({ type: 'unit/setSortOption', payload: option })),
  setSortOption2: vi.fn((option) => ({ type: 'unit/setSortOption2', payload: option })),
  setSortOption3: vi.fn((option) => ({ type: 'unit/setSortOption3', payload: option })),
  setSearchTerm: vi.fn((term) => ({ type: 'unit/setSearchTerm', payload: term })),
}));

vi.mock('../../../src/store/reducers/formationSlice', () => ({
  removeUnit: vi.fn((payload) => ({ type: 'formation/removeUnit', payload })),
  placeUnit: vi.fn((payload) => ({ type: 'formation/placeUnit', payload })),
}));

vi.mock('../../../src/components/UnitCard', () => ({
  default: vi.fn(({ unit, onDoubleClick }) => (
    <div data-testid={`unit-card-${unit.id}`} onDoubleClick={onDoubleClick}>
      {unit.name}
    </div>
  )),
}));

vi.mock('../../../src/components/UnitSearch', () => ({
  default: vi.fn(({ onSearchChange }) => (
    <input
      data-testid="unit-search"
      onChange={(e) => onSearchChange(e.target.value)}
      placeholder="Search units..."
    />
  )),
}));

vi.mock('../../../src/components/ManageUnitsModal', () => ({
  default: vi.fn(({ open }) => (
    open ? <div data-testid="manage-units-modal">Manage Units Modal</div> : null
  )),
}));

describe('UnitList', () => {
  const mockDispatch = vi.fn();
  const mockUnits = [
    { id: '1', name: 'Unit1', level: 1, rarity: UnitRarity.Common },
    { id: '2', name: 'Unit2', level: 2, rarity: UnitRarity.Rare },
    { id: '3', name: 'Unit3', level: 3, rarity: UnitRarity.Epic },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (useAppDispatch as ReturnType<typeof vi.fn>).mockReturnValue(mockDispatch);
    (useAppSelector as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
      const state = {
        unit: {
          filteredUnits: mockUnits,
          sortOption: 'level' as const,
          sortOption2: null,
          sortOption3: null,
        },
        formation: {
          currentFormation: {
            name: 'Test Formation',
            power: 0,
            tiles: Array(7).fill(null).map(() => Array(7).fill(null)),
          },
        },
      };
      return selector(state);
    });
  });

  it('should render unit list with available units', () => {
    render(<UnitList />);

    expect(screen.getByTestId('unit-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('unit-card-2')).toBeInTheDocument();
    expect(screen.getByTestId('unit-card-3')).toBeInTheDocument();
  });

  it('should render sort controls', () => {
    render(<UnitList />);

    expect(screen.getByLabelText(/sort units by \(primary\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/sort units by \(secondary\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/sort units by \(tertiary\)/i)).toBeInTheDocument();
  });

  it('should render unit count badge', () => {
    render(<UnitList />);

    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should render Manage Units button', () => {
    render(<UnitList />);

    const manageButton = screen.getByRole('button', { name: /manage units/i });
    expect(manageButton).toBeInTheDocument();
  });

  it('should open Manage Units modal when Manage Units button is clicked', async () => {
    const user = userEvent.setup();
    render(<UnitList />);

    const manageButton = screen.getByRole('button', { name: /manage units/i });
    await user.click(manageButton);

    expect(screen.getByTestId('manage-units-modal')).toBeInTheDocument();
  });

  it('should render UnitSearch component', () => {
    render(<UnitList />);

    expect(screen.getByTestId('unit-search')).toBeInTheDocument();
  });

  it('should filter out units that are in formation', () => {
    (useAppSelector as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
      const state = {
        unit: {
          filteredUnits: mockUnits,
          sortOption: 'level' as const,
          sortOption2: null,
          sortOption3: null,
        },
        formation: {
          currentFormation: {
            name: 'Test Formation',
            power: 0,
            tiles: [
              [{ id: '1', name: 'Unit1', level: 1, rarity: UnitRarity.Common }, ...Array(6).fill(null)],
              ...Array(6).fill(null).map(() => Array(7).fill(null)),
            ],
          },
        },
      };
      return selector(state);
    });

    render(<UnitList />);

    // Unit1 should not be in the list since it's in formation
    expect(screen.queryByTestId('unit-card-1')).not.toBeInTheDocument();
    expect(screen.getByTestId('unit-card-2')).toBeInTheDocument();
    expect(screen.getByTestId('unit-card-3')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // Count should be 2
  });

  // Note: Testing MUI Select interactions requires more complex setup
  // The sort functionality is tested in the reducer tests
});

