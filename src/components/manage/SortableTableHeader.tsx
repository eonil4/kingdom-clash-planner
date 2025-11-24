import { TableCell, Box } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import type { SortColumn, SortDirection } from '../../hooks/useManageUnits';

interface SortableTableHeaderProps {
  column: SortColumn;
  label: string;
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  onSort: (column: SortColumn) => void;
}

export default function SortableTableHeader({
  column,
  label,
  sortColumn,
  sortDirection,
  onSort,
}: SortableTableHeaderProps) {
  return (
    <TableCell
      className="text-white font-bold cursor-pointer hover:bg-gray-800 select-none"
      onClick={() => onSort(column)}
    >
      <Box className="flex items-center gap-1">
        {label}
        {sortColumn === column && (
          sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
        )}
      </Box>
    </TableCell>
  );
}

