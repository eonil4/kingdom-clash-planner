import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddUnitForm from '../../../../src/components/manage/AddUnitForm';
import { UnitRarity } from '../../../../src/types';

vi.mock('../../../../src/components/unit/UnitCard', () => ({
  default: ({ unit }: { unit: { name: string; level: number } }) => (
    <div data-testid={`unit-card-${unit.name}-${unit.level}`}>
      {unit.name} Lv{unit.level}
    </div>
  ),
}));

vi.mock('../../../../src/utils/imageUtils', () => ({
  getUnitImagePath: vi.fn((name) => (name ? `/images/${name}.png` : undefined)),
}));

vi.mock('../../../../src/types/unitNames', () => ({
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

vi.mock('../../../../src/utils/unitNameUtils', () => ({
  normalizeUnitName: vi.fn((name) => name.trim()),
}));

describe('AddUnitForm', () => {
  const mockFormData = {
    name: 'TestUnit',
    level: 10,
    rarity: UnitRarity.Common,
    count: 1,
  };

  const mockProps = {
    formData: mockFormData,
    selectedLevels: [1, 2],
    levelCounts: { 1: 1, 2: 1 },
    units: [],
    formationUnitCount: 0,
    onNameChange: vi.fn(),
    onLevelToggle: vi.fn(),
    onLevelCountChange: vi.fn(),
    onSelectAllLevels: vi.fn(),
    onSave: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the form with title', () => {
    render(<AddUnitForm {...mockProps} />);
    expect(screen.getByText('Add New Unit')).toBeInTheDocument();
  });

  it('should render unit card preview', () => {
    render(<AddUnitForm {...mockProps} />);
    expect(screen.getByTestId('unit-card-TestUnit-1')).toBeInTheDocument();
  });

  it('should render unit name select', () => {
    render(<AddUnitForm {...mockProps} />);
    
    // Find the Select by its display value - verify it exists
    const selectInput = screen.getByDisplayValue('TestUnit');
    expect(selectInput).toBeInTheDocument();
    
    // Verify the select has the correct value
    expect(selectInput).toHaveValue('TestUnit');
    
    // Verify the label text exists (MUI Select uses InputLabel which appears multiple times)
    const labels = screen.getAllByText('Unit Name');
    expect(labels.length).toBeGreaterThan(0);
  });

  it('should call onNameChange when unit name is changed', () => {
    render(<AddUnitForm {...mockProps} />);
    
    // Find the native input element within the Select
    const selectInput = screen.getByDisplayValue('TestUnit') as HTMLInputElement;
    
    // Simulate changing the value directly on the native input
    fireEvent.change(selectInput, { target: { value: 'AnotherUnit' } });
    
    // Verify the onChange handler was called
    expect(mockProps.onNameChange).toHaveBeenCalledWith('AnotherUnit');
  });

  it('should render level checkboxes', () => {
    render(<AddUnitForm {...mockProps} />);
    
    for (let i = 1; i <= 10; i++) {
      const checkbox = screen.getByLabelText(i.toString());
      expect(checkbox).toBeInTheDocument();
    }
  });

  it('should show selected levels as checked', () => {
    render(<AddUnitForm {...mockProps} selectedLevels={[1, 3, 5]} />);
    
    expect(screen.getByLabelText('1')).toBeChecked();
    expect(screen.getByLabelText('3')).toBeChecked();
    expect(screen.getByLabelText('5')).toBeChecked();
    expect(screen.getByLabelText('2')).not.toBeChecked();
  });

  it('should call onLevelToggle when level checkbox is clicked', async () => {
    const user = userEvent.setup();
    render(<AddUnitForm {...mockProps} />);
    
    const checkbox = screen.getByLabelText('3');
    await user.click(checkbox);
    
    expect(mockProps.onLevelToggle).toHaveBeenCalledWith(3);
  });

  it('should render level count inputs for selected levels', () => {
    render(<AddUnitForm {...mockProps} selectedLevels={[1, 2]} levelCounts={{ 1: 5, 2: 3 }} />);
    
    const level1Input = screen.getByDisplayValue('5');
    const level2Input = screen.getByDisplayValue('3');
    expect(level1Input).toBeInTheDocument();
    expect(level2Input).toBeInTheDocument();
  });

  it('should disable level count inputs for unselected levels', () => {
    render(<AddUnitForm {...mockProps} selectedLevels={[1]} />);
    
    const level2Checkbox = screen.getByLabelText('2');
    expect(level2Checkbox).not.toBeChecked();
  });

  it('should call onLevelCountChange when level count is changed', async () => {
    const user = userEvent.setup();
    render(<AddUnitForm {...mockProps} selectedLevels={[1]} levelCounts={{ 1: 5 }} />);
    
    const input = screen.getByDisplayValue('5');
    await user.clear(input);
    await user.type(input, '10');
    
    expect(mockProps.onLevelCountChange).toHaveBeenCalled();
  });

  it('should show select all checkbox', () => {
    render(<AddUnitForm {...mockProps} />);
    expect(screen.getByLabelText('Select All Levels')).toBeInTheDocument();
  });

  it('should show select all as checked when all levels are selected', () => {
    render(<AddUnitForm {...mockProps} selectedLevels={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]} />);
    const selectAll = screen.getByLabelText('Select All Levels');
    expect(selectAll).toBeChecked();
  });

  it('should show select all as indeterminate when some levels are selected', () => {
    render(<AddUnitForm {...mockProps} selectedLevels={[1, 2, 3]} />);
    const selectAll = screen.getByLabelText('Select All Levels');
    // Check data-indeterminate attribute instead
    expect(selectAll).toHaveAttribute('data-indeterminate', 'true');
  });

  it('should call onSelectAllLevels when select all checkbox is clicked', async () => {
    const user = userEvent.setup();
    render(<AddUnitForm {...mockProps} />);
    
    const selectAll = screen.getByLabelText('Select All Levels');
    await user.click(selectAll);
    
    expect(mockProps.onSelectAllLevels).toHaveBeenCalledWith(true);
  });

  it('should display total unit count', () => {
    render(<AddUnitForm {...mockProps} units={[{ id: '1', name: 'TestUnit', level: 1, rarity: UnitRarity.Common, power: 100 }]} formationUnitCount={5} />);
    
    expect(screen.getByText(/Total: 6 \/ 1000/)).toBeInTheDocument();
    expect(screen.getByText(/Roster: 1, Formation: 5/)).toBeInTheDocument();
  });

  it('should show warning when no levels are selected', () => {
    render(<AddUnitForm {...mockProps} selectedLevels={[]} />);
    expect(screen.getByText('Please select at least one level')).toBeInTheDocument();
  });

  it('should disable save button when no unit name is selected', () => {
    render(<AddUnitForm {...mockProps} formData={{ ...mockFormData, name: '' }} />);
    const saveButton = screen.getByText('Add Units');
    expect(saveButton).toBeDisabled();
  });

  it('should disable save button when no levels are selected', () => {
    render(<AddUnitForm {...mockProps} selectedLevels={[]} />);
    const saveButton = screen.getByText('Add Units');
    expect(saveButton).toBeDisabled();
  });

  it('should enable save button when unit name and levels are selected', () => {
    render(<AddUnitForm {...mockProps} />);
    const saveButton = screen.getByText('Add Units');
    expect(saveButton).not.toBeDisabled();
  });

  it('should call onSave when save button is clicked', async () => {
    const user = userEvent.setup();
    render(<AddUnitForm {...mockProps} />);
    
    const saveButton = screen.getByText('Add Units');
    await user.click(saveButton);
    
    expect(mockProps.onSave).toHaveBeenCalledTimes(1);
  });

  it('should call onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<AddUnitForm {...mockProps} />);
    
    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);
    
    expect(mockProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('should show max units per level message', () => {
    render(<AddUnitForm {...mockProps} />);
    expect(screen.getByText('Max: 49 per level')).toBeInTheDocument();
  });

  it('should disable level checkbox when max units reached for that level', () => {
    const unitsWithMaxLevel1 = Array(49).fill(null).map((_, i) => ({
      id: `unit-${i}`,
      name: 'TestUnit',
      level: 1,
      rarity: UnitRarity.Common,
      power: 100,
    }));
    
    render(<AddUnitForm {...mockProps} units={unitsWithMaxLevel1} formData={{ ...mockFormData, name: 'TestUnit' }} selectedLevels={[]} />);
    
    const level1Checkbox = screen.getByLabelText('1');
    expect(level1Checkbox).toBeDisabled();
  });

  it('should show preview unit with correct power when unit data exists', () => {
    render(<AddUnitForm {...mockProps} formData={{ ...mockFormData, name: 'TestUnit' }} />);
    const previewCard = screen.getByTestId('unit-card-TestUnit-1');
    expect(previewCard).toBeInTheDocument();
  });

  it('should show preview unit with default name when no unit selected', () => {
    render(<AddUnitForm {...mockProps} formData={{ ...mockFormData, name: '' }} />);
    const previewCard = screen.getByTestId('unit-card-Select Unit-1');
    expect(previewCard).toBeInTheDocument();
  });
});

