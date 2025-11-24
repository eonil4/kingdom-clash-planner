import { Box, TextField, InputAdornment, FormControl, Select, MenuItem } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import { UnitRarity } from '../../types';
import type { UnitFilters as UnitFiltersType } from '../../hooks/useManageUnits';

interface UnitFiltersProps {
    filters: UnitFiltersType;
    onFilterChange: (field: keyof UnitFiltersType, value: string | UnitRarity) => void;
}

export default function UnitFilters({ filters, onFilterChange }: UnitFiltersProps) {
    return (
        <>
            {/* Name Filter */}
            <TextField
                size="small"
                placeholder="Filter name..."
                value={filters.name}
                onChange={(e) => onFilterChange('name', e.target.value)}
                className="bg-gray-700"
                InputProps={{
                    className: 'text-white text-sm',
                    startAdornment: (
                        <InputAdornment position="start">
                            <FilterListIcon className="text-gray-400" fontSize="small" />
                        </InputAdornment>
                    ),
                }}
                sx={{
                    '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.23)',
                        },
                        '&:hover fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.4)',
                        },
                    },
                }}
            />

            {/* Level Range Filter */}
            <Box className="flex items-center gap-1">
                <TextField
                    size="small"
                    placeholder="Min"
                    type="number"
                    value={filters.levelMin}
                    onChange={(e) => onFilterChange('levelMin', e.target.value)}
                    className="bg-gray-700"
                    InputProps={{
                        className: 'text-white text-xs',
                    }}
                    inputProps={{ min: 1, max: 10 }}
                    sx={{
                        width: '60px',
                        '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                                borderColor: 'rgba(255, 255, 255, 0.23)',
                            },
                            '&:hover fieldset': {
                                borderColor: 'rgba(255, 255, 255, 0.4)',
                            },
                        },
                    }}
                />
                <span className="text-gray-400 text-xs">-</span>
                <TextField
                    size="small"
                    placeholder="Max"
                    type="number"
                    value={filters.levelMax}
                    onChange={(e) => onFilterChange('levelMax', e.target.value)}
                    className="bg-gray-700"
                    InputProps={{
                        className: 'text-white text-xs',
                    }}
                    inputProps={{ min: 1, max: 10 }}
                    sx={{
                        width: '60px',
                        '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                                borderColor: 'rgba(255, 255, 255, 0.23)',
                            },
                            '&:hover fieldset': {
                                borderColor: 'rgba(255, 255, 255, 0.4)',
                            },
                        },
                    }}
                />
            </Box>

            {/* Rarity Range Filter */}
            <Box className="flex items-center gap-1">
                <FormControl size="small" className="bg-gray-700" sx={{ minWidth: '80px' }}>
                    <Select
                        value={filters.rarityMin}
                        onChange={(e) => onFilterChange('rarityMin', e.target.value as UnitRarity | '')}
                        displayEmpty
                        className="text-white text-xs"
                        sx={{
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(255, 255, 255, 0.23)',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(255, 255, 255, 0.4)',
                            },
                        }}
                    >
                        <MenuItem value="">Min</MenuItem>
                        <MenuItem value={UnitRarity.Common}>Common</MenuItem>
                        <MenuItem value={UnitRarity.Rare}>Rare</MenuItem>
                        <MenuItem value={UnitRarity.Epic}>Epic</MenuItem>
                        <MenuItem value={UnitRarity.Legendary}>Legendary</MenuItem>
                    </Select>
                </FormControl>
                <span className="text-gray-400 text-xs">-</span>
                <FormControl size="small" className="bg-gray-700" sx={{ minWidth: '80px' }}>
                    <Select
                        value={filters.rarityMax}
                        onChange={(e) => onFilterChange('rarityMax', e.target.value as UnitRarity | '')}
                        displayEmpty
                        className="text-white text-xs"
                        sx={{
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(255, 255, 255, 0.23)',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(255, 255, 255, 0.4)',
                            },
                        }}
                    >
                        <MenuItem value="">Max</MenuItem>
                        <MenuItem value={UnitRarity.Common}>Common</MenuItem>
                        <MenuItem value={UnitRarity.Rare}>Rare</MenuItem>
                        <MenuItem value={UnitRarity.Epic}>Epic</MenuItem>
                        <MenuItem value={UnitRarity.Legendary}>Legendary</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {/* Count Range Filter */}
            <Box className="flex items-center gap-1">
                <TextField
                    size="small"
                    placeholder="Min"
                    type="number"
                    value={filters.countMin}
                    onChange={(e) => onFilterChange('countMin', e.target.value)}
                    className="bg-gray-700"
                    InputProps={{
                        className: 'text-white text-xs',
                    }}
                    inputProps={{ min: 1 }}
                    sx={{
                        width: '60px',
                        '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                                borderColor: 'rgba(255, 255, 255, 0.23)',
                            },
                            '&:hover fieldset': {
                                borderColor: 'rgba(255, 255, 255, 0.4)',
                            },
                        },
                    }}
                />
                <span className="text-gray-400 text-xs">-</span>
                <TextField
                    size="small"
                    placeholder="Max"
                    type="number"
                    value={filters.countMax}
                    onChange={(e) => onFilterChange('countMax', e.target.value)}
                    className="bg-gray-700"
                    InputProps={{
                        className: 'text-white text-xs',
                    }}
                    inputProps={{ min: 1 }}
                    sx={{
                        width: '60px',
                        '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                                borderColor: 'rgba(255, 255, 255, 0.23)',
                            },
                            '&:hover fieldset': {
                                borderColor: 'rgba(255, 255, 255, 0.4)',
                            },
                        },
                    }}
                />
            </Box>
        </>
    );
}
