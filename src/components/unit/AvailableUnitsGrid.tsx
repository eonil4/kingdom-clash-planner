import { Box } from '@mui/material';
import type { Unit } from '../../types';
import UnitCard from './UnitCard';

interface AvailableUnitsGridProps {
  units: Unit[];
  onUnitDoubleClick: (unit: Unit) => void;
}

export default function AvailableUnitsGrid({ units, onUnitDoubleClick }: AvailableUnitsGridProps) {
  return (
    <Box
      className="flex flex-wrap gap-2"
      role="list"
      aria-label="Available units"
    >
      {units.map((unit) => (
        <UnitCard
          key={unit.id}
          unit={unit}
          onDoubleClick={() => onUnitDoubleClick(unit)}
        />
      ))}
    </Box>
  );
}

