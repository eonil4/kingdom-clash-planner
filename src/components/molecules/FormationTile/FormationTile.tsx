import { memo, useCallback } from 'react';
import { useDrop } from 'react-dnd';
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
}

function FormationTileComponent({
  row,
  col,
  unit,
  onPlaceUnit,
  onRemoveUnit,
  onSwapUnits,
}: FormationTileProps) {
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
    ? `${unit.level} ${unit.name} at row ${row + 1} column ${col + 1}`
    : `Empty tile at row ${row + 1} column ${col + 1}`;

  return (
    <div
      ref={drop as unknown as React.Ref<HTMLDivElement>}
      className={`
        w-full h-full border border-gray-500 rounded-sm
        flex items-center justify-center
        ${isOver ? 'bg-blue-500 bg-opacity-30 border-blue-400' : 'bg-gray-800'}
      `}
      role="gridcell"
      aria-label={ariaLabel}
    >
      {unit ? (
        <UnitCard 
          unit={unit} 
          isInFormation 
          sourceRow={row} 
          sourceCol={col}
          onDoubleClick={handleDoubleClick}
        />
      ) : (
        <div className="w-full h-full" />
      )}
    </div>
  );
}

export default memo(FormationTileComponent);
