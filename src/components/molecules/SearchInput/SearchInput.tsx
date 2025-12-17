import { useState } from 'react';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { IconButton } from '../../atoms';
import { TextField } from '../../atoms';

interface SearchInputProps {
  onSearchChange: (searchTerm: string) => void;
  placeholder?: string;
  className?: string;
  ariaLabel?: string;
}

export default function SearchInput({ 
  onSearchChange, 
  placeholder = 'Search...',
  className = 'bg-gray-700',
  ariaLabel
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
      inputProps={{
        'aria-label': ariaLabel || placeholder,
      }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon className="text-gray-300" aria-hidden="true" />
          </InputAdornment>
        ),
        endAdornment: searchTerm && (
          <InputAdornment position="end">
            <IconButton
              icon={<ClearIcon fontSize="small" />}
              size="small"
              onClick={handleClear}
              className="text-gray-300 hover:text-white"
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
          color: 'rgba(255, 255, 255, 0.7)',
          opacity: 1,
        },
      }}
    />
  );
}
