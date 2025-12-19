import { memo, useState, useRef, useLayoutEffect } from 'react';
import { useDrag } from 'react-dnd';
import Tooltip from '@mui/material/Tooltip';
import Popover from '@mui/material/Popover';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import EditIcon from '@mui/icons-material/Edit';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import OpenWithIcon from '@mui/icons-material/OpenWith';
import type { Unit } from '../../../types';
import { UnitRarity } from '../../../types';
import { UNIT_NAMES_ARRAY, getUnitDataByName } from '../../../types/unitNames';
import { UnitLevelBadge } from '../../atoms';
import { UnitImage } from '../../atoms';
import { formatNumber, calculateUnitPower } from '../../../utils/powerUtils';
import { getUnitImagePath } from '../../../utils/imageUtils';

interface UnitCardProps {
  unit: Unit;
  isInFormation?: boolean;
  sourceRow?: number;
  sourceCol?: number;
  onDoubleClick?: () => void;
  onEdit?: (updatedUnit: Unit) => void;
  size?: string | number;
  showLevelBadge?: boolean;
}

const rarityColors: Record<UnitRarity, string> = {
  [UnitRarity.Common]: 'border-gray-500 bg-gray-800',
  [UnitRarity.Rare]: 'border-blue-500 bg-blue-900',
  [UnitRarity.Epic]: 'border-purple-500 bg-purple-900',
  [UnitRarity.Legendary]: 'border-yellow-500 bg-yellow-900',
};

function UnitCardComponent({ unit, isInFormation = false, sourceRow, sourceCol, onDoubleClick, onEdit, size, showLevelBadge = true }: UnitCardProps) {
  const [{ isDragging }, drag] = useDrag({
    type: 'unit',
    item: { unit, isInFormation, sourceRow, sourceCol },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [editAnchorEl, setEditAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [editName, setEditName] = useState(unit.name);
  const [editLevel, setEditLevel] = useState(unit.level);
  const cardRef = useRef<HTMLDivElement>(null);
  const imageUrl = unit.imageUrl;
  const badgeSize = isInFormation ? '35%' : '24px';
  const badgeFontSize = isInFormation ? 'clamp(0.5rem, 2vw, 0.65rem)' : '0.75rem';
  const placeholderFontSize = isInFormation ? '0.65rem' : '0.75rem';
  const cardSize = size !== undefined ? (typeof size === 'string' ? size : `${size}px`) : (isInFormation ? '90%' : '64px');

  const isEditOpen = Boolean(editAnchorEl);

  // Close tooltip on any click outside the card
  useLayoutEffect(() => {
    if (!tooltipOpen) return;

    const handleClickAnywhere = (event: MouseEvent) => {
      const target = event.target as Node;
      if (cardRef.current && !cardRef.current.contains(target)) {
        setTooltipOpen(false);
      }
    };

    document.addEventListener('click', handleClickAnywhere, true);
    return () => {
      document.removeEventListener('click', handleClickAnywhere, true);
    };
  }, [tooltipOpen]);

  const tooltipContent = (
    <div className="p-2">
      <div className="font-bold text-lg mb-1">{unit.name}</div>
      <div className="text-sm">
        <div>Level: <span className="font-bold">{unit.level}</span></div>
        <div>Rarity: <span className="font-bold">{unit.rarity}</span></div>
        <div>Power: <span className="font-bold">{formatNumber(unit.power ?? 0)}</span></div>
        <div className="mt-1 text-xs opacity-90">
          {unit.rarity === UnitRarity.Legendary && '⭐ Legendary Unit'}
          {unit.rarity === UnitRarity.Epic && '💜 Epic Unit'}
          {unit.rarity === UnitRarity.Rare && '💙 Rare Unit'}
          {unit.rarity === UnitRarity.Common && '⚪ Common Unit'}
        </div>
      </div>
    </div>
  );

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDragging) return;
    setTooltipOpen((prev) => !prev);
  };

  const handleCardKeyDown = (e: React.KeyboardEvent) => {
    if (isDragging) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      setTooltipOpen((prev) => !prev);
    }
  };

  const combinedRef = (node: HTMLDivElement | null) => {
    cardRef.current = node;
    if (node && typeof drag === 'function') {
      drag(node);
    }
  };
  
  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setTooltipOpen(false);
    if (onDoubleClick) {
      onDoubleClick();
    }
  };

  const handleEditClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    setTooltipOpen(false);
    setEditAnchorEl(e.currentTarget);
    setEditName(unit.name);
    setEditLevel(unit.level);
  };

  const handleEditClose = () => {
    setEditAnchorEl(null);
  };

  const handleEditSave = () => {
    const unitData = getUnitDataByName(editName);
    const newRarity = unitData?.rarity || unit.rarity;
    const newPower = calculateUnitPower(newRarity, editLevel);
    
    const updatedUnit: Unit = {
      ...unit,
      name: editName,
      level: editLevel,
      rarity: newRarity,
      power: newPower,
      imageUrl: getUnitImagePath(editName),
    };
    onEdit!(updatedUnit);
    setEditAnchorEl(null);
  };
  
  const cardContent = (
    <div
      ref={combinedRef}
      className={`
        relative rounded-lg border-2 cursor-move overflow-hidden group
        ${rarityColors[unit.rarity]}
        ${isDragging ? 'opacity-50' : 'opacity-100'}
        focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900
        transition-transform duration-150 hover:scale-105
      `}
      style={{
        width: cardSize,
        height: cardSize,
        aspectRatio: '1 / 1',
        maxWidth: isInFormation ? '100%' : undefined,
        maxHeight: isInFormation ? '100%' : undefined,
        minWidth: isInFormation ? 0 : undefined,
        minHeight: isInFormation ? 0 : undefined,
      }}
      role="button"
      tabIndex={0}
      aria-label={`${unit.level} ${unit.name}. Double-click to ${isInFormation ? 'remove from formation' : 'add to formation'}`}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDoubleClick={(e) => {
        e.stopPropagation();
        setTooltipOpen(false);
        if (onDoubleClick) {
          onDoubleClick();
        }
      }}
    >
      <UnitImage 
        name={unit.name} 
        rarity={unit.rarity} 
        imageUrl={imageUrl}
        fontSize={placeholderFontSize}
      />
      {showLevelBadge && <UnitLevelBadge level={unit.level} size={badgeSize} fontSize={badgeFontSize} />}
      
      {/* Hover overlay with action icons */}
      <div 
        className={`
          absolute inset-0 bg-black/60 flex items-center justify-center gap-1
          transition-opacity duration-150
          ${isHovered && !isDragging && !isEditOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
      >
        {isInFormation ? (
          <>
            <IconButton
              size="small"
              onClick={handleRemoveClick}
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
            {onEdit && (
              <IconButton
                size="small"
                onClick={handleEditClick}
                sx={{ 
                  color: '#fbbf24',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '&:hover': { backgroundColor: 'rgba(251,191,36,0.3)' },
                  padding: '4px',
                }}
                aria-label="Edit unit"
              >
                <EditIcon sx={{ fontSize: 'clamp(14px, 3vw, 20px)' }} />
              </IconButton>
            )}
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
            {onEdit && (
              <IconButton
                size="small"
                onClick={handleEditClick}
                sx={{ 
                  color: '#fbbf24',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '&:hover': { backgroundColor: 'rgba(251,191,36,0.3)' },
                  padding: '4px',
                }}
                aria-label="Edit unit"
              >
                <EditIcon sx={{ fontSize: '18px' }} />
              </IconButton>
            )}
          </>
        )}
      </div>
    </div>
  );

  // Edit popover for changing unit type and level
  const editPopover = (
    <Popover
      open={isEditOpen}
      anchorEl={editAnchorEl}
      onClose={handleEditClose}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      slotProps={{
        paper: {
          sx: {
            backgroundColor: '#1f2937',
            border: '1px solid #374151',
            borderRadius: '8px',
            minWidth: '240px',
          },
        },
      }}
    >
      <Box className="p-4">
        <Typography variant="subtitle2" className="text-white mb-3 font-bold">
          Edit Unit
        </Typography>
        
        {/* Unit Type Select */}
        <FormControl fullWidth size="small" className="mb-3">
          <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Unit Type</InputLabel>
          <Select
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            label="Unit Type"
            MenuProps={{
              PaperProps: {
                sx: {
                  backgroundColor: '#374151',
                  maxHeight: '200px',
                },
              },
            }}
            sx={{
              color: 'white',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255,255,255,0.3)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255,255,255,0.5)',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#fbbf24',
              },
              '& .MuiSvgIcon-root': {
                color: 'white',
              },
            }}
          >
            {UNIT_NAMES_ARRAY.map((name) => (
              <MenuItem key={name} value={name} sx={{ color: 'white', '&:hover': { backgroundColor: '#4b5563' } }}>
                {name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        {/* Level Slider */}
        <Box className="mb-3">
          <Typography variant="caption" className="text-gray-400">
            Level: <span className="text-white font-bold">{editLevel}</span>
          </Typography>
          <Slider
            value={editLevel}
            onChange={(_, value) => setEditLevel(value as number)}
            min={1}
            max={10}
            step={1}
            marks
            sx={{
              color: '#fbbf24',
              '& .MuiSlider-mark': {
                backgroundColor: 'rgba(255,255,255,0.3)',
              },
              '& .MuiSlider-markActive': {
                backgroundColor: '#fbbf24',
              },
            }}
          />
        </Box>
        
        {/* Preview */}
        <Box className="mb-3 p-2 bg-gray-800 rounded flex items-center gap-2">
          <Box className="w-10 h-10 rounded overflow-hidden border border-gray-600">
            <UnitImage 
              name={editName} 
              rarity={getUnitDataByName(editName)?.rarity || unit.rarity}
              imageUrl={getUnitImagePath(editName)}
              fontSize="0.5rem"
            />
          </Box>
          <Box>
            <Typography variant="caption" className="text-white block">{editName}</Typography>
            <Typography variant="caption" className="text-gray-400">
              Lv.{editLevel} • {formatNumber(calculateUnitPower(getUnitDataByName(editName)?.rarity || unit.rarity, editLevel))} power
            </Typography>
          </Box>
        </Box>
        
        {/* Buttons */}
        <Box className="flex gap-2 justify-end">
          <Button 
            size="small" 
            onClick={handleEditClose}
            sx={{ color: 'rgba(255,255,255,0.7)' }}
          >
            Cancel
          </Button>
          <Button 
            size="small" 
            variant="contained"
            onClick={handleEditSave}
            sx={{ 
              backgroundColor: '#fbbf24',
              color: '#1f2937',
              '&:hover': { backgroundColor: '#f59e0b' },
            }}
          >
            Save
          </Button>
        </Box>
      </Box>
    </Popover>
  );

  return (
    <>
    <Tooltip
      title={tooltipContent}
      arrow
      placement="top"
        open={tooltipOpen && !isEditOpen}
      onClose={() => setTooltipOpen(false)}
      disableHoverListener
      disableFocusListener
      disableTouchListener
      componentsProps={{
        tooltip: {
          sx: {
            bgcolor: 'rgba(0, 0, 0, 0.9)',
            border: `2px solid ${getRarityBorderColor(unit.rarity)}`,
            borderRadius: '8px',
            fontSize: '0.875rem',
            maxWidth: '200px',
            pointerEvents: 'auto',
          },
        },
        arrow: {
          sx: {
            color: getRarityBorderColor(unit.rarity),
          },
        },
      }}
    >
      {cardContent}
    </Tooltip>
      {editPopover}
    </>
  );
}

const UnitCard = memo(UnitCardComponent);

export default UnitCard;

function getRarityBorderColor(rarity: UnitRarity): string {
  switch (rarity) {
    case UnitRarity.Legendary:
      return '#eab308';
    case UnitRarity.Epic:
      return '#7c3aed';
    case UnitRarity.Rare:
      return '#2563eb';
    case UnitRarity.Common:
      return '#6b7280';
    default:
      return '#6b7280';
  }
}
