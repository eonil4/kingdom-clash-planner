import { lazy, Suspense, useState } from 'react';
import { useDrop } from 'react-dnd';
import { Box } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import { setSortOption, setSortOption2, setSortOption3, setSearchTerm } from '../../../store/reducers/unitSlice';
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

  const unitsInFormation = new Set(
    currentFormation?.tiles
      .flat()
      .filter((unit) => unit !== null)
      .map((unit) => unit!.id) || []
  );

  const availableUnits = filteredUnits.filter((unit) => !unitsInFormation.has(unit.id));

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

  const handlePrimarySortChange = (event: SelectChangeEvent<SortOption>) => {
    const newSort = event.target.value as SortOption;
    dispatch(setSortOption(newSort));
    if (localSortOption2 === newSort) {
      dispatch(setSortOption2(null));
    }
    if (localSortOption3 === newSort) {
      dispatch(setSortOption3(null));
    }
  };

  const handleSecondarySortChange = (event: SelectChangeEvent<SortOption | ''>) => {
    const newSort = event.target.value === '' ? null : (event.target.value as SortOption);
    dispatch(setSortOption2(newSort));
    if (localSortOption3 === newSort) {
      dispatch(setSortOption3(null));
    }
  };

  const handleTertiarySortChange = (event: SelectChangeEvent<SortOption | ''>) => {
    const newSort = event.target.value === '' ? null : (event.target.value as SortOption);
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
          w-full bg-gray-800 p-2 sm:p-4
          ${isOver ? 'bg-blue-900 bg-opacity-50' : ''}
          transition-colors
        `}
      component="section"
      aria-label="Unit list"
    >
      <Box className="mb-4">
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
        <Box className="mb-2">
          <SearchInput onSearchChange={handleSearchChange} placeholder="Search units..." />
        </Box>
      </Box>
      <AvailableUnitsGrid
        units={availableUnits}
        onUnitDoubleClick={handleUnitDoubleClick}
      />
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
