import { memo, useCallback } from 'react';
import Box from '@mui/material/Box';
import type { Unit } from '../../../types';
import { UnitCard } from '../../molecules';

interface AvailableUnitsGridProps {
  units: Unit[];
  onUnitDoubleClick: (unit: Unit) => void;
}

interface UnitCardWrapperProps {
  unit: Unit;
  onDoubleClick: (unit: Unit) => void;
}

const UnitCardWrapper = memo(function UnitCardWrapper({ unit, onDoubleClick }: UnitCardWrapperProps) {
  const handleDoubleClick = useCallback(() => {
    onDoubleClick(unit);
  }, [onDoubleClick, unit]);

  return (
    <div role="listitem">
      <UnitCard unit={unit} onDoubleClick={handleDoubleClick} />
    </div>
  );
});

function AvailableUnitsGridComponent({ units, onUnitDoubleClick }: AvailableUnitsGridProps) {
  return (
    <Box
      className="flex flex-wrap gap-2"
      role="list"
      aria-label="Available units"
    >
      {units.map((unit) => (
        <UnitCardWrapper
          key={unit.id}
          unit={unit}
          onDoubleClick={onUnitDoubleClick}
        />
      ))}
    </Box>
  );
}

export default memo(AvailableUnitsGridComponent);
