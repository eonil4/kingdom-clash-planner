import { useState, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import { Box } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { setSortOption, setSortOption2, setSortOption3, setSearchTerm } from '../../store/reducers/unitSlice';
import { removeUnit as removeUnitFromFormation, placeUnit } from '../../store/reducers/formationSlice';
import { removeUnit } from '../../store/reducers/formationSlice';
import type { SortOption, Unit } from '../../types';
import UnitSearch from './UnitSearch';
import ManageUnitsModal from '../manage/ManageUnitsModal';
import SortControls from './SortControls';
import UnitCountBadge from './UnitCountBadge';
import UnitListActions from './UnitListActions';
import AvailableUnitsGrid from './AvailableUnitsGrid';

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

  const handlePrimarySortChange = (event: SelectChangeEvent<SortOption>) => {
    const newSort = event.target.value as SortOption;
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
  };

  const handleSecondarySortChange = (event: SelectChangeEvent<SortOption | ''>) => {
    const newSort = event.target.value === '' ? null : (event.target.value as SortOption);
    setLocalSortOption2(newSort);
    dispatch(setSortOption2(newSort));

    // Clear tertiary if it conflicts with new secondary
    if (localSortOption3 === newSort) {
      setLocalSortOption3(null);
      dispatch(setSortOption3(null));
    }
  };

  const handleTertiarySortChange = (event: SelectChangeEvent<SortOption | ''>) => {
    const newSort = event.target.value === '' ? null : (event.target.value as SortOption);
    setLocalSortOption3(newSort);
    dispatch(setSortOption3(newSort));
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
            <SortControls
              primarySort={localSortOption}
              secondarySort={localSortOption2}
              tertiarySort={localSortOption3}
              onPrimaryChange={handlePrimarySortChange}
              onSecondaryChange={handleSecondarySortChange}
              onTertiaryChange={handleTertiarySortChange}
            />
            <UnitCountBadge count={availableUnits.length} />
            <UnitListActions
              onManageUnits={handleManageUnits}
              onWithdrawAll={handleWithdrawAll}
            />
          </Box>
        </Box>
        <Box className="mb-2">
          <UnitSearch onSearchChange={handleSearchChange} />
        </Box>
      </Box>
      <AvailableUnitsGrid
        units={availableUnits}
        onUnitDoubleClick={handleUnitDoubleClick}
      />
      <ManageUnitsModal
        open={isManageUnitsOpen}
        onClose={() => setIsManageUnitsOpen(false)}
      />
    </Box>
  );
}

