import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Table, TableBody } from '@mui/material';
import { UnitTableRow } from '../../../../../src/components/molecules';
import { UnitRarity } from '../../../../../src/types';
import type { Unit } from '../../../../../src/types';

vi.mock('react-dnd', () => ({
  DndProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useDrop: vi.fn(() => [{ isOver: false }, vi.fn()]),
  useDrag: vi.fn(() => [{ isDragging: false }, vi.fn()]),
  HTML5Backend: {},
}));

vi.mock('../../../../../src/components/molecules/UnitCard', () => ({
  UnitCard: ({ unit }: { unit: { name: string; level: number } }) => (
    <div data-testid={`unit-card-${unit.name}-${unit.level}`}>
      {unit.name} Lv{unit.level}
    </div>
  ),
}));

vi.mock('../../../../../src/types/unitNames', () => ({
  UNIT_NAMES_ARRAY: ['TestUnit', 'AnotherUnit'],
  getUnitDataByName: vi.fn((name) => {
    if (name === 'TestUnit') {
      return {
        name: 'TestUnit',
        rarity: UnitRarity.Common,
        getPower: () => 100,
      };
    }
    return null;
  }),
}));

describe('UnitTableRow', () => {
  const mockUnit: Unit = {
    id: '1',
    name: 'TestUnit',
    level: 5,
    rarity: UnitRarity.Epic,
    power: 500,
  };

  const mockProps = {
    unit: mockUnit,
    unitCount: 3,
    isEditing: false,
    editData: {
      name: 'TestUnit',
      level: 5,
      rarity: UnitRarity.Epic,
      count: 3,
    },
    onRowEditChange: vi.fn(),
    onRowEdit: vi.fn(),
    onRowSave: vi.fn(),
    onRowCancel: vi.fn(),
    onDelete: vi.fn(),
  };

  const renderTableRow = (props: typeof mockProps) => {
    return render(
      <Table>
        <TableBody>
          <UnitTableRow {...props} />
        </TableBody>
      </Table>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render unit card', () => {
    renderTableRow(mockProps);
    expect(screen.getByTestId('unit-card-TestUnit-5')).toBeInTheDocument();
  });

  it('should display unit name when not editing', () => {
    renderTableRow(mockProps);
    expect(screen.getByText('TestUnit')).toBeInTheDocument();
  });

  it('should display unit level when not editing', () => {
    renderTableRow(mockProps);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should display unit rarity badge when not editing', () => {
    renderTableRow(mockProps);
    expect(screen.getByText('Epic')).toBeInTheDocument();
  });

  it('should display unit count when not editing', () => {
    renderTableRow(mockProps);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should show edit and delete buttons when not editing', () => {
    renderTableRow(mockProps);
    
    const editButton = screen.getByLabelText('Edit TestUnit');
    const deleteButton = screen.getByLabelText('Delete TestUnit');
    
    expect(editButton).toBeInTheDocument();
    expect(deleteButton).toBeInTheDocument();
  });

  it('should call onRowEdit when edit button is clicked', async () => {
    const user = userEvent.setup();
    renderTableRow(mockProps);
    
    const editButton = screen.getByLabelText('Edit TestUnit');
    await user.click(editButton);
    
    expect(mockProps.onRowEdit).toHaveBeenCalledWith(mockUnit);
  });

  it('should call onDelete when delete button is clicked', async () => {
    const user = userEvent.setup();
    renderTableRow(mockProps);
    
    const deleteButton = screen.getByLabelText('Delete TestUnit');
    await user.click(deleteButton);
    
    expect(mockProps.onDelete).toHaveBeenCalledWith('1');
  });

  it('should show name select when editing', () => {
    renderTableRow({ ...mockProps, isEditing: true });
    
    const nameSelect = screen.getByDisplayValue('TestUnit');
    expect(nameSelect).toBeInTheDocument();
  });

  it('should call onRowEditChange when name is changed', async () => {
    const user = userEvent.setup();
    renderTableRow({ ...mockProps, isEditing: true });
    
    const comboboxes = screen.getAllByRole('combobox');
    const nameSelect = comboboxes[0];
    await user.click(nameSelect);
    
    const anotherUnitOption = await screen.findByRole('option', { name: 'AnotherUnit' });
    await user.click(anotherUnitOption);
    
    expect(mockProps.onRowEditChange).toHaveBeenCalledWith('1', 'name', 'AnotherUnit');
  });

  it('should update rarity when unit name changes', async () => {
    const user = userEvent.setup();
    renderTableRow({ 
      ...mockProps, 
      isEditing: true,
      editData: { ...mockProps.editData, name: 'AnotherUnit' }
    });
    
    const comboboxes = screen.getAllByRole('combobox');
    const nameSelect = comboboxes[0];
    await user.click(nameSelect);
    
    const testUnitOption = await screen.findByRole('option', { name: 'TestUnit' });
    await user.click(testUnitOption);
    
    expect(mockProps.onRowEditChange).toHaveBeenCalledWith('1', 'name', 'TestUnit');
    
    const calls = mockProps.onRowEditChange.mock.calls;
    const rarityCall = calls.find(call => call[1] === 'rarity' && call[0] === '1');
    expect(rarityCall).toBeDefined();
    if (rarityCall) {
      expect(rarityCall[0]).toBe('1');
      expect(rarityCall[1]).toBe('rarity');
      expect(rarityCall[2]).toBe(UnitRarity.Common);
    }
  });

  it('should show level input when editing', () => {
    renderTableRow({ ...mockProps, isEditing: true });
    
    const levelInput = screen.getByDisplayValue('5');
    expect(levelInput).toBeInTheDocument();
  });

  it('should call onRowEditChange when level is changed', () => {
    renderTableRow({ ...mockProps, isEditing: true });
    
    const levelInput = screen.getByDisplayValue('5') as HTMLInputElement;
    fireEvent.change(levelInput, { target: { value: '7' } });
    
    expect(mockProps.onRowEditChange).toHaveBeenCalledWith('1', 'level', 7);
  });

  it('should show rarity select when editing', () => {
    renderTableRow({ ...mockProps, isEditing: true });
    
    const raritySelect = screen.getByDisplayValue('Epic');
    expect(raritySelect).toBeInTheDocument();
  });

  it('should call onRowEditChange when rarity is changed', async () => {
    const user = userEvent.setup();
    renderTableRow({ ...mockProps, isEditing: true });
    
    const comboboxes = screen.getAllByRole('combobox');
    const raritySelect = comboboxes[1];
    await user.click(raritySelect);
    const legendaryOption = await screen.findByRole('option', { name: 'Legendary' });
    await user.click(legendaryOption);
    
    expect(mockProps.onRowEditChange).toHaveBeenCalledWith('1', 'rarity', UnitRarity.Legendary);
  });

  it('should show count input when editing', () => {
    renderTableRow({ ...mockProps, isEditing: true });
    
    const countInput = screen.getByDisplayValue('3');
    expect(countInput).toBeInTheDocument();
  });

  it('should call onRowEditChange when count is changed', () => {
    renderTableRow({ ...mockProps, isEditing: true });
    
    const countInput = screen.getByDisplayValue('3') as HTMLInputElement;
    fireEvent.change(countInput, { target: { value: '10' } });
    
    expect(mockProps.onRowEditChange).toHaveBeenCalledWith('1', 'count', 10);
  });

  it('should show save and cancel buttons when editing', () => {
    renderTableRow({ ...mockProps, isEditing: true });
    
    const saveButton = screen.getByLabelText('Save TestUnit');
    const cancelButton = screen.getByLabelText('Cancel');
    
    expect(saveButton).toBeInTheDocument();
    expect(cancelButton).toBeInTheDocument();
  });

  it('should call onRowSave when save button is clicked', async () => {
    const user = userEvent.setup();
    renderTableRow({ ...mockProps, isEditing: true });
    
    const saveButton = screen.getByLabelText('Save TestUnit');
    await user.click(saveButton);
    
    expect(mockProps.onRowSave).toHaveBeenCalledTimes(1);
  });

  it('should call onRowCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    renderTableRow({ ...mockProps, isEditing: true });
    
    const cancelButton = screen.getByLabelText('Cancel');
    await user.click(cancelButton);
    
    expect(mockProps.onRowCancel).toHaveBeenCalledTimes(1);
  });

  it('should display correct rarity badge color for Common', () => {
    renderTableRow({ ...mockProps, unit: { ...mockUnit, rarity: UnitRarity.Common } });
    const badge = screen.getByText('Common');
    expect(badge).toHaveClass('bg-gray-600');
  });

  it('should display correct rarity badge color for Rare', () => {
    renderTableRow({ ...mockProps, unit: { ...mockUnit, rarity: UnitRarity.Rare } });
    const badge = screen.getByText('Rare');
    expect(badge).toHaveClass('bg-blue-600');
  });

  it('should display correct rarity badge color for Epic', () => {
    renderTableRow({ ...mockProps, unit: { ...mockUnit, rarity: UnitRarity.Epic } });
    const badge = screen.getByText('Epic');
    expect(badge).toHaveClass('bg-purple-600');
  });

  it('should display correct rarity badge color for Legendary', () => {
    renderTableRow({ ...mockProps, unit: { ...mockUnit, rarity: UnitRarity.Legendary } });
    const badge = screen.getByText('Legendary');
    expect(badge).toHaveClass('bg-yellow-600');
  });
});

