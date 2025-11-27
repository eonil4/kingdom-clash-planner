import { useState } from 'react';
import { getUnitImagePath } from '../../../utils/imageUtils';
import UnitPlaceholder from './UnitPlaceholder';
import type { UnitRarity } from '../../../types';

interface UnitImageProps {
  name: string;
  rarity: UnitRarity;
  imageUrl?: string;
  fontSize?: string;
  className?: string;
  alt?: string;
}

export default function UnitImage({ 
  name, 
  rarity, 
  imageUrl, 
  fontSize = '0.75rem',
  className = '',
  alt 
}: UnitImageProps) {
  const [imageError, setImageError] = useState(false);
  const finalImageUrl = imageUrl || getUnitImagePath(name);
  const showPlaceholder = imageError || !finalImageUrl;

  if (showPlaceholder) {
    return <UnitPlaceholder name={name} rarity={rarity} fontSize={fontSize} />;
  }

  return (
    <img
      src={finalImageUrl}
      alt={alt || name}
      className={`w-full h-full object-cover ${className}`}
      onError={() => setImageError(true)}
      loading="lazy"
    />
  );
}

