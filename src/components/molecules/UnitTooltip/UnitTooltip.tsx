import type { Unit } from '../../../types';
import { UnitRarity } from '../../../types';
import { formatNumber } from '../../../utils/powerUtils';

interface UnitTooltipProps {
  unit: Unit;
  roles: string[];
}

export default function UnitTooltip({ unit, roles }: UnitTooltipProps) {
  return (
    <div className="p-2">
      <div className="font-bold text-lg mb-1">{unit.name}</div>
      <div className="text-sm">
        <div>Level: <span className="font-bold">{unit.level}</span></div>
        <div>Rarity: <span className="font-bold">{unit.rarity}</span></div>
        <div>Power: <span className="font-bold">{formatNumber(unit.power ?? 0)}</span></div>
        {roles.length > 0 && (
          <div>Roles: <span className="font-bold">{roles.join(', ')}</span></div>
        )}
        <div className="mt-1 text-xs opacity-90">
          {unit.rarity === UnitRarity.Legendary && '⭐ Legendary Unit'}
          {unit.rarity === UnitRarity.Epic && '💜 Epic Unit'}
          {unit.rarity === UnitRarity.Rare && '💙 Rare Unit'}
          {unit.rarity === UnitRarity.Common && '⚪ Common Unit'}
        </div>
      </div>
    </div>
  );
}