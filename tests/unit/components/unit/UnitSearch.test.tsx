import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UnitSearch from '../../../../src/components/unit/UnitSearch';

describe('UnitSearch', () => {
  const mockOnSearchChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render search input with placeholder', () => {
    render(<UnitSearch onSearchChange={mockOnSearchChange} />);

    const input = screen.getByPlaceholderText('Search units...');
    expect(input).toBeInTheDocument();
  });

  it('should call onSearchChange when input value changes', async () => {
    const user = userEvent.setup();
    render(<UnitSearch onSearchChange={mockOnSearchChange} />);

    const input = screen.getByPlaceholderText('Search units...');
    await user.type(input, 'test');

    expect(mockOnSearchChange).toHaveBeenCalledTimes(4); // Once for each character
    expect(mockOnSearchChange).toHaveBeenLastCalledWith('test');
  });

  it('should show clear button when search term is not empty', async () => {
    const user = userEvent.setup();
    render(<UnitSearch onSearchChange={mockOnSearchChange} />);

    const input = screen.getByPlaceholderText('Search units...') as HTMLInputElement;
    // Initially, clear button should not be visible
    expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument();

    // Type something
    await user.type(input, 'test');

    // Clear button should now be visible
    expect(screen.getByLabelText('Clear search')).toBeInTheDocument();
  });

  it('should clear search term and call onSearchChange with empty string when clear button is clicked', async () => {
    const user = userEvent.setup();
    render(<UnitSearch onSearchChange={mockOnSearchChange} />);

    const input = screen.getByPlaceholderText('Search units...') as HTMLInputElement;
    await user.type(input, 'test');

    const clearButton = screen.getByLabelText('Clear search');
    await user.click(clearButton);

    expect(input.value).toBe('');
    expect(mockOnSearchChange).toHaveBeenLastCalledWith('');
    expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument();
  });

  it('should update internal state when input changes', async () => {
    const user = userEvent.setup();
    render(<UnitSearch onSearchChange={mockOnSearchChange} />);

    const input = screen.getByPlaceholderText('Search units...') as HTMLInputElement;
    await user.type(input, 'unit');

    expect(input.value).toBe('unit');
  });
});

