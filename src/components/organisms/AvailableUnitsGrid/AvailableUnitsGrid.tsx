import { memo, useCallback } from 'react';
import Box from '@mui/material/Box';
import type { Unit } from '../../../types';
import { UnitCard } from '../../molecules';

interface AvailableUnitsGridProps {
  units: Unit[];
  onUnitDoubleClick: (unit: Unit) => void;
  onUnitEdit?: (originalUnit: Unit, updatedUnit: Unit) => void;
}

interface UnitCardWrapperProps {
  unit: Unit;
  onDoubleClick: (unit: Unit) => void;
  onEdit?: (originalUnit: Unit, updatedUnit: Unit) => void;
}

const UnitCardWrapper = memo(function UnitCardWrapper({ unit, onDoubleClick, onEdit }: UnitCardWrapperProps) {
  const handleDoubleClick = useCallback(() => {
    onDoubleClick(unit);
  }, [onDoubleClick, unit]);

  const handleEdit = useCallback((updatedUnit: Unit) => {
    onEdit?.(unit, updatedUnit);
  }, [onEdit, unit]);

  return (
    <div role="listitem">
      <UnitCard unit={unit} onDoubleClick={handleDoubleClick} onEdit={onEdit ? handleEdit : undefined} />
    </div>
  );
});

function AvailableUnitsGridComponent({ units, onUnitDoubleClick, onUnitEdit }: AvailableUnitsGridProps) {
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
      }}
      role="list"
      aria-label="Available units"
    >
      {units.map((unit) => (
        <UnitCardWrapper
          key={unit.id}
          unit={unit}
          onDoubleClick={onUnitDoubleClick}
          onEdit={onUnitEdit}
        />
      ))}
    </Box>
  );
}

export default memo(AvailableUnitsGridComponent);
