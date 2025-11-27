import { useState, useRef, useEffect } from 'react';
import { Typography, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { IconButton } from '../../atoms';
import { TextField } from '../../atoms';

interface EditableTextProps {
  value: string;
  onSave: (value: string) => void;
  placeholder?: string;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body1' | 'body2';
  className?: string;
  showEditIcon?: boolean;
  leftAction?: React.ReactNode;
  editAriaLabel?: string;
}

export default function EditableText({ 
  value, 
  onSave, 
  placeholder = '',
  variant = 'h6',
  className = '',
  showEditIcon = true,
  leftAction,
  editAriaLabel = 'Edit'
}: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleEditClick = () => {
    setEditValue(value);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editValue.trim()) {
      onSave(editValue.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  return (
    <Box className={`relative flex items-center justify-center w-full ${className}`}>
      {isEditing ? (
        <TextField
          inputRef={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          variant="outlined"
          size="small"
          className="bg-white"
          sx={{
            '& .MuiOutlinedInput-root': {
              color: '#000',
              '& fieldset': {
                borderColor: '#fff',
              },
            },
          }}
          inputProps={{
            style: { 
              fontSize: '1.25rem',
              fontWeight: 'bold',
              padding: '8px 12px',
            },
          }}
        />
      ) : (
        <>
          {leftAction && (
            <Box
              sx={{
                position: 'absolute',
                left: 0,
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            >
              {leftAction}
            </Box>
          )}
          <Typography
            variant={variant}
            className="text-white font-bold text-xl text-center"
            component="h1"
            sx={{ flex: 1, textAlign: 'center' }}
          >
            {value || placeholder}
          </Typography>
          {showEditIcon && (
            <IconButton
              icon={<EditIcon fontSize="small" />}
              size="small"
              onClick={handleEditClick}
              className="text-white hover:text-yellow-400"
              aria-label={editAriaLabel}
              sx={{
                position: 'absolute',
                right: 0,
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            />
          )}
        </>
      )}
    </Box>
  );
}

