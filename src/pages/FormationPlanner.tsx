import { lazy, Suspense, useCallback, useEffect, useState, useMemo } from 'react';
import { DndProvider } from 'react-dnd';
import { useDrop } from 'react-dnd';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { placeUnit, removeUnit, swapUnits, updateUnitInFormation } from '../store/reducers/formationSlice';
import { updateUnit } from '../store/reducers/unitSlice';
import FormationHeader from '../components/organisms/FormationHeader/FormationHeader';
import FormationGrid from '../components/organisms/FormationGrid/FormationGrid';
import { useInitializeData } from '../hooks/useInitializeData';
import { useUrlSync } from '../hooks/useUrlSync';
import { useToast } from '../hooks/useToast';
import { getDndBackend, getDndBackendOptions } from '../utils/deviceUtils';
import type { Unit } from '../types';
import { MAX_TOTAL_UNITS, GRID_SIZE_RANGE } from '../constants';

const UnitList = lazy(() => import('../components/organisms/UnitList/UnitList'));

// Component that wraps the content and provides the drop zone
// This must be inside DndProvider to use useDrop hook
function FormationPlannerContent() {
  const dispatch = useAppDispatch();
  const currentFormation = useAppSelector((state) => state.formation.currentFormation);
  const { units } = useAppSelector((state) => state.unit);
  const { showError } = useToast();
  
  // Grid size state (percentage of max size)
  const [gridScale, setGridScale] = useState(80);

  // Update page title with formation name
  useEffect(() => {
    if (currentFormation?.name) {
      document.title = `${currentFormation.name} - Kingdom Clash Planner`;
    } else {
      document.title = 'Kingdom Clash Planner';
    }
  }, [currentFormation?.name]);

  const handleGridScaleChange = (_event: Event, newValue: number | number[]) => {
    setGridScale(newValue as number);
  };

  const handlePlaceUnit = useCallback((row: number, col: number, unit: Unit) => {
    const existingUnit = currentFormation?.tiles[row]?.[col];
    const isReplacing = !!existingUnit;
    const isInRoster = units.some(u => u.id === unit.id);
    
    if (!isReplacing && !isInRoster) {
      let formationUnitCount = 0;
      for (const r of currentFormation!.tiles) {
        for (const u of r) {
          if (u) formationUnitCount++;
        }
      }
      const maxTotalUnits = MAX_TOTAL_UNITS;
      const totalUnitCount = units.length + formationUnitCount;
      
      if (totalUnitCount >= maxTotalUnits) {
        showError(`Cannot place unit. Maximum total units (roster + formation) is ${maxTotalUnits}.`);
        return;
      }
    }
    
    dispatch(placeUnit({ row, col, unit }));
  }, [dispatch, currentFormation, units, showError]);

  const handleRemoveUnit = useCallback((row: number, col: number, unit: Unit | null) => {
    dispatch(removeUnit({ row, col, unit: unit || null }));
  }, [dispatch]);

  const handleSwapUnits = useCallback((
    sourceRow: number,
    sourceCol: number,
    targetRow: number,
    targetCol: number,
    sourceUnit: Unit,
    targetUnit: Unit
  ) => {
    dispatch(swapUnits({
      sourceRow,
      sourceCol,
      targetRow,
      targetCol,
      sourceUnit,
      targetUnit,
    }));
  }, [dispatch]);

  const handleEditUnit = useCallback((row: number, col: number, unit: Unit) => {
    // Update unit in formation
    dispatch(updateUnitInFormation({ row, col, unit }));
    // Also update unit in roster if it exists there
    dispatch(updateUnit(unit));
  }, [dispatch]);

  // Drop zone for removing units from formation when dropped outside the grid
  // Note: UnitList has its own drop handler, so this only handles drops outside both grid and list
  const [, dropOutside] = useDrop({
    accept: 'unit',
    drop: (item: { unit: Unit; isInFormation?: boolean; sourceRow?: number; sourceCol?: number }, monitor) => {
      // Only handle units that are being dragged from the formation
      if (item.isInFormation && item.sourceRow !== undefined && item.sourceCol !== undefined) {
        // Check if the drop happened on a nested drop target (like UnitList)
        // If so, let the nested handler deal with it to avoid double-processing
        const didDrop = monitor.didDrop();
        if (didDrop) {
          // A nested drop target handled it, don't process here
          return;
        }
        // Remove unit from formation and add it back to roster
        dispatch(removeUnit({ row: item.sourceRow, col: item.sourceCol, unit: item.unit }));
      }
    },
  });

  if (!currentFormation) {
    return (
      <div className="min-h-screen bg-gray-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Calculate the grid max width based on scale (10% = ~100px, 100% = 750px)
  const gridMaxWidth = Math.round(100 + (gridScale / 100) * 650);

  return (
    <main
      id="main-content"
      ref={dropOutside as unknown as React.Ref<HTMLElement>}
      className="min-h-screen bg-gray-900 flex flex-col text-white"
    >
      <FormationHeader />
      
      {/* Main content area - side by side on large screens */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Formation Grid Panel */}
        <Box 
          className="lg:flex-shrink-0 bg-gray-700 flex flex-col relative"
          sx={{ 
            width: { xs: '100%', lg: `${gridMaxWidth}px` },
            minWidth: { lg: '200px' },
            maxWidth: { lg: '750px' },
            transition: 'width 0.2s ease-out',
          }}
        >
          {/* Grid size control - vertical on mobile (right side), horizontal on desktop */}
          <Box 
            className="bg-gray-800/50"
            sx={{
              // Mobile: vertical slider on right side
              position: { xs: 'absolute', lg: 'relative' },
              right: { xs: 8, lg: 'auto' },
              top: { xs: 8, lg: 'auto' },
              zIndex: { xs: 10, lg: 'auto' },
              // Mobile: vertical layout
              display: 'flex',
              flexDirection: { xs: 'column', lg: 'row' },
              alignItems: 'center',
              gap: { xs: 1, lg: 3 },
              // Mobile: compact styling
              padding: { xs: '8px', lg: '12px 16px 4px 16px' },
              borderRadius: { xs: '8px', lg: 0 },
              boxShadow: { xs: '0 2px 8px rgba(0,0,0,0.3)', lg: 'none' },
            }}
          >
            <ZoomOutIcon sx={{ color: 'gray', fontSize: '18px' }} />
            <Slider
              value={gridScale}
              onChange={handleGridScaleChange}
              min={GRID_SIZE_RANGE.MIN}
              max={GRID_SIZE_RANGE.MAX}
              orientation="vertical"
              aria-label="Grid size"
              sx={{
                color: '#60a5fa',
                // Mobile: vertical slider
                display: { xs: 'block', lg: 'none' },
                height: '80px',
                '& .MuiSlider-thumb': {
                  width: 16,
                  height: 16,
                },
                '& .MuiSlider-track': {
                  width: 4,
                },
                '& .MuiSlider-rail': {
                  width: 4,
                  opacity: 0.3,
                },
              }}
            />
            <Slider
              value={gridScale}
              onChange={handleGridScaleChange}
              min={GRID_SIZE_RANGE.MIN}
              max={GRID_SIZE_RANGE.MAX}
              aria-label="Grid size"
              sx={{
                color: '#60a5fa',
                // Desktop: horizontal slider
                display: { xs: 'none', lg: 'block' },
                '& .MuiSlider-thumb': {
                  width: 16,
                  height: 16,
                },
                '& .MuiSlider-track': {
                  height: 4,
                },
                '& .MuiSlider-rail': {
                  height: 4,
                  opacity: 0.3,
                },
              }}
            />
            <ZoomInIcon sx={{ color: 'gray', fontSize: '18px' }} />
            <Typography variant="caption" className="text-gray-400 whitespace-nowrap">
              {gridScale}%
            </Typography>
          </Box>
          
          {/* Formation Grid */}
          <div className="flex-1 overflow-auto p-4 flex items-start justify-center">
            <Box sx={{ width: '100%', maxWidth: `${gridMaxWidth - 32}px` }}>
        <FormationGrid
          tiles={currentFormation.tiles}
          onPlaceUnit={handlePlaceUnit}
          onRemoveUnit={handleRemoveUnit}
          onSwapUnits={handleSwapUnits}
                onEditUnit={handleEditUnit}
        />
            </Box>
      </div>
        </Box>
        
        {/* Unit Roster Panel */}
        <Box 
          className="flex-1 overflow-hidden flex flex-col min-h-0"
          sx={{ minHeight: { xs: '300px', lg: 'auto' } }}
        >
          <Suspense fallback={<div className="w-full bg-gray-800 p-4 flex-1" />}>
      <UnitList />
      </Suspense>
        </Box>
      </div>
    </main>
  );
}

export default function FormationPlanner() {
  useInitializeData();
  useUrlSync();

  const backend = useMemo(() => getDndBackend(), []);
  const backendOptions = useMemo(() => getDndBackendOptions(), []);

  return (
    <DndProvider backend={backend} options={backendOptions}>
      <FormationPlannerContent />
    </DndProvider>
  );
}
