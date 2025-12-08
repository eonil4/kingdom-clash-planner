import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import { Box } from '@mui/material';
import { updateFormationName } from '../../../store/reducers/formationSlice';
import { HelpOverlay } from '../HelpOverlay';
import { FormationNameEditor } from '../../molecules';
import { PowerBadge } from '../../atoms';

export default function FormationHeader() {
  const dispatch = useAppDispatch();
  const currentFormation = useAppSelector((state) => state.formation.currentFormation);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const handleSaveName = (name: string) => {
    dispatch(updateFormationName(name));
  };

  return (
    <Box
      component="header"
      className="w-full p-4 bg-gray-800 flex items-center justify-center"
    >
      <Box className="flex flex-col items-center w-full">
        <FormationNameEditor
          name={currentFormation?.name || 'Formation'}
          onSave={handleSaveName}
          onHelpClick={() => setIsHelpOpen(true)}
        />
        <PowerBadge power={currentFormation?.power || 0} />
      </Box>
      <HelpOverlay open={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </Box>
  );
}
