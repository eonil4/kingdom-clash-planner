import TableCell from '@mui/material/TableCell';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import type { SortColumn, SortDirection } from '../../../hooks/useManageUnits';

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
  const isSorted = sortColumn === column;
  const isAscending = isSorted && sortDirection === 'asc';

  return (
    <TableCell
      onClick={() => onSort(column)}
      className="text-white cursor-pointer hover:bg-gray-700 select-none"
      sx={{
        userSelect: 'none',
        '&:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
        },
      }}
    >
      <div className="flex items-center gap-1">
        <span>{label}</span>
        {isSorted && (
          <span className="flex items-center">
            {isAscending ? (
              <ArrowUpwardIcon fontSize="small" />
            ) : (
              <ArrowDownwardIcon fontSize="small" />
            )}
          </span>
        )}
      </div>
    </TableCell>
  );
}
