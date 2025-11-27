import { UnitRarity } from '../../../types';

interface UnitPlaceholderProps {
  name: string;
  rarity: UnitRarity;
  fontSize?: string;
}

const rarityBgColors: Record<UnitRarity, string> = {
  [UnitRarity.Common]: '#4a5568',
  [UnitRarity.Rare]: '#2563eb',
  [UnitRarity.Epic]: '#7c3aed',
  [UnitRarity.Legendary]: '#eab308',
};

export default function UnitPlaceholder({ name, rarity, fontSize = '0.75rem' }: UnitPlaceholderProps) {
  return (
    <div
      className="w-full h-full flex items-center justify-center text-white font-bold"
      style={{ 
        backgroundColor: rarityBgColors[rarity],
        fontSize,
      }}
    >
      {name.charAt(0)}
    </div>
  );
}

