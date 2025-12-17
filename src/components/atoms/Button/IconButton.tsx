import MuiIconButton from '@mui/material/IconButton';
import type { IconButtonProps as MuiIconButtonProps } from '@mui/material/IconButton';

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
