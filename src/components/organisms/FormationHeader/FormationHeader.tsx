import { lazy, Suspense, useState, useCallback, useMemo, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import { updateFormationName, placeUnit } from '../../../store/reducers/formationSlice';
import { FormationNameEditor } from '../../molecules';
import { PowerBadge } from '../../atoms';
import { useUndoRedo } from '../../../hooks/useUndoRedo';

const HelpOverlay = lazy(() => import('../HelpOverlay/HelpOverlay'));

export default function FormationHeader() {
  const dispatch = useAppDispatch();
  const currentFormation = useAppSelector((state) => state.formation.currentFormation);
  const { filteredUnits } = useAppSelector((state) => state.unit);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const { canUndo, canRedo, undo: handleUndo, redo: handleRedo } = useUndoRedo();

  /* istanbul ignore next */
  const unitsInFormation = useMemo(() => new Set(
    currentFormation?.tiles
      .flat()
      .filter((unit) => unit !== null)
      .map((unit) => unit!.id) || []
  ), [currentFormation?.tiles]);

  // Get available units not in formation
  const availableUnits = useMemo(
    () => filteredUnits.filter((unit) => !unitsInFormation.has(unit.id)),
    [filteredUnits, unitsInFormation]
  );

  // Count empty tiles
  const emptyTileCount = useMemo(() => {
    if (!currentFormation) return 0;
    let count = 0;
    for (const row of currentFormation.tiles) {
      for (const tile of row) {
        if (!tile) count++;
      }
    }
    return count;
  }, [currentFormation]);

  const handleSaveName = (name: string) => {
    dispatch(updateFormationName(name));
  };

  const handleAutoFill = useCallback(() => {
    let unitIndex = 0;
    for (let row = 0; row < 7 && unitIndex < availableUnits.length; row++) {
      for (let col = 0; col < 7 && unitIndex < availableUnits.length; col++) {
        if (!currentFormation?.tiles[row][col]) {
          dispatch(placeUnit({ row, col, unit: availableUnits[unitIndex] }));
          unitIndex++;
        }
      }
    }
  }, [currentFormation, availableUnits, dispatch]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isUndo = (isMac && event.metaKey && !event.shiftKey && event.key === 'z') ||
                     (!isMac && event.ctrlKey && !event.shiftKey && event.key === 'z');
      const isRedo = (isMac && event.metaKey && event.shiftKey && event.key === 'z') ||
                     (!isMac && event.ctrlKey && event.shiftKey && event.key === 'z');

      if (isUndo && canUndo) {
        /* istanbul ignore next -- @preserve keyboard shortcut handler, tested via integration */
        event.preventDefault();
        handleUndo();
      } else if (isRedo && canRedo) {
        /* istanbul ignore next -- @preserve keyboard shortcut handler, tested via integration */
        event.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [canUndo, canRedo, handleUndo, handleRedo]);

  return (
    <Box
      component="header"
      className="w-full p-3 bg-gray-800 flex items-center justify-between gap-4"
    >
      {/* Left: Batch action buttons */}
      <Box className="flex items-center gap-1">
        <Tooltip title={canUndo ? 'Undo (Ctrl+Z / Cmd+Z)' : 'Nothing to undo'} arrow>
          <span>
            <IconButton
              onClick={handleUndo}
              disabled={!canUndo}
              sx={{
                color: canUndo ? '#60a5fa' : 'rgba(255,255,255,0.2)',
                backgroundColor: canUndo ? 'rgba(96, 165, 250, 0.1)' : 'transparent',
                '&:hover': canUndo ? { backgroundColor: 'rgba(96, 165, 250, 0.2)' } : {},
                '&.Mui-disabled': { color: 'rgba(255,255,255,0.2)' },
              }}
              aria-label="Undo last action"
            >
              <UndoIcon />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title={canRedo ? 'Redo (Ctrl+Shift+Z / Cmd+Shift+Z)' : 'Nothing to redo'} arrow>
          <span>
            <IconButton
              onClick={handleRedo}
              disabled={!canRedo}
              sx={{
                color: canRedo ? '#60a5fa' : 'rgba(255,255,255,0.2)',
                backgroundColor: canRedo ? 'rgba(96, 165, 250, 0.1)' : 'transparent',
                '&:hover': canRedo ? { backgroundColor: 'rgba(96, 165, 250, 0.2)' } : {},
                '&.Mui-disabled': { color: 'rgba(255,255,255,0.2)' },
              }}
              aria-label="Redo last undone action"
            >
              <RedoIcon />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title={`Auto-fill ${emptyTileCount} empty tiles with roster units`} arrow>
          <span>
            <IconButton
              onClick={handleAutoFill}
              disabled={emptyTileCount === 0 || availableUnits.length === 0}
              sx={{
                color: '#22c55e',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                '&:hover': { backgroundColor: 'rgba(34, 197, 94, 0.2)' },
                '&.Mui-disabled': { color: 'rgba(255,255,255,0.2)' },
              }}
              aria-label="Auto-fill formation with available units"
            >
              <AutoAwesomeIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      {/* Center: Formation name and power */}
      <Box className="flex flex-col items-center flex-1 min-w-0">
        <FormationNameEditor
          name={currentFormation?.name || 'Formation'}
          onSave={handleSaveName}
          onHelpClick={() => setIsHelpOpen(true)}
        />
        <PowerBadge power={currentFormation?.power || 0} />
      </Box>

      {/* Right: Placeholder for symmetry */}
      <Box className="w-20" />

      {isHelpOpen && (
        <Suspense fallback={null}>
      <HelpOverlay open={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
        </Suspense>
      )}
    </Box>
  );
}
