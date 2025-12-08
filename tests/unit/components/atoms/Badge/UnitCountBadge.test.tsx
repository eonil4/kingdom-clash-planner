import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UnitCountBadge } from '../../../../../src/components/atoms';

describe('UnitCountBadge', () => {
  it('should render count value', () => {
    // Arrange & Act
    render(<UnitCountBadge count={42} />);

    // Assert
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('should format large numbers with space separator', () => {
    // Arrange & Act
    render(<UnitCountBadge count={1500} />);

    // Assert
    expect(screen.getByText('1 500')).toBeInTheDocument();
  });

  it('should render zero count', () => {
    // Arrange & Act
    render(<UnitCountBadge count={0} />);

    // Assert
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});
