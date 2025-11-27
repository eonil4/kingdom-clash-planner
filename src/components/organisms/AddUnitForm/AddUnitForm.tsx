import {
    Box,
    Typography,
    MenuItem,
    Button,
    Checkbox,
    FormControlLabel,
    FormControl,
    InputLabel,
} from '@mui/material';
import type { Unit } from '../../../types';
import { UnitRarity } from '../../../types';
import { UNIT_NAMES_ARRAY, getUnitDataByName } from '../../../types/unitNames';
import { normalizeUnitName } from '../../../utils/unitNameUtils';
import { getUnitImagePath } from '../../../utils/imageUtils';
import { UnitCard } from '../../molecules';
import { TextField, Select } from '../../atoms';

interface AddUnitFormProps {
    formData: {
        name: string;
        level: number;
        rarity: UnitRarity;
        count: number;
    };
    selectedLevels: number[];
    levelCounts: Record<number, number>;
    units: Unit[];
    formationUnitCount: number;
    onNameChange: (name: string) => void;
    onLevelToggle: (level: number) => void;
    onLevelCountChange: (level: number, count: number) => void;
    onSelectAllLevels: (selected: boolean) => void;
    onSave: () => void;
    onCancel: () => void;
}

export default function AddUnitForm({
    formData,
    selectedLevels,
    levelCounts,
    units,
    formationUnitCount,
    onNameChange,
    onLevelToggle,
    onLevelCountChange,
    onSelectAllLevels,
    onSave,
    onCancel,
}: AddUnitFormProps) {
    const allUnitNames = UNIT_NAMES_ARRAY;
    const totalUnitCount = units.length + formationUnitCount;

    const previewUnit: Unit = {
        id: 'preview',
        name: formData.name || 'Select Unit',
        level: 1,
        rarity: formData.rarity,
        power: formData.name && getUnitDataByName(formData.name) 
            ? getUnitDataByName(formData.name)!.getPower(1)
            : 0,
        imageUrl: formData.name ? getUnitImagePath(formData.name) : undefined,
    };

    return (
        <Box className="bg-gray-800 p-4 rounded-lg mb-4 border border-gray-700">
            <Typography variant="h6" className="text-white mb-4">
                Add New Unit
            </Typography>

            <Box className="flex flex-col gap-4">
                <Box className="flex gap-4">
                    <Box className="w-32 h-32 flex-shrink-0 flex items-center justify-center">
                        <UnitCard unit={previewUnit} size="100%" />
                    </Box>

                    <Box className="flex-grow flex flex-col gap-4">
                        <FormControl fullWidth size="small">
                            <InputLabel className="text-gray-400">Unit Name</InputLabel>
                            <Select
                                value={formData.name}
                                onChange={(e) => onNameChange(e.target.value)}
                                label="Unit Name"
                                className="text-white"
                                MenuProps={{
                                    PaperProps: {
                                        className: 'bg-gray-700 max-h-60',
                                    },
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'rgba(255, 255, 255, 0.23)',
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'rgba(255, 255, 255, 0.4)',
                                    },
                                    '& .MuiSvgIcon-root': {
                                        color: 'white',
                                    },
                                }}
                            >
                                {allUnitNames.map((name) => (
                                    <MenuItem key={name} value={name} className="text-white hover:bg-gray-600">
                                        {name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Box className="flex justify-end gap-2 mt-auto">
                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={onCancel}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={onSave}
                                disabled={!formData.name || selectedLevels.length === 0}
                            >
                                Add Units
                            </Button>
                        </Box>
                    </Box>
                </Box>

                <Box>
                    <Box className="flex justify-between items-center mb-2">
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={selectedLevels.length === 10}
                                    indeterminate={selectedLevels.length > 0 && selectedLevels.length < 10}
                                    onChange={(e) => onSelectAllLevels(e.target.checked)}
                                    size="small"
                                    sx={{
                                        color: 'rgba(255, 255, 255, 0.7)',
                                        '&.Mui-checked': {
                                            color: '#3b82f6',
                                        },
                                        '&.MuiCheckbox-indeterminate': {
                                            color: '#3b82f6',
                                        },
                                    }}
                                />
                            }
                            label="Select All Levels"
                            className="text-white"
                        />
                        <Box className="text-right">
                            <Typography variant="caption" className="text-gray-400 text-xs block">
                                Max: 49 per level
                            </Typography>
                            <Typography variant="caption" className="text-gray-400 text-xs block">
                                Total: {totalUnitCount} / 1000 (Roster: {units.length}, Formation: {formationUnitCount})
                            </Typography>
                        </Box>
                    </Box>

                    <Box>
                        <Typography variant="caption" className="text-gray-300 text-xs mb-1 block">
                            Levels
                        </Typography>
                        <Box className="flex flex-wrap" sx={{ gap: '16px' }}>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => {
                                const isSelected = selectedLevels.includes(level);
                                const levelCount = levelCounts[level] || 1;
                                const normalizedName = normalizeUnitName(formData.name.trim());
                                const existingCount = normalizedName ? units.filter(
                                    (u) => normalizeUnitName(u.name) === normalizedName && u.level === level
                                ).length : 0;
                                const isMaxReached = existingCount >= 49;

                                return (
                                    <Box
                                        key={level}
                                        className="flex items-center"
                                        sx={{
                                            gap: '4px',
                                            whiteSpace: 'nowrap',
                                            flexShrink: 0,
                                            border: '1px solid rgba(255, 255, 255, 0.23)',
                                            borderRadius: '4px',
                                            padding: '2px 4px',
                                            alignItems: 'center',
                                            opacity: isMaxReached && !isSelected ? 0.5 : 1,
                                            '&:hover': {
                                                borderColor: 'rgba(255, 255, 255, 0.4)',
                                            },
                                        }}
                                    >
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={isSelected}
                                                    onChange={() => onLevelToggle(level)}
                                                    disabled={isMaxReached && !isSelected}
                                                    size="small"
                                                    sx={{
                                                        color: 'rgba(255, 255, 255, 0.7)',
                                                        padding: '0px',
                                                        margin: '0px',
                                                        '&.Mui-checked': {
                                                            color: '#3b82f6',
                                                        },
                                                        '&.Mui-disabled': {
                                                            color: 'rgba(255, 255, 255, 0.3)',
                                                        },
                                                    }}
                                                />
                                            }
                                            label={level.toString()}
                                            className="text-white m-0"
                                            sx={{
                                                margin: 0,
                                                marginRight: 0,
                                                marginLeft: 0,
                                                '&.MuiFormControlLabel-root': {
                                                    margin: 0,
                                                    marginRight: 0,
                                                },
                                                '& .MuiFormControlLabel-label': {
                                                    color: 'white',
                                                    fontSize: '0.75rem',
                                                    marginLeft: '2px',
                                                    minWidth: '16px',
                                                    padding: 0,
                                                },
                                            }}
                                        />
                                        <TextField
                                            type="number"
                                            value={levelCount}
                                            onChange={(e) => onLevelCountChange(level, parseInt(e.target.value) || 1)}
                                            inputProps={{ min: 1, max: 100 }}
                                            size="small"
                                            disabled={!isSelected}
                                            className="w-14"
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    height: '28px',
                                                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                                                    '&:hover fieldset': { borderColor: isSelected ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.1)' },
                                                    '&.Mui-focused fieldset': { borderColor: 'rgba(255, 255, 255, 0.6)' },
                                                    '&.Mui-disabled': {
                                                        opacity: 0.5,
                                                    },
                                                },
                                                '& .MuiInputBase-input': {
                                                    color: 'white',
                                                    padding: '2px 4px',
                                                    fontSize: '0.75rem',
                                                    textAlign: 'center',
                                                },
                                            }}
                                        />
                                    </Box>
                                );
                            })}
                        </Box>
                        {selectedLevels.length === 0 && (
                            <Typography variant="caption" className="text-yellow-400 text-xs mt-1 block">
                                Please select at least one level
                            </Typography>
                        )}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

