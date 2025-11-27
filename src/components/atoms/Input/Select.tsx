import { Select as MuiSelect } from '@mui/material';
import type { SelectProps as MuiSelectProps } from '@mui/material';

export type SelectProps<T = unknown> = MuiSelectProps<T>;

export default function Select<T = unknown>(props: SelectProps<T>) {
  return <MuiSelect {...props} />;
}

