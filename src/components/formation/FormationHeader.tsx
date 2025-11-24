import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { Box } from '@mui/material';
import { updateFormationName } from '../../store/reducers/formationSlice';
import HelpOverlay from '../help/HelpOverlay';
import FormationNameEditor from './FormationNameEditor';
import PowerBadge from './PowerBadge';

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
      className="w-full p-4 bg-gradient-to-b from-gray-700 to-gray-800 flex items-center justify-center"
      style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
      }}
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

