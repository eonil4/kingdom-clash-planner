import { useAppSelector } from '../store/hooks';
import { Typography, Box } from '@mui/material';

export default function FormationHeader() {
  const currentFormation = useAppSelector((state) => state.formation.currentFormation);

  return (
    <Box
      component="header"
      className="w-full p-4 bg-gradient-to-b from-gray-700 to-gray-800 flex items-center justify-center"
      style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
      }}
    >
      <Box className="flex flex-col items-center">
        <Typography
          variant="h6"
          className="text-white font-bold mb-2 text-xl"
          component="h1"
        >
          {currentFormation?.name || 'Formation'}
        </Typography>
        <Box
          className="bg-blue-900 border-2 border-yellow-500 rounded-lg px-6 py-2 flex items-center gap-2"
          style={{
            clipPath: 'polygon(5% 0%, 95% 0%, 100% 50%, 95% 100%, 5% 100%, 0% 50%)',
          }}
        >
          <span className="text-yellow-500 text-xl">👊</span>
          <Typography variant="body1" className="text-white font-bold text-lg">
            {currentFormation?.power || 0}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

