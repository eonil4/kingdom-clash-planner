import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TextField,
    Select,
    MenuItem,
    IconButton,
    Button,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import type { Unit } from '../../types';
import { UnitRarity } from '../../types';
import { UNIT_NAMES_ARRAY, getUnitDataByName } from '../../types/unitNames';
import UnitCard from '../unit/UnitCard';
import UnitFilters from './UnitFilters';
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
    const allUnitNames = UNIT_NAMES_ARRAY;

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
                        <TableCell
                            className="text-white font-bold cursor-pointer hover:bg-gray-800 select-none"
                            onClick={() => onSort('name')}
                        >
                            <Box className="flex items-center gap-1">
                                Name
                                {sortColumn === 'name' && (
                                    sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                                )}
                            </Box>
                        </TableCell>
                        <TableCell
                            className="text-white font-bold cursor-pointer hover:bg-gray-800 select-none"
                            onClick={() => onSort('level')}
                        >
                            <Box className="flex items-center gap-1">
                                Level
                                {sortColumn === 'level' && (
                                    sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                                )}
                            </Box>
                        </TableCell>
                        <TableCell
                            className="text-white font-bold cursor-pointer hover:bg-gray-800 select-none"
                            onClick={() => onSort('rarity')}
                        >
                            <Box className="flex items-center gap-1">
                                Rarity
                                {sortColumn === 'rarity' && (
                                    sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                                )}
                            </Box>
                        </TableCell>
                        <TableCell
                            className="text-white font-bold cursor-pointer hover:bg-gray-800 select-none"
                            onClick={() => onSort('count')}
                        >
                            <Box className="flex items-center gap-1">
                                Count
                                {sortColumn === 'count' && (
                                    sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                                )}
                            </Box>
                        </TableCell>
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

                        return (
                            <TableRow key={unit.id} className="hover:bg-gray-600">
                                <TableCell>
                                    <div className="w-12 h-12">
                                        <UnitCard unit={unit} />
                                    </div>
                                </TableCell>
                                <TableCell className="text-white font-semibold">
                                    {isEditing ? (
                                        <Select
                                            value={editData.name}
                                            onChange={(e) => {
                                                const selectedName = e.target.value;
                                                const unitData = getUnitDataByName(selectedName);
                                                onRowEditChange(unit.id, 'name', selectedName);
                                                if (unitData) {
                                                    onRowEditChange(unit.id, 'rarity', unitData.rarity);
                                                }
                                            }}
                                            size="small"
                                            className="text-white min-w-[150px]"
                                            MenuProps={{
                                                PaperProps: {
                                                    className: 'bg-gray-700 max-h-60',
                                                },
                                            }}
                                        >
                                            {allUnitNames.map((name) => (
                                                <MenuItem key={name} value={name} className="text-white hover:bg-gray-600">
                                                    {name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    ) : (
                                        unit.name
                                    )}
                                </TableCell>
                                <TableCell className="text-white">
                                    {isEditing ? (
                                        <TextField
                                            type="number"
                                            value={editData.level}
                                            onChange={(e) => onRowEditChange(unit.id, 'level', parseInt(e.target.value) || 1)}
                                            inputProps={{ min: 1, max: 10 }}
                                            size="small"
                                            className="w-20"
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                                                    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.4)' },
                                                    '&.Mui-focused fieldset': { borderColor: 'rgba(255, 255, 255, 0.6)' },
                                                },
                                                '& .MuiInputBase-input': { color: 'white', padding: '8px' },
                                            }}
                                        />
                                    ) : (
                                        unit.level
                                    )}
                                </TableCell>
                                <TableCell className="text-white">
                                    {isEditing ? (
                                        <Select
                                            value={editData.rarity}
                                            onChange={(e) => onRowEditChange(unit.id, 'rarity', e.target.value as UnitRarity)}
                                            size="small"
                                            className="text-white min-w-[120px]"
                                            MenuProps={{
                                                PaperProps: {
                                                    className: 'bg-gray-700',
                                                },
                                            }}
                                        >
                                            {Object.values(UnitRarity).map((rarity) => (
                                                <MenuItem key={rarity} value={rarity} className="text-white hover:bg-gray-600">
                                                    {rarity}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    ) : (
                                        <span
                                            className={`px-2 py-1 rounded text-xs font-bold ${unit.rarity === UnitRarity.Legendary
                                                ? 'bg-yellow-600 text-yellow-100'
                                                : unit.rarity === UnitRarity.Epic
                                                    ? 'bg-purple-600 text-purple-100'
                                                    : unit.rarity === UnitRarity.Rare
                                                        ? 'bg-blue-600 text-blue-100'
                                                        : 'bg-gray-600 text-gray-100'
                                                }`}
                                        >
                                            {unit.rarity}
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell className="text-white">
                                    {isEditing ? (
                                        <TextField
                                            type="number"
                                            value={editData.count}
                                            onChange={(e) => onRowEditChange(unit.id, 'count', parseInt(e.target.value) || 1)}
                                            inputProps={{ min: 1, max: 100 }}
                                            size="small"
                                            className="w-20"
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                                                    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.4)' },
                                                    '&.Mui-focused fieldset': { borderColor: 'rgba(255, 255, 255, 0.6)' },
                                                },
                                                '& .MuiInputBase-input': { color: 'white', padding: '8px' },
                                            }}
                                        />
                                    ) : (
                                        unitCounts[`${unit.name}-${unit.level}`] || 1
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Box className="flex gap-2">
                                        {isEditing ? (
                                            <>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => onRowSave()}
                                                    className="text-green-400 hover:bg-green-900"
                                                    aria-label={`Save ${unit.name}`}
                                                >
                                                    <CheckIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    onClick={onRowCancel}
                                                    className="text-gray-400 hover:bg-gray-700"
                                                    aria-label="Cancel"
                                                >
                                                    <CloseIcon fontSize="small" />
                                                </IconButton>
                                            </>
                                        ) : (
                                            <>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => onRowEdit(unit)}
                                                    className="text-blue-400 hover:bg-blue-900"
                                                    aria-label={`Edit ${unit.name}`}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => onDelete(unit.id)}
                                                    className="text-red-400 hover:bg-red-900"
                                                    aria-label={`Delete ${unit.name}`}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </>
                                        )}
                                    </Box>
                                </TableCell>
                            </TableRow>
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
