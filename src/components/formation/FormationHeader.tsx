import { useState, useRef, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { Typography, Box, IconButton, TextField } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import HelpIcon from '@mui/icons-material/Help';
import { updateFormationName } from '../../store/reducers/formationSlice';
import HelpOverlay from '../help/HelpOverlay';

export default function FormationHeader() {
  const dispatch = useAppDispatch();
  const currentFormation = useAppSelector((state) => state.formation.currentFormation);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleEditClick = () => {
    if (currentFormation) {
      setEditValue(currentFormation.name);
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    if (editValue.trim() && currentFormation) {
      dispatch(updateFormationName(editValue.trim()));
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
    <Box
      component="header"
      className="w-full p-4 bg-gradient-to-b from-gray-700 to-gray-800 flex items-center justify-center"
      style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
      }}
    >
      <Box className="flex flex-col items-center w-full">
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
                onClick={() => setIsHelpOpen(true)}
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
                {currentFormation?.name || 'Formation'}
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
        <Box
          className="bg-blue-900 border-2 border-yellow-500 rounded-lg px-6 py-2 flex items-center gap-2"
          style={{
            clipPath: 'polygon(5% 0%, 95% 0%, 100% 50%, 95% 100%, 5% 100%, 0% 50%)',
          }}
        >
          <span className="text-yellow-500 text-xl">👊</span>
          <Typography variant="body1" className="text-white font-bold text-lg">
            {currentFormation?.power || 0}
          </Typography>
        </Box>
      </Box>
      <HelpOverlay open={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </Box>
  );
}

