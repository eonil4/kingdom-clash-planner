import { Typography, Box } from '@mui/material';

interface UnitCountBadgeProps {
  count: number;
}

export default function UnitCountBadge({ count }: UnitCountBadgeProps) {
  return (
    <Box className="bg-blue-900 border-2 border-blue-500 rounded-lg px-3 py-1">
      <Typography variant="body2" className="text-white font-bold">
        {count}
      </Typography>
    </Box>
  );
}

