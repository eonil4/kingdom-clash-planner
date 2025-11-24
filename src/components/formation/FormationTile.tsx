import { useDrop } from 'react-dnd';
import type { Unit } from '../../types';
import UnitCard from '../unit/UnitCard';

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

export default function FormationTile({
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
      
      // Don't do anything if dropping on the same tile
      if (isDroppingOnSameTile) {
        return;
      }
      
      // If both units are in the formation, swap them instead of replacing
      if (isMovingFromDifferentTile && unit && onSwapUnits && item.sourceRow !== undefined && item.sourceCol !== undefined) {
        onSwapUnits(item.sourceRow, item.sourceCol, row, col, item.unit, unit);
        return;
      }
      
      // If unit is being moved from another tile, remove it from the old position first
      // We need to get the unit from the item since we don't have access to it here
      if (isMovingFromDifferentTile && item.sourceRow !== undefined && item.sourceCol !== undefined) {
        // Pass the unit being moved (it's in the item)
        onRemoveUnit(item.sourceRow, item.sourceCol, item.unit);
      }
      
      // If there's an existing unit in this tile (and we're not dropping on the same tile),
      // remove the existing unit first (it will be moved back to roster)
      if (unit) {
        onRemoveUnit(row, col, unit);
      }
      
      // Place the new unit (always place after handling removals)
      onPlaceUnit(row, col, item.unit);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const handleDoubleClick = () => {
    if (unit) {
      // Remove unit from formation and add it back to roster
      onRemoveUnit(row, col, unit);
    }
  };

  return (
    <div
      ref={drop as unknown as React.Ref<HTMLDivElement>}
      className={`
        w-full h-full border-2 border-white border-opacity-40 rounded-sm
        flex items-center justify-center
        ${isOver ? 'bg-blue-500 bg-opacity-40 border-blue-400' : 'bg-transparent'}
        transition-all duration-200
        hover:border-opacity-60
      `}
      role="gridcell"
      aria-label={`Formation tile row ${row + 1} column ${col + 1}`}
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

