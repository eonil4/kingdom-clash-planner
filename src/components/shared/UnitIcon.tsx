import { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { UnitRarity } from '../../types';
import { getUnitImagePath } from '../../utils/imageUtils';

interface UnitIconProps {
  name: string;
  rarity: UnitRarity;
}

const rarityColors: Record<UnitRarity, string> = {
  [UnitRarity.Common]: '#4a5568',
  [UnitRarity.Rare]: '#2563eb',
  [UnitRarity.Epic]: '#7c3aed',
  [UnitRarity.Legendary]: '#eab308',
};

export default function UnitIcon({ name, rarity }: UnitIconProps) {
  const [imageError, setImageError] = useState(false);
  const imageUrl = getUnitImagePath(name);
  const showPlaceholder = imageError || !imageUrl;

  useEffect(() => {
    setImageError(false);
  }, [name]);

  if (showPlaceholder) {
    const initial = name.charAt(0).toUpperCase();
    
    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          backgroundColor: rarityColors[rarity],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '20px',
          fontWeight: 'bold',
        }}
      >
        {initial}
      </Box>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={name}
      onError={() => setImageError(true)}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
      }}
    />
  );
}

