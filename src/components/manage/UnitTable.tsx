import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
} from '@mui/material';
import type { Unit } from '../../types';
import { UnitRarity } from '../../types';
import UnitFilters from './UnitFilters';
import UnitTableRow from './UnitTableRow';
import SortableTableHeader from './SortableTableHeader';
import type { SortColumn, SortDirection, UnitFilters as UnitFiltersType } from '../../hooks/useManageUnits';

interface UnitTableProps {
    uniqueUnits: Unit[];
    unitCounts: Record<string, number>;
    editingRowId: string | null;
    rowEditData: Record<string, { name: string; level: number; rarity: UnitRarity; count: number }>;
    sortColumn: SortColumn;
    sortDirection: SortDirection;
    filters: UnitFiltersType;
    onSort: (column: SortColumn) => void;
    onFilterChange: (field: keyof UnitFiltersType, value: string | UnitRarity) => void;
    onClearFilters: () => void;
    onRowEdit: (unit: Unit) => void;
    onRowEditChange: (unitId: string, field: string, value: string | number) => void;
    onRowSave: () => void;
    onRowCancel: () => void;
    onDelete: (unitId: string) => void;
}

export default function UnitTable({
    uniqueUnits,
    unitCounts,
    editingRowId,
    rowEditData,
    sortColumn,
    sortDirection,
    filters,
    onSort,
    onFilterChange,
    onClearFilters,
    onRowEdit,
    onRowEditChange,
    onRowSave,
    onRowCancel,
    onDelete,
}: UnitTableProps) {
    const hasActiveFilters =
        filters.name ||
        filters.levelMin ||
        filters.levelMax ||
        filters.rarityMin ||
        filters.rarityMax ||
        filters.countMin ||
        filters.countMax;

    return (
        <TableContainer
            component={Paper}
            className="bg-gray-700"
            sx={{
                maxHeight: 'calc(100vh - 400px)',
                overflow: 'auto'
            }}
        >
            <Table stickyHeader>
                <TableHead>
                    <TableRow className="bg-gray-900">
                        <TableCell className="text-white font-bold">Preview</TableCell>
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
                            column="count"
                            label="Count"
                            sortColumn={sortColumn}
                            sortDirection={sortDirection}
                            onSort={onSort}
                        />
                        <TableCell className="text-white font-bold">Actions</TableCell>
                    </TableRow>
                    <TableRow className="bg-gray-800" sx={{ position: 'sticky', top: '56px', zIndex: 10 }}>
                        <TableCell sx={{ backgroundColor: '#1f2937' }}></TableCell>
                        <TableCell sx={{ backgroundColor: '#1f2937' }} colSpan={4}>
                            <Box className="flex items-center gap-4">
                                <UnitFilters filters={filters} onFilterChange={onFilterChange} />
                            </Box>
                        </TableCell>
                        <TableCell sx={{ backgroundColor: '#1f2937' }}>
                            {hasActiveFilters && (
                                <Button
                                    size="small"
                                    onClick={onClearFilters}
                                    className="text-gray-300 hover:text-white text-xs"
                                >
                                    Clear
                                </Button>
                            )}
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {uniqueUnits.map((unit) => {
                        const isEditing = editingRowId === unit.id;
                        const unitKey = `${unit.name}-${unit.level}`;
                        const editData = rowEditData[unit.id] || { name: unit.name, level: unit.level, rarity: unit.rarity, count: unitCounts[unitKey] || 1 };
                        const unitCount = unitCounts[unitKey] || 1;

                        return (
                            <UnitTableRow
                                key={unit.id}
                                unit={unit}
                                unitCount={unitCount}
                                isEditing={isEditing}
                                editData={editData}
                                onRowEditChange={onRowEditChange}
                                onRowEdit={onRowEdit}
                                onRowSave={onRowSave}
                                onRowCancel={onRowCancel}
                                onDelete={onDelete}
                            />
                        );
                    })}
                    {uniqueUnits.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center text-gray-400 py-8">
                                No units in roster. Add your first unit!
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
