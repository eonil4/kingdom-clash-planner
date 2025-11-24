import { useState, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  Button,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { setSortOption, setSortOption2, setSortOption3, setSearchTerm } from '../../store/reducers/unitSlice';
import { removeUnit as removeUnitFromFormation, placeUnit } from '../../store/reducers/formationSlice';
import { removeUnit } from '../../store/reducers/formationSlice';
import type { SortOption, Unit } from '../../types';
import UnitCard from './UnitCard';
import UnitSearch from './UnitSearch';
import ManageUnitsModal from '../manage/ManageUnitsModal';

export default function UnitList() {
  const dispatch = useAppDispatch();
  const { filteredUnits, sortOption, sortOption2, sortOption3 } = useAppSelector((state) => state.unit);
  const currentFormation = useAppSelector((state) => state.formation.currentFormation);
  const [localSortOption, setLocalSortOption] = useState<SortOption>(sortOption);
  const [localSortOption2, setLocalSortOption2] = useState<SortOption | null>(sortOption2);
  const [localSortOption3, setLocalSortOption3] = useState<SortOption | null>(sortOption3);
  const [isManageUnitsOpen, setIsManageUnitsOpen] = useState(false);

  // Sync local sort options with Redux state
  useEffect(() => {
    setLocalSortOption(sortOption);
    setLocalSortOption2(sortOption2);
    setLocalSortOption3(sortOption3);
  }, [sortOption, sortOption2, sortOption3]);

  // Get all unit IDs that are currently in the formation
  const unitsInFormation = new Set(
    currentFormation?.tiles
      .flat()
      .filter((unit) => unit !== null)
      .map((unit) => unit!.id) || []
  );

  // Filter out units that are already in the formation
  // filteredUnits is already sorted by the selected sort option in Redux
  const availableUnits = filteredUnits.filter((unit) => !unitsInFormation.has(unit.id));

  const [{ isOver }, drop] = useDrop({
    accept: 'unit',
    drop: (item: { unit: Unit; isInFormation?: boolean; sourceRow?: number; sourceCol?: number }) => {
      if (item.isInFormation && item.sourceRow !== undefined && item.sourceCol !== undefined) {
        // Unit is being removed from formation - remove it from the tile
        // Pass the unit so it can be added back to the available units list
        dispatch(removeUnitFromFormation({ row: item.sourceRow, col: item.sourceCol, unit: item.unit }));
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const onSortChange = (level: 1 | 2 | 3) => (event: SelectChangeEvent<SortOption | ''>) => {
    const value = event.target.value;
    // Primary sort cannot be null/empty
    if (level === 1 && value === '') return;

    const newSort = value === '' ? null : (value as SortOption);

    if (level === 1) {
      if (newSort) {
        setLocalSortOption(newSort);
        dispatch(setSortOption(newSort));

        // Clear secondary/tertiary if they conflict with new primary
        if (localSortOption2 === newSort) {
          setLocalSortOption2(null);
          dispatch(setSortOption2(null));
        }
        if (localSortOption3 === newSort) {
          setLocalSortOption3(null);
          dispatch(setSortOption3(null));
        }
      }
    } else if (level === 2) {
      setLocalSortOption2(newSort);
      dispatch(setSortOption2(newSort));

      // Clear tertiary if it conflicts with new secondary
      if (localSortOption3 === newSort) {
        setLocalSortOption3(null);
        dispatch(setSortOption3(null));
      }
    } else if (level === 3) {
      setLocalSortOption3(newSort);
      dispatch(setSortOption3(newSort));
    }
  };

  // Properly typed handler for primary sort (non-nullable)
  const handlePrimarySortChange = (event: SelectChangeEvent<SortOption>) => {
    onSortChange(1)(event as SelectChangeEvent<SortOption | ''>);
  };

  const handleSearchChange = (searchTerm: string) => {
    dispatch(setSearchTerm(searchTerm));
  };

  const handleManageUnits = () => {
    setIsManageUnitsOpen(true);
  };

  const handleWithdrawAll = () => {
    if (!currentFormation) return;
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 7; col++) {
        const unit = currentFormation.tiles[row][col];
        if (unit) {
          dispatch(removeUnit({ row, col, unit }));
        }
      }
    }
  };

  const handleUnitDoubleClick = (unit: Unit) => {
    if (!currentFormation) return;

    // Find the first empty tile
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 7; col++) {
        if (!currentFormation.tiles[row][col]) {
          dispatch(placeUnit({ row, col, unit }));
          return;
        }
      }
    }
  };

  return (
    <Box
      ref={drop as unknown as React.Ref<HTMLElement>}
      className={`
          w-full bg-gray-800 p-4
          ${isOver ? 'bg-blue-900 bg-opacity-50' : ''}
          transition-colors
        `}
      component="section"
      aria-label="Unit list"
    >
      <Box className="mb-4">
        <Box className="flex items-center justify-between mb-2">
          <Box className="flex items-center gap-2">
            <FormControl size="small" className="min-w-32">
              <Select
                value={localSortOption}
                onChange={handlePrimarySortChange}
                className="text-white bg-gray-700"
                aria-label="Sort units by (primary)"
              >
                <MenuItem value="level">By Level</MenuItem>
                <MenuItem value="rarity">By Rarity</MenuItem>
                <MenuItem value="name">By Name</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" className="min-w-32">
              <Select
                value={localSortOption2 || ''}
                onChange={onSortChange(2)}
                className="text-white bg-gray-700"
                aria-label="Sort units by (secondary)"
                displayEmpty
              >
                <MenuItem value="">None</MenuItem>
                {['level', 'rarity', 'name']
                  .filter((option) => option !== localSortOption)
                  .map((option) => (
                    <MenuItem key={option} value={option}>
                      {option === 'level' ? 'By Level' : option === 'rarity' ? 'By Rarity' : 'By Name'}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            <FormControl size="small" className="min-w-32">
              <Select
                value={localSortOption3 || ''}
                onChange={onSortChange(3)}
                className="text-white bg-gray-700"
                aria-label="Sort units by (tertiary)"
                displayEmpty
              >
                <MenuItem value="">None</MenuItem>
                {['level', 'rarity', 'name']
                  .filter((option) => option !== localSortOption && option !== localSortOption2)
                  .map((option) => (
                    <MenuItem key={option} value={option}>
                      {option === 'level' ? 'By Level' : option === 'rarity' ? 'By Rarity' : 'By Name'}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            <Box className="bg-blue-900 border-2 border-blue-500 rounded-lg px-3 py-1">
              <Typography variant="body2" className="text-white font-bold">
                {availableUnits.length}
              </Typography>
            </Box>
            <Button
              variant="contained"
              size="small"
              className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-1"
              style={{
                clipPath: 'polygon(5% 0%, 95% 0%, 100% 50%, 95% 100%, 5% 100%, 0% 50%)',
              }}
              onClick={handleManageUnits}
              aria-label="Manage units"
            >
              Manage Units
            </Button>
            <Button
              variant="contained"
              size="small"
              className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-1"
              style={{
                clipPath: 'polygon(5% 0%, 95% 0%, 100% 50%, 95% 100%, 5% 100%, 0% 50%)',
              }}
              onClick={handleWithdrawAll}
              aria-label="Withdraw all units from formation"
            >
              WITHDRAW ALL
            </Button>
          </Box>
        </Box>
        <Box className="mb-2">
          <UnitSearch onSearchChange={handleSearchChange} />
        </Box>
      </Box>
      <Box
        className="flex flex-wrap gap-2"
        role="list"
        aria-label="Available units"
      >
        {availableUnits.map((unit) => (
          <UnitCard
            key={unit.id}
            unit={unit}
            onDoubleClick={() => handleUnitDoubleClick(unit)}
          />
        ))}
      </Box>
      <ManageUnitsModal
        open={isManageUnitsOpen}
        onClose={() => setIsManageUnitsOpen(false)}
      />
    </Box>
  );
}

