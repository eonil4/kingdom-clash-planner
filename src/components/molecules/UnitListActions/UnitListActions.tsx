import Box from '@mui/material/Box';
import SettingsIcon from '@mui/icons-material/Settings';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { Button } from '../../atoms';

interface UnitListActionsProps {
  onManageUnits: () => void;
  onWithdrawAll: () => void;
}

export default function UnitListActions({ onManageUnits, onWithdrawAll }: UnitListActionsProps) {
  return (
    <Box className="flex gap-2 flex-shrink-0">
      <Button
        variant="outlined"
        size="small"
        startIcon={<SettingsIcon className="text-base sm:text-lg" />}
        onClick={onManageUnits}
        className="text-white border-gray-500 hover:bg-gray-700 text-xs sm:text-sm whitespace-nowrap"
        sx={{
          borderColor: 'rgba(255, 255, 255, 0.23)',
          minHeight: '36px',
          padding: { xs: '4px 8px', sm: '6px 16px' },
          '&:hover': {
            borderColor: 'rgba(255, 255, 255, 0.4)',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        <span className="hidden sm:inline">Manage Units</span>
        <span className="sm:hidden">Manage</span>
      </Button>
      <Button
        variant="outlined"
        size="small"
        startIcon={<ExitToAppIcon className="text-base sm:text-lg" />}
        onClick={onWithdrawAll}
        className="text-white border-gray-500 hover:bg-gray-700 text-xs sm:text-sm whitespace-nowrap"
        sx={{
          borderColor: 'rgba(255, 255, 255, 0.23)',
          minHeight: '36px',
          padding: { xs: '4px 8px', sm: '6px 16px' },
          '&:hover': {
            borderColor: 'rgba(255, 255, 255, 0.4)',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        <span className="hidden sm:inline">Withdraw All</span>
        <span className="sm:hidden">Withdraw</span>
      </Button>
    </Box>
  );
}
