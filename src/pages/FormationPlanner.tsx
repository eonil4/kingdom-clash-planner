import { lazy, Suspense, useCallback, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useDrop } from 'react-dnd';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { placeUnit, removeUnit, swapUnits } from '../store/reducers/formationSlice';
import FormationHeader from '../components/organisms/FormationHeader/FormationHeader';
import FormationGrid from '../components/organisms/FormationGrid/FormationGrid';
import { useInitializeData } from '../hooks/useInitializeData';
import { useUrlSync } from '../hooks/useUrlSync';
import type { Unit } from '../types';

const UnitList = lazy(() => import('../components/organisms/UnitList/UnitList'));

// Component that wraps the content and provides the drop zone
// This must be inside DndProvider to use useDrop hook
function FormationPlannerContent() {
  const dispatch = useAppDispatch();
  const currentFormation = useAppSelector((state) => state.formation.currentFormation);
  const { units } = useAppSelector((state) => state.unit);

  // Update page title with formation name
  useEffect(() => {
    if (currentFormation?.name) {
      document.title = `${currentFormation.name} - Kingdom Clash Planner`;
    } else {
      document.title = 'Kingdom Clash Planner';
    }
  }, [currentFormation?.name]);

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
      const maxTotalUnits = 1000;
      const totalUnitCount = units.length + formationUnitCount;
      
      if (totalUnitCount >= maxTotalUnits) {
        alert(`Cannot place unit. Maximum total units (roster + formation) is ${maxTotalUnits}.`);
        return;
      }
    }
    
    dispatch(placeUnit({ row, col, unit }));
  }, [dispatch, currentFormation, units]);

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

  return (
    <main
      id="main-content"
      ref={dropOutside as unknown as React.Ref<HTMLElement>}
      className="min-h-screen bg-gray-900 flex flex-col text-white"
    >
      <FormationHeader />
      <div className="overflow-auto">
        <FormationGrid
          tiles={currentFormation.tiles}
          onPlaceUnit={handlePlaceUnit}
          onRemoveUnit={handleRemoveUnit}
          onSwapUnits={handleSwapUnits}
        />
      </div>
      <Suspense fallback={<div className="w-full bg-gray-800 p-4 min-h-32" />}>
      <UnitList />
      </Suspense>
    </main>
  );
}

export default function FormationPlanner() {
  useInitializeData();
  useUrlSync();

  return (
    <DndProvider backend={HTML5Backend}>
      <FormationPlannerContent />
    </DndProvider>
  );
}
