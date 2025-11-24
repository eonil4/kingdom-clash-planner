import { useState, useRef, useEffect } from 'react';
import { Typography, Box, IconButton, TextField } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import HelpIcon from '@mui/icons-material/Help';

interface FormationNameEditorProps {
  name: string;
  onSave: (name: string) => void;
  onHelpClick: () => void;
}

export default function FormationNameEditor({ name, onSave, onHelpClick }: FormationNameEditorProps) {
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
    setEditValue(name);
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
    <Box className="relative flex items-center justify-center mb-2 w-full" sx={{ position: 'relative', width: '100%' }}>
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
          <IconButton
            size="small"
            onClick={onHelpClick}
            className="text-white hover:text-blue-400"
            aria-label="Open help overlay"
            sx={{
              position: 'absolute',
              left: 0,
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          >
            <HelpIcon fontSize="small" />
          </IconButton>
          <Typography
            variant="h6"
            className="text-white font-bold text-xl text-center"
            component="h1"
            sx={{ flex: 1, textAlign: 'center' }}
          >
            {name || 'Formation'}
          </Typography>
          <IconButton
            size="small"
            onClick={handleEditClick}
            className="text-white hover:text-yellow-400"
            aria-label="Edit formation name"
            sx={{
              position: 'absolute',
              right: 0,
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </>
      )}
    </Box>
  );
}

