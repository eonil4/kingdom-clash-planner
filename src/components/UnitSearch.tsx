import { useState } from 'react';
import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import IconButton from '@mui/material/IconButton';

interface UnitSearchProps {
  onSearchChange: (searchTerm: string) => void;
}

export default function UnitSearch({ onSearchChange }: UnitSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    onSearchChange(value);
  };

  const handleClear = () => {
    setSearchTerm('');
    onSearchChange('');
  };

  return (
    <TextField
      fullWidth
      size="small"
      placeholder="Search units..."
      value={searchTerm}
      onChange={handleChange}
      className="bg-gray-700"
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon className="text-gray-400" />
          </InputAdornment>
        ),
        endAdornment: searchTerm && (
          <InputAdornment position="end">
            <IconButton
              size="small"
              onClick={handleClear}
              className="text-gray-400"
              aria-label="Clear search"
            >
              <ClearIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        ),
        className: 'text-white',
        sx: {
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255, 255, 255, 0.3)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255, 255, 255, 0.5)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255, 255, 255, 0.7)',
          },
        },
      }}
      sx={{
        '& .MuiInputBase-input': {
          color: 'white',
        },
        '& .MuiInputBase-input::placeholder': {
          color: 'rgba(255, 255, 255, 0.5)',
          opacity: 1,
        },
      }}
    />
  );
}

