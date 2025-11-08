import { Button, Box } from '@mui/material';
import { useAppDispatch } from '../store/hooks';
import { removeUnit } from '../store/reducers/formationSlice';
import { useAppSelector } from '../store/hooks';

interface FormationFooterProps {}

export default function FormationFooter({}: FormationFooterProps) {
  const dispatch = useAppDispatch();
  const currentFormation = useAppSelector((state) => state.formation.currentFormation);

  const handleWithdrawAll = () => {
    if (!currentFormation) return;
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 7; col++) {
        if (currentFormation.tiles[row][col]) {
          dispatch(removeUnit({ row, col }));
        }
      }
    }
  };

  return (
    <Box
      component="footer"
      className="w-full p-4 bg-gray-800 flex gap-4 justify-center"
    >
      <Button
        variant="contained"
        className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-3"
        style={{
          clipPath: 'polygon(5% 0%, 95% 0%, 100% 50%, 95% 100%, 5% 100%, 0% 50%)',
        }}
        onClick={handleWithdrawAll}
        aria-label="Withdraw all units from formation"
      >
        WITHDRAW ALL
      </Button>
    </Box>
  );
}

