import { Button } from '@mui/material';

interface UnitListActionsProps {
  onManageUnits: () => void;
  onWithdrawAll: () => void;
}

export default function UnitListActions({ onManageUnits, onWithdrawAll }: UnitListActionsProps) {
  const buttonStyle = {
    clipPath: 'polygon(5% 0%, 95% 0%, 100% 50%, 95% 100%, 5% 100%, 0% 50%)',
  };

  return (
    <>
      <Button
        variant="contained"
        size="small"
        className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-1"
        style={buttonStyle}
        onClick={onManageUnits}
        aria-label="Manage units"
      >
        Manage Units
      </Button>
      <Button
        variant="contained"
        size="small"
        className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-1"
        style={buttonStyle}
        onClick={onWithdrawAll}
        aria-label="Withdraw all units from formation"
      >
        WITHDRAW ALL
      </Button>
    </>
  );
}

