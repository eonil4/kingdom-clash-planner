import { useDrop } from 'react-dnd';
import type { Unit } from '../types';
import UnitCard from './UnitCard';

interface FormationTileProps {
  row: number;
  col: number;
  unit: Unit | null;
  onPlaceUnit: (row: number, col: number, unit: Unit) => void;
  onRemoveUnit: (row: number, col: number) => void;
}

export default function FormationTile({
  row,
  col,
  unit,
  onPlaceUnit,
  onRemoveUnit,
}: FormationTileProps) {
  const [{ isOver }, drop] = useDrop({
    accept: 'unit',
    drop: (item: { unit: Unit; isInFormation?: boolean; sourceRow?: number; sourceCol?: number }) => {
      // If unit is being moved from another tile, remove it from the old position first
      if (item.isInFormation && item.sourceRow !== undefined && item.sourceCol !== undefined) {
        if (item.sourceRow !== row || item.sourceCol !== col) {
          onRemoveUnit(item.sourceRow, item.sourceCol);
        }
      }
      // Place unit if tile is empty, or if we're moving from another tile (overwrite)
      if (!unit || (item.isInFormation && item.sourceRow !== undefined && item.sourceCol !== undefined && (item.sourceRow !== row || item.sourceCol !== col))) {
        onPlaceUnit(row, col, item.unit);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

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
        <UnitCard unit={unit} isInFormation sourceRow={row} sourceCol={col} />
      ) : (
        <div className="w-full h-full" />
      )}
    </div>
  );
}

