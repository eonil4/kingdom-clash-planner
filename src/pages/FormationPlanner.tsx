import { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { placeUnit, removeUnit } from '../store/reducers/formationSlice';
import FormationHeader from '../components/FormationHeader';
import FormationGrid from '../components/FormationGrid';
import UnitList from '../components/UnitList';
import FormationsModal from '../components/FormationsModal';
import { useInitializeData } from '../hooks/useInitializeData';
import type { Unit } from '../types';
import { useNavigate } from 'react-router-dom';

export default function FormationPlanner() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const currentFormation = useAppSelector((state) => state.formation.currentFormation);
  const [isFormationsModalOpen, setIsFormationsModalOpen] = useState(false);
  
  useInitializeData();

  const handlePlaceUnit = (row: number, col: number, unit: Unit) => {
    dispatch(placeUnit({ row, col, unit }));
  };

  const handleRemoveUnit = (row: number, col: number) => {
    // Get the unit from the formation before removing it
    const unit = currentFormation?.tiles[row]?.[col] || null;
    dispatch(removeUnit({ row, col, unit }));
  };

  const handleClose = () => {
    navigate('/formations');
  };

  const handleFormationsClick = () => {
    setIsFormationsModalOpen(true);
  };

  const handleFormationsModalClose = () => {
    setIsFormationsModalOpen(false);
  };

  const handleFormationsModalApply = () => {
    setIsFormationsModalOpen(false);
  };

  const handleFormationsModalShare = () => {
    // TODO: Implement share functionality
    console.log('Share clicked');
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
        <FormationHeader onFormationsClick={handleFormationsClick} />
        <div className="flex-1 overflow-auto">
          <FormationGrid
            tiles={currentFormation.tiles}
            onPlaceUnit={handlePlaceUnit}
            onRemoveUnit={handleRemoveUnit}
          />
        </div>
        <UnitList onClose={handleClose} />
        <FormationsModal
          open={isFormationsModalOpen}
          onClose={handleFormationsModalClose}
          onApply={handleFormationsModalApply}
          onShare={handleFormationsModalShare}
        />
      </div>
    </DndProvider>
  );
}

