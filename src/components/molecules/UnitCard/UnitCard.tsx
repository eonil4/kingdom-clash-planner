import { memo, useState, useRef, useLayoutEffect } from 'react';
import Tooltip from '@mui/material/Tooltip';
import type { Unit } from '../../../types';
import { UnitRarity } from '../../../types';
import { getUnitDataByName } from '../../../types/unitNames';
import { UnitLevelBadge } from '../../atoms';
import { UnitImage } from '../../atoms';
import UnitTooltip from '../UnitTooltip/UnitTooltip';
import UnitCardActions from '../UnitCardActions/UnitCardActions';
import { useUnitCardDrag } from '../../../hooks/useUnitCardDrag';

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
  const { dragRef, isDragging } = useUnitCardDrag({ unit, isInFormation, sourceRow, sourceCol });

  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const imageUrl = unit.imageUrl;
  const badgeSize = isInFormation ? '35%' : '24px';
  const badgeFontSize = isInFormation ? 'clamp(0.5rem, 2vw, 0.65rem)' : '0.75rem';
  const placeholderFontSize = isInFormation ? '0.65rem' : '0.75rem';
  const cardSize = size !== undefined ? (typeof size === 'string' ? size : `${size}px`) : (isInFormation ? '90%' : '64px');

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

  const unitData = getUnitDataByName(unit.name);
  const roles = unitData?.roles || [];

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
    dragRef(node);
  };
  
  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setTooltipOpen(false);
    if (onDoubleClick) {
      onDoubleClick();
    }
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
      
      <UnitCardActions
        isInFormation={isInFormation}
        isHovered={isHovered}
        onDoubleClick={handleRemoveClick}
        onEdit={onEdit}
        unit={unit}
      />
    </div>
  );

  return (
    <Tooltip
      title={<UnitTooltip unit={unit} roles={roles} />}
      arrow
      placement="top"
      open={tooltipOpen}
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
