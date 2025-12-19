import { lazy, Suspense, useCallback, useMemo, useState } from 'react';
import { useDrop } from 'react-dnd';
import Box from '@mui/material/Box';
import type { SelectChangeEvent } from '@mui/material/Select';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import { setSortOption, setSortOption2, setSortOption3, setSearchTerm, updateUnit } from '../../../store/reducers/unitSlice';
import { removeUnit as removeUnitFromFormation, placeUnit } from '../../../store/reducers/formationSlice';
import { removeUnit } from '../../../store/reducers/formationSlice';
import type { SortOption, Unit } from '../../../types';
import { SearchInput, SortControls, UnitListActions } from '../../molecules';
import { AvailableUnitsGrid } from '../AvailableUnitsGrid';
import { UnitCountBadge } from '../../atoms';

const ManageUnitsModal = lazy(() => import('../ManageUnitsModal/ManageUnitsModal'));

export default function UnitList() {
  const dispatch = useAppDispatch();
  const { filteredUnits, sortOption, sortOption2, sortOption3 } = useAppSelector((state) => state.unit);
  const currentFormation = useAppSelector((state) => state.formation.currentFormation);
  const localSortOption = sortOption;
  const localSortOption2 = sortOption2;
  const localSortOption3 = sortOption3;
  const [isManageUnitsOpen, setIsManageUnitsOpen] = useState(false);

  const unitsInFormation = useMemo(() => new Set(
    currentFormation?.tiles
      .flat()
      .filter((unit) => unit !== null)
      .map((unit) => unit!.id) || []
  ), [currentFormation?.tiles]);

  const availableUnits = useMemo(
    () => filteredUnits.filter((unit) => !unitsInFormation.has(unit.id)),
    [filteredUnits, unitsInFormation]
  );

  const [{ isOver }, drop] = useDrop({
    accept: 'unit',
    drop: (item: { unit: Unit; isInFormation?: boolean; sourceRow?: number; sourceCol?: number }) => {
      if (item.isInFormation && item.sourceRow !== undefined && item.sourceCol !== undefined) {
        dispatch(removeUnitFromFormation({ row: item.sourceRow, col: item.sourceCol, unit: item.unit }));
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const handlePrimarySortChange = useCallback((event: SelectChangeEvent<SortOption>) => {
    const newSort = event.target.value as SortOption;
    dispatch(setSortOption(newSort));
    if (localSortOption2 === newSort) {
      dispatch(setSortOption2(null));
    }
    if (localSortOption3 === newSort) {
      dispatch(setSortOption3(null));
    }
  }, [dispatch, localSortOption2, localSortOption3]);

  const handleSecondarySortChange = useCallback((event: SelectChangeEvent<SortOption | ''>) => {
    const newSort = event.target.value === '' ? null : (event.target.value as SortOption);
    dispatch(setSortOption2(newSort));
    if (localSortOption3 === newSort) {
      dispatch(setSortOption3(null));
    }
  }, [dispatch, localSortOption3]);

  const handleTertiarySortChange = useCallback((event: SelectChangeEvent<SortOption | ''>) => {
    const newSort = event.target.value === '' ? null : (event.target.value as SortOption);
    dispatch(setSortOption3(newSort));
  }, [dispatch]);

  const handleSearchChange = useCallback((searchTerm: string) => {
    dispatch(setSearchTerm(searchTerm));
  }, [dispatch]);

  const handleManageUnits = useCallback(() => {
    setIsManageUnitsOpen(true);
  }, []);

  const handleWithdrawAll = useCallback(() => {
    if (!currentFormation) return;
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 7; col++) {
        const unit = currentFormation.tiles[row][col];
        if (unit) {
          dispatch(removeUnit({ row, col, unit }));
        }
      }
    }
  }, [currentFormation, dispatch]);

  const handleUnitDoubleClick = useCallback((unit: Unit) => {
    if (!currentFormation) return;
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 7; col++) {
        if (!currentFormation.tiles[row][col]) {
          dispatch(placeUnit({ row, col, unit }));
          return;
        }
      }
    }
  }, [currentFormation, dispatch]);

  const handleUnitEdit = useCallback((_originalUnit: Unit, updatedUnit: Unit) => {
    dispatch(updateUnit(updatedUnit));
  }, [dispatch]);

  return (
    <Box
      ref={drop as unknown as React.Ref<HTMLElement>}
      className={`
          w-full bg-gray-800 px-2 pb-2 pt-0 sm:px-4 sm:pb-4 flex flex-col h-full min-h-0
          ${isOver ? 'bg-blue-900 bg-opacity-50' : ''}
          transition-colors
        `}
      component="section"
      aria-label="Unit roster. Double-click units to add to formation."
    >
      {/* Header with controls - stays fixed */}
      <Box className="flex-shrink-0 mb-3">
        <Box className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
          <Box className="flex flex-wrap items-center gap-2">
            <SortControls
              primarySort={localSortOption}
              secondarySort={localSortOption2}
              tertiarySort={localSortOption3}
              onPrimaryChange={handlePrimarySortChange}
              onSecondaryChange={handleSecondarySortChange}
              onTertiaryChange={handleTertiarySortChange}
            />
            <UnitCountBadge count={availableUnits.length} />
          </Box>
          <UnitListActions
            onManageUnits={handleManageUnits}
            onWithdrawAll={handleWithdrawAll}
          />
        </Box>
        <SearchInput onSearchChange={handleSearchChange} placeholder="Search units..." />
      </Box>
      
      {/* Scrollable unit grid area */}
      <Box 
        className="flex-1 overflow-auto min-h-0 rounded-lg"
        sx={{
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '4px',
            '&:hover': {
              background: 'rgba(255,255,255,0.3)',
            },
          },
        }}
      >
        {availableUnits.length === 0 ? (
          <Box className="flex flex-col items-center justify-center h-full min-h-32 text-gray-500">
            <Box className="text-4xl mb-2">📦</Box>
            <Box className="text-center">
              No units available.<br />
              <span className="text-sm">Add units via "Manage Units" or withdraw from formation.</span>
            </Box>
          </Box>
        ) : (
          <AvailableUnitsGrid
            units={availableUnits}
            onUnitDoubleClick={handleUnitDoubleClick}
            onUnitEdit={handleUnitEdit}
          />
        )}
      </Box>
      
      {/* Hint text */}
      <Box className="flex-shrink-0 mt-2 text-xs text-gray-500 text-center">
        💡 Double-click to add to formation • Drag to specific tile • Hover for actions
      </Box>
      
      {isManageUnitsOpen && (
        <Suspense fallback={null}>
          <ManageUnitsModal
            open={isManageUnitsOpen}
            onClose={() => setIsManageUnitsOpen(false)}
          />
        </Suspense>
      )}
    </Box>
  );
}
