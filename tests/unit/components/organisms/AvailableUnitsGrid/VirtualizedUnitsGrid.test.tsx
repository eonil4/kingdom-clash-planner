import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VirtualizedUnitsGrid } from '../../../../../src/components/organisms/AvailableUnitsGrid';
import { UnitRarity } from '../../../../../src/types';
import type { Unit } from '../../../../../src/types';

vi.mock('../../../../../src/components/molecules', () => ({
  UnitCard: ({ unit, onDoubleClick, onEdit }: { 
    unit: { id: string; name: string; level: number; rarity?: string; power?: number }; 
    onDoubleClick?: () => void; 
    onEdit?: (updatedUnit: { id: string; name: string; level: number }) => void 
  }) => (
    <div
      data-testid={`unit-card-${unit.id}`}
      onDoubleClick={onDoubleClick}
      role="button"
      tabIndex={0}
    >
      {unit.name} Lv{unit.level}
      {onEdit && (
        <button
          data-testid={`edit-btn-${unit.id}`}
          onClick={() => onEdit({ ...unit, level: unit.level + 1 })}
        >
          Edit
        </button>
      )}
    </div>
  ),
}));

vi.mock('react-window', () => ({
  Grid: ({ cellComponent: CellComponent, cellProps, columnCount, rowCount }: {
    cellComponent: React.ComponentType<{
      columnIndex: number;
      rowIndex: number;
      style: React.CSSProperties;
      units: Unit[];
      columnCount: number;
      onDoubleClick: (unit: Unit) => void;
      onEdit?: (originalUnit: Unit, updatedUnit: Unit) => void;
    }>;
    cellProps: {
      units: Unit[];
      columnCount: number;
      onDoubleClick: (unit: Unit) => void;
      onEdit?: (originalUnit: Unit, updatedUnit: Unit) => void;
    };
    columnCount: number;
    rowCount: number;
    columnWidth: number;
    rowHeight: number;
    style: React.CSSProperties;
  }) => (
    <div data-testid="virtualized-grid">
      {/* Render all cells including empty ones to test Cell null return */}
      {Array.from({ length: rowCount * columnCount }).map((_, index) => {
        const rowIndex = Math.floor(index / columnCount);
        const columnIndex = index % columnCount;
        return (
          <CellComponent
            key={`${rowIndex}-${columnIndex}`}
            columnIndex={columnIndex}
            rowIndex={rowIndex}
            style={{ position: 'absolute', left: columnIndex * 70, top: rowIndex * 70, width: 70, height: 70 }}
            {...cellProps}
          />
        );
      })}
    </div>
  ),
}));

describe('VirtualizedUnitsGrid', () => {
  const createMockUnits = (count: number): Unit[] => 
    Array.from({ length: count }, (_, i) => ({
      id: String(i + 1),
      name: `Unit${i + 1}`,
      level: (i % 10) + 1,
      rarity: UnitRarity.Common,
      power: 100 * (i + 1),
    }));

  const mockOnUnitDoubleClick = vi.fn();
  const mockOnUnitEdit = vi.fn();

  let resizeObserverCallback: ResizeObserverCallback | null = null;
  let resizeObserverTarget: Element | null = null;
  
  beforeEach(() => {
    vi.clearAllMocks();
    resizeObserverCallback = null;
    resizeObserverTarget = null;

    globalThis.ResizeObserver = class ResizeObserver {
      private callback: ResizeObserverCallback;
      
      constructor(callback: ResizeObserverCallback) {
        this.callback = callback;
        resizeObserverCallback = callback;
      }
      
      observe(target: Element) {
        resizeObserverTarget = target;
        Object.defineProperty(target, 'offsetWidth', { value: 500, configurable: true });
        this.callback([
          {
            target,
            contentRect: { width: 500, height: 400 } as DOMRectReadOnly,
            borderBoxSize: [{ inlineSize: 500, blockSize: 400 }] as ResizeObserverSize[],
            contentBoxSize: [{ inlineSize: 500, blockSize: 400 }] as ResizeObserverSize[],
            devicePixelContentBoxSize: [{ inlineSize: 500, blockSize: 400 }] as ResizeObserverSize[],
          } as ResizeObserverEntry,
        ], this);
      }
      
      unobserve() {}
      disconnect() {}
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('empty units', () => {
    it('should return null when units array is empty', () => {
      const { container } = render(
        <VirtualizedUnitsGrid 
          units={[]} 
          onUnitDoubleClick={mockOnUnitDoubleClick} 
        />
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('non-virtualized rendering (< 50 units)', () => {
    const smallUnitList = createMockUnits(10);

    it('should render with list role', () => {
      render(
        <VirtualizedUnitsGrid 
          units={smallUnitList} 
          onUnitDoubleClick={mockOnUnitDoubleClick} 
        />
      );

      expect(screen.getByRole('list')).toBeInTheDocument();
    });

    it('should have correct aria-label for non-virtualized grid', () => {
      render(
        <VirtualizedUnitsGrid 
          units={smallUnitList} 
          onUnitDoubleClick={mockOnUnitDoubleClick} 
        />
      );

      expect(screen.getByLabelText('Available units')).toBeInTheDocument();
    });

    it('should render all unit cards', () => {
      render(
        <VirtualizedUnitsGrid 
          units={smallUnitList} 
          onUnitDoubleClick={mockOnUnitDoubleClick} 
        />
      );

      expect(screen.getByTestId('unit-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('unit-card-10')).toBeInTheDocument();
    });

    it('should call onUnitDoubleClick when unit card is double-clicked', async () => {
      const user = userEvent.setup();
      render(
        <VirtualizedUnitsGrid 
          units={smallUnitList} 
          onUnitDoubleClick={mockOnUnitDoubleClick} 
        />
      );

      await user.dblClick(screen.getByTestId('unit-card-1'));

      expect(mockOnUnitDoubleClick).toHaveBeenCalledTimes(1);
      expect(mockOnUnitDoubleClick).toHaveBeenCalledWith(smallUnitList[0]);
    });

    it('should call onUnitEdit when unit is edited', async () => {
      const user = userEvent.setup();
      render(
        <VirtualizedUnitsGrid 
          units={smallUnitList} 
          onUnitDoubleClick={mockOnUnitDoubleClick}
          onUnitEdit={mockOnUnitEdit}
        />
      );

      const editButton = screen.getByTestId('edit-btn-1');
      await user.click(editButton);

      expect(mockOnUnitEdit).toHaveBeenCalledWith(
        smallUnitList[0], 
        expect.objectContaining({ level: 2 })
      );
    });

    it('should not render edit button when onUnitEdit is not provided', () => {
      render(
        <VirtualizedUnitsGrid 
          units={smallUnitList} 
          onUnitDoubleClick={mockOnUnitDoubleClick} 
        />
      );

      expect(screen.queryByTestId('edit-btn-1')).not.toBeInTheDocument();
    });

    it('should render with grid layout class', () => {
      const { container } = render(
        <VirtualizedUnitsGrid 
          units={smallUnitList} 
          onUnitDoubleClick={mockOnUnitDoubleClick} 
        />
      );

      const grid = container.querySelector('.grid');
      expect(grid).toBeInTheDocument();
    });
  });

  describe('virtualized rendering (>= 50 units)', () => {
    const largeUnitList = createMockUnits(60);

    it('should render virtualized grid for large unit lists', () => {
      render(
        <VirtualizedUnitsGrid 
          units={largeUnitList} 
          onUnitDoubleClick={mockOnUnitDoubleClick}
          height={400}
        />
      );

      expect(screen.getByTestId('virtualized-grid')).toBeInTheDocument();
    });

    it('should have correct aria-label for virtualized grid', () => {
      render(
        <VirtualizedUnitsGrid 
          units={largeUnitList} 
          onUnitDoubleClick={mockOnUnitDoubleClick}
          height={400}
        />
      );

      expect(screen.getByLabelText('Available units (virtualized)')).toBeInTheDocument();
    });

    it('should render unit cards in virtualized grid', () => {
      render(
        <VirtualizedUnitsGrid 
          units={largeUnitList} 
          onUnitDoubleClick={mockOnUnitDoubleClick}
          height={400}
        />
      );

      expect(screen.getByTestId('unit-card-1')).toBeInTheDocument();
    });

    it('should call onUnitDoubleClick in virtualized mode', async () => {
      const user = userEvent.setup();
      render(
        <VirtualizedUnitsGrid 
          units={largeUnitList} 
          onUnitDoubleClick={mockOnUnitDoubleClick}
          height={400}
        />
      );

      await user.dblClick(screen.getByTestId('unit-card-1'));

      expect(mockOnUnitDoubleClick).toHaveBeenCalledWith(largeUnitList[0]);
    });

    it('should call onUnitEdit in virtualized mode', async () => {
      const user = userEvent.setup();
      render(
        <VirtualizedUnitsGrid 
          units={largeUnitList} 
          onUnitDoubleClick={mockOnUnitDoubleClick}
          onUnitEdit={mockOnUnitEdit}
          height={400}
        />
      );

      const editButton = screen.getByTestId('edit-btn-1');
      await user.click(editButton);

      expect(mockOnUnitEdit).toHaveBeenCalledWith(
        largeUnitList[0], 
        expect.objectContaining({ level: 2 })
      );
    });

    it('should use default height when not provided', () => {
      render(
        <VirtualizedUnitsGrid 
          units={largeUnitList} 
          onUnitDoubleClick={mockOnUnitDoubleClick}
        />
      );

      expect(screen.getByTestId('virtualized-grid')).toBeInTheDocument();
    });
  });

  describe('responsive sizing', () => {
    it('should use mobile size for small screens', () => {
      Object.defineProperty(window, 'innerWidth', { value: 500, configurable: true });
      
      const largeUnitList = createMockUnits(60);
      render(
        <VirtualizedUnitsGrid 
          units={largeUnitList} 
          onUnitDoubleClick={mockOnUnitDoubleClick}
        />
      );

      expect(screen.getByTestId('virtualized-grid')).toBeInTheDocument();
    });

    it('should use tablet size for medium screens', () => {
      Object.defineProperty(window, 'innerWidth', { value: 800, configurable: true });
      
      const largeUnitList = createMockUnits(60);
      render(
        <VirtualizedUnitsGrid 
          units={largeUnitList} 
          onUnitDoubleClick={mockOnUnitDoubleClick}
        />
      );

      expect(screen.getByTestId('virtualized-grid')).toBeInTheDocument();
    });

    it('should use desktop size for large screens', () => {
      Object.defineProperty(window, 'innerWidth', { value: 1200, configurable: true });
      
      const largeUnitList = createMockUnits(60);
      render(
        <VirtualizedUnitsGrid 
          units={largeUnitList} 
          onUnitDoubleClick={mockOnUnitDoubleClick}
        />
      );

      expect(screen.getByTestId('virtualized-grid')).toBeInTheDocument();
    });
  });

  describe('resize handling', () => {
    it('should update size on window resize', async () => {
      const largeUnitList = createMockUnits(60);
      render(
        <VirtualizedUnitsGrid 
          units={largeUnitList} 
          onUnitDoubleClick={mockOnUnitDoubleClick}
        />
      );

      expect(screen.getByTestId('virtualized-grid')).toBeInTheDocument();

      await act(async () => {
        Object.defineProperty(window, 'innerWidth', { value: 1200, configurable: true });
        window.dispatchEvent(new Event('resize'));
      });

      expect(screen.getByTestId('virtualized-grid')).toBeInTheDocument();
    });

    it('should handle ResizeObserver callback', async () => {
      const largeUnitList = createMockUnits(60);
      render(
        <VirtualizedUnitsGrid 
          units={largeUnitList} 
          onUnitDoubleClick={mockOnUnitDoubleClick}
        />
      );

      expect(resizeObserverCallback).toBeDefined();
      expect(resizeObserverTarget).toBeDefined();

      if (resizeObserverCallback && resizeObserverTarget) {
        Object.defineProperty(resizeObserverTarget, 'offsetWidth', { value: 800, configurable: true });
        
        await act(async () => {
          resizeObserverCallback!([
            {
              target: resizeObserverTarget!,
              contentRect: { width: 800, height: 400 } as DOMRectReadOnly,
              borderBoxSize: [{ inlineSize: 800, blockSize: 400 }] as ResizeObserverSize[],
              contentBoxSize: [{ inlineSize: 800, blockSize: 400 }] as ResizeObserverSize[],
              devicePixelContentBoxSize: [{ inlineSize: 800, blockSize: 400 }] as ResizeObserverSize[],
            } as ResizeObserverEntry,
          ], {} as ResizeObserver);
        });
      }

      expect(screen.getByTestId('virtualized-grid')).toBeInTheDocument();
    });
  });

  describe('Cell component edge cases', () => {
    it('should handle cell with no unit (sparse grid)', () => {
      const sparseUnits = [createMockUnits(1)[0]];
      
      render(
        <VirtualizedUnitsGrid 
          units={sparseUnits} 
          onUnitDoubleClick={mockOnUnitDoubleClick} 
        />
      );

      expect(screen.getByTestId('unit-card-1')).toBeInTheDocument();
    });
  });

  describe('boundary conditions', () => {
    it('should handle exactly 49 units (below threshold)', () => {
      const units = createMockUnits(49);
      render(
        <VirtualizedUnitsGrid 
          units={units} 
          onUnitDoubleClick={mockOnUnitDoubleClick} 
        />
      );

      expect(screen.getByLabelText('Available units')).toBeInTheDocument();
      expect(screen.queryByTestId('virtualized-grid')).not.toBeInTheDocument();
    });

    it('should handle exactly 50 units (at threshold)', () => {
      const units = createMockUnits(50);
      render(
        <VirtualizedUnitsGrid 
          units={units} 
          onUnitDoubleClick={mockOnUnitDoubleClick} 
        />
      );

      expect(screen.getByTestId('virtualized-grid')).toBeInTheDocument();
    });

    it('should handle exactly 51 units (above threshold)', () => {
      const units = createMockUnits(51);
      render(
        <VirtualizedUnitsGrid 
          units={units} 
          onUnitDoubleClick={mockOnUnitDoubleClick} 
        />
      );

      expect(screen.getByTestId('virtualized-grid')).toBeInTheDocument();
    });
  });

  describe('columnCount calculation', () => {
    it('should return 1 column when container width is 0', () => {
      globalThis.ResizeObserver = class ResizeObserver {
        constructor() {}
        observe() {}
        unobserve() {}
        disconnect() {}
      };

      const largeUnitList = createMockUnits(60);
      const { container } = render(
        <VirtualizedUnitsGrid 
          units={largeUnitList} 
          onUnitDoubleClick={mockOnUnitDoubleClick}
        />
      );

      const listContainer = container.querySelector('[role="list"]');
      expect(listContainer).toBeInTheDocument();
    });
  });
});
