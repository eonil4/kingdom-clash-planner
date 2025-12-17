import Box from '@mui/material/Box';
import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function Badge({ children, className = '', style }: BadgeProps) {
  return (
    <Box className={className} style={style}>
      {children}
    </Box>
  );
}
