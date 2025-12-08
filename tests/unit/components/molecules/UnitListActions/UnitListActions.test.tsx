import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UnitListActions } from '../../../../../src/components/molecules';

describe('UnitListActions', () => {
  const mockOnManageUnits = vi.fn();
  const mockOnWithdrawAll = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render Manage Units button', () => {
    // Arrange & Act
    render(
      <UnitListActions
        onManageUnits={mockOnManageUnits}
        onWithdrawAll={mockOnWithdrawAll}
      />
    );

    // Assert
    expect(screen.getByRole('button', { name: /manage/i })).toBeInTheDocument();
  });

  it('should render Withdraw All button', () => {
    // Arrange & Act
    render(
      <UnitListActions
        onManageUnits={mockOnManageUnits}
        onWithdrawAll={mockOnWithdrawAll}
      />
    );

    // Assert
    expect(screen.getByRole('button', { name: /withdraw/i })).toBeInTheDocument();
  });

  it('should call onManageUnits when Manage Units button is clicked', async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <UnitListActions
        onManageUnits={mockOnManageUnits}
        onWithdrawAll={mockOnWithdrawAll}
      />
    );

    // Act
    const manageButton = screen.getByRole('button', { name: /manage/i });
    await user.click(manageButton);

    // Assert
    expect(mockOnManageUnits).toHaveBeenCalledTimes(1);
  });

  it('should call onWithdrawAll when Withdraw All button is clicked', async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <UnitListActions
        onManageUnits={mockOnManageUnits}
        onWithdrawAll={mockOnWithdrawAll}
      />
    );

    // Act
    const withdrawButton = screen.getByRole('button', { name: /withdraw/i });
    await user.click(withdrawButton);

    // Assert
    expect(mockOnWithdrawAll).toHaveBeenCalledTimes(1);
  });

  it('should render both desktop and mobile text variants', () => {
    // Arrange & Act
    render(
      <UnitListActions
        onManageUnits={mockOnManageUnits}
        onWithdrawAll={mockOnWithdrawAll}
      />
    );

    // Assert - both visible (CSS handles responsive display)
    expect(screen.getByText('Manage Units')).toBeInTheDocument();
    expect(screen.getByText('Manage')).toBeInTheDocument();
    expect(screen.getByText('Withdraw All')).toBeInTheDocument();
    expect(screen.getByText('Withdraw')).toBeInTheDocument();
  });
});
