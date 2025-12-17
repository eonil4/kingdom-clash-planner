import { use, useState, Suspense } from 'react';
import { preloadUnitImage } from '../../../utils/imageUtils';
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

const imagePromiseCache = new Map<string, Promise<string>>();

function getImagePromise(name: string): Promise<string> {
  if (!imagePromiseCache.has(name)) {
    imagePromiseCache.set(name, preloadUnitImage(name));
  }
  return imagePromiseCache.get(name)!;
}

function AsyncUnitImage({ 
  name, 
  rarity, 
  className = '',
  alt,
  fontSize = '0.75rem'
}: Omit<UnitImageProps, 'imageUrl'>) {
  const resolvedUrl = use(getImagePromise(name));
  const [hasError, setHasError] = useState(false);

  /* istanbul ignore next -- @preserve Suspense + use() hook error paths difficult to test */
  if (hasError) {
    return <UnitPlaceholder name={name} rarity={rarity} fontSize={fontSize} />;
  }

  return (
    <img
      key={resolvedUrl}
      src={resolvedUrl}
      alt={alt || name}
      className={`w-full h-full object-cover ${className}`}
      onError={/* istanbul ignore next -- @preserve */ () => setHasError(true)}
      loading="lazy"
    />
  );
}

export default function UnitImage({ 
  name, 
  rarity, 
  imageUrl, 
  fontSize = '0.75rem',
  className = '',
  alt 
}: UnitImageProps) {
  const [hasError, setHasError] = useState(false);

  if (imageUrl) {
    if (hasError) {
      return <UnitPlaceholder name={name} rarity={rarity} fontSize={fontSize} />;
    }
    return (
      <img
        key={imageUrl}
        src={imageUrl}
        alt={alt || name}
        className={`w-full h-full object-cover ${className}`}
        onError={() => setHasError(true)}
        loading="lazy"
      />
    );
  }

  return (
    <Suspense fallback={<UnitPlaceholder name={name} rarity={rarity} fontSize={fontSize} />}>
      <AsyncUnitImage 
        name={name} 
        rarity={rarity} 
        className={className} 
        alt={alt}
        fontSize={fontSize}
      />
    </Suspense>
  );
}
