import { Typography } from '@mui/material';
import Badge from './Badge';

interface PowerBadgeProps {
  power: number;
}

export default function PowerBadge({ power }: PowerBadgeProps) {
  return (
    <Badge
      className="bg-blue-900 border-2 border-yellow-500 rounded-lg px-6 py-2 flex items-center gap-2"
      style={{
        clipPath: 'polygon(5% 0%, 95% 0%, 100% 50%, 95% 100%, 5% 100%, 0% 50%)',
      }}
    >
      <span className="text-yellow-500 text-xl">👊</span>
      <Typography variant="body1" className="text-white font-bold text-lg">
        {power}
      </Typography>
    </Badge>
  );
}

