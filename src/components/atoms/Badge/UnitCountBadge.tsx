import { Typography } from '@mui/material';
import Badge from './Badge';
import { formatNumber } from '../../../utils/powerUtils';

interface UnitCountBadgeProps {
  count: number;
}

export default function UnitCountBadge({ count }: UnitCountBadgeProps) {
  return (
    <Badge className="bg-blue-900 border-2 border-blue-500 rounded-lg px-3 py-1">
      <Typography variant="body2" className="text-white font-bold">
        {formatNumber(count)}
      </Typography>
    </Badge>
  );
}
