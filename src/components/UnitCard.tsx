import { useState, useEffect, useRef } from 'react';
import { useDrag } from 'react-dnd';
import { Tooltip } from '@mui/material';
import type { Unit } from '../types';
import { UnitRarity } from '../types';
import { getUnitImagePath } from '../utils/imageUtils';

interface UnitCardProps {
  unit: Unit;
  isInFormation?: boolean;
  sourceRow?: number;
  sourceCol?: number;
  onDoubleClick?: () => void;
}

const rarityColors: Record<UnitRarity, string> = {
  [UnitRarity.Common]: 'border-gray-500 bg-gray-800',
  [UnitRarity.Rare]: 'border-blue-500 bg-blue-900',
  [UnitRarity.Epic]: 'border-purple-500 bg-purple-900',
  [UnitRarity.Legendary]: 'border-yellow-500 bg-yellow-900',
};

const rarityBgColors: Record<UnitRarity, string> = {
  [UnitRarity.Common]: '#4a5568',
  [UnitRarity.Rare]: '#2563eb',
  [UnitRarity.Epic]: '#7c3aed',
  [UnitRarity.Legendary]: '#eab308',
};

export default function UnitCard({ unit, isInFormation = false, sourceRow, sourceCol, onDoubleClick }: UnitCardProps) {
  const [{ isDragging }, drag] = useDrag({
    type: 'unit',
    item: { unit, isInFormation, sourceRow, sourceCol },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [imageError, setImageError] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const imageUrl = unit.imageUrl || getUnitImagePath(unit.name);
  const showPlaceholder = imageError || !imageUrl;

  // Close tooltip on any click outside the card
  useEffect(() => {
    const handleClickAnywhere = (event: MouseEvent) => {
      if (tooltipOpen && cardRef.current) {
        // Check if the click target is within the card element
        const target = event.target as Node;
        if (!cardRef.current.contains(target)) {
          setTooltipOpen(false);
        }
      }
    };

    if (tooltipOpen) {
      // Use 'click' event instead of 'mousedown' to fire after React's onClick
      // This ensures handleCardClick executes first and can toggle the tooltip
      document.addEventListener('click', handleClickAnywhere, true);
      return () => {
        document.removeEventListener('click', handleClickAnywhere, true);
      };
    }
  }, [tooltipOpen]);

  const tooltipContent = (
    <div className="p-2">
      <div className="font-bold text-lg mb-1">{unit.name}</div>
      <div className="text-sm">
        <div>Level: <span className="font-bold">{unit.level}</span></div>
        <div>Rarity: <span className="font-bold">{unit.rarity}</span></div>
        <div className="mt-1 text-xs opacity-90">
          {unit.rarity === UnitRarity.Legendary && '⭐ Legendary Unit'}
          {unit.rarity === UnitRarity.Epic && '💜 Epic Unit'}
          {unit.rarity === UnitRarity.Rare && '💙 Rare Unit'}
          {unit.rarity === UnitRarity.Common && '⚪ Common Unit'}
        </div>
      </div>
    </div>
  );

  // For formation tiles, use percentage to fill the cell dynamically
  // For unit list, use fixed size
  const cardSize = isInFormation ? '90%' : '64px';
  // Badge size scales with card size - use percentage for formation, fixed for list
  const badgeSize = isInFormation ? '35%' : '24px';
  const badgeFontSize = isInFormation ? 'clamp(0.5rem, 2vw, 0.65rem)' : '0.75rem';

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDragging) return;
    
    // Toggle tooltip on single click
    // The document click listener will check if click is outside the card
    setTooltipOpen((prev) => !prev);
  };

  const cardContent = (
    <div
      ref={(node) => {
        cardRef.current = node;
        const dragRef = drag as unknown as React.Ref<HTMLDivElement>;
        if (typeof dragRef === 'function') {
          dragRef(node);
        } else if (dragRef && typeof dragRef === 'object' && 'current' in dragRef) {
          (dragRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }
      }}
      className={`
        relative rounded-lg border-2 cursor-move overflow-hidden
        ${rarityColors[unit.rarity]}
        ${isDragging ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}
        transition-all duration-200
        ${isInFormation ? '' : 'hover:scale-105 hover:shadow-lg'}
        active:scale-95
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
      aria-label={`${unit.name} level ${unit.level}`}
      onClick={handleCardClick}
      onDoubleClick={(e) => {
        e.stopPropagation();
        setTooltipOpen(false);
        if (onDoubleClick) {
          onDoubleClick();
        }
      }}
    >
      {showPlaceholder ? (
        <div
          className="w-full h-full flex items-center justify-center text-white font-bold"
          style={{ 
            backgroundColor: rarityBgColors[unit.rarity],
            fontSize: isInFormation ? '0.65rem' : '0.75rem',
          }}
        >
          {unit.name.charAt(0)}
        </div>
      ) : (
        <img
          src={imageUrl}
          alt={unit.name}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
          loading="lazy"
        />
      )}
      <div
        className={`
          absolute -top-0.5 -right-0.5 flex items-center justify-center
          bg-blue-600 border-2 border-blue-400 shadow-lg
        `}
        style={{
          width: badgeSize,
          height: badgeSize,
          minWidth: isInFormation ? '12px' : undefined,
          minHeight: isInFormation ? '12px' : undefined,
          clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
        }}
      >
        <span className={`font-bold text-white`} style={{ fontSize: badgeFontSize }}>
          {unit.level}
        </span>
      </div>
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

function getRarityBorderColor(rarity: UnitRarity): string {
  switch (rarity) {
    case UnitRarity.Legendary:
      return '#eab308'; // Gold
    case UnitRarity.Epic:
      return '#7c3aed'; // Purple
    case UnitRarity.Rare:
      return '#2563eb'; // Blue
    case UnitRarity.Common:
      return '#6b7280'; // Gray
    default:
      return '#6b7280';
  }
}

