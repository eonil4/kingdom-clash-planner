import { useNavigate } from 'react-router-dom';
import { Button, Box, Typography } from '@mui/material';

export default function FormationsList() {
  const navigate = useNavigate();

  return (
    <Box className="min-h-screen bg-gray-900 flex items-center justify-center">
      <Box className="text-center">
        <Typography variant="h4" className="text-white mb-4">
          Formations List
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/planner')}
          className="bg-green-600 hover:bg-green-700"
        >
          Open Formation Planner
        </Button>
      </Box>
    </Box>
  );
}

