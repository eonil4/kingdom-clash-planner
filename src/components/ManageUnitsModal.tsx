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
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
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
import { UNIT_NAMES_ARRAY, getUnitDataByName } from '../types/unitNames';
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
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [rowEditData, setRowEditData] = useState<Record<string, { name: string; level: number; rarity: UnitRarity; count: number }>>({});
  const [formData, setFormData] = useState({
    name: '',
    level: 10,
    rarity: UnitRarity.Common as UnitRarity,
    count: 1,
  });
  const [selectedLevels, setSelectedLevels] = useState<number[]>([]);
  const [levelCounts, setLevelCounts] = useState<Record<number, number>>({});

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
    setSelectedLevels([]);
    setLevelCounts({});
  };

  const handleRowEdit = (unit: Unit) => {
    const unitCount = units.filter((u) => u.name === unit.name && u.level === unit.level && u.rarity === unit.rarity).length;
    setEditingRowId(unit.id);
    setRowEditData({
      [unit.id]: {
        name: unit.name,
        level: unit.level,
        rarity: unit.rarity,
        count: unitCount || 1,
      },
    });
  };

  const handleRowEditChange = (unitId: string, field: string, value: string | number) => {
    setRowEditData((prev) => ({
      ...prev,
      [unitId]: {
        ...prev[unitId],
        [field]: value,
      },
    }));
  };

  const handleRowSave = (unit: Unit) => {
    if (!editingRowId || !rowEditData[editingRowId]) return;

    const editData = rowEditData[editingRowId];
    const normalizedName = normalizeUnitName(editData.name.trim());
    const maxUnits = 49; // Maximum capacity of 7x7 formation grid
    const count = Math.max(1, Math.min(maxUnits, editData.count || 1));
    
    // Get unit data to ensure correct rarity and power calculation
    const unitData = getUnitDataByName(normalizedName);
    const finalRarity = unitData ? unitData.rarity : editData.rarity;
    const getPower = unitData ? unitData.getPower : (level: number) => calculateUnitPower(finalRarity, level);

    // Find all matching units
    const matchingUnits = units.filter(
      (u) =>
        u.name === unit.name &&
        u.level === unit.level &&
        u.rarity === unit.rarity
    );

    // If count is less than current, remove excess units
    if (count < matchingUnits.length) {
      const toRemove = matchingUnits.slice(count);
      toRemove.forEach((u) => {
        dispatch(removeUnit(u.id));
      });
    }

    // Update the first unit (or all if they should be the same)
    matchingUnits.slice(0, count).forEach((u) => {
      dispatch(
        updateUnit({
          ...u,
          name: normalizedName,
          level: editData.level,
          rarity: finalRarity,
          power: getPower(editData.level),
        })
      );
    });

    // If count is more than current, add new units
    if (count > matchingUnits.length) {
      const toAdd = count - matchingUnits.length;
      const currentCount = units.length;
      const maxUnits = 49; // Maximum capacity of 7x7 formation grid
      const available = maxUnits - currentCount;
      
      if (available <= 0) {
        alert(`Cannot add more units. Maximum unit count is ${maxUnits}.`);
        return;
      }
      
      const unitsToAdd = Math.min(toAdd, available);
      if (unitsToAdd < toAdd) {
        alert(`Cannot add ${toAdd} units. Maximum unit count is ${maxUnits}. You can add ${available} more unit${available !== 1 ? 's' : ''}.`);
      }
      
      for (let i = 0; i < unitsToAdd; i++) {
        const newUnit: Unit = {
          id: `unit-${Date.now()}-${i}-${Math.random()}`,
          name: normalizedName,
          level: editData.level,
          rarity: finalRarity,
          power: getPower(editData.level),
          imageUrl: getUnitImagePath(normalizedName),
        };
        dispatch(addUnit(newUnit));
      }
    }

    setEditingRowId(null);
    setRowEditData({});
  };

  const handleRowCancel = () => {
    setEditingRowId(null);
    setRowEditData({});
  };

  const handleClearRoster = () => {
    if (window.confirm('Are you sure you want to clear all units from the roster? This action cannot be undone.')) {
      // Remove all units
      units.forEach((unit) => {
        dispatch(removeUnit(unit.id));
      });
    }
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      return;
    }

    // Normalize the name (remove any trailing numbers)
    const normalizedName = normalizeUnitName(formData.name.trim());
    
    // Get unit data to ensure correct rarity and power calculation
    const unitData = getUnitDataByName(normalizedName);
    const finalRarity = unitData ? unitData.rarity : formData.rarity;
    const getPower = unitData ? unitData.getPower : (level: number) => calculateUnitPower(finalRarity, level);

    if (editingId) {
      // Update existing units - update all matching units
      const unitToUpdate = units.find((u) => u.id === editingId);
      if (unitToUpdate) {
        const matchingUnits = units.filter(
          (u) =>
            u.name === unitToUpdate.name &&
            u.level === unitToUpdate.level &&
            u.rarity === unitToUpdate.rarity
        );

        // Update all matching units
        matchingUnits.forEach((unit) => {
          dispatch(
            updateUnit({
              ...unit,
              name: normalizedName,
              level: formData.level,
              rarity: finalRarity,
              power: getPower(formData.level),
            })
          );
        });
      }
      setEditingId(null);
    } else {
      // Add new units based on selected levels and their individual counts
      if (selectedLevels.length === 0) {
        return; // Require at least one level to be selected
      }
      
      // Calculate total units to add
      const totalToAdd = selectedLevels.reduce((sum, level) => sum + (levelCounts[level] || 1), 0);
      const currentCount = units.length;
      const maxUnits = 49; // Maximum capacity of 7x7 formation grid
      
      if (currentCount + totalToAdd > maxUnits) {
        const available = maxUnits - currentCount;
        alert(`Cannot add ${totalToAdd} units. Maximum unit count is ${maxUnits}. You can add ${available} more unit${available !== 1 ? 's' : ''}.`);
        return;
      }
      
      selectedLevels.forEach((level) => {
        const levelCount = levelCounts[level] || 1;
        for (let i = 0; i < levelCount; i++) {
          const newUnit: Unit = {
            id: `unit-${Date.now()}-${level}-${i}-${Math.random()}`,
            name: normalizedName,
            level: level,
            rarity: finalRarity,
            power: getPower(level),
            imageUrl: getUnitImagePath(normalizedName),
          };
          dispatch(addUnit(newUnit));
        }
      });
      setIsAdding(false);
    }
    
    setFormData({ name: '', level: 10, rarity: UnitRarity.Common, count: 1 });
    setSelectedLevels([]);
    setLevelCounts({});
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: '', level: 10, rarity: UnitRarity.Common, count: 1 });
    setSelectedLevels([]);
    setLevelCounts({});
  };

  const handleLevelToggle = (level: number) => {
    setSelectedLevels((prev) => {
      if (prev.includes(level)) {
        // Remove level and its count
        const newCounts = { ...levelCounts };
        delete newCounts[level];
        setLevelCounts(newCounts);
        return prev.filter((l) => l !== level);
      } else {
        // Add level with default count of 1
        setLevelCounts((prev) => ({ ...prev, [level]: 1 }));
        return [...prev, level].sort((a, b) => a - b);
      }
    });
  };

  const handleLevelCountChange = (level: number, count: number) => {
    setLevelCounts((prev) => ({
      ...prev,
      [level]: Math.max(1, Math.min(100, count || 1)),
    }));
  };

  const handleSelectAllLevels = () => {
    if (selectedLevels.length === 10) {
      setSelectedLevels([]);
      setLevelCounts({});
    } else {
      const allLevels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      setSelectedLevels(allLevels);
      // Set default count of 1 for all levels that don't have a count yet
      const defaultCounts = allLevels.reduce((acc, level) => {
        acc[level] = levelCounts[level] || 1;
        return acc;
      }, {} as Record<number, number>);
      setLevelCounts(defaultCounts);
    }
  };

  const handleDelete = (unitId: string) => {
    if (window.confirm('Are you sure you want to remove this unit from the roster?')) {
      dispatch(removeUnit(unitId));
    }
  };

  const handleNameChange = (event: SelectChangeEvent<string>) => {
    const selectedName = event.target.value;
    // Auto-set rarity based on unit data
    const unitData = getUnitDataByName(selectedName);
    setFormData((prev) => ({
      ...prev,
      name: selectedName,
      rarity: unitData ? unitData.rarity : prev.rarity,
    }));
  };


  // Get all unique unit names from existing units and predefined list
  // Use UNIT_NAMES_ARRAY from enum (already sorted alphabetically)
  const predefinedUnitNames = UNIT_NAMES_ARRAY;

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
            <Box className="flex gap-2">
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddNew}
                className="bg-green-600 hover:bg-green-700"
                disabled={isAdding || editingId !== null}
              >
                Add New Unit
              </Button>
              <Button
                variant="contained"
                onClick={handleClearRoster}
                className="bg-red-600 hover:bg-red-700"
                disabled={units.length === 0 || isAdding || editingId !== null || editingRowId !== null}
              >
                Clear Roster
              </Button>
            </Box>
          </Box>

          {(isAdding || editingId) && (
            <Box className="bg-gray-700 p-3 rounded-lg mb-3">
              <Box className="flex items-center justify-between mb-2">
                <Typography variant="subtitle2" className="text-white text-sm">
                  {editingId ? 'Edit Unit' : 'Add New Unit'}
                </Typography>
                <Box className="flex gap-2">
                  <Button
                    variant="contained"
                    onClick={handleSave}
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={!formData.name.trim() || selectedLevels.length === 0}
                    size="small"
                    sx={{ fontSize: '0.875rem', minWidth: '80px' }}
                  >
                    Save
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    className="text-white border-gray-500"
                    size="small"
                    sx={{ fontSize: '0.875rem', minWidth: '80px' }}
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
              <Box className="space-y-2">
                <Box className="flex items-start gap-3">
                  <FormControl className="bg-gray-600 flex-1" sx={{ minWidth: '200px' }}>
                    <InputLabel className="text-gray-300">Unit Name</InputLabel>
                    <Select
                      value={formData.name}
                      onChange={handleNameChange}
                      className="text-white"
                      label="Unit Name"
                      size="small"
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
                    {formData.name && (
                      <Typography
                        variant="caption"
                        className={`mt-0.5 text-xs font-bold ${
                          formData.rarity === UnitRarity.Legendary
                            ? 'text-yellow-400'
                            : formData.rarity === UnitRarity.Epic
                            ? 'text-purple-400'
                            : formData.rarity === UnitRarity.Rare
                            ? 'text-blue-400'
                            : 'text-gray-400'
                        }`}
                      >
                        {formData.rarity}
                      </Typography>
                    )}
                  </FormControl>
                  <Button
                    size="small"
                    onClick={handleSelectAllLevels}
                    className="text-xs bg-gray-600 hover:bg-gray-500 text-white"
                    sx={{ fontSize: '0.7rem', padding: '4px 12px', height: '40px', alignSelf: 'flex-end' }}
                  >
                    {selectedLevels.length === 10 ? 'Deselect All' : 'Select All'}
                  </Button>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-gray-300 text-xs mb-1 block">
                    Levels
                  </Typography>
                  <Box className="flex flex-wrap" sx={{ gap: '16px' }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => {
                      const isSelected = selectedLevels.includes(level);
                      const levelCount = levelCounts[level] || 1;
                      return (
                        <Box 
                          key={level} 
                          className="flex items-center"
                          sx={{ 
                            gap: '4px',
                            whiteSpace: 'nowrap',
                            flexShrink: 0,
                            border: '1px solid rgba(255, 255, 255, 0.23)',
                            borderRadius: '4px',
                            padding: '2px 4px',
                            alignItems: 'center',
                            '&:hover': {
                              borderColor: 'rgba(255, 255, 255, 0.4)',
                            },
                          }}
                        >
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={isSelected}
                                onChange={() => handleLevelToggle(level)}
                                size="small"
                                sx={{
                                  color: 'rgba(255, 255, 255, 0.7)',
                                  padding: '0px',
                                  margin: '0px',
                                  '&.Mui-checked': {
                                    color: '#3b82f6',
                                  },
                                }}
                              />
                            }
                            label={level.toString()}
                            className="text-white m-0"
                            sx={{
                              margin: 0,
                              marginRight: 0,
                              marginLeft: 0,
                              '&.MuiFormControlLabel-root': {
                                margin: 0,
                                marginRight: 0,
                              },
                              '& .MuiFormControlLabel-label': {
                                color: 'white',
                                fontSize: '0.75rem',
                                marginLeft: '2px',
                                minWidth: '16px',
                                padding: 0,
                              },
                            }}
                          />
                          <TextField
                            type="number"
                            value={levelCount}
                            onChange={(e) => handleLevelCountChange(level, parseInt(e.target.value) || 1)}
                            inputProps={{ min: 1, max: 100 }}
                            size="small"
                            disabled={!isSelected}
                            className="w-14"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                height: '28px',
                                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                                '&:hover fieldset': { borderColor: isSelected ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.1)' },
                                '&.Mui-focused fieldset': { borderColor: 'rgba(255, 255, 255, 0.6)' },
                                '&.Mui-disabled': {
                                  opacity: 0.5,
                                },
                              },
                              '& .MuiInputBase-input': { 
                                color: 'white', 
                                padding: '2px 4px',
                                fontSize: '0.75rem',
                                textAlign: 'center',
                              },
                            }}
                          />
                        </Box>
                      );
                    })}
                  </Box>
                  {selectedLevels.length === 0 && (
                    <Typography variant="caption" className="text-yellow-400 text-xs mt-1 block">
                      Please select at least one level
                    </Typography>
                  )}
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
                {uniqueUnits.map((unit) => {
                  const isEditing = editingRowId === unit.id;
                  const editData = rowEditData[unit.id] || { name: unit.name, level: unit.level, rarity: unit.rarity, count: unitCounts[unit.name] || 1 };
                  
                  return (
                    <TableRow key={unit.id} className="hover:bg-gray-600">
                      <TableCell>
                        <div className="w-12 h-12">
                          <UnitCard unit={unit} />
                        </div>
                      </TableCell>
                      <TableCell className="text-white font-semibold">
                        {isEditing ? (
                          <Select
                            value={editData.name}
                            onChange={(e) => {
                              const selectedName = e.target.value;
                              const unitData = getUnitDataByName(selectedName);
                              handleRowEditChange(unit.id, 'name', selectedName);
                              if (unitData) {
                                handleRowEditChange(unit.id, 'rarity', unitData.rarity);
                              }
                            }}
                            size="small"
                            className="text-white min-w-[150px]"
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
                        ) : (
                          unit.name
                        )}
                      </TableCell>
                      <TableCell className="text-white">
                        {isEditing ? (
                          <TextField
                            type="number"
                            value={editData.level}
                            onChange={(e) => handleRowEditChange(unit.id, 'level', parseInt(e.target.value) || 1)}
                            inputProps={{ min: 1, max: 10 }}
                            size="small"
                            className="w-20"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.4)' },
                                '&.Mui-focused fieldset': { borderColor: 'rgba(255, 255, 255, 0.6)' },
                              },
                              '& .MuiInputBase-input': { color: 'white', padding: '8px' },
                            }}
                          />
                        ) : (
                          unit.level
                        )}
                      </TableCell>
                      <TableCell className="text-white">
                        {isEditing ? (
                          <Select
                            value={editData.rarity}
                            onChange={(e) => handleRowEditChange(unit.id, 'rarity', e.target.value as UnitRarity)}
                            size="small"
                            className="text-white min-w-[120px]"
                            MenuProps={{
                              PaperProps: {
                                className: 'bg-gray-700',
                              },
                            }}
                          >
                            {Object.values(UnitRarity).map((rarity) => (
                              <MenuItem key={rarity} value={rarity} className="text-white hover:bg-gray-600">
                                {rarity}
                              </MenuItem>
                            ))}
                          </Select>
                        ) : (
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
                        )}
                      </TableCell>
                      <TableCell className="text-white">
                        {isEditing ? (
                          <TextField
                            type="number"
                            value={editData.count}
                            onChange={(e) => handleRowEditChange(unit.id, 'count', parseInt(e.target.value) || 1)}
                            inputProps={{ min: 1, max: 100 }}
                            size="small"
                            className="w-20"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.4)' },
                                '&.Mui-focused fieldset': { borderColor: 'rgba(255, 255, 255, 0.6)' },
                              },
                              '& .MuiInputBase-input': { color: 'white', padding: '8px' },
                            }}
                          />
                        ) : (
                          unitCounts[unit.name] || 1
                        )}
                      </TableCell>
                      <TableCell>
                        <Box className="flex gap-2">
                          {isEditing ? (
                            <>
                              <IconButton
                                size="small"
                                onClick={() => handleRowSave(unit)}
                                className="text-green-400 hover:bg-green-900"
                                aria-label={`Save ${unit.name}`}
                              >
                                <CheckIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={handleRowCancel}
                                className="text-gray-400 hover:bg-gray-700"
                                aria-label="Cancel"
                              >
                                <CloseIcon fontSize="small" />
                              </IconButton>
                            </>
                          ) : (
                            <>
                              <IconButton
                                size="small"
                                onClick={() => handleRowEdit(unit)}
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
                            </>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
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

