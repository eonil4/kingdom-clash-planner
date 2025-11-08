import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Grid,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { setCurrentFormation, setSelectedFormationId } from '../store/reducers/formationSlice';
import type { Formation } from '../types';

interface FormationsModalProps {
  open: boolean;
  onClose: () => void;
  onApply: () => void;
  onShare: () => void;
}

export default function FormationsModal({
  open,
  onClose,
  onApply,
  onShare,
}: FormationsModalProps) {
  const dispatch = useAppDispatch();
  const { formations, selectedFormationId } = useAppSelector((state) => state.formation);

  const handleSelectFormation = (formation: Formation) => {
    dispatch(setSelectedFormationId(formation.id));
  };

  const handleApply = () => {
    const selectedFormation = formations.find((f) => f.id === selectedFormationId);
    if (selectedFormation) {
      dispatch(setCurrentFormation(selectedFormation));
    }
    onApply();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        className: 'bg-amber-100',
      }}
    >
      <DialogTitle className="flex items-center justify-between bg-amber-200">
        <Typography variant="h6" className="text-amber-900 font-bold">
          Formations
        </Typography>
        <IconButton
          onClick={onClose}
          className="bg-red-600 hover:bg-red-700 text-white"
          aria-label="Close formations modal"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent className="bg-amber-100">
        <Grid container spacing={2} className="mt-4">
          {formations.map((formation) => (
            <Grid item xs={6} key={formation.id}>
              <Box
                className={`
                  border-4 rounded-lg p-4 cursor-pointer transition-all
                  ${
                    selectedFormationId === formation.id
                      ? 'border-amber-400 bg-amber-200'
                      : 'border-amber-600 bg-amber-50'
                  }
                `}
                onClick={() => handleSelectFormation(formation)}
                role="button"
                tabIndex={0}
                aria-label={`Select formation ${formation.name}`}
              >
                <Box className="flex items-center gap-2 mb-2">
                  <Typography
                    variant="body2"
                    className="text-amber-900 font-bold bg-yellow-500 px-2 py-1 rounded"
                  >
                    {formation.id}
                  </Typography>
                  <Typography variant="body1" className="text-amber-900 font-bold">
                    {formation.name}
                  </Typography>
                  <IconButton
                    size="small"
                    className="ml-auto"
                    aria-label={`Edit formation ${formation.name}`}
                  >
                    <EditIcon className="text-amber-900" />
                  </IconButton>
                </Box>
                <Box className="flex gap-2">
                  {formation.tiles
                    .flat()
                    .filter((unit) => unit !== null)
                    .slice(0, 3)
                    .map((_unit, index) => (
                      <Box
                        key={index}
                        className="w-8 h-8 bg-gray-700 rounded border-2 border-gray-500"
                      />
                    ))}
                </Box>
                {selectedFormationId === formation.id && (
                  <Box className="flex items-center gap-1 mt-2">
                    <Typography variant="caption" className="text-gray-600">
                      SELECTED
                    </Typography>
                    <span className="text-green-600">✓</span>
                  </Box>
                )}
              </Box>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions className="bg-amber-100 flex justify-center gap-4 pb-4">
        <Button
          onClick={onShare}
          className="bg-yellow-600 hover:bg-yellow-700 text-amber-900 font-bold px-8 py-2 rounded-lg"
          aria-label="Share formation"
        >
          SHARE
        </Button>
        <Button
          onClick={handleApply}
          className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-2 rounded-lg"
          aria-label="Apply selected formation"
        >
          APPLY
        </Button>
      </DialogActions>
    </Dialog>
  );
}

