import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UnitEditPopover from '../../../../../src/components/molecules/UnitEditPopover/UnitEditPopover';
import { UnitRarity } from '../../../../../src/types';

vi.mock('../../../../../src/components/atoms', () => ({
  UnitImage: ({ name }: { name: string }) => (
    <div data-testid="unit-image-mock">{name}</div>
  ),
}));

describe('UnitEditPopover', () => {
  const createMockUnit = (overrides = {}) => ({
    id: 'test-id',
    name: 'Archers',
    level: 5,
    rarity: UnitRarity.Rare,
    power: 12500,
    imageUrl: '/images/units/archers.png',
    ...overrides,
  });

  const mockOnEdit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render edit button', () => {
    // Arrange
    const unit = createMockUnit();

    // Act
    render(<UnitEditPopover unit={unit} onEdit={mockOnEdit} />);

    // Assert
    expect(screen.getByLabelText('Edit unit')).toBeInTheDocument();
  });

  it('should open popover when edit button is clicked', async () => {
    // Arrange
    const user = userEvent.setup();
    const unit = createMockUnit();

    // Act
    render(<UnitEditPopover unit={unit} onEdit={mockOnEdit} />);
    await user.click(screen.getByLabelText('Edit unit'));

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Edit Unit')).toBeInTheDocument();
    });
  });

  it('should display unit type select with current unit name', async () => {
    // Arrange
    const user = userEvent.setup();
    const unit = createMockUnit({ name: 'Archers' });

    // Act
    render(<UnitEditPopover unit={unit} onEdit={mockOnEdit} />);
    await user.click(screen.getByLabelText('Edit unit'));

    // Assert
    await waitFor(() => {
      expect(screen.getAllByText('Unit Type').length).toBeGreaterThan(0);
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });

  it('should display level slider with current level', async () => {
    // Arrange
    const user = userEvent.setup();
    const unit = createMockUnit({ level: 7 });

    // Act
    render(<UnitEditPopover unit={unit} onEdit={mockOnEdit} />);
    await user.click(screen.getByLabelText('Edit unit'));

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/Level:/)).toBeInTheDocument();
      expect(screen.getByText('7')).toBeInTheDocument();
    });
  });

  it('should display preview with unit image', async () => {
    // Arrange
    const user = userEvent.setup();
    const unit = createMockUnit({ name: 'Infantry' });

    // Act
    render(<UnitEditPopover unit={unit} onEdit={mockOnEdit} />);
    await user.click(screen.getByLabelText('Edit unit'));

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId('unit-image-mock')).toBeInTheDocument();
    });
  });

  it('should close popover when cancel button is clicked', async () => {
    // Arrange
    const user = userEvent.setup();
    const unit = createMockUnit();

    // Act
    render(<UnitEditPopover unit={unit} onEdit={mockOnEdit} />);
    await user.click(screen.getByLabelText('Edit unit'));

    await waitFor(() => {
      expect(screen.getByText('Edit Unit')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    // Assert
    await waitFor(() => {
      expect(screen.queryByText('Edit Unit')).not.toBeInTheDocument();
    });
  });

  it('should call onEdit with updated unit when save button is clicked', async () => {
    // Arrange
    const user = userEvent.setup();
    const unit = createMockUnit({ name: 'Archers', level: 5 });

    // Act
    render(<UnitEditPopover unit={unit} onEdit={mockOnEdit} />);
    await user.click(screen.getByLabelText('Edit unit'));

    await waitFor(() => {
      expect(screen.getByText('Edit Unit')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Save' }));

    // Assert
    expect(mockOnEdit).toHaveBeenCalledTimes(1);
    expect(mockOnEdit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Archers',
        level: 5,
      })
    );
  });

  it('should close popover after saving', async () => {
    // Arrange
    const user = userEvent.setup();
    const unit = createMockUnit();

    // Act
    render(<UnitEditPopover unit={unit} onEdit={mockOnEdit} />);
    await user.click(screen.getByLabelText('Edit unit'));

    await waitFor(() => {
      expect(screen.getByText('Edit Unit')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Save' }));

    // Assert
    await waitFor(() => {
      expect(screen.queryByText('Edit Unit')).not.toBeInTheDocument();
    });
  });

  it('should update unit power based on rarity and level when saving', async () => {
    // Arrange
    const user = userEvent.setup();
    const unit = createMockUnit({ name: 'Archers', level: 5, rarity: UnitRarity.Rare });

    // Act
    render(<UnitEditPopover unit={unit} onEdit={mockOnEdit} />);
    await user.click(screen.getByLabelText('Edit unit'));

    await waitFor(() => {
      expect(screen.getByText('Edit Unit')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Save' }));

    // Assert
    expect(mockOnEdit).toHaveBeenCalledWith(
      expect.objectContaining({
        power: expect.any(Number),
      })
    );
  });

  it('should update imageUrl when saving', async () => {
    // Arrange
    const user = userEvent.setup();
    const unit = createMockUnit({ name: 'Archers' });

    // Act
    render(<UnitEditPopover unit={unit} onEdit={mockOnEdit} />);
    await user.click(screen.getByLabelText('Edit unit'));

    await waitFor(() => {
      expect(screen.getByText('Edit Unit')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Save' }));

    // Assert
    expect(mockOnEdit).toHaveBeenCalledWith(
      expect.objectContaining({
        imageUrl: expect.stringContaining('archers'),
      })
    );
  });

  it('should reset form values when reopening popover', async () => {
    // Arrange
    const user = userEvent.setup();
    const unit = createMockUnit({ name: 'Archers', level: 3 });

    // Act
    render(<UnitEditPopover unit={unit} onEdit={mockOnEdit} />);

    await user.click(screen.getByLabelText('Edit unit'));
    await waitFor(() => {
      expect(screen.getByText('Edit Unit')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => {
      expect(screen.queryByText('Edit Unit')).not.toBeInTheDocument();
    });

    await user.click(screen.getByLabelText('Edit unit'));

    // Assert
    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  it('should display unit name in preview', async () => {
    // Arrange
    const user = userEvent.setup();
    const unit = createMockUnit({ name: 'Archers' });

    // Act
    render(<UnitEditPopover unit={unit} onEdit={mockOnEdit} />);
    await user.click(screen.getByLabelText('Edit unit'));

    // Assert
    await waitFor(() => {
      const previews = screen.getAllByText('Archers');
      expect(previews.length).toBeGreaterThan(0);
    });
  });

  it('should display level and power in preview', async () => {
    // Arrange
    const user = userEvent.setup();
    const unit = createMockUnit({ level: 5 });

    // Act
    render(<UnitEditPopover unit={unit} onEdit={mockOnEdit} />);
    await user.click(screen.getByLabelText('Edit unit'));

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/Lv\.5/)).toBeInTheDocument();
      expect(screen.getByText(/power/)).toBeInTheDocument();
    });
  });

  it('should have slider with min 1 and max 10', async () => {
    // Arrange
    const user = userEvent.setup();
    const unit = createMockUnit();

    // Act
    render(<UnitEditPopover unit={unit} onEdit={mockOnEdit} />);
    await user.click(screen.getByLabelText('Edit unit'));

    // Assert
    await waitFor(() => {
      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-valuemin', '1');
      expect(slider).toHaveAttribute('aria-valuemax', '10');
    });
  });

  it('should stop propagation when edit button is clicked', async () => {
    // Arrange
    const user = userEvent.setup();
    const unit = createMockUnit();
    const parentClickHandler = vi.fn();

    // Act
    render(
      <div 
        onClick={parentClickHandler}
        onKeyDown={parentClickHandler}
        role="button"
        tabIndex={0}
      >
        <UnitEditPopover unit={unit} onEdit={mockOnEdit} />
      </div>
    );
    await user.click(screen.getByLabelText('Edit unit'));

    // Assert
    expect(parentClickHandler).not.toHaveBeenCalled();
  });

  it('should change unit name when selecting a different unit type', async () => {
    // Arrange
    const user = userEvent.setup();
    const unit = createMockUnit({ name: 'Archers' });

    // Act
    render(<UnitEditPopover unit={unit} onEdit={mockOnEdit} />);
    await user.click(screen.getByLabelText('Edit unit'));

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('combobox'));
    
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    const infantryOption = screen.getByRole('option', { name: 'Infantry' });
    await user.click(infantryOption);

    await user.click(screen.getByRole('button', { name: 'Save' }));

    // Assert
    expect(mockOnEdit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Infantry',
      })
    );
  });

  it('should change level when adjusting slider', async () => {
    // Arrange
    const user = userEvent.setup();
    const unit = createMockUnit({ level: 5 });

    // Act
    render(<UnitEditPopover unit={unit} onEdit={mockOnEdit} />);
    await user.click(screen.getByLabelText('Edit unit'));

    await waitFor(() => {
      expect(screen.getByRole('slider')).toBeInTheDocument();
    });

    const slider = screen.getByRole('slider');
    
    slider.focus();
    await user.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}');

    await user.click(screen.getByRole('button', { name: 'Save' }));

    // Assert
    expect(mockOnEdit).toHaveBeenCalledWith(
      expect.objectContaining({
        level: expect.any(Number),
      })
    );
    const calledWith = mockOnEdit.mock.calls[0][0];
    expect(calledWith.level).toBeGreaterThan(5);
  });

  it('should use unit rarity when unit data is not found', async () => {
    // Arrange
    const user = userEvent.setup();
    const unit = createMockUnit({ 
      name: 'UnknownUnit', 
      rarity: UnitRarity.Epic 
    });

    // Act
    render(<UnitEditPopover unit={unit} onEdit={mockOnEdit} />);
    await user.click(screen.getByLabelText('Edit unit'));

    await waitFor(() => {
      expect(screen.getByText('Edit Unit')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Save' }));

    // Assert
    expect(mockOnEdit).toHaveBeenCalledWith(
      expect.objectContaining({
        rarity: UnitRarity.Epic,
      })
    );
  });
});
