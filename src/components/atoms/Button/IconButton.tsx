import { IconButton as MuiIconButton } from '@mui/material';
import type { IconButtonProps as MuiIconButtonProps } from '@mui/material';

interface IconButtonProps extends Omit<MuiIconButtonProps, 'children'> {
  icon: React.ReactNode;
  'aria-label': string;
}

export default function IconButton({ icon, className = '', sx, ...props }: IconButtonProps) {
  return (
    <MuiIconButton className={className} sx={sx} {...props}>
      {icon}
    </MuiIconButton>
  );
}

