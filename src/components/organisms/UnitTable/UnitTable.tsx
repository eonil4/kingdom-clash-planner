import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import type { Unit } from '../../../types';
import { UnitRarity } from '../../../types';
import { SortableTableHeader } from '../../molecules';
import { UnitTableRow } from '../../molecules';
import type { SortColumn, SortDirection } from '../../../hooks/useManageUnits';

interface UnitTableProps {
  uniqueUnits: Unit[];
  unitCounts: Record<string, number>;
  editingRowId: string | null;
  rowEditData: Record<string, { name: string; level: number; rarity: UnitRarity; count: number }>;
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  onRowEdit: (unit: Unit) => void;
  onRowEditChange: (unitId: string, field: string, value: string | number) => void;
  onRowSave: () => void;
  onRowCancel: () => void;
  onDelete: (unitId: string) => void;
  onSort: (column: SortColumn) => void;
}

export default function UnitTable({
  uniqueUnits,
  unitCounts,
  editingRowId,
  rowEditData,
  sortColumn,
  sortDirection,
  onRowEdit,
  onRowEditChange,
  onRowSave,
  onRowCancel,
  onDelete,
  onSort,
}: UnitTableProps) {
  return (
    <Box>
      <TableContainer component={Paper} className="bg-gray-700 max-h-96 overflow-auto">
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <SortableTableHeader
                column="name"
                label="Unit"
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={onSort}
              />
              <SortableTableHeader
                column="name"
                label="Name"
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={onSort}
              />
              <SortableTableHeader
                column="level"
                label="Level"
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={onSort}
              />
              <SortableTableHeader
                column="rarity"
                label="Rarity"
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={onSort}
              />
              <SortableTableHeader
                column={null}
                label="Roles"
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={() => {}}
              />
              <SortableTableHeader
                column="count"
                label="Count"
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={onSort}
              />
              <SortableTableHeader
                column={null}
                label="Actions"
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={() => {}}
              />
            </TableRow>
          </TableHead>
          <TableBody>
            {uniqueUnits.map((unit) => {
              const key = `${unit.name}-${unit.level}`;
              return (
              <UnitTableRow
                key={unit.id}
                unit={unit}
                unitCount={unitCounts[key] || 0}
                isEditing={editingRowId === unit.id}
                editData={rowEditData[unit.id] || { name: unit.name, level: unit.level, rarity: unit.rarity, count: unitCounts[key] || 0 }}
                onRowEdit={onRowEdit}
                onRowEditChange={onRowEditChange}
                onRowSave={onRowSave}
                onRowCancel={onRowCancel}
                onDelete={onDelete}
              />
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
