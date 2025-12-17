import MuiSelect from '@mui/material/Select';
import type { SelectProps as MuiSelectProps } from '@mui/material/Select';

export type SelectProps<T = unknown> = MuiSelectProps<T>;

export default function Select<T = unknown>(props: SelectProps<T>) {
  return <MuiSelect {...props} />;
}
