import IconButton from '@mui/material/IconButton';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import OpenWithIcon from '@mui/icons-material/OpenWith';
import UnitEditPopover from '../UnitEditPopover/UnitEditPopover';
import type { Unit } from '../../../types';

interface UnitCardActionsProps {
  isInFormation: boolean;
  isHovered: boolean;
  onDoubleClick: (e: React.MouseEvent) => void;
  onEdit?: (updatedUnit: Unit) => void;
  unit: Unit;
}

export default function UnitCardActions({
  isInFormation,
  isHovered,
  onDoubleClick,
  onEdit,
  unit
}: UnitCardActionsProps) {
  if (!isHovered) return null;

  return (
    <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-1">
      {isInFormation ? (
        <>
          <IconButton
            size="small"
            onClick={onDoubleClick}
            sx={{
              color: '#ef4444',
              backgroundColor: 'rgba(255,255,255,0.1)',
              '&:hover': { backgroundColor: 'rgba(239,68,68,0.3)' },
              padding: '4px',
            }}
            aria-label="Remove from formation"
          >
            <RemoveCircleIcon sx={{ fontSize: 'clamp(14px, 3vw, 20px)' }} />
          </IconButton>
          {onEdit && <UnitEditPopover unit={unit} onEdit={onEdit} />}
        </>
      ) : (
        <>
          <IconButton
            size="small"
            sx={{
              color: '#a3a3a3',
              backgroundColor: 'rgba(255,255,255,0.1)',
              padding: '4px',
              cursor: 'move',
            }}
            aria-label="Drag to place in formation"
          >
            <OpenWithIcon sx={{ fontSize: '18px' }} />
          </IconButton>
          {onEdit && <UnitEditPopover unit={unit} onEdit={onEdit} />}
        </>
      )}
    </div>
  );
}