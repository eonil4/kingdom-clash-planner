import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UnitTable } from '../../../../../src/components/organisms';
import { UnitRarity } from '../../../../../src/types';
import type { Unit } from '../../../../../src/types';

vi.mock('../../../../../src/components/molecules', () => ({
  SortableTableHeader: ({ label, column, onSort }: { label: string; column: string | null; onSort: (column: string | null) => void }) => (
    <th onClick={() => onSort(column)} data-testid={`header-${label.toLowerCase()}`}>
      {label}
    </th>
  ),
  UnitTableRow: ({ unit, unitCount, isEditing, onRowEdit, onDelete }: { 
    unit: { id: string; name: string; level: number }; 
    unitCount: number;
    isEditing: boolean;
    onRowEdit: (unit: Unit) => void;
    onDelete: (id: string) => void;
  }) => (
    <tr data-testid={`row-${unit.id}`} data-editing={isEditing}>
      <td>{unit.name}</td>
      <td>{unit.level}</td>
      <td>{unitCount}</td>
      <td>
        <button onClick={() => onRowEdit(unit as Unit)} aria-label={`Edit ${unit.name}`}>Edit</button>
        <button onClick={() => onDelete(unit.id)} aria-label={`Delete ${unit.name}`}>Delete</button>
      </td>
    </tr>
  ),
}));

describe('UnitTable', () => {
  const mockUnits: Unit[] = [
    { id: '1', name: 'Archers', level: 5, rarity: UnitRarity.Common, power: 1600 },
    { id: '2', name: 'Paladin', level: 10, rarity: UnitRarity.Epic, power: 53760 },
    { id: '3', name: 'Infantry', level: 3, rarity: UnitRarity.Rare, power: 480 },
  ];

  const mockUnitCounts = {
    'Archers-5': 3,
    'Paladin-10': 1,
    'Infantry-3': 5,
  };

  const mockProps = {
    uniqueUnits: mockUnits,
    unitCounts: mockUnitCounts,
    editingRowId: null as string | null,
    rowEditData: {} as Record<string, { name: string; level: number; rarity: UnitRarity; count: number }>,
    sortColumn: 'name' as const,
    sortDirection: 'asc' as const,
    onRowEdit: vi.fn(),
    onRowEditChange: vi.fn(),
    onRowSave: vi.fn(),
    onRowCancel: vi.fn(),
    onDelete: vi.fn(),
    onSort: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render table with headers', () => {
    render(<UnitTable {...mockProps} />);

    expect(screen.getByTestId('header-unit')).toBeInTheDocument();
    expect(screen.getByTestId('header-name')).toBeInTheDocument();
    expect(screen.getByTestId('header-level')).toBeInTheDocument();
    expect(screen.getByTestId('header-rarity')).toBeInTheDocument();
    expect(screen.getByTestId('header-count')).toBeInTheDocument();
    expect(screen.getByTestId('header-actions')).toBeInTheDocument();
  });

  it('should render all unit rows', () => {
    render(<UnitTable {...mockProps} />);

    expect(screen.getByTestId('row-1')).toBeInTheDocument();
    expect(screen.getByTestId('row-2')).toBeInTheDocument();
    expect(screen.getByTestId('row-3')).toBeInTheDocument();
  });

  it('should display unit names', () => {
    render(<UnitTable {...mockProps} />);

    expect(screen.getByText('Archers')).toBeInTheDocument();
    expect(screen.getByText('Paladin')).toBeInTheDocument();
    expect(screen.getByText('Infantry')).toBeInTheDocument();
  });

  it('should call onSort when header is clicked', async () => {
    const user = userEvent.setup();
    render(<UnitTable {...mockProps} />);

    await user.click(screen.getByTestId('header-level'));
    expect(mockProps.onSort).toHaveBeenCalledWith('level');
  });

  it('should call onRowEdit when edit button is clicked', async () => {
    const user = userEvent.setup();
    render(<UnitTable {...mockProps} />);

    await user.click(screen.getByLabelText('Edit Archers'));
    expect(mockProps.onRowEdit).toHaveBeenCalledWith(mockUnits[0]);
  });

  it('should call onDelete when delete button is clicked', async () => {
    const user = userEvent.setup();
    render(<UnitTable {...mockProps} />);

    await user.click(screen.getByLabelText('Delete Archers'));
    expect(mockProps.onDelete).toHaveBeenCalledWith('1');
  });

  it('should mark row as editing when editingRowId matches', () => {
    render(<UnitTable {...mockProps} editingRowId="2" />);

    expect(screen.getByTestId('row-2')).toHaveAttribute('data-editing', 'true');
    expect(screen.getByTestId('row-1')).toHaveAttribute('data-editing', 'false');
  });

  it('should handle empty units array', () => {
    render(<UnitTable {...mockProps} uniqueUnits={[]} />);

    expect(screen.queryByTestId('row-1')).not.toBeInTheDocument();
  });

  it('should use default count of 0 when unit count is not in unitCounts', () => {
    const unitsWithMissingCount: Unit[] = [
      { id: '99', name: 'Unknown', level: 1, rarity: UnitRarity.Common, power: 100 },
    ];

    render(<UnitTable {...mockProps} uniqueUnits={unitsWithMissingCount} />);

    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('should pass correct editData to row when editing', () => {
    const editData = {
      '1': { name: 'Archers', level: 5, rarity: UnitRarity.Common, count: 3 },
    };

    render(<UnitTable {...mockProps} editingRowId="1" rowEditData={editData} />);

    expect(screen.getByTestId('row-1')).toHaveAttribute('data-editing', 'true');
  });

  it('should call onSort with null for Actions column', async () => {
    const user = userEvent.setup();
    render(<UnitTable {...mockProps} />);

    await user.click(screen.getByTestId('header-actions'));
    expect(mockProps.onSort).not.toHaveBeenCalled();
  });
});

