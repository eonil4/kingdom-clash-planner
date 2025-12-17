import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function FormationFooter() {
  return (
    <Box
      component="footer"
      className="w-full p-4 bg-gray-800 text-center"
    >
      <Typography variant="body2" className="text-gray-400">
        Kingdom Clash Planner - Plan your formations strategically
      </Typography>
    </Box>
  );
}
