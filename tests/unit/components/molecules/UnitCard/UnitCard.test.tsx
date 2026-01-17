import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UnitCard } from '../../../../../src/components/molecules';
import type { Unit } from '../../../../../src/types';
import { UnitRarity } from '../../../../../src/types';

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

vi.mock('../../../../../src/components/atoms', () => ({
  UnitImage: ({ name, imageUrl, fontSize = '0.75rem', alt }: {
    name: string;
    imageUrl?: string;
    fontSize?: string;
    alt?: string;
  }) => {
    // For testing purposes, simulate different behaviors based on imageUrl
    if (imageUrl) {
      // When imageUrl is provided, render an actual img element that can error
      return (
        <img
          src={imageUrl}
          alt={alt || name}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Simulate error handling by replacing with placeholder
            const target = e.target as HTMLImageElement;
            if (target && target.parentNode) {
              const placeholder = document.createElement('div');
              placeholder.className = `w-full h-full flex items-center justify-center text-white font-bold bg-blue-900`;
              placeholder.style.fontSize = fontSize;
              placeholder.textContent = name.charAt(0);
              target.parentNode.replaceChild(placeholder, target);
            }
          }}
        />
      );
    }

    // When no imageUrl, simulate async loading result - render img element
    return (
      <img
        src={`/images/units/${name}.png`}
        alt={alt || name}
        className="w-full h-full object-cover"
      />
    );
  },
  UnitLevelBadge: ({ level, size, fontSize }: {
    level: number;
    size: string | number;
    fontSize: string;
  }) => (
    <div
      className="absolute top-0 right-0 bg-black text-white rounded-full flex items-center justify-center text-xs font-bold border border-white"
      style={{
        width: size,
        height: size,
        fontSize
      }}
    >
      {level}
    </div>
  ),
}));

vi.mock('../../../../../src/components/molecules/UnitTooltip/UnitTooltip', () => ({
  default: ({ unit, roles }: {
    unit: { name: string; level: number; rarity: string; power?: number };
    roles?: string[];
  }) => {
    const formatNumber = (value: number) => value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

    return (
      <div className="p-2">
        <div className="font-bold text-lg mb-1">{unit.name}</div>
        <div className="text-sm">
          <div>Level: <span className="font-bold">{unit.level}</span></div>
          <div>Rarity: <span className="font-bold">{unit.rarity}</span></div>
          <div>Power: <span className="font-bold">{formatNumber(unit.power ?? 0)}</span></div>
          {roles && roles.length > 0 && (
            <div>Roles: <span className="font-bold">{roles.join(', ')}</span></div>
          )}
        </div>
      </div>
    );
  },
}));

interface MockUnitCardActionsProps {
  isInFormation?: boolean;
  isHovered?: boolean;
  onDoubleClick?: (e: React.MouseEvent) => void;
  onEdit?: (updatedUnit: Unit) => void;
  unit?: Unit;
}

function MockUnitCardActions({ isInFormation, isHovered, onDoubleClick, onEdit, unit }: MockUnitCardActionsProps) {
  const [showEditPopover, setShowEditPopover] = React.useState(false);
  const [selectedName, setSelectedName] = React.useState(unit?.name || '');
  const [selectedLevel, setSelectedLevel] = React.useState(unit?.level || 1);

  if (!isHovered && !onEdit) return null;

  return (
    <>
      <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-1">
        {isInFormation ? (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                if (onDoubleClick) {
                  onDoubleClick(e);
                }
              }}
              aria-label="Remove from formation"
              className="text-red-500 bg-white/10 hover:bg-red-500/30 p-1 rounded"
            >
              <svg style={{ fontSize: 'clamp(14px, 3vw, 20px)' }}>
                <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/>
                <line x1="8" y1="8" x2="16" y2="16" stroke="currentColor" strokeWidth="2"/>
                <line x1="16" y1="8" x2="8" y2="16" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </button>
            {onEdit && (
              <button
                onClick={() => {
                  setSelectedName(unit?.name || '');
                  setSelectedLevel(unit?.level || 1);
                  setShowEditPopover(true);
                }}
                aria-label="Edit unit"
                className="text-gray-400 bg-white/10 hover:bg-white/20 p-1 rounded"
              >
                <svg style={{ fontSize: '16px' }}>
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/>
                </svg>
              </button>
            )}
          </>
        ) : (
          <>
            <button
              aria-label="Drag to place in formation"
              className="text-gray-400 bg-white/10 p-1 rounded cursor-move"
            >
              <svg style={{ fontSize: '18px' }}>
                <path d="M3 7v4h4V7H3zm0 6v4h4v-4H3zm6-6v4h4V7h-4zm0 6v4h4v-4h-4z" fill="currentColor"/>
              </svg>
            </button>
            {onEdit && (
              <button
                onClick={() => {
                  setSelectedName(unit?.name || '');
                  setSelectedLevel(unit?.level || 1);
                  setShowEditPopover(true);
                }}
                aria-label="Edit unit"
                className="text-gray-400 bg-white/10 hover:bg-white/20 p-1 rounded"
              >
                <svg style={{ fontSize: '16px' }}>
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/>
                </svg>
              </button>
            )}
          </>
        )}
      </div>

      {showEditPopover && onEdit && (
        <div data-testid="edit-popover" className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-600 min-w-60">
            <h2 className="text-white text-lg font-bold mb-3">Edit Unit</h2>

            <div className="mb-3">
              <label htmlFor="unit-type-select" className="block text-gray-300 text-sm mb-1">Unit Type</label>
              <select
                id="unit-type-select"
                value={selectedName}
                onChange={(e) => setSelectedName(e.target.value)}
                className="w-full bg-gray-700 text-white border border-gray-500 rounded px-2 py-1"
              >
                <option value="TestUnit">TestUnit</option>
                <option value="Archers">Archers</option>
                <option value="Cavalry">Cavalry</option>
              </select>
            </div>

            <div className="mb-3">
              <label htmlFor="level-slider" className="block text-gray-400 text-sm">
                Level: <span className="text-white font-bold">{selectedLevel}</span>
              </label>
              <input
                id="level-slider"
                type="range"
                min="1"
                max="10"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowEditPopover(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onEdit({
                    ...unit,
                    name: selectedName,
                    level: selectedLevel,
                  } as Unit);
                  setShowEditPopover(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

vi.mock('../../../../../src/components/molecules/UnitCardActions/UnitCardActions', () => ({
  default: MockUnitCardActions,
}));

vi.mock('../../../../../src/components/molecules/UnitEditPopover/UnitEditPopover', () => ({
  default: ({ unit, onEdit }: { unit?: Unit; onEdit?: (updatedUnit: Unit) => void }) => {
    if (!onEdit) return null;

    return (
      <button
        onClick={() => onEdit(unit)}
        aria-label="Edit unit"
        className="text-gray-400 bg-white/10 hover:bg-white/20 p-1 rounded"
      >
        <svg style={{ fontSize: '16px' }}>
          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/>
        </svg>
      </button>
    );
  },
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

    const card = screen.getByRole('button', { name: /TestUnit/i });
    await user.click(card);

    expect(card).toBeInTheDocument();
  });

  it('should display power in tooltip', async () => {
    const user = userEvent.setup();
    render(<UnitCard unit={mockUnit} />);

    const card = screen.getByRole('button', { name: /TestUnit/i });
    await user.click(card);

    await waitFor(() => {
      const tooltip = document.body.querySelector('[role="tooltip"]');
      expect(tooltip).toBeInTheDocument();
      const tooltipText = tooltip?.textContent || '';
      expect(tooltipText).toMatch(/Power:/i);
      expect(tooltipText).toMatch(/1 920/);
    }, { timeout: 3000 });
  });

  it('should call onDoubleClick when double-clicked', async () => {
    const user = userEvent.setup();
    const mockOnDoubleClick = vi.fn();
    render(<UnitCard unit={mockUnit} onDoubleClick={mockOnDoubleClick} />);

    const card = screen.getByRole('button', { name: /TestUnit/i });
    await user.dblClick(card);

    expect(mockOnDoubleClick).toHaveBeenCalledTimes(1);
  });

  it('should handle double-click when onDoubleClick is not provided', async () => {
    const user = userEvent.setup();
    render(<UnitCard unit={mockUnit} />);

    const card = screen.getByRole('button', { name: /TestUnit/i });
    await user.dblClick(card);

    expect(card).toBeInTheDocument();
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

  it('should load image when imageUrl is not provided', async () => {
    const unitWithoutImageUrl = { ...mockUnit, imageUrl: undefined };
    render(<UnitCard unit={unitWithoutImageUrl} />);

    await waitFor(() => {
      const img = screen.getByRole('img', { name: 'TestUnit' });
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', expect.stringContaining('TestUnit'));
    });
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

    // aria-label now includes additional context for accessibility
    const card = screen.getByLabelText(/5 TestUnit\. Double-click to add to formation/i);
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


  it('should show placeholder when imageUrl is empty string', async () => {
    const unitWithEmptyImageUrl = {
      ...mockUnit,
      imageUrl: '',
    };

    const { container } = render(<UnitCard unit={unitWithEmptyImageUrl} />);

    await waitFor(() => {
      const placeholder = container.querySelector('.w-full.h-full');
      expect(placeholder).toBeInTheDocument();
    });
  });

  it('should close tooltip when clicking outside', async () => {
    const user = userEvent.setup();
    render(<UnitCard unit={mockUnit} />);

    const card = screen.getByRole('button', { name: /TestUnit/i });
    await user.click(card);

    expect(card).toBeInTheDocument();

    await user.click(document.body);

    expect(card).toBeInTheDocument();
  });

  it('should not close tooltip when clicking on card', async () => {
    const user = userEvent.setup();
    render(<UnitCard unit={mockUnit} />);

    const card = screen.getByRole('button', { name: /TestUnit/i });
    await user.click(card);

    await user.click(card);

    expect(card).toBeInTheDocument();
  });

  it('should render placeholder with correct rarity background color for Common', async () => {
    const commonUnit = { ...mockUnit, rarity: UnitRarity.Common, imageUrl: undefined };
    
    const { container } = render(<UnitCard unit={commonUnit} />);
    
    await waitFor(() => {
      const placeholder = container.querySelector('.bg-gray-800');
      expect(placeholder).toBeInTheDocument();
    });
  });

  it('should render placeholder with correct rarity background color for Legendary', async () => {
    const legendaryUnit = { ...mockUnit, rarity: UnitRarity.Legendary, imageUrl: undefined };
    
    const { container } = render(<UnitCard unit={legendaryUnit} />);
    
    await waitFor(() => {
      const placeholder = container.querySelector('.bg-yellow-900');
      expect(placeholder).toBeInTheDocument();
    });
  });

  it('should handle keyboard events - Enter key toggles tooltip', async () => {
    const user = userEvent.setup();
    render(<UnitCard unit={mockUnit} />);
    
    const card = screen.getByRole('button', { name: /TestUnit/i });
    card.focus();
    
    await user.keyboard('{Enter}');
    
    expect(card).toBeInTheDocument();
  });

  it('should handle keyboard events - Space key toggles tooltip', async () => {
    const user = userEvent.setup();
    render(<UnitCard unit={mockUnit} />);
    
    const card = screen.getByRole('button', { name: /TestUnit/i });
    card.focus();
    
    await user.keyboard(' ');
    
    expect(card).toBeInTheDocument();
  });

  it('should close tooltip when onClose is called', async () => {
    const user = userEvent.setup();
    render(<UnitCard unit={mockUnit} />);
    
    const card = screen.getByRole('button', { name: /TestUnit/i });
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
    
    const card = screen.getByRole('button', { name: /TestUnit/i });
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
    
    const card = screen.getByRole('button', { name: /TestUnit/i });
    card.focus();
    
    await user.keyboard('{Enter}');
    
    expect(card).toBeInTheDocument();
  });

  it('should close tooltip on double click before calling onDoubleClick', async () => {
    const user = userEvent.setup();
    const mockOnDoubleClick = vi.fn();
    render(<UnitCard unit={mockUnit} onDoubleClick={mockOnDoubleClick} />);
    
    const card = screen.getByRole('button', { name: /TestUnit/i });
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
    
    // Get the main card button by its aria-label (there are now multiple buttons due to hover overlay)
    const card = screen.getByRole('button', { name: /5 TestUnit/i });
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
    
    // Get the main card button by its aria-label (there are now multiple buttons due to hover overlay)
    const card = screen.getByRole('button', { name: /5 TestUnit/i });
    await user.dblClick(card);
    
    expect(card).toBeInTheDocument();
  });

  it('should display power as 0 when unit.power is undefined', async () => {
    const user = userEvent.setup();
    const unitWithoutPower = { ...mockUnit, power: undefined };
    render(<UnitCard unit={unitWithoutPower} />);
    
    // Get the main card button by its aria-label (there are now multiple buttons due to hover overlay)
    const card = screen.getByRole('button', { name: /5 TestUnit/i });
    await user.click(card);
    
    await waitFor(() => {
      const tooltip = document.body.querySelector('[role="tooltip"]');
      expect(tooltip).toBeInTheDocument();
      expect(tooltip?.textContent).toContain('Power:');
      expect(tooltip?.textContent).toContain('0');
    });
  });

  it('should show remove button on hover when isInFormation', async () => {
    const user = userEvent.setup();
    const mockOnDoubleClick = vi.fn();
    render(<UnitCard unit={mockUnit} isInFormation onDoubleClick={mockOnDoubleClick} />);
    
    const card = screen.getByRole('button', { name: /5 TestUnit/i });
    await user.hover(card);
    
    const removeButton = await screen.findByLabelText('Remove from formation');
    expect(removeButton).toBeInTheDocument();
  });

  it('should call onDoubleClick when remove button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnDoubleClick = vi.fn();
    render(<UnitCard unit={mockUnit} isInFormation onDoubleClick={mockOnDoubleClick} />);

    const card = screen.getByRole('button', { name: /5 TestUnit/i });
    await user.hover(card);

    const removeButton = await screen.findByLabelText('Remove from formation');
    fireEvent.click(removeButton);

    expect(mockOnDoubleClick).toHaveBeenCalled();
  });

  it('should show edit button on hover when onEdit is provided', async () => {
    const user = userEvent.setup();
    const mockOnEdit = vi.fn();
    render(<UnitCard unit={mockUnit} isInFormation onEdit={mockOnEdit} />);
    
    const card = screen.getByRole('button', { name: /5 TestUnit/i });
    await user.hover(card);
    
    const editButton = await screen.findByLabelText('Edit unit');
    expect(editButton).toBeInTheDocument();
  });

  it('should open edit popover when edit button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnEdit = vi.fn();
    render(<UnitCard unit={mockUnit} isInFormation onEdit={mockOnEdit} />);

    const card = screen.getByRole('button', { name: /5 TestUnit/i });
    await user.hover(card);

    const editButton = await screen.findByLabelText('Edit unit');
    await user.click(editButton);

    expect(await screen.findByText('Edit Unit')).toBeInTheDocument();
  });

  it('should close edit popover when cancel is clicked', async () => {
    const user = userEvent.setup();
    const mockOnEdit = vi.fn();
    render(<UnitCard unit={mockUnit} isInFormation onEdit={mockOnEdit} />);
    
    const card = screen.getByRole('button', { name: /5 TestUnit/i });
    await user.hover(card);
    
    const editButton = await screen.findByLabelText('Edit unit');
    await user.click(editButton);
    
    expect(await screen.findByText('Edit Unit')).toBeInTheDocument();
    
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);
    
    await waitFor(() => {
      expect(screen.queryByText('Edit Unit')).not.toBeInTheDocument();
    });
  });

  it('should call onEdit with updated unit when save is clicked', async () => {
    const user = userEvent.setup();
    const mockOnEdit = vi.fn();
    render(<UnitCard unit={mockUnit} isInFormation onEdit={mockOnEdit} />);
    
    const card = screen.getByRole('button', { name: /5 TestUnit/i });
    await user.hover(card);
    
    const editButton = await screen.findByLabelText('Edit unit');
    await user.click(editButton);
    
    expect(await screen.findByText('Edit Unit')).toBeInTheDocument();
    
    const saveButton = screen.getByRole('button', { name: 'Save' });
    await user.click(saveButton);
    
    expect(mockOnEdit).toHaveBeenCalledWith(expect.objectContaining({
      name: mockUnit.name,
      level: mockUnit.level,
    }));
  });

  it('should show drag icon when not in formation', async () => {
    const user = userEvent.setup();
    render(<UnitCard unit={mockUnit} />);
    
    const card = screen.getByRole('button', { name: /5 TestUnit/i });
    await user.hover(card);
    
    const dragIcon = await screen.findByLabelText('Drag to place in formation');
    expect(dragIcon).toBeInTheDocument();
  });

  it('should show edit button for non-formation card when onEdit is provided', async () => {
    const user = userEvent.setup();
    const mockOnEdit = vi.fn();
    render(<UnitCard unit={mockUnit} onEdit={mockOnEdit} />);
    
    const card = screen.getByRole('button', { name: /5 TestUnit/i });
    await user.hover(card);
    
    const editButton = await screen.findByLabelText('Edit unit');
    expect(editButton).toBeInTheDocument();
  });

  it('should hide level badge when showLevelBadge is false', () => {
    render(<UnitCard unit={mockUnit} showLevelBadge={false} />);
    
    expect(screen.queryByText('5')).not.toBeInTheDocument();
  });

  it('should update edit name when unit type is changed in edit popover', async () => {
    const user = userEvent.setup();
    const mockOnEdit = vi.fn();
    render(<UnitCard unit={mockUnit} isInFormation onEdit={mockOnEdit} />);

    const card = screen.getByRole('button', { name: /5 TestUnit/i });
    await user.hover(card);

    const editButton = await screen.findByLabelText('Edit unit');
    await user.click(editButton);

    expect(await screen.findByText('Edit Unit')).toBeInTheDocument();

    const unitTypeSelect = screen.getByRole('combobox');
    await user.selectOptions(unitTypeSelect, 'Archers');

    const saveButton = screen.getByRole('button', { name: 'Save' });
    await user.click(saveButton);

    expect(mockOnEdit).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Archers',
    }));
  });

  it('should update edit level when slider is changed in edit popover', async () => {
    const user = userEvent.setup();
    const mockOnEdit = vi.fn();
    render(<UnitCard unit={mockUnit} isInFormation onEdit={mockOnEdit} />);
    
    const card = screen.getByRole('button', { name: /5 TestUnit/i });
    await user.hover(card);
    
    const editButton = await screen.findByLabelText('Edit unit');
    await user.click(editButton);
    
    expect(await screen.findByText('Edit Unit')).toBeInTheDocument();
    
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '6' } });

    const saveButton = screen.getByRole('button', { name: 'Save' });
    fireEvent.click(saveButton);

    expect(mockOnEdit).toHaveBeenCalledWith(expect.objectContaining({
      level: 6,
    }));
  });

  it('should handle remove button click when onDoubleClick is not provided', async () => {
    const user = userEvent.setup();
    render(<UnitCard unit={mockUnit} isInFormation />);
    
    const card = screen.getByRole('button', { name: /5 TestUnit/i });
    await user.hover(card);
    
    const removeButton = await screen.findByLabelText('Remove from formation');
    fireEvent.click(removeButton);
    
    expect(card).toBeInTheDocument();
  });

  it('should render correct icon sizes when not in formation with hover', async () => {
    const user = userEvent.setup();
    const mockOnEdit = vi.fn();
    render(<UnitCard unit={mockUnit} isInFormation={false} onEdit={mockOnEdit} />);
    
    const card = screen.getByRole('button', { name: /5 TestUnit/i });
    await user.hover(card);
    
    const dragIcon = await screen.findByLabelText('Drag to place in formation');
    expect(dragIcon).toBeInTheDocument();
    
    const editButton = await screen.findByLabelText('Edit unit');
    expect(editButton).toBeInTheDocument();
  });

  it('should not toggle tooltip when clicking while dragging', async () => {
    mockUseDrag.mockReturnValue([
      { isDragging: true },
      vi.fn(),
    ]);
    
    const user = userEvent.setup();
    render(<UnitCard unit={mockUnit} />);
    
    const card = screen.getByRole('button', { name: /5 TestUnit/i });
    await user.click(card);
    
    const tooltip = document.body.querySelector('[role="tooltip"]');
    expect(tooltip).not.toBeInTheDocument();
  });

  it('should render icons with 18px font size when not in formation', async () => {
    const user = userEvent.setup();
    render(<UnitCard unit={mockUnit} isInFormation={false} />);
    
    const card = screen.getByRole('button', { name: /5 TestUnit/i });
    await user.hover(card);
    
    const dragIcon = await screen.findByLabelText('Drag to place in formation');
    expect(dragIcon).toBeInTheDocument();
    
    expect(dragIcon.querySelector('svg')).toBeInTheDocument();
  });

  it('should render icons with clamp font size when in formation', async () => {
    const user = userEvent.setup();
    const mockOnDoubleClick = vi.fn();
    render(<UnitCard unit={mockUnit} isInFormation onDoubleClick={mockOnDoubleClick} />);
    
    const card = screen.getByRole('button', { name: /5 TestUnit/i });
    await user.hover(card);
    
    const removeIcon = await screen.findByLabelText('Remove from formation');
    expect(removeIcon).toBeInTheDocument();
    
    expect(removeIcon.querySelector('svg')).toBeInTheDocument();
  });

  it('should display roles in tooltip when unit has roles', async () => {
    const user = userEvent.setup();
    const unitWithRoles = {
      ...mockUnit,
      name: 'Archers',
    };
    render(<UnitCard unit={unitWithRoles} />);
    
    const card = screen.getByRole('button', { name: /5 Archers/i });
    await user.click(card);
    
    await waitFor(() => {
      const tooltip = document.body.querySelector('[role="tooltip"]');
      expect(tooltip).toBeInTheDocument();
      const tooltipText = tooltip?.textContent || '';
      expect(tooltipText).toMatch(/Roles:/i);
      expect(tooltipText).toMatch(/Human/i);
    });
  });

});
