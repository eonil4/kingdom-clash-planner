import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useDrop } from 'react-dnd';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { placeUnit, removeUnit } from '../store/reducers/formationSlice';
import FormationHeader from '../components/FormationHeader';
import FormationGrid from '../components/FormationGrid';
import UnitList from '../components/UnitList';
import { useInitializeData } from '../hooks/useInitializeData';
import { useUrlSync } from '../hooks/useUrlSync';
import type { Unit } from '../types';

// Component that wraps the content and provides the drop zone
// This must be inside DndProvider to use useDrop hook
function FormationPlannerContent() {
  const dispatch = useAppDispatch();
  const currentFormation = useAppSelector((state) => state.formation.currentFormation);
  const { units } = useAppSelector((state) => state.unit);

  // Helper function to count units in formation
  const countFormationUnits = (): number => {
    if (!currentFormation) return 0;
    let count = 0;
    for (const row of currentFormation.tiles) {
      for (const unit of row) {
        if (unit) count++;
      }
    }
    return count;
  };

  const handlePlaceUnit = (row: number, col: number, unit: Unit) => {
    // Check if we're replacing an existing unit (moving within formation) or adding new
    const existingUnit = currentFormation?.tiles[row]?.[col];
    const isReplacing = !!existingUnit;
    
    // Check if the unit is already in the roster (being moved, not added)
    const isInRoster = units.some(u => u.id === unit.id);
    
    // If not replacing and unit is not in roster (truly adding a new unit), check total limit
    if (!isReplacing && !isInRoster) {
      const formationUnitCount = countFormationUnits();
      const maxTotalUnits = 1000;
      const totalUnitCount = units.length + formationUnitCount;
      
      if (totalUnitCount >= maxTotalUnits) {
        alert(`Cannot place unit. Maximum total units (roster + formation) is ${maxTotalUnits}.`);
        return;
      }
    }
    // If unit is in roster, it will be moved (removed from roster, added to formation),
    // so total count stays the same - no need to check limit
    
    dispatch(placeUnit({ row, col, unit }));
  };

  const handleRemoveUnit = (row: number, col: number, unit: Unit | null) => {
    // Unit is passed from the component, so we use it directly
    // This ensures we have the correct unit even if state has changed
    dispatch(removeUnit({ row, col, unit: unit || null }));
  };

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
    <div
      ref={dropOutside as unknown as React.Ref<HTMLDivElement>}
      className="min-h-screen bg-gray-800 flex flex-col text-white"
      style={{
        backgroundImage: `
          radial-gradient(circle at 10% 20%, rgba(120, 120, 120, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 90% 80%, rgba(120, 120, 120, 0.1) 0%, transparent 50%),
          url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
        `,
      }}
    >
      <FormationHeader />
      <div className="overflow-auto">
        <FormationGrid
          tiles={currentFormation.tiles}
          onPlaceUnit={handlePlaceUnit}
          onRemoveUnit={handleRemoveUnit}
        />
      </div>
      <UnitList />
    </div>
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

