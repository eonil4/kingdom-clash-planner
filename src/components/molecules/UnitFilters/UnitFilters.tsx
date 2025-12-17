import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import FilterListIcon from '@mui/icons-material/FilterList';
import { UnitRarity } from '../../../types';
import type { UnitFilters as UnitFiltersType } from '../../../hooks/useManageUnits';
import { TextField, Select } from '../../atoms';

interface UnitFiltersProps {
  filters: UnitFiltersType;
  onFilterChange: (field: keyof UnitFiltersType, value: string | UnitRarity) => void;
}

export default function UnitFilters({ filters, onFilterChange }: UnitFiltersProps) {
  return (
    <Box className="flex flex-wrap gap-2 items-center">
      <TextField
        size="small"
        placeholder="Filter name..."
        value={filters.name}
        onChange={(e) => onFilterChange('name', e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <FilterListIcon className="text-gray-400" fontSize="small" />
            </InputAdornment>
          ),
        }}
        className="bg-gray-700 min-w-[150px]"
        sx={{
          '& .MuiOutlinedInput-root': {
            color: 'white',
            '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
            '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.4)' },
            '&.Mui-focused fieldset': { borderColor: 'rgba(255, 255, 255, 0.6)' },
          },
          '& .MuiInputBase-input::placeholder': {
            color: 'rgba(255, 255, 255, 0.5)',
            opacity: 1,
          },
        }}
      />
      
      <TextField
        type="number"
        size="small"
        placeholder="Min"
        value={filters.levelMin}
        onChange={(e) => onFilterChange('levelMin', e.target.value)}
        inputProps={{ min: 1, max: 10 }}
        className="bg-gray-700 w-20"
        sx={{
          '& .MuiOutlinedInput-root': {
            color: 'white',
            '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
            '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.4)' },
            '&.Mui-focused fieldset': { borderColor: 'rgba(255, 255, 255, 0.6)' },
          },
        }}
      />
      <TextField
        type="number"
        size="small"
        placeholder="Max"
        value={filters.levelMax}
        onChange={(e) => onFilterChange('levelMax', e.target.value)}
        inputProps={{ min: 1, max: 10 }}
        className="bg-gray-700 w-20"
        sx={{
          '& .MuiOutlinedInput-root': {
            color: 'white',
            '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
            '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.4)' },
            '&.Mui-focused fieldset': { borderColor: 'rgba(255, 255, 255, 0.6)' },
          },
        }}
      />
      
      <Select
        value={filters.rarityMin || ''}
        onChange={(e) => onFilterChange('rarityMin', e.target.value as UnitRarity | '')}
        size="small"
        displayEmpty
        className="text-white bg-gray-700 min-w-[120px]"
        MenuProps={{
          PaperProps: {
            className: 'bg-gray-700',
          },
        }}
      >
        <MenuItem value="">All</MenuItem>
        {Object.values(UnitRarity).map((rarity) => (
          <MenuItem key={rarity} value={rarity} className="text-white hover:bg-gray-600">
            {rarity}
          </MenuItem>
        ))}
      </Select>
      <Select
        value={filters.rarityMax || ''}
        onChange={(e) => onFilterChange('rarityMax', e.target.value as UnitRarity | '')}
        size="small"
        displayEmpty
        className="text-white bg-gray-700 min-w-[120px]"
        MenuProps={{
          PaperProps: {
            className: 'bg-gray-700',
          },
        }}
      >
        <MenuItem value="">All</MenuItem>
        {Object.values(UnitRarity).map((rarity) => (
          <MenuItem key={rarity} value={rarity} className="text-white hover:bg-gray-600">
            {rarity}
          </MenuItem>
        ))}
      </Select>
      
      <TextField
        type="number"
        size="small"
        placeholder="Min"
        value={filters.countMin}
        onChange={(e) => onFilterChange('countMin', e.target.value)}
        inputProps={{ min: 1 }}
        className="bg-gray-700 w-20"
        sx={{
          '& .MuiOutlinedInput-root': {
            color: 'white',
            '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
            '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.4)' },
            '&.Mui-focused fieldset': { borderColor: 'rgba(255, 255, 255, 0.6)' },
          },
        }}
      />
      <TextField
        type="number"
        size="small"
        placeholder="Max"
        value={filters.countMax}
        onChange={(e) => onFilterChange('countMax', e.target.value)}
        inputProps={{ min: 1 }}
        className="bg-gray-700 w-20"
        sx={{
          '& .MuiOutlinedInput-root': {
            color: 'white',
            '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
            '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.4)' },
            '&.Mui-focused fieldset': { borderColor: 'rgba(255, 255, 255, 0.6)' },
          },
        }}
      />
    </Box>
  );
}
