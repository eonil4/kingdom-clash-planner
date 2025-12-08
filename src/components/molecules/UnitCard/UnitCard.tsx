import { memo, useState, useEffect, useRef } from 'react';
import { useDrag } from 'react-dnd';
import { Tooltip } from '@mui/material';
import type { Unit } from '../../../types';
import { UnitRarity } from '../../../types';
import { UnitLevelBadge } from '../../atoms';
import { UnitImage } from '../../atoms';
import { formatNumber } from '../../../utils/powerUtils';

interface UnitCardProps {
  unit: Unit;
  isInFormation?: boolean;
  sourceRow?: number;
  sourceCol?: number;
  onDoubleClick?: () => void;
  size?: string | number;
  showLevelBadge?: boolean;
}

const rarityColors: Record<UnitRarity, string> = {
  [UnitRarity.Common]: 'border-gray-500 bg-gray-800',
  [UnitRarity.Rare]: 'border-blue-500 bg-blue-900',
  [UnitRarity.Epic]: 'border-purple-500 bg-purple-900',
  [UnitRarity.Legendary]: 'border-yellow-500 bg-yellow-900',
};

function UnitCardComponent({ unit, isInFormation = false, sourceRow, sourceCol, onDoubleClick, size, showLevelBadge = true }: UnitCardProps) {
  const [{ isDragging }, drag] = useDrag({
    type: 'unit',
    item: { unit, isInFormation, sourceRow, sourceCol },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [tooltipOpen, setTooltipOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const imageUrl = unit.imageUrl;
  const badgeSize = isInFormation ? '35%' : '24px';
  const badgeFontSize = isInFormation ? 'clamp(0.5rem, 2vw, 0.65rem)' : '0.75rem';
  const placeholderFontSize = isInFormation ? '0.65rem' : '0.75rem';
  const cardSize = size !== undefined ? (typeof size === 'string' ? size : `${size}px`) : (isInFormation ? '90%' : '64px');

  // Close tooltip on any click outside the card
  useEffect(() => {
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
  
  const cardContent = (
    <div
      ref={combinedRef}
      className={`
        relative rounded-lg border-2 cursor-move overflow-hidden
        ${rarityColors[unit.rarity]}
        ${isDragging ? 'opacity-50' : 'opacity-100'}
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
      aria-label={`${unit.level} ${unit.name}`}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
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
    </div>
  );

  return (
    <Tooltip
      title={tooltipContent}
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
