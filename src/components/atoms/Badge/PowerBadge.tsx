import { Typography } from '@mui/material';
import Badge from './Badge';
import { formatNumber } from '../../../utils/powerUtils';

interface PowerBadgeProps {
  power: number;
}

export default function PowerBadge({ power }: PowerBadgeProps) {
  return (
    <Badge className="bg-gray-700 border border-yellow-500 rounded px-4 py-1 flex items-center gap-2">
      <span className="text-yellow-500">⚔</span>
      <Typography variant="body2" className="text-white font-medium">
        {formatNumber(power)}
      </Typography>
    </Badge>
  );
}
