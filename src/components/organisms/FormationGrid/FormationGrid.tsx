import { memo } from 'react';
import Grid from '@mui/material/Grid';
import type { Unit } from '../../../types';
import { FormationTile } from '../../molecules';

interface FormationGridProps {
  tiles: (Unit | null)[][];
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

function FormationGridComponent({
  tiles,
  onPlaceUnit,
  onRemoveUnit,
  onSwapUnits,
  onEditUnit,
}: FormationGridProps) {
  return (
    <div className="w-full bg-gray-700 rounded-lg shadow-lg">
      <Grid
        container
        spacing={0.5}
        sx={{
          width: '100%',
        }}
        role="grid"
        aria-label="Formation grid. Drag units here to place them. Double-click to remove."
      >
        {tiles.map((row, rowIndex) =>
          row.map((unit, colIndex) => (
            <Grid item xs={12 / 7} key={`${rowIndex}-${colIndex}`}>
              <div className="aspect-square">
                <FormationTile
                  row={rowIndex}
                  col={colIndex}
                  unit={unit}
                  onPlaceUnit={onPlaceUnit}
                  onRemoveUnit={onRemoveUnit}
                  onSwapUnits={onSwapUnits}
                  onEditUnit={onEditUnit}
                />
              </div>
            </Grid>
          ))
        )}
      </Grid>
    </div>
  );
}

export default memo(FormationGridComponent);
