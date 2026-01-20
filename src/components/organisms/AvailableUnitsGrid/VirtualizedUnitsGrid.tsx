import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Grid, type CellComponentProps } from 'react-window';
import Box from '@mui/material/Box';
import type { Unit } from '../../../types';
import { UnitCard } from '../../molecules';

interface VirtualizedUnitsGridProps {
  units: Unit[];
  onUnitDoubleClick: (unit: Unit) => void;
  onUnitEdit?: (originalUnit: Unit, updatedUnit: Unit) => void;
  height?: number;
}

interface CellProps {
  units: Unit[];
  columnCount: number;
  onDoubleClick: (unit: Unit) => void;
  onEdit?: (originalUnit: Unit, updatedUnit: Unit) => void;
}

const ITEM_SIZE_MOBILE = 62;
const ITEM_SIZE_TABLET = 66;
const ITEM_SIZE_DESKTOP = 70;
const GAP = 6;
const VIRTUALIZATION_THRESHOLD = 50;

function getItemSize(): number {
  /* istanbul ignore if -- @preserve SSR check, window always exists in browser tests */
  if (typeof window === 'undefined') return ITEM_SIZE_DESKTOP;
  const width = window.innerWidth;
  if (width < 640) return ITEM_SIZE_MOBILE;
  if (width < 1024) return ITEM_SIZE_TABLET;
  return ITEM_SIZE_DESKTOP;
}

function Cell({ 
  columnIndex, 
  rowIndex, 
  style,
  units,
  columnCount,
  onDoubleClick,
  onEdit,
}: CellComponentProps & CellProps) {
  const index = rowIndex * columnCount + columnIndex;
  const unit = units[index];

  if (!unit) {
    return null;
  }

  const handleDoubleClick = () => {
    onDoubleClick(unit);
  };

  const handleEdit = onEdit 
    ? (updatedUnit: Unit) => onEdit(unit, updatedUnit)
    : undefined;

  return (
    <div 
      style={{ 
        ...style, 
        padding: GAP / 2,
      }} 
      role="listitem"
    >
      <UnitCard 
        unit={unit} 
        onDoubleClick={handleDoubleClick} 
        onEdit={handleEdit}
      />
    </div>
  );
}

function VirtualizedUnitsGridComponent({ 
  units, 
  onUnitDoubleClick, 
  onUnitEdit,
  height = 400 
}: VirtualizedUnitsGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [itemSize, setItemSize] = useState(getItemSize);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
      setItemSize(getItemSize());
    };

    updateSize();

    const resizeObserver = new ResizeObserver(updateSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', updateSize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  const columnCount = useMemo(() => {
    if (containerWidth === 0) return 1;
    return Math.max(1, Math.floor(containerWidth / itemSize));
  }, [containerWidth, itemSize]);

  const rowCount = useMemo(() => {
    return Math.ceil(units.length / columnCount);
  }, [units.length, columnCount]);

  const cellProps = useMemo<CellProps>(() => ({
    units,
    columnCount,
    onDoubleClick: onUnitDoubleClick,
    onEdit: onUnitEdit,
  }), [units, columnCount, onUnitDoubleClick, onUnitEdit]);

  if (units.length === 0) {
    return null;
  }

  if (units.length < VIRTUALIZATION_THRESHOLD) {
    return (
      <Box
        className="grid gap-1.5"
        sx={{
          gridTemplateColumns: 'repeat(auto-fill, minmax(56px, 1fr))',
          '@media (min-width: 640px)': {
            gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))',
          },
          '@media (min-width: 1024px)': {
            gridTemplateColumns: 'repeat(auto-fill, minmax(64px, 1fr))',
          },
          maxHeight: height,
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
        role="list"
        aria-label="Available units"
      >
        {units.map((unit) => (
          <div key={unit.id} role="listitem">
            <UnitCard 
              unit={unit} 
              onDoubleClick={() => onUnitDoubleClick(unit)} 
              onEdit={onUnitEdit ? (updated) => onUnitEdit(unit, updated) : undefined}
            />
          </div>
        ))}
      </Box>
    );
  }

  return (
    <Box 
      ref={containerRef} 
      className="w-full h-full"
      role="list"
      aria-label="Available units (virtualized)"
    >
      {containerWidth > 0 && (
        <Grid
          cellComponent={Cell}
          cellProps={cellProps}
          columnCount={columnCount}
          columnWidth={itemSize}
          rowCount={rowCount}
          rowHeight={itemSize}
          style={{ height, width: containerWidth, overflowX: 'hidden', overflowY: 'auto' }}
        />
      )}
    </Box>
  );
}

export default memo(VirtualizedUnitsGridComponent);
