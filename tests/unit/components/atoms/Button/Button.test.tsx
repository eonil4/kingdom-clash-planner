import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../../../../../src/components/atoms';

describe('Button', () => {
  it('should render button with text', () => {
    // Arrange & Act
    render(<Button>Click me</Button>);

    // Assert
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('should call onClick when clicked', async () => {
    // Arrange
    const mockOnClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={mockOnClick}>Click me</Button>);

    // Act
    await user.click(screen.getByRole('button'));

    // Assert
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('should pass variant prop to MUI Button', () => {
    // Arrange & Act
    render(<Button variant="contained">Contained</Button>);

    // Assert
    const button = screen.getByRole('button');
    expect(button).toHaveClass('MuiButton-contained');
  });

  it('should be disabled when disabled prop is true', () => {
    // Arrange & Act
    render(<Button disabled>Disabled</Button>);

    // Assert
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
