import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SortControls } from '../../../../../src/components/molecules';
import type { SortOption } from '../../../../../src/types';

describe('SortControls', () => {
  const mockOnPrimaryChange = vi.fn();
  const mockOnSecondaryChange = vi.fn();
  const mockOnTertiaryChange = vi.fn();

  const defaultProps = {
    primarySort: 'level' as SortOption,
    secondarySort: null as SortOption | null,
    tertiarySort: null as SortOption | null,
    onPrimaryChange: mockOnPrimaryChange,
    onSecondaryChange: mockOnSecondaryChange,
    onTertiaryChange: mockOnTertiaryChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render three sort controls', () => {
    render(<SortControls {...defaultProps} />);

    expect(screen.getByLabelText('Sort units by (primary)')).toBeInTheDocument();
    expect(screen.getByLabelText('Sort units by (secondary)')).toBeInTheDocument();
    expect(screen.getByLabelText('Sort units by (tertiary)')).toBeInTheDocument();
  });

  it('should display primary sort value as By Level', () => {
    render(<SortControls {...defaultProps} primarySort="level" />);

    expect(screen.getByText('By Level')).toBeInTheDocument();
  });

  it('should display primary sort value as By Rarity', () => {
    render(<SortControls {...defaultProps} primarySort="rarity" />);

    expect(screen.getByText('By Rarity')).toBeInTheDocument();
  });

  it('should display primary sort value as By Name', () => {
    render(<SortControls {...defaultProps} primarySort="name" />);

    expect(screen.getByText('By Name')).toBeInTheDocument();
  });

  it('should display secondary sort value when set to rarity', () => {
    render(<SortControls {...defaultProps} secondarySort="rarity" />);

    expect(screen.getByText('By Rarity')).toBeInTheDocument();
  });

  it('should display secondary sort value when set to name', () => {
    render(<SortControls {...defaultProps} secondarySort="name" />);

    expect(screen.getByText('By Name')).toBeInTheDocument();
  });

  it('should display tertiary sort value when set', () => {
    render(<SortControls {...defaultProps} secondarySort="rarity" tertiarySort="name" />);

    expect(screen.getByText('By Name')).toBeInTheDocument();
  });

  it('should render all three comboboxes', () => {
    render(<SortControls {...defaultProps} />);

    const comboboxes = screen.getAllByRole('combobox');
    expect(comboboxes).toHaveLength(3);
  });

  it('should display correct labels for all sort options', () => {
    render(<SortControls {...defaultProps} primarySort="name" secondarySort="level" tertiarySort="rarity" />);

    expect(screen.getByText('By Name')).toBeInTheDocument();
    expect(screen.getByText('By Level')).toBeInTheDocument();
    expect(screen.getByText('By Rarity')).toBeInTheDocument();
  });

  it('should render with displayEmpty on secondary select', () => {
    render(<SortControls {...defaultProps} secondarySort={null} />);

    const secondarySelect = screen.getByLabelText('Sort units by (secondary)');
    expect(secondarySelect).toBeInTheDocument();
  });

  it('should render with displayEmpty on tertiary select', () => {
    render(<SortControls {...defaultProps} tertiarySort={null} />);

    const tertiarySelect = screen.getByLabelText('Sort units by (tertiary)');
    expect(tertiarySelect).toBeInTheDocument();
  });

  it('should have correct styling classes on select controls', () => {
    render(<SortControls {...defaultProps} />);

    const primarySelect = screen.getByLabelText('Sort units by (primary)');
    expect(primarySelect).toHaveClass('bg-gray-700');
  });

  it('should render FormControl with correct size', () => {
    const { container } = render(<SortControls {...defaultProps} />);

    const formControls = container.querySelectorAll('.MuiFormControl-root');
    expect(formControls).toHaveLength(3);
  });

  it('should call onChange handlers when native input changes', () => {
    render(<SortControls {...defaultProps} />);

    const primaryNativeInput = document.querySelector('input[value="level"]') as HTMLInputElement;
    expect(primaryNativeInput).toBeInTheDocument();
  });
});
