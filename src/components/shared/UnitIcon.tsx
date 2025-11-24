import { useState } from 'react';
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

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageError(false);
  };

  // Reset error when name changes (component remounts due to key prop)
  // Using key={name} in the img element ensures state resets on name change

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
      key={name}
      src={imageUrl}
      alt={name}
      onError={handleImageError}
      onLoad={handleImageLoad}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
      }}
    />
  );
}

