import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import FormationHeader from '../../../src/components/FormationHeader';
import { useAppSelector } from '../../../src/store/hooks';

vi.mock('../../../src/store/hooks', () => ({
  useAppSelector: vi.fn(),
  useAppDispatch: vi.fn(),
}));

describe('FormationHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
});

