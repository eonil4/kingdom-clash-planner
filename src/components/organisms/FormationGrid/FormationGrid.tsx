import { memo } from 'react';
import { Grid } from '@mui/material';
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
}

function FormationGridComponent({
  tiles,
  onPlaceUnit,
  onRemoveUnit,
  onSwapUnits,
}: FormationGridProps) {
  return (
    <div className="w-full p-4 bg-gray-700">
      <Grid
        container
        spacing={0.5}
        sx={{
          maxWidth: '672px',
          margin: '0 auto',
          width: '100%',
        }}
        role="grid"
        aria-label="Formation grid"
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
