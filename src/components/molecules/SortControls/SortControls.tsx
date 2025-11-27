import { MenuItem, FormControl } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { Select } from '../../atoms';
import type { SortOption } from '../../../types';

interface SortControlsProps {
  primarySort: SortOption;
  secondarySort: SortOption | null;
  tertiarySort: SortOption | null;
  onPrimaryChange: (event: SelectChangeEvent<SortOption>) => void;
  onSecondaryChange: (event: SelectChangeEvent<SortOption | ''>) => void;
  onTertiaryChange: (event: SelectChangeEvent<SortOption | ''>) => void;
}

export default function SortControls({
  primarySort,
  secondarySort,
  tertiarySort,
  onPrimaryChange,
  onSecondaryChange,
  onTertiaryChange,
}: SortControlsProps) {
  const availableOptions: SortOption[] = ['level', 'rarity', 'name'];
  
  const getAvailableSecondaryOptions = () => {
    return availableOptions.filter((option) => option !== primarySort);
  };

  const getAvailableTertiaryOptions = () => {
    return availableOptions.filter((option) => option !== primarySort && option !== secondarySort);
  };

  const getOptionLabel = (option: SortOption): string => {
    switch (option) {
      case 'level':
        return 'By Level';
      case 'rarity':
        return 'By Rarity';
      case 'name':
        return 'By Name';
      default:
        return option;
    }
  };

  return (
    <>
      <FormControl size="small" className="min-w-32">
        <Select
          value={primarySort}
          onChange={onPrimaryChange}
          className="text-white bg-gray-700"
          aria-label="Sort units by (primary)"
        >
          {availableOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {getOptionLabel(option)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl size="small" className="min-w-32">
        <Select
          value={secondarySort || ''}
          onChange={onSecondaryChange}
          className="text-white bg-gray-700"
          aria-label="Sort units by (secondary)"
          displayEmpty
        >
          <MenuItem value="">None</MenuItem>
          {getAvailableSecondaryOptions().map((option) => (
            <MenuItem key={option} value={option}>
              {getOptionLabel(option)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl size="small" className="min-w-32">
        <Select
          value={tertiarySort || ''}
          onChange={onTertiaryChange}
          className="text-white bg-gray-700"
          aria-label="Sort units by (tertiary)"
          displayEmpty
        >
          <MenuItem value="">None</MenuItem>
          {getAvailableTertiaryOptions().map((option) => (
            <MenuItem key={option} value={option}>
              {getOptionLabel(option)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </>
  );
}

