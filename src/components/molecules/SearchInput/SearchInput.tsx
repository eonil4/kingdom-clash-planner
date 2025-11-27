import { useState } from 'react';
import { InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { IconButton } from '../../atoms';
import { TextField } from '../../atoms';

interface SearchInputProps {
  onSearchChange: (searchTerm: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchInput({ 
  onSearchChange, 
  placeholder = 'Search...',
  className = 'bg-gray-700'
}: SearchInputProps) {
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
      placeholder={placeholder}
      value={searchTerm}
      onChange={handleChange}
      className={className}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon className="text-gray-400" />
          </InputAdornment>
        ),
        endAdornment: searchTerm && (
          <InputAdornment position="end">
            <IconButton
              icon={<ClearIcon fontSize="small" />}
              size="small"
              onClick={handleClear}
              className="text-gray-400"
              aria-label="Clear search"
            />
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

