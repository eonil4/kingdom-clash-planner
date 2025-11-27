import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormationFooter } from '../../../../../src/components/organisms';

describe('FormationFooter', () => {
  it('should render footer element', () => {
    const { container } = render(<FormationFooter />);

    const footer = container.querySelector('footer');
    expect(footer).toBeInTheDocument();
  });

  it('should display application tagline', () => {
    render(<FormationFooter />);

    expect(screen.getByText('Kingdom Clash Planner - Plan your formations strategically')).toBeInTheDocument();
  });

  it('should have correct styling classes', () => {
    const { container } = render(<FormationFooter />);

    const footer = container.querySelector('footer');
    expect(footer).toHaveClass('w-full', 'p-4', 'bg-gray-800', 'text-center');
  });

  it('should render text with gray color', () => {
    render(<FormationFooter />);

    const text = screen.getByText('Kingdom Clash Planner - Plan your formations strategically');
    expect(text).toHaveClass('text-gray-400');
  });
});

