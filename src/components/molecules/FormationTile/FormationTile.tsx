import { memo, useCallback, useState } from 'react';
import { useDrop } from 'react-dnd';
import AddIcon from '@mui/icons-material/Add';
import type { Unit } from '../../../types';
import { UnitCard } from '../UnitCard';

interface FormationTileProps {
  row: number;
  col: number;
  unit: Unit | null;
  onPlaceUnit: (row: number, col: number, unit: Unit) => void;
  onRemoveUnit: (row: number, col: number, unit: Unit | null) => void;
  onSwapUnits?: (
    sourceRow: number,
    sourceCol: number,
    targetRow: number,
    targetCol: number,
    sourceUnit: Unit,
    targetUnit: Unit
  ) => void;
  onEditUnit?: (row: number, col: number, unit: Unit) => void;
}

function FormationTileComponent({
  row,
  col,
  unit,
  onPlaceUnit,
  onRemoveUnit,
  onSwapUnits,
  onEditUnit,
}: FormationTileProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const handleEditUnit = useCallback((updatedUnit: Unit) => {
    onEditUnit?.(row, col, updatedUnit);
  }, [onEditUnit, row, col]);
  
  const [{ isOver }, drop] = useDrop({
    accept: 'unit',
    drop: (item: { unit: Unit; isInFormation?: boolean; sourceRow?: number; sourceCol?: number }) => {
      const isMovingFromFormation = item.isInFormation && item.sourceRow !== undefined && item.sourceCol !== undefined;
      const isMovingFromDifferentTile = isMovingFromFormation && (item.sourceRow !== row || item.sourceCol !== col);
      const isDroppingOnSameTile = isMovingFromFormation && item.sourceRow === row && item.sourceCol === col;
      
      if (isDroppingOnSameTile) {
        return;
      }
      
      if (isMovingFromDifferentTile && unit && onSwapUnits && item.sourceRow !== undefined && item.sourceCol !== undefined) {
        onSwapUnits(item.sourceRow, item.sourceCol, row, col, item.unit, unit);
        return;
      }
      
      if (isMovingFromDifferentTile && item.sourceRow !== undefined && item.sourceCol !== undefined) {
        onRemoveUnit(item.sourceRow, item.sourceCol, item.unit);
      }
      
      if (unit) {
        onRemoveUnit(row, col, unit);
      }
      
      onPlaceUnit(row, col, item.unit);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const handleDoubleClick = useCallback(() => {
    onRemoveUnit(row, col, unit);
  }, [onRemoveUnit, row, col, unit]);

  const ariaLabel = unit
    ? `${unit.level} ${unit.name} at row ${row + 1} column ${col + 1}. Double-click or hover and click remove to withdraw.`
    : `Empty tile at row ${row + 1} column ${col + 1}. Drag a unit here to place it.`;

  return (
    <div
      ref={drop as unknown as React.Ref<HTMLDivElement>}
      className={`
        w-full h-full border rounded-sm
        flex items-center justify-center
        transition-all duration-150
        ${isOver ? 'bg-blue-500/40 border-blue-400 border-2 scale-105' : ''}
        ${!unit && isHovered && !isOver ? 'bg-gray-700 border-gray-400 border-dashed' : ''}
        ${!unit && !isHovered && !isOver ? 'bg-gray-800 border-gray-600' : ''}
        ${unit && !isOver ? 'bg-gray-800 border-gray-500' : ''}
        focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 focus:ring-offset-gray-900 focus:outline-none
      `}
      role="gridcell"
      tabIndex={0}
      aria-label={ariaLabel}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {unit ? (
        <UnitCard 
          unit={unit} 
          isInFormation 
          sourceRow={row} 
          sourceCol={col}
          onDoubleClick={handleDoubleClick}
          onEdit={onEditUnit ? handleEditUnit : undefined}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          {(isHovered || isOver) && (
            <AddIcon 
              sx={{ 
                fontSize: 'clamp(16px, 4vw, 28px)',
                color: isOver ? '#60a5fa' : '#6b7280',
                opacity: isOver ? 1 : 0.5,
              }} 
            />
          )}
        </div>
      )}
    </div>
  );
}

export default memo(FormationTileComponent);
