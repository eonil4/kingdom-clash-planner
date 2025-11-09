import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FormationHeader from '../../../src/components/FormationHeader';
import { useAppSelector, useAppDispatch } from '../../../src/store/hooks';
import { updateFormationName } from '../../../src/store/reducers/formationSlice';

vi.mock('../../../src/store/hooks', () => ({
  useAppSelector: vi.fn(),
  useAppDispatch: vi.fn(),
}));

vi.mock('../../../src/store/reducers/formationSlice', () => ({
  updateFormationName: vi.fn((name) => ({ type: 'formation/updateFormationName', payload: name })),
}));

describe('FormationHeader', () => {
  const mockDispatch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAppDispatch as ReturnType<typeof vi.fn>).mockReturnValue(mockDispatch);
  });

  it('should render default formation name when currentFormation is null', () => {
    (useAppSelector as ReturnType<typeof vi.fn>).mockReturnValue(null);

    render(<FormationHeader />);

    expect(screen.getByText('Formation')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('should render formation name and power when currentFormation exists', () => {
    const mockFormation = {
      name: 'Test Formation',
      power: 12345,
      tiles: [],
    };

    (useAppSelector as ReturnType<typeof vi.fn>).mockReturnValue(mockFormation);

    render(<FormationHeader />);

    expect(screen.getByText('Test Formation')).toBeInTheDocument();
    expect(screen.getByText('12345')).toBeInTheDocument();
  });

  it('should render with correct styling classes', () => {
    (useAppSelector as ReturnType<typeof vi.fn>).mockReturnValue(null);

    const { container } = render(<FormationHeader />);
    const header = container.querySelector('header');

    expect(header).toHaveClass('w-full', 'p-4', 'bg-gradient-to-b', 'from-gray-700', 'to-gray-800');
  });

  it('should render power badge with correct styling', () => {
    const mockFormation = {
      name: 'Test',
      power: 5000,
      tiles: [],
    };

    (useAppSelector as ReturnType<typeof vi.fn>).mockReturnValue(mockFormation);

    render(<FormationHeader />);

    const powerElement = screen.getByText('5000');
    expect(powerElement).toBeInTheDocument();
    expect(powerElement.closest('.bg-blue-900')).toBeInTheDocument();
  });

  it('should show edit icon next to formation name', () => {
    const mockFormation = {
      id: '1',
      name: 'Test Formation',
      power: 100,
      tiles: Array(7).fill(null).map(() => Array(7).fill(null)),
    };

    (useAppSelector as ReturnType<typeof vi.fn>).mockReturnValue(mockFormation);

    render(<FormationHeader />);

    const editButton = screen.getByLabelText('Edit formation name');
    expect(editButton).toBeInTheDocument();
  });

  it('should show input field when edit icon is clicked', async () => {
    const user = userEvent.setup();
    const mockFormation = {
      id: '1',
      name: 'Test Formation',
      power: 100,
      tiles: Array(7).fill(null).map(() => Array(7).fill(null)),
    };

    (useAppSelector as ReturnType<typeof vi.fn>).mockReturnValue(mockFormation);

    render(<FormationHeader />);

    const editButton = screen.getByLabelText('Edit formation name');
    await user.click(editButton);

    const input = screen.getByDisplayValue('Test Formation');
    expect(input).toBeInTheDocument();
    expect(screen.queryByText('Test Formation')).not.toBeInTheDocument();
  });

  it('should save formation name when Enter is pressed', async () => {
    const user = userEvent.setup();
    const mockFormation = {
      id: '1',
      name: 'Test Formation',
      power: 100,
      tiles: Array(7).fill(null).map(() => Array(7).fill(null)),
    };

    (useAppSelector as ReturnType<typeof vi.fn>).mockReturnValue(mockFormation);

    render(<FormationHeader />);

    const editButton = screen.getByLabelText('Edit formation name');
    await user.click(editButton);

    const input = screen.getByDisplayValue('Test Formation');
    await user.clear(input);
    await user.type(input, 'New Formation Name');
    await user.keyboard('{Enter}');

    expect(mockDispatch).toHaveBeenCalledWith(updateFormationName('New Formation Name'));
  });

  it('should save formation name when input loses focus', async () => {
    const user = userEvent.setup();
    const mockFormation = {
      id: '1',
      name: 'Test Formation',
      power: 100,
      tiles: Array(7).fill(null).map(() => Array(7).fill(null)),
    };

    (useAppSelector as ReturnType<typeof vi.fn>).mockReturnValue(mockFormation);

    render(<FormationHeader />);

    const editButton = screen.getByLabelText('Edit formation name');
    await user.click(editButton);

    const input = screen.getByDisplayValue('Test Formation');
    await user.clear(input);
    await user.type(input, 'New Formation Name');
    await user.tab(); // Blur the input

    expect(mockDispatch).toHaveBeenCalledWith(updateFormationName('New Formation Name'));
  });

  it('should cancel editing when Escape is pressed', async () => {
    const user = userEvent.setup();
    const mockFormation = {
      id: '1',
      name: 'Test Formation',
      power: 100,
      tiles: Array(7).fill(null).map(() => Array(7).fill(null)),
    };

    (useAppSelector as ReturnType<typeof vi.fn>).mockReturnValue(mockFormation);

    render(<FormationHeader />);

    const editButton = screen.getByLabelText('Edit formation name');
    await user.click(editButton);

    const input = screen.getByDisplayValue('Test Formation');
    await user.clear(input);
    await user.type(input, 'New Formation Name');
    await user.keyboard('{Escape}');

    expect(mockDispatch).not.toHaveBeenCalled();
    expect(screen.getByText('Test Formation')).toBeInTheDocument();
  });

  it('should trim whitespace from formation name before saving', async () => {
    const user = userEvent.setup();
    const mockFormation = {
      id: '1',
      name: 'Test Formation',
      power: 100,
      tiles: Array(7).fill(null).map(() => Array(7).fill(null)),
    };

    (useAppSelector as ReturnType<typeof vi.fn>).mockReturnValue(mockFormation);

    render(<FormationHeader />);

    const editButton = screen.getByLabelText('Edit formation name');
    await user.click(editButton);

    const input = screen.getByDisplayValue('Test Formation');
    await user.clear(input);
    await user.type(input, '  New Formation Name  ');
    await user.keyboard('{Enter}');

    expect(mockDispatch).toHaveBeenCalledWith(updateFormationName('New Formation Name'));
  });
});

