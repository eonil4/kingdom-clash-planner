import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  InputAdornment,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import FilterListIcon from '@mui/icons-material/FilterList';
import type { SelectChangeEvent } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { addUnit, removeUnit, updateUnit } from '../store/reducers/unitSlice';
import type { Unit } from '../types';
import { UnitRarity } from '../types';
import { getUnitImagePath } from '../utils/imageUtils';
import { normalizeUnitName } from '../utils/unitNameUtils';
import { calculateUnitPower } from '../utils/powerUtils';
import UnitCard from './UnitCard';

interface ManageUnitsModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ManageUnitsModal({ open, onClose }: ManageUnitsModalProps) {
  const dispatch = useAppDispatch();
  const { units } = useAppSelector((state) => state.unit);
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    level: 10,
    rarity: UnitRarity.Common as UnitRarity,
    count: 1,
  });

  // Sorting state
  type SortColumn = 'name' | 'level' | 'rarity' | 'count' | null;
  type SortDirection = 'asc' | 'desc';
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Filter state - supports ranges for level, rarity, and count
  const [filters, setFilters] = useState({
    name: '',
    levelMin: '',
    levelMax: '',
    rarityMin: '' as UnitRarity | '',
    rarityMax: '' as UnitRarity | '',
    countMin: '',
    countMax: '',
  });

  const handleAddNew = () => {
    setIsAdding(true);
    setFormData({ name: '', level: 10, rarity: UnitRarity.Common, count: 1 });
  };

  const handleEdit = (unit: Unit) => {
    setEditingId(unit.id);
    // Get count of this unit in the roster
    const unitCount = units.filter((u) => u.name === unit.name && u.level === unit.level && u.rarity === unit.rarity).length;
    setFormData({
      name: unit.name,
      level: unit.level,
      rarity: unit.rarity,
      count: unitCount || 1,
    });
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      return;
    }

    // Normalize the name (remove any trailing numbers)
    const normalizedName = normalizeUnitName(formData.name.trim());
    const count = Math.max(1, Math.min(100, formData.count || 1)); // Limit between 1 and 100

    if (editingId) {
      // Update existing units - find all matching units and update/remove as needed
      const unitToUpdate = units.find((u) => u.id === editingId);
      if (unitToUpdate) {
        const matchingUnits = units.filter(
          (u) =>
            u.name === unitToUpdate.name &&
            u.level === unitToUpdate.level &&
            u.rarity === unitToUpdate.rarity
        );

        // If count is less than current, remove excess units
        if (count < matchingUnits.length) {
          const toRemove = matchingUnits.slice(count);
          toRemove.forEach((unit) => {
            dispatch(removeUnit(unit.id));
          });
        }

        // Update the first unit (or all if they should be the same)
        matchingUnits.slice(0, count).forEach((unit) => {
          dispatch(
            updateUnit({
              ...unit,
              name: normalizedName,
              level: formData.level,
              rarity: formData.rarity,
              power: calculateUnitPower(formData.rarity, formData.level),
            })
          );
        });

        // If count is more than current, add new units
        if (count > matchingUnits.length) {
          const toAdd = count - matchingUnits.length;
          for (let i = 0; i < toAdd; i++) {
            const newUnit: Unit = {
              id: `unit-${Date.now()}-${i}`,
              name: normalizedName,
              level: formData.level,
              rarity: formData.rarity,
              power: calculateUnitPower(formData.rarity, formData.level),
              imageUrl: getUnitImagePath(normalizedName),
            };
            dispatch(addUnit(newUnit));
          }
        }
      }
      setEditingId(null);
    } else {
      // Add new units based on count
      for (let i = 0; i < count; i++) {
        const newUnit: Unit = {
          id: `unit-${Date.now()}-${i}`,
          name: normalizedName,
          level: formData.level,
          rarity: formData.rarity,
          power: calculateUnitPower(formData.rarity, formData.level),
          imageUrl: getUnitImagePath(normalizedName),
        };
        dispatch(addUnit(newUnit));
      }
      setIsAdding(false);
    }
    
    setFormData({ name: '', level: 10, rarity: UnitRarity.Common, count: 1 });
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: '', level: 10, rarity: UnitRarity.Common, count: 1 });
  };

  const handleDelete = (unitId: string) => {
    if (window.confirm('Are you sure you want to remove this unit from the roster?')) {
      dispatch(removeUnit(unitId));
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNameChange = (event: SelectChangeEvent<string>) => {
    setFormData((prev) => ({ ...prev, name: event.target.value }));
  };

  const handleRarityChange = (event: SelectChangeEvent<UnitRarity>) => {
    setFormData((prev) => ({ ...prev, rarity: event.target.value as UnitRarity }));
  };

  // Get all unique unit names from existing units and predefined list
  const predefinedUnitNames = [
    // Legendary
    'PALADIN', 'HUNTRESS', 'BONEBREAKER', 'SHAMAN', 'HEADLESS', 'NIGHT HUNTER',
    'STONE GOLEM', 'GIANT TOAD', 'PHOENIX',
    // Epic
    'NECROMANCER', 'BUTCHER', 'UNDEAD MAGE', 'ALCHEMIST', 'IMP', 'MONK',
    'MAGIC ARCHER', 'PYROTECHNICIAN', 'STORM MISTRESSES', 'SORCERER\'S APPRENTICES',
    'LAVA GOLEM', 'ROYAL GUARD', 'IMMORTAL', 'AIR ELEMENTAL',
    // Rare
    'ARCHERS', 'INFANTRY', 'IRON GUARDS', 'BOMBERS', 'CATAPULT', 'ASSASSINS',
    'LANCER', 'BATTLE GOLEM', 'GRAVEDIGGER',
    // Common
    'BONE WARRIOR', 'BONE SPEARTHROWER', 'CURSED CATAPULT', 'EXPLOSIVE SPIDER',
    // Additional common units
    'ARCHER', 'WARRIOR', 'KNIGHT', 'MAGE', 'GOLEM', 'ELEMENTAL', 'DEMON',
    'SKELETON', 'GUARD', 'SOLDIER',
  ];

  // Get existing unit names and normalize them (remove numbers)
  const existingUnitNames = Array.from(
    new Set(units.map((u) => normalizeUnitName(u.name)))
  );
  
  // Combine and deduplicate, ensuring we use normalized names
  const allUnitNames = Array.from(
    new Set([
      ...predefinedUnitNames.map(normalizeUnitName),
      ...existingUnitNames,
    ])
  ).sort();

  // Get unique units (by name) for the table
  let uniqueUnits = Array.from(
    new Map(units.map((unit) => [unit.name, unit])).values()
  );

  // Count occurrences of each unit
  const unitCounts = units.reduce((acc, unit) => {
    acc[unit.name] = (acc[unit.name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Rarity order for range filtering
  const rarityOrder: Record<UnitRarity, number> = {
    [UnitRarity.Common]: 0,
    [UnitRarity.Rare]: 1,
    [UnitRarity.Epic]: 2,
    [UnitRarity.Legendary]: 3,
  };

  // Apply filters
  uniqueUnits = uniqueUnits.filter((unit) => {
    const count = unitCounts[unit.name] || 1;
    
    // Name filter (exact match search)
    if (filters.name && !unit.name.toLowerCase().includes(filters.name.toLowerCase())) {
      return false;
    }
    
    // Level range filter
    if (filters.levelMin && filters.levelMin !== '' && unit.level < parseInt(filters.levelMin)) {
      return false;
    }
    if (filters.levelMax && filters.levelMax !== '' && unit.level > parseInt(filters.levelMax)) {
      return false;
    }
    
    // Rarity range filter
    if (filters.rarityMin) {
      const unitRarityOrder = rarityOrder[unit.rarity];
      const minRarityOrder = rarityOrder[filters.rarityMin];
      if (unitRarityOrder < minRarityOrder) {
        return false;
      }
    }
    if (filters.rarityMax) {
      const unitRarityOrder = rarityOrder[unit.rarity];
      const maxRarityOrder = rarityOrder[filters.rarityMax];
      if (unitRarityOrder > maxRarityOrder) {
        return false;
      }
    }
    
    // Count range filter
    if (filters.countMin && filters.countMin !== '' && count < parseInt(filters.countMin)) {
      return false;
    }
    if (filters.countMax && filters.countMax !== '' && count > parseInt(filters.countMax)) {
      return false;
    }
    
    return true;
  });

  // Apply sorting
  if (sortColumn) {
    uniqueUnits = [...uniqueUnits].sort((a, b) => {
      let comparison = 0;

      switch (sortColumn) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'level':
          comparison = a.level - b.level;
          break;
        case 'rarity':
          comparison = rarityOrder[a.rarity] - rarityOrder[b.rarity];
          break;
        case 'count':
          comparison = (unitCounts[a.name] || 1) - (unitCounts[b.name] || 1);
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  } else {
    // Default sort by name
    uniqueUnits = [...uniqueUnits].sort((a, b) => a.name.localeCompare(b.name));
  }

  // Handle column sort
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New column, default to ascending
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Handle filter changes
  const handleFilterChange = (field: keyof typeof filters, value: string | UnitRarity) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({ 
      name: '', 
      levelMin: '', 
      levelMax: '', 
      rarityMin: '' as UnitRarity | '', 
      rarityMax: '' as UnitRarity | '', 
      countMin: '', 
      countMax: '' 
    });
  };

  // Check if any filter is active
  const hasActiveFilters = 
    filters.name || 
    filters.levelMin || 
    filters.levelMax || 
    filters.rarityMin || 
    filters.rarityMax || 
    filters.countMin || 
    filters.countMax;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        className: 'bg-gray-800',
      }}
    >
      <DialogTitle className="flex items-center justify-between bg-gray-900">
        <Typography variant="h6" className="text-white font-bold">
          Manage Units
        </Typography>
        <IconButton
          onClick={onClose}
          className="text-white hover:bg-gray-700"
          aria-label="Close manage units modal"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent className="bg-gray-800">
        <Box className="mb-4">
          <Box className="flex items-center justify-between mb-4">
            <Typography variant="h6" className="text-white">
              Unit Roster ({units.length} total units)
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddNew}
              className="bg-green-600 hover:bg-green-700"
              disabled={isAdding || editingId !== null}
            >
              Add New Unit
            </Button>
          </Box>

          {(isAdding || editingId) && (
            <Box className="bg-gray-700 p-4 rounded-lg mb-4">
              <Typography variant="subtitle1" className="text-white mb-3">
                {editingId ? 'Edit Unit' : 'Add New Unit'}
              </Typography>
              <Box className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <FormControl fullWidth className="bg-gray-600">
                  <InputLabel className="text-gray-300">Unit Name</InputLabel>
                  <Select
                    value={formData.name}
                    onChange={handleNameChange}
                    className="text-white"
                    label="Unit Name"
                    MenuProps={{
                      PaperProps: {
                        className: 'bg-gray-700 max-h-60',
                      },
                    }}
                  >
                    {allUnitNames.map((name) => (
                      <MenuItem key={name} value={name} className="text-white hover:bg-gray-600">
                        {name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="Level"
                  type="number"
                  value={formData.level}
                  onChange={(e) => handleInputChange('level', parseInt(e.target.value) || 1)}
                  inputProps={{ min: 1, max: 10 }}
                  fullWidth
                  className="bg-gray-600"
                  InputProps={{
                    className: 'text-white',
                  }}
                  InputLabelProps={{
                    className: 'text-gray-300',
                  }}
                />
                <TextField
                  label="Count"
                  type="number"
                  value={formData.count}
                  onChange={(e) => handleInputChange('count', parseInt(e.target.value) || 1)}
                  inputProps={{ min: 1, max: 100 }}
                  fullWidth
                  className="bg-gray-600"
                  InputProps={{
                    className: 'text-white',
                  }}
                  InputLabelProps={{
                    className: 'text-gray-300',
                  }}
                  helperText={editingId ? 'Update count of matching units' : 'Number of units to add'}
                  FormHelperTextProps={{
                    className: 'text-gray-400',
                  }}
                />
                <FormControl fullWidth className="bg-gray-600">
                  <InputLabel className="text-gray-300">Rarity</InputLabel>
                  <Select
                    value={formData.rarity}
                    onChange={handleRarityChange}
                    className="text-white"
                    label="Rarity"
                  >
                    <MenuItem value={UnitRarity.Common}>Common</MenuItem>
                    <MenuItem value={UnitRarity.Rare}>Rare</MenuItem>
                    <MenuItem value={UnitRarity.Epic}>Epic</MenuItem>
                    <MenuItem value={UnitRarity.Legendary}>Legendary</MenuItem>
                  </Select>
                </FormControl>
                <Box className="flex gap-2">
                  <Button
                    variant="contained"
                    onClick={handleSave}
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={!formData.name.trim()}
                  >
                    Save
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    className="text-white border-gray-500"
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            </Box>
          )}

          <TableContainer component={Paper} className="bg-gray-700">
            <Table>
              <TableHead>
                <TableRow className="bg-gray-900">
                  <TableCell className="text-white font-bold">Preview</TableCell>
                  <TableCell 
                    className="text-white font-bold cursor-pointer hover:bg-gray-800 select-none"
                    onClick={() => handleSort('name')}
                  >
                    <Box className="flex items-center gap-1">
                      Name
                      {sortColumn === 'name' && (
                        sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell 
                    className="text-white font-bold cursor-pointer hover:bg-gray-800 select-none"
                    onClick={() => handleSort('level')}
                  >
                    <Box className="flex items-center gap-1">
                      Level
                      {sortColumn === 'level' && (
                        sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell 
                    className="text-white font-bold cursor-pointer hover:bg-gray-800 select-none"
                    onClick={() => handleSort('rarity')}
                  >
                    <Box className="flex items-center gap-1">
                      Rarity
                      {sortColumn === 'rarity' && (
                        sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell 
                    className="text-white font-bold cursor-pointer hover:bg-gray-800 select-none"
                    onClick={() => handleSort('count')}
                  >
                    <Box className="flex items-center gap-1">
                      Count
                      {sortColumn === 'count' && (
                        sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell className="text-white font-bold">Actions</TableCell>
                </TableRow>
                <TableRow className="bg-gray-800">
                  <TableCell></TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      placeholder="Filter name..."
                      value={filters.name}
                      onChange={(e) => handleFilterChange('name', e.target.value)}
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
                  </TableCell>
                  <TableCell>
                    <Box className="flex items-center gap-1">
                      <TextField
                        size="small"
                        placeholder="Min"
                        type="number"
                        value={filters.levelMin}
                        onChange={(e) => handleFilterChange('levelMin', e.target.value)}
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
                        onChange={(e) => handleFilterChange('levelMax', e.target.value)}
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
                  </TableCell>
                  <TableCell>
                    <Box className="flex items-center gap-1">
                      <FormControl size="small" className="bg-gray-700" sx={{ minWidth: '80px' }}>
                        <Select
                          value={filters.rarityMin}
                          onChange={(e) => handleFilterChange('rarityMin', e.target.value as UnitRarity | '')}
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
                          onChange={(e) => handleFilterChange('rarityMax', e.target.value as UnitRarity | '')}
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
                  </TableCell>
                  <TableCell>
                    <Box className="flex items-center gap-1">
                      <TextField
                        size="small"
                        placeholder="Min"
                        type="number"
                        value={filters.countMin}
                        onChange={(e) => handleFilterChange('countMin', e.target.value)}
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
                        onChange={(e) => handleFilterChange('countMax', e.target.value)}
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
                  </TableCell>
                  <TableCell>
                    {hasActiveFilters && (
                      <Button
                        size="small"
                        onClick={handleClearFilters}
                        className="text-gray-300 hover:text-white text-xs"
                      >
                        Clear
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {uniqueUnits.map((unit) => (
                  <TableRow key={unit.id} className="hover:bg-gray-600">
                    <TableCell>
                      <div className="w-12 h-12">
                        <UnitCard unit={unit} />
                      </div>
                    </TableCell>
                    <TableCell className="text-white font-semibold">
                      {unit.name}
                    </TableCell>
                    <TableCell className="text-white">
                      {unit.level}
                    </TableCell>
                    <TableCell className="text-white">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${
                          unit.rarity === UnitRarity.Legendary
                            ? 'bg-yellow-600 text-yellow-100'
                            : unit.rarity === UnitRarity.Epic
                            ? 'bg-purple-600 text-purple-100'
                            : unit.rarity === UnitRarity.Rare
                            ? 'bg-blue-600 text-blue-100'
                            : 'bg-gray-600 text-gray-100'
                        }`}
                      >
                        {unit.rarity}
                      </span>
                    </TableCell>
                    <TableCell className="text-white">
                      {unitCounts[unit.name] || 1}
                    </TableCell>
                    <TableCell>
                      <Box className="flex gap-2">
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(unit)}
                          className="text-blue-400 hover:bg-blue-900"
                          aria-label={`Edit ${unit.name}`}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(unit.id)}
                          className="text-red-400 hover:bg-red-900"
                          aria-label={`Delete ${unit.name}`}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {uniqueUnits.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-400 py-8">
                      No units in roster. Add your first unit!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </DialogContent>
      
      <DialogActions className="bg-gray-900">
        <Button
          onClick={onClose}
          className="text-white hover:bg-gray-700"
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

