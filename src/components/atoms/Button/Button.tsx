import MuiButton from '@mui/material/Button';
import type { ButtonProps as MuiButtonProps } from '@mui/material/Button';

export type ButtonProps = MuiButtonProps;

export default function Button(props: ButtonProps) {
  return <MuiButton {...props} />;
}
