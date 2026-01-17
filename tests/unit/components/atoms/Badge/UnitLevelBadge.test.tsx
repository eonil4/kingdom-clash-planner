import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import UnitLevelBadge from '../../../../../src/components/atoms/Badge/UnitLevelBadge';

describe('UnitLevelBadge', () => {
  it('should render level value', () => {
    // Arrange & Act
    render(<UnitLevelBadge level={5} />);

    // Assert
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should render with default size and fontSize', () => {
    // Arrange & Act
    const { container } = render(<UnitLevelBadge level={3} />);

    // Assert
    const badge = container.querySelector('div');
    expect(badge).toHaveStyle({ width: '24px', height: '24px' });
  });

  it('should render with custom size', () => {
    // Arrange & Act
    const { container } = render(<UnitLevelBadge level={7} size="32px" />);

    // Assert
    const badge = container.querySelector('div');
    expect(badge).toHaveStyle({ width: '32px', height: '32px' });
  });

  it('should render with custom fontSize', () => {
    // Arrange & Act
    const { container } = render(<UnitLevelBadge level={10} fontSize="1rem" />);

    // Assert
    const span = container.querySelector('span');
    expect(span).toHaveStyle({ fontSize: '1rem' });
  });

  it('should set minWidth and minHeight when size includes percentage', () => {
    // Arrange & Act
    const { container } = render(<UnitLevelBadge level={1} size="50%" />);

    // Assert
    const badge = container.querySelector('div');
    expect(badge).toHaveStyle({ minWidth: '12px', minHeight: '12px' });
  });

  it('should not set minWidth and minHeight when size is in pixels', () => {
    // Arrange & Act
    const { container } = render(<UnitLevelBadge level={1} size="24px" />);

    // Assert
    const badge = container.querySelector('div');
    expect(badge).not.toHaveStyle({ minWidth: '12px' });
  });

  it('should have aria-hidden attribute', () => {
    // Arrange & Act
    const { container } = render(<UnitLevelBadge level={5} />);

    // Assert
    const badge = container.querySelector('div');
    expect(badge).toHaveAttribute('aria-hidden', 'true');
  });

  it('should render level 1', () => {
    // Arrange & Act
    render(<UnitLevelBadge level={1} />);

    // Assert
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('should render level 10', () => {
    // Arrange & Act
    render(<UnitLevelBadge level={10} />);

    // Assert
    expect(screen.getByText('10')).toBeInTheDocument();
  });
});
