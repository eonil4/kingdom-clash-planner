import { Box } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { Button } from '../../atoms';

interface UnitListActionsProps {
  onManageUnits: () => void;
  onWithdrawAll: () => void;
}

export default function UnitListActions({ onManageUnits, onWithdrawAll }: UnitListActionsProps) {
  return (
    <Box className="flex gap-2">
      <Button
        variant="outlined"
        size="small"
        startIcon={<SettingsIcon />}
        onClick={onManageUnits}
        className="text-white border-gray-500 hover:bg-gray-700"
        sx={{
          borderColor: 'rgba(255, 255, 255, 0.23)',
          '&:hover': {
            borderColor: 'rgba(255, 255, 255, 0.4)',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        Manage Units
      </Button>
      <Button
        variant="outlined"
        size="small"
        startIcon={<ExitToAppIcon />}
        onClick={onWithdrawAll}
        className="text-white border-gray-500 hover:bg-gray-700"
        sx={{
          borderColor: 'rgba(255, 255, 255, 0.23)',
          '&:hover': {
            borderColor: 'rgba(255, 255, 255, 0.4)',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        WITHDRAW ALL
      </Button>
    </Box>
  );
}

