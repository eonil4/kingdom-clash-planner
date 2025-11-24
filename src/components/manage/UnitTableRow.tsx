import { TableCell, TableRow, TextField, Select, MenuItem, IconButton, Box } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Unit } from '../../types';
import { UnitRarity } from '../../types';
import { getUnitDataByName } from '../../types/unitNames';
import { UNIT_NAMES_ARRAY } from '../../types/unitNames';
import UnitCard from '../unit/UnitCard';

interface UnitTableRowProps {
  unit: Unit;
  unitCount: number;
  isEditing: boolean;
  editData: { name: string; level: number; rarity: UnitRarity; count: number };
  onRowEditChange: (unitId: string, field: string, value: string | number) => void;
  onRowEdit: (unit: Unit) => void;
  onRowSave: () => void;
  onRowCancel: () => void;
  onDelete: (unitId: string) => void;
}

export default function UnitTableRow({
  unit,
  unitCount,
  isEditing,
  editData,
  onRowEditChange,
  onRowEdit,
  onRowSave,
  onRowCancel,
  onDelete,
}: UnitTableRowProps) {
  return (
    <TableRow className="hover:bg-gray-600">
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
            {UNIT_NAMES_ARRAY.map((name) => (
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
            className={`px-2 py-1 rounded text-xs font-bold ${
              unit.rarity === UnitRarity.Legendary
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
          unitCount
        )}
      </TableCell>
      <TableCell>
        <Box className="flex gap-2">
          {isEditing ? (
            <>
              <IconButton
                size="small"
                onClick={onRowSave}
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
}

