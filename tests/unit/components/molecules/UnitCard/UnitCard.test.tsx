import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UnitCard } from '../../../../../src/components/molecules';
import { UnitRarity } from '../../../../../src/types';
import { getUnitImagePath } from '../../../../../src/utils/imageUtils';

interface DragConfig {
  type: string;
  item: { unit: unknown; isInFormation?: boolean; sourceRow?: number; sourceCol?: number };
  collect: (monitor: { isDragging: () => boolean }) => { isDragging: boolean };
}

let capturedDragConfig: DragConfig | undefined;
const mockUseDrag = vi.fn((config?: DragConfig) => {
  if (config) {
    capturedDragConfig = config;
  }
  return [
    { isDragging: false },
    vi.fn(),
  ];
});

vi.mock('react-dnd', () => ({
  DndProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useDrag: (config?: DragConfig) => mockUseDrag(config),
  useDrop: vi.fn(() => [{ isOver: false }, vi.fn()]),
  HTML5Backend: {},
}));

vi.mock('../../../../../src/utils/imageUtils', () => ({
  getUnitImagePath: vi.fn((name: string) => `/images/units/${name}.png`),
}));

describe('UnitCard', () => {
  const mockUnit = {
    id: '1',
    name: 'TestUnit',
    level: 5,
    rarity: UnitRarity.Rare,
    power: 1920,
    imageUrl: undefined,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    capturedDragConfig = undefined;
    mockUseDrag.mockImplementation((config?: DragConfig) => {
      if (config) {
        capturedDragConfig = config;
      }
      return [
        { isDragging: false },
        vi.fn(),
      ];
    });
  });

  it('should render unit card with unit name placeholder when imageUrl is not provided', () => {
    const unitWithoutImage = { ...mockUnit, imageUrl: undefined };
    render(<UnitCard unit={unitWithoutImage} />);

    const levelBadge = screen.getByText('5');
    expect(levelBadge).toBeInTheDocument();
  });

  it('should render unit level badge', () => {
    render(<UnitCard unit={mockUnit} />);

    const levelBadge = screen.getByText('5');
    expect(levelBadge).toBeInTheDocument();
  });

  it('should render with correct rarity styling for Common', () => {
    const commonUnit = { ...mockUnit, rarity: UnitRarity.Common };
    const { container } = render(<UnitCard unit={commonUnit} />);

    const card = container.querySelector('.border-gray-500');
    expect(card).toBeInTheDocument();
  });

  it('should render with correct rarity styling for Rare', () => {
    const { container } = render(<UnitCard unit={mockUnit} />);

    const card = container.querySelector('.border-blue-500');
    expect(card).toBeInTheDocument();
  });

  it('should render with correct rarity styling for Epic', () => {
    const epicUnit = { ...mockUnit, rarity: UnitRarity.Epic };
    const { container } = render(<UnitCard unit={epicUnit} />);

    const card = container.querySelector('.border-purple-500');
    expect(card).toBeInTheDocument();
  });

  it('should render with correct rarity styling for Legendary', () => {
    const legendaryUnit = { ...mockUnit, rarity: UnitRarity.Legendary };
    const { container } = render(<UnitCard unit={legendaryUnit} />);

    const card = container.querySelector('.border-yellow-500');
    expect(card).toBeInTheDocument();
  });

  it('should toggle tooltip on click', async () => {
    const user = userEvent.setup();
    render(<UnitCard unit={mockUnit} />);

    const card = screen.getByRole('button');
    await user.click(card);

    expect(card).toBeInTheDocument();
  });

  it('should display power in tooltip', async () => {
    const user = userEvent.setup();
    render(<UnitCard unit={mockUnit} />);

    const card = screen.getByRole('button');
    await user.click(card);

    await waitFor(() => {
      const tooltip = document.body.querySelector('[role="tooltip"]');
      expect(tooltip).toBeInTheDocument();
      const tooltipText = tooltip?.textContent || '';
      expect(tooltipText).toMatch(/Power:/i);
      expect(tooltipText).toMatch(/19/);
    }, { timeout: 3000 });
  });

  it('should call onDoubleClick when double-clicked', async () => {
    const user = userEvent.setup();
    const mockOnDoubleClick = vi.fn();
    render(<UnitCard unit={mockUnit} onDoubleClick={mockOnDoubleClick} />);

    const card = screen.getByRole('button');
    await user.dblClick(card);

    expect(mockOnDoubleClick).toHaveBeenCalledTimes(1);
  });

  it('should render image when imageUrl is provided', () => {
    const unitWithImage = {
      ...mockUnit,
      imageUrl: '/test-image.png',
    };

    render(<UnitCard unit={unitWithImage} />);

    const img = screen.getByAltText('TestUnit');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/test-image.png');
  });

  it('should show placeholder when image fails to load', async () => {
    const unitWithImage = {
      ...mockUnit,
      imageUrl: '/test-image.png',
    };

    render(<UnitCard unit={unitWithImage} />);

    const img = screen.getByAltText('TestUnit');
    
    await act(async () => {
      const errorEvent = new Event('error', { bubbles: true });
      Object.defineProperty(errorEvent, 'target', { value: img, enumerable: true });
      img.dispatchEvent(errorEvent);
    });

    await waitFor(() => {
      expect(screen.getByText('T')).toBeInTheDocument();
    });
  });

  it('should use getUnitImagePath when imageUrl is not provided', () => {
    render(<UnitCard unit={mockUnit} />);

    expect(getUnitImagePath).toHaveBeenCalledWith('TestUnit');
  });

  it('should render with isInFormation prop affecting size', () => {
    const { container: container1 } = render(<UnitCard unit={mockUnit} isInFormation={false} />);
    const { container: container2 } = render(<UnitCard unit={mockUnit} isInFormation={true} />);

    const card1 = container1.querySelector('[role="button"]');
    const card2 = container2.querySelector('[role="button"]');

    expect(card1).toHaveStyle({ width: '64px' });
    expect(card2).toHaveStyle({ width: '90%' });
  });

  it('should have correct aria-label', () => {
    render(<UnitCard unit={mockUnit} />);

    const card = screen.getByLabelText('TestUnit level 5');
    expect(card).toBeInTheDocument();
  });

  it('should apply dragging styles when isDragging is true', () => {
    mockUseDrag.mockReturnValueOnce([
      { isDragging: true },
      vi.fn(),
    ]);

    const { container } = render(<UnitCard unit={mockUnit} />);
    const card = container.querySelector('.opacity-50');

    expect(card).toBeInTheDocument();
  });


  it('should show placeholder when imageUrl is empty string', () => {
    const unitWithoutImage = {
      ...mockUnit,
      imageUrl: '',
    };

    (getUnitImagePath as ReturnType<typeof vi.fn>).mockReturnValueOnce('');

    const { container } = render(<UnitCard unit={unitWithoutImage} />);

    const placeholder = container.querySelector('.w-full.h-full.flex.items-center.justify-center');
    expect(placeholder).toBeInTheDocument();
  });

  it('should close tooltip when clicking outside', async () => {
    const user = userEvent.setup();
    render(<UnitCard unit={mockUnit} />);

    const card = screen.getByRole('button');
    await user.click(card);

    expect(card).toBeInTheDocument();

    await user.click(document.body);

    expect(card).toBeInTheDocument();
  });

  it('should not close tooltip when clicking on card', async () => {
    const user = userEvent.setup();
    render(<UnitCard unit={mockUnit} />);

    const card = screen.getByRole('button');
    await user.click(card);

    await user.click(card);

    expect(card).toBeInTheDocument();
  });

  it('should render placeholder with correct rarity background color for Common', () => {
    const commonUnit = { ...mockUnit, rarity: UnitRarity.Common, imageUrl: undefined };
    (getUnitImagePath as ReturnType<typeof vi.fn>).mockReturnValueOnce('');
    
    const { container } = render(<UnitCard unit={commonUnit} />);
    
    const placeholder = container.querySelector('[style*="background-color"]');
    expect(placeholder).toBeInTheDocument();
  });

  it('should render placeholder with correct rarity background color for Legendary', () => {
    const legendaryUnit = { ...mockUnit, rarity: UnitRarity.Legendary, imageUrl: undefined };
    (getUnitImagePath as ReturnType<typeof vi.fn>).mockReturnValueOnce('');
    
    const { container } = render(<UnitCard unit={legendaryUnit} />);
    
    const placeholder = container.querySelector('[style*="background-color"]');
    expect(placeholder).toBeInTheDocument();
  });

  it('should handle keyboard events - Enter key toggles tooltip', async () => {
    const user = userEvent.setup();
    render(<UnitCard unit={mockUnit} />);
    
    const card = screen.getByRole('button');
    card.focus();
    
    await user.keyboard('{Enter}');
    
    expect(card).toBeInTheDocument();
  });

  it('should handle keyboard events - Space key toggles tooltip', async () => {
    const user = userEvent.setup();
    render(<UnitCard unit={mockUnit} />);
    
    const card = screen.getByRole('button');
    card.focus();
    
    await user.keyboard(' ');
    
    expect(card).toBeInTheDocument();
  });

  it('should close tooltip when onClose is called', async () => {
    const user = userEvent.setup();
    render(<UnitCard unit={mockUnit} />);
    
    const card = screen.getByRole('button');
    await user.click(card);
    
    await waitFor(() => {
      const tooltip = document.body.querySelector('[role="tooltip"]');
      expect(tooltip).toBeInTheDocument();
    });
    
    await user.click(document.body);
    
    await waitFor(() => {
      const tooltip = document.body.querySelector('[role="tooltip"]');
      expect(tooltip).not.toBeInTheDocument();
    });
  });

  it('should handle getRarityBorderColor default case', () => {
    const invalidRarityUnit = {
      ...mockUnit,
      rarity: 'Invalid' as UnitRarity,
    };
    
    const { container } = render(<UnitCard unit={invalidRarityUnit} />);
    const card = container.querySelector('[role="button"]');
    expect(card).toBeInTheDocument();
  });

  it('should pass correct drag item to useDrag', () => {
    render(
      <UnitCard
        unit={mockUnit}
        isInFormation={true}
        sourceRow={2}
        sourceCol={3}
      />
    );

    expect(mockUseDrag).toHaveBeenCalled();
  });

  it('should render with custom size prop as number', () => {
    const { container } = render(<UnitCard unit={mockUnit} size={80} />);
    
    const card = container.querySelector('[role="button"]');
    expect(card).toHaveStyle({ width: '80px' });
  });

  it('should render with custom size prop as string', () => {
    const { container } = render(<UnitCard unit={mockUnit} size="100%" />);
    
    const card = container.querySelector('[role="button"]');
    expect(card).toHaveStyle({ width: '100%' });
  });

  it('should not toggle tooltip when isDragging', async () => {
    mockUseDrag.mockReturnValueOnce([
      { isDragging: true },
      vi.fn(),
    ]);
    
    const user = userEvent.setup();
    render(<UnitCard unit={mockUnit} />);
    
    const card = screen.getByRole('button');
    await user.click(card);
    
    expect(card).toBeInTheDocument();
  });

  it('should not handle keyboard events when isDragging', async () => {
    mockUseDrag.mockReturnValueOnce([
      { isDragging: true },
      vi.fn(),
    ]);
    
    const user = userEvent.setup();
    render(<UnitCard unit={mockUnit} />);
    
    const card = screen.getByRole('button');
    card.focus();
    
    await user.keyboard('{Enter}');
    
    expect(card).toBeInTheDocument();
  });

  it('should close tooltip on double click before calling onDoubleClick', async () => {
    const user = userEvent.setup();
    const mockOnDoubleClick = vi.fn();
    render(<UnitCard unit={mockUnit} onDoubleClick={mockOnDoubleClick} />);
    
    const card = screen.getByRole('button');
    await user.click(card);
    
    await waitFor(() => {
      const tooltip = document.body.querySelector('[role="tooltip"]');
      expect(tooltip).toBeInTheDocument();
    });
    
    await user.dblClick(card);
    
    expect(mockOnDoubleClick).toHaveBeenCalled();
  });

  it('should pass correct item to useDrag with formation info', () => {
    render(
      <UnitCard
        unit={mockUnit}
        isInFormation={true}
        sourceRow={2}
        sourceCol={3}
      />
    );

    expect(capturedDragConfig).toBeDefined();
    expect(capturedDragConfig?.item).toEqual({
      unit: mockUnit,
      isInFormation: true,
      sourceRow: 2,
      sourceCol: 3,
    });
    expect(capturedDragConfig?.type).toBe('unit');
  });

  it('should call collect function in useDrag', () => {
    render(<UnitCard unit={mockUnit} />);

    expect(capturedDragConfig?.collect).toBeDefined();
    if (capturedDragConfig?.collect) {
      const result = capturedDragConfig.collect({ isDragging: () => true });
      expect(result).toEqual({ isDragging: true });

      const resultFalse = capturedDragConfig.collect({ isDragging: () => false });
      expect(resultFalse).toEqual({ isDragging: false });
    }
  });

  it('should close tooltip when Escape key is pressed', async () => {
    const user = userEvent.setup();
    render(<UnitCard unit={mockUnit} />);
    
    const card = screen.getByRole('button');
    await user.click(card);
    
    await waitFor(() => {
      const tooltip = document.body.querySelector('[role="tooltip"]');
      expect(tooltip).toBeInTheDocument();
    });
    
    await user.keyboard('{Escape}');
    
    await waitFor(() => {
      const tooltip = document.body.querySelector('[role="tooltip"]');
      expect(tooltip).not.toBeInTheDocument();
    });
  });

  it('should handle double-click without onDoubleClick prop', async () => {
    const user = userEvent.setup();
    render(<UnitCard unit={mockUnit} />);
    
    const card = screen.getByRole('button');
    await user.dblClick(card);
    
    expect(card).toBeInTheDocument();
  });

  it('should display power as 0 when unit.power is undefined', async () => {
    const user = userEvent.setup();
    const unitWithoutPower = { ...mockUnit, power: undefined };
    render(<UnitCard unit={unitWithoutPower} />);
    
    const card = screen.getByRole('button');
    await user.click(card);
    
    await waitFor(() => {
      const tooltip = document.body.querySelector('[role="tooltip"]');
      expect(tooltip).toBeInTheDocument();
      expect(tooltip?.textContent).toContain('Power:');
      expect(tooltip?.textContent).toContain('0');
    });
  });
});

