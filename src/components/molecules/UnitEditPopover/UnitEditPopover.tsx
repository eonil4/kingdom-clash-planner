import { useState } from 'react';
import Popover from '@mui/material/Popover';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import EditIcon from '@mui/icons-material/Edit';
import type { Unit } from '../../../types';
import { UNIT_NAMES_ARRAY, getUnitDataByName } from '../../../types/unitNames';
import { formatNumber, calculateUnitPower } from '../../../utils/powerUtils';
import { getUnitImagePath } from '../../../utils/imageUtils';
import { UnitImage } from '../../atoms';

interface UnitEditPopoverProps {
  unit: Unit;
  onEdit: (updatedUnit: Unit) => void;
}

export default function UnitEditPopover({ unit, onEdit }: UnitEditPopoverProps) {
  const [editAnchorEl, setEditAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [editName, setEditName] = useState(unit.name);
  const [editLevel, setEditLevel] = useState(unit.level);

  const isEditOpen = Boolean(editAnchorEl);

  const handleEditClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    setEditAnchorEl(e.currentTarget);
    setEditName(unit.name);
    setEditLevel(unit.level);
  };

  const handleEditClose = () => {
    setEditAnchorEl(null);
  };

  const handleEditSave = () => {
    const unitData = getUnitDataByName(editName);
    const newRarity = unitData?.rarity || unit.rarity;
    const newPower = calculateUnitPower(newRarity, editLevel);

    const updatedUnit: Unit = {
      ...unit,
      name: editName,
      level: editLevel,
      rarity: newRarity,
      power: newPower,
      imageUrl: getUnitImagePath(editName),
    };
    onEdit(updatedUnit);
    setEditAnchorEl(null);
  };

  return (
    <>
      <IconButton
        size="small"
        onClick={handleEditClick}
        sx={{
          color: '#fbbf24',
          backgroundColor: 'rgba(255,255,255,0.1)',
          '&:hover': { backgroundColor: 'rgba(251,191,36,0.3)' },
          padding: '4px',
        }}
        aria-label="Edit unit"
      >
        <EditIcon sx={{ fontSize: 'clamp(14px, 3vw, 20px)' }} />
      </IconButton>

      <Popover
        open={isEditOpen}
        anchorEl={editAnchorEl}
        onClose={handleEditClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        slotProps={{
          paper: {
            sx: {
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              minWidth: '240px',
            },
          },
        }}
      >
        <Box className="p-4">
          <Typography variant="subtitle2" className="text-white mb-3 font-bold">
            Edit Unit
          </Typography>

          {/* Unit Type Select */}
          <FormControl fullWidth size="small" className="mb-3">
            <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Unit Type</InputLabel>
            <Select
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              label="Unit Type"
              MenuProps={{
                PaperProps: {
                  sx: {
                    backgroundColor: '#374151',
                    maxHeight: '200px',
                  },
                },
              }}
              sx={{
                color: 'white',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255,255,255,0.3)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255,255,255,0.5)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#fbbf24',
                },
                '& .MuiSvgIcon-root': {
                  color: 'white',
                },
              }}
            >
              {UNIT_NAMES_ARRAY.map((name) => (
                <MenuItem key={name} value={name} sx={{ color: 'white', '&:hover': { backgroundColor: '#4b5563' } }}>
                  {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Level Slider */}
          <Box className="mb-3">
            <Typography variant="caption" className="text-gray-400">
              Level: <span className="text-white font-bold">{editLevel}</span>
            </Typography>
            <Slider
              value={editLevel}
              onChange={(_, value) => setEditLevel(value as number)}
              min={1}
              max={10}
              step={1}
              marks
              sx={{
                color: '#fbbf24',
                '& .MuiSlider-mark': {
                  backgroundColor: 'rgba(255,255,255,0.3)',
                },
                '& .MuiSlider-markActive': {
                  backgroundColor: '#fbbf24',
                },
              }}
            />
          </Box>

          {/* Preview */}
          <Box className="mb-3 p-2 bg-gray-800 rounded flex items-center gap-2">
            <Box className="w-10 h-10 rounded overflow-hidden border border-gray-600">
              <UnitImage
                name={editName}
                rarity={getUnitDataByName(editName)?.rarity || unit.rarity}
                imageUrl={getUnitImagePath(editName)}
                fontSize="0.5rem"
              />
            </Box>
            <Box>
              <Typography variant="caption" className="text-white block">{editName}</Typography>
              <Typography variant="caption" className="text-gray-400">
                Lv.{editLevel} • {formatNumber(calculateUnitPower(getUnitDataByName(editName)?.rarity || unit.rarity, editLevel))} power
              </Typography>
            </Box>
          </Box>

          {/* Buttons */}
          <Box className="flex gap-2 justify-end">
            <Button
              size="small"
              onClick={handleEditClose}
              sx={{ color: 'rgba(255,255,255,0.7)' }}
            >
              Cancel
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={handleEditSave}
              sx={{
                backgroundColor: '#fbbf24',
                color: '#1f2937',
                '&:hover': { backgroundColor: '#f59e0b' },
              }}
            >
              Save
            </Button>
          </Box>
        </Box>
      </Popover>
    </>
  );
}