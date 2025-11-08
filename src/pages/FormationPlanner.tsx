import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { placeUnit, removeUnit } from '../store/reducers/formationSlice';
import FormationHeader from '../components/FormationHeader';
import FormationGrid from '../components/FormationGrid';
import UnitList from '../components/UnitList';
import { useInitializeData } from '../hooks/useInitializeData';
import { useUrlSync } from '../hooks/useUrlSync';
import type { Unit } from '../types';

export default function FormationPlanner() {
  const dispatch = useAppDispatch();
  const currentFormation = useAppSelector((state) => state.formation.currentFormation);
  
  useInitializeData();
  useUrlSync();

  const handlePlaceUnit = (row: number, col: number, unit: Unit) => {
    dispatch(placeUnit({ row, col, unit }));
  };

  const handleRemoveUnit = (row: number, col: number) => {
    // Get the unit from the formation before removing it
    const unit = currentFormation?.tiles[row]?.[col] || null;
    dispatch(removeUnit({ row, col, unit }));
  };

  if (!currentFormation) {
    return (
      <div className="min-h-screen bg-gray-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div
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
    </DndProvider>
  );
}

