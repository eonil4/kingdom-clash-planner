import { TextField as MuiTextField } from '@mui/material';
import type { TextFieldProps as MuiTextFieldProps } from '@mui/material';

export type TextFieldProps = MuiTextFieldProps;

export default function TextField(props: TextFieldProps) {
  return <MuiTextField {...props} />;
}

