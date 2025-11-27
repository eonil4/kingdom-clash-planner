import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UnitFilters } from '../../../../../src/components/molecules';
import { UnitRarity } from '../../../../../src/types';
import type { UnitFilters as UnitFiltersType } from '../../../../../src/hooks/useManageUnits';

describe('UnitFilters', () => {
  const mockFilters: UnitFiltersType = {
    name: '',
    levelMin: '',
    levelMax: '',
    rarityMin: '',
    rarityMax: '',
    countMin: '',
    countMax: '',
  };

  const mockOnFilterChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render name filter input', () => {
    render(<UnitFilters filters={mockFilters} onFilterChange={mockOnFilterChange} />);
    
    const nameInput = screen.getByPlaceholderText('Filter name...');
    expect(nameInput).toBeInTheDocument();
  });

  it('should call onFilterChange when name filter changes', async () => {
    render(<UnitFilters filters={mockFilters} onFilterChange={mockOnFilterChange} />);
    
    const nameInput = screen.getByPlaceholderText('Filter name...') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'test' } });
    
    expect(mockOnFilterChange).toHaveBeenCalledWith('name', 'test');
  });

  it('should render level range filters', () => {
    render(<UnitFilters filters={mockFilters} onFilterChange={mockOnFilterChange} />);
    
    const levelInputs = screen.getAllByPlaceholderText('Min');
    const maxInputs = screen.getAllByPlaceholderText('Max');
    
    expect(levelInputs.length).toBeGreaterThanOrEqual(1);
    expect(maxInputs.length).toBeGreaterThanOrEqual(1);
  });

  it('should call onFilterChange when level min changes', async () => {
    const user = userEvent.setup();
    render(<UnitFilters filters={mockFilters} onFilterChange={mockOnFilterChange} />);
    
    const levelInputs = screen.getAllByPlaceholderText('Min');
    const levelMinInput = levelInputs[0];
    
    await user.type(levelMinInput, '5');
    
    expect(mockOnFilterChange).toHaveBeenCalledWith('levelMin', '5');
  });

  it('should call onFilterChange when level max changes', async () => {
    render(<UnitFilters filters={mockFilters} onFilterChange={mockOnFilterChange} />);
    
    const levelMaxInputs = screen.getAllByPlaceholderText('Max');
    const levelMaxInput = levelMaxInputs[0] as HTMLInputElement;
    
    fireEvent.change(levelMaxInput, { target: { value: '10' } });
    
    expect(mockOnFilterChange).toHaveBeenCalledWith('levelMax', '10');
  });

  it('should render rarity range filters', () => {
    render(<UnitFilters filters={mockFilters} onFilterChange={mockOnFilterChange} />);
    
    const raritySelects = screen.getAllByRole('combobox');
    expect(raritySelects.length).toBeGreaterThanOrEqual(2);
  });

  it('should call onFilterChange when rarity min changes', async () => {
    const user = userEvent.setup();
    render(<UnitFilters filters={mockFilters} onFilterChange={mockOnFilterChange} />);
    
    const raritySelects = screen.getAllByRole('combobox');
    const rarityMinSelect = raritySelects[0];
    
    await user.click(rarityMinSelect);
    const commonOption = screen.getByText('Common');
    await user.click(commonOption);
    
    expect(mockOnFilterChange).toHaveBeenCalledWith('rarityMin', UnitRarity.Common);
  });

  it('should call onFilterChange when rarity max changes', async () => {
    const user = userEvent.setup();
    render(<UnitFilters filters={mockFilters} onFilterChange={mockOnFilterChange} />);
    
    const raritySelects = screen.getAllByRole('combobox');
    const rarityMaxSelect = raritySelects[1];
    
    await user.click(rarityMaxSelect);
    const legendaryOption = screen.getByText('Legendary');
    await user.click(legendaryOption);
    
    expect(mockOnFilterChange).toHaveBeenCalledWith('rarityMax', UnitRarity.Legendary);
  });

  it('should display all rarity options', async () => {
    const user = userEvent.setup();
    render(<UnitFilters filters={mockFilters} onFilterChange={mockOnFilterChange} />);
    
    const raritySelects = screen.getAllByRole('combobox');
    await user.click(raritySelects[0]);
    
    expect(screen.getByText('Common')).toBeInTheDocument();
    expect(screen.getByText('Rare')).toBeInTheDocument();
    expect(screen.getByText('Epic')).toBeInTheDocument();
    expect(screen.getByText('Legendary')).toBeInTheDocument();
  });

  it('should render count range filters', () => {
    render(<UnitFilters filters={mockFilters} onFilterChange={mockOnFilterChange} />);
    
    const countInputs = screen.getAllByPlaceholderText('Min');
    const countMaxInputs = screen.getAllByPlaceholderText('Max');
    
    expect(countInputs.length).toBeGreaterThanOrEqual(2);
    expect(countMaxInputs.length).toBeGreaterThanOrEqual(2);
  });

  it('should call onFilterChange when count min changes', async () => {
    const user = userEvent.setup();
    render(<UnitFilters filters={mockFilters} onFilterChange={mockOnFilterChange} />);
    
    const countInputs = screen.getAllByPlaceholderText('Min');
    const countMinInput = countInputs[1];
    
    await user.type(countMinInput, '5');
    
    expect(mockOnFilterChange).toHaveBeenCalledWith('countMin', '5');
  });

  it('should call onFilterChange when count max changes', async () => {
    render(<UnitFilters filters={mockFilters} onFilterChange={mockOnFilterChange} />);
    
    const countMaxInputs = screen.getAllByPlaceholderText('Max');
    const countMaxInput = countMaxInputs[1] as HTMLInputElement;
    
    fireEvent.change(countMaxInput, { target: { value: '10' } });
    
    expect(mockOnFilterChange).toHaveBeenCalledWith('countMax', '10');
  });

  it('should display current filter values', () => {
    const filtersWithValues: UnitFiltersType = {
      name: 'TestUnit',
      levelMin: '1',
      levelMax: '10',
      rarityMin: UnitRarity.Common,
      rarityMax: UnitRarity.Legendary,
      countMin: '5',
      countMax: '20',
    };
    
    render(<UnitFilters filters={filtersWithValues} onFilterChange={mockOnFilterChange} />);
    
    expect(screen.getByDisplayValue('TestUnit')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('10')).toBeInTheDocument();
    expect(screen.getByDisplayValue('5')).toBeInTheDocument();
    expect(screen.getByDisplayValue('20')).toBeInTheDocument();
  });

  it('should show filter icon in name input', () => {
    render(<UnitFilters filters={mockFilters} onFilterChange={mockOnFilterChange} />);
    
    const nameInput = screen.getByPlaceholderText('Filter name...');
    expect(nameInput).toBeInTheDocument();
  });
});

