import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UnitCardActions from '../../../../../src/components/molecules/UnitCardActions/UnitCardActions';
import { UnitRarity } from '../../../../../src/types';

vi.mock('../../../../../src/components/molecules/UnitEditPopover/UnitEditPopover', () => ({
  default: ({ onEdit }: { onEdit: () => void }) => (
    <button onClick={onEdit} data-testid="edit-popover-mock">Edit Popover</button>
  ),
}));

describe('UnitCardActions', () => {
  const createMockUnit = (overrides = {}) => ({
    id: 'test-id',
    name: 'TestUnit',
    level: 5,
    rarity: UnitRarity.Rare,
    power: 12500,
    ...overrides,
  });

  const mockOnDoubleClick = vi.fn();
  const mockOnEdit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return null when not hovered', () => {
    // Arrange
    const unit = createMockUnit();

    // Act
    const { container } = render(
      <UnitCardActions
        isInFormation={true}
        isHovered={false}
        onDoubleClick={mockOnDoubleClick}
        unit={unit}
      />
    );

    // Assert
    expect(container.firstChild).toBeNull();
  });

  it('should render remove button when in formation and hovered', () => {
    // Arrange
    const unit = createMockUnit();

    // Act
    render(
      <UnitCardActions
        isInFormation={true}
        isHovered={true}
        onDoubleClick={mockOnDoubleClick}
        unit={unit}
      />
    );

    // Assert
    expect(screen.getByLabelText('Remove from formation')).toBeInTheDocument();
  });

  it('should call onDoubleClick when remove button is clicked', async () => {
    // Arrange
    const user = userEvent.setup();
    const unit = createMockUnit();

    // Act
    render(
      <UnitCardActions
        isInFormation={true}
        isHovered={true}
        onDoubleClick={mockOnDoubleClick}
        unit={unit}
      />
    );

    await user.click(screen.getByLabelText('Remove from formation'));

    // Assert
    expect(mockOnDoubleClick).toHaveBeenCalledTimes(1);
  });

  it('should render drag button when not in formation and hovered', () => {
    // Arrange
    const unit = createMockUnit();

    // Act
    render(
      <UnitCardActions
        isInFormation={false}
        isHovered={true}
        onDoubleClick={mockOnDoubleClick}
        unit={unit}
      />
    );

    // Assert
    expect(screen.getByLabelText('Drag to place in formation')).toBeInTheDocument();
  });

  it('should not render remove button when not in formation', () => {
    // Arrange
    const unit = createMockUnit();

    // Act
    render(
      <UnitCardActions
        isInFormation={false}
        isHovered={true}
        onDoubleClick={mockOnDoubleClick}
        unit={unit}
      />
    );

    // Assert
    expect(screen.queryByLabelText('Remove from formation')).not.toBeInTheDocument();
  });

  it('should not render drag button when in formation', () => {
    // Arrange
    const unit = createMockUnit();

    // Act
    render(
      <UnitCardActions
        isInFormation={true}
        isHovered={true}
        onDoubleClick={mockOnDoubleClick}
        unit={unit}
      />
    );

    // Assert
    expect(screen.queryByLabelText('Drag to place in formation')).not.toBeInTheDocument();
  });

  it('should render edit popover when onEdit is provided and in formation', () => {
    // Arrange
    const unit = createMockUnit();

    // Act
    render(
      <UnitCardActions
        isInFormation={true}
        isHovered={true}
        onDoubleClick={mockOnDoubleClick}
        onEdit={mockOnEdit}
        unit={unit}
      />
    );

    // Assert
    expect(screen.getByTestId('edit-popover-mock')).toBeInTheDocument();
  });

  it('should render edit popover when onEdit is provided and not in formation', () => {
    // Arrange
    const unit = createMockUnit();

    // Act
    render(
      <UnitCardActions
        isInFormation={false}
        isHovered={true}
        onDoubleClick={mockOnDoubleClick}
        onEdit={mockOnEdit}
        unit={unit}
      />
    );

    // Assert
    expect(screen.getByTestId('edit-popover-mock')).toBeInTheDocument();
  });

  it('should not render edit popover when onEdit is not provided', () => {
    // Arrange
    const unit = createMockUnit();

    // Act
    render(
      <UnitCardActions
        isInFormation={true}
        isHovered={true}
        onDoubleClick={mockOnDoubleClick}
        unit={unit}
      />
    );

    // Assert
    expect(screen.queryByTestId('edit-popover-mock')).not.toBeInTheDocument();
  });

  it('should have overlay styling', () => {
    // Arrange
    const unit = createMockUnit();

    // Act
    const { container } = render(
      <UnitCardActions
        isInFormation={true}
        isHovered={true}
        onDoubleClick={mockOnDoubleClick}
        unit={unit}
      />
    );

    // Assert
    const overlay = container.firstChild as HTMLElement;
    expect(overlay).toHaveClass('absolute', 'inset-0', 'bg-black/60');
  });
});
