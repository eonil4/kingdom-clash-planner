import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import HelpIcon from '@mui/icons-material/Help';
import { IconButton } from '../../atoms';

interface HelpOverlayProps {
  open: boolean;
  onClose: () => void;
}

export default function HelpOverlay({ open, onClose }: HelpOverlayProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        className: 'bg-gray-800',
      }}
    >
      <DialogTitle className="flex items-center justify-between bg-gray-900">
        <Box className="flex items-center gap-2">
          <HelpIcon className="text-blue-400" />
          <span className="text-white font-bold">Application Guide</span>
        </Box>
        <IconButton
          icon={<CloseIcon />}
          onClick={onClose}
          className="text-white hover:bg-gray-700"
          aria-label="Close help overlay"
        />
      </DialogTitle>
      
      <DialogContent className="bg-gray-800 text-white">
        <Box className="space-y-6">
          <Box>
            <Typography variant="h5" className="text-yellow-400 font-bold mb-3">
              Overview
            </Typography>
            <Typography variant="body1" className="mb-2">
              The Kingdom Clash Planner is a formation planning tool that allows you to organize and manage your units for strategic battles.
            </Typography>
            <Typography variant="body1">
              You can create formations by placing units on a 7x7 grid, manage your unit roster, and track your total formation power.
            </Typography>
          </Box>

          <Divider className="bg-gray-600" />

          <Box>
            <Typography variant="h5" className="text-yellow-400 font-bold mb-3">
              Visual Structure
            </Typography>
            
            <Box className="mb-4">
              <Typography variant="h6" className="text-blue-400 font-semibold mb-2">
                1. Formation Header
              </Typography>
              <Typography variant="body2" className="mb-1">
                • <strong>Formation Name:</strong> Displays the current formation name. Click the edit icon to rename it.
              </Typography>
              <Typography variant="body2" className="mb-1">
                • <strong>Power Display:</strong> Shows the total power of all units currently placed in the formation.
              </Typography>
            </Box>

            <Box className="mb-4">
              <Typography variant="h6" className="text-blue-400 font-semibold mb-2">
                2. Formation Grid (7x7)
              </Typography>
              <Typography variant="body2" className="mb-1">
                • A 7x7 grid where you can place units to create your formation.
              </Typography>
              <Typography variant="body2" className="mb-1">
                • <strong>Place Units:</strong> Drag units from the available units list or double-click to place them in the first empty tile.
              </Typography>
              <Typography variant="body2" className="mb-1">
                • <strong>Remove Units:</strong> Double-click a unit in the grid or drag it back to the available units area.
              </Typography>
              <Typography variant="body2" className="mb-1">
                • <strong>Swap Units:</strong> Drag a unit from one position in the formation onto another unit in the formation to swap their positions.
              </Typography>
              <Typography variant="body2" className="mb-1">
                • <strong>Replace Units:</strong> Drag a unit from the available units list onto an occupied tile in the formation to replace it. The replaced unit will be moved back to available units.
              </Typography>
            </Box>

            <Box className="mb-4">
              <Typography variant="h6" className="text-blue-400 font-semibold mb-2">
                3. Available Units List
              </Typography>
              <Typography variant="body2" className="mb-1">
                • Displays all units in your roster that are not currently in the formation.
              </Typography>
              <Typography variant="body2" className="mb-1">
                • <strong>Sort Controls:</strong> Sort units by Level, Rarity, or Name (primary, secondary, and tertiary sorting).
              </Typography>
              <Typography variant="body2" className="mb-1">
                • <strong>Search:</strong> Filter units by name or rarity.
              </Typography>
              <Typography variant="body2" className="mb-1">
                • <strong>Manage Units Button:</strong> Opens a modal to add, edit, or remove units from your roster.
              </Typography>
              <Typography variant="body2" className="mb-1">
                • <strong>Withdraw All Button:</strong> Removes all units from the formation and returns them to the available units list.
              </Typography>
            </Box>
          </Box>

          <Divider className="bg-gray-600" />

          <Box>
            <Typography variant="h5" className="text-yellow-400 font-bold mb-3">
              Usage Guide
            </Typography>
            
            <Box className="mb-4">
              <Typography variant="h6" className="text-blue-400 font-semibold mb-2">
                Adding Units to Formation
              </Typography>
              <Typography variant="body2" className="mb-1">
                • <strong>Drag and Drop:</strong> Click and hold a unit card, then drag it to an empty tile in the formation grid.
              </Typography>
              <Typography variant="body2" className="mb-1">
                • <strong>Double-Click:</strong> Double-click a unit in the available units list to place it in the first empty tile.
              </Typography>
            </Box>

            <Box className="mb-4">
              <Typography variant="h6" className="text-blue-400 font-semibold mb-2">
                Removing Units from Formation
              </Typography>
              <Typography variant="body2" className="mb-1">
                • <strong>Double-Click:</strong> Double-click a unit in the formation grid to remove it.
              </Typography>
              <Typography variant="body2" className="mb-1">
                • <strong>Drag Back:</strong> Drag a unit from the formation grid back to the available units area.
              </Typography>
            </Box>

            <Box className="mb-4">
              <Typography variant="h6" className="text-blue-400 font-semibold mb-2">
                Swapping and Replacing Units
              </Typography>
              <Typography variant="body2" className="mb-1">
                • <strong>Swap Units:</strong> Drag a unit from one position in the formation onto another unit in the formation. The two units will swap positions.
              </Typography>
              <Typography variant="body2" className="mb-1">
                • <strong>Replace Units:</strong> Drag a unit from the available units list onto an occupied tile in the formation. The unit in the formation will be moved back to available units, and the new unit will take its place.
              </Typography>
            </Box>

            <Box className="mb-4">
              <Typography variant="h6" className="text-blue-400 font-semibold mb-2">
                Managing Your Roster
              </Typography>
              <Typography variant="body2" className="mb-1">
                • Click <strong>"Manage Units"</strong> to open the unit management modal.
              </Typography>
              <Typography variant="body2" className="mb-1">
                • <strong>Add New Units:</strong> Select a unit name, level, and rarity, then choose which levels to add (1-10).
              </Typography>
              <Typography variant="body2" className="mb-1">
                • <strong>Edit Units:</strong> Click the edit icon on any unit row to modify its properties.
              </Typography>
              <Typography variant="body2" className="mb-1">
                • <strong>Delete Units:</strong> Click the delete icon to remove units from your roster.
              </Typography>
            </Box>

            <Box className="mb-4">
              <Typography variant="h6" className="text-blue-400 font-semibold mb-2">
                Limits and Constraints
              </Typography>
              <Typography variant="body2" className="mb-1">
                • <strong>Total Units:</strong> Maximum 1000 units total (roster + formation combined).
              </Typography>
              <Typography variant="body2" className="mb-1">
                • <strong>Per Unit Per Level:</strong> Maximum 49 units of the same name and level.
              </Typography>
              <Typography variant="body2" className="mb-1">
                • <strong>Formation Grid:</strong> 7x7 grid (49 tiles maximum).
              </Typography>
            </Box>

            <Box className="mb-4">
              <Typography variant="h6" className="text-blue-400 font-semibold mb-2">
                Unit Information
              </Typography>
              <Typography variant="body2" className="mb-1">
                • <strong>Unit Card:</strong> Click on a unit card to see detailed information (name, level, rarity, power).
              </Typography>
              <Typography variant="body2" className="mb-1">
                • <strong>Rarity Colors:</strong> Units are color-coded by rarity (Common: Gray, Rare: Blue, Epic: Purple, Legendary: Yellow).
              </Typography>
              <Typography variant="body2" className="mb-1">
                • <strong>Power Calculation:</strong> Unit power is calculated based on rarity and level.
              </Typography>
            </Box>

            <Box className="mb-4">
              <Typography variant="h6" className="text-blue-400 font-semibold mb-2">
                URL Sharing
              </Typography>
              <Typography variant="body2" className="mb-1">
                • Your formation and roster are automatically saved in the URL.
              </Typography>
              <Typography variant="body2" className="mb-1">
                • Share the URL to let others view your formation and roster.
              </Typography>
              <Typography variant="body2" className="mb-1">
                • The URL parameters are: <code className="bg-gray-700 px-1 rounded">formation</code> and <code className="bg-gray-700 px-1 rounded">units</code>.
              </Typography>
            </Box>
          </Box>

          <Divider className="bg-gray-600" />

          <Box>
            <Typography variant="h5" className="text-yellow-400 font-bold mb-3">
              Keyboard Shortcuts
            </Typography>
            <Typography variant="body2" className="mb-1">
              • <strong>Enter:</strong> Save formation name when editing.
            </Typography>
            <Typography variant="body2" className="mb-1">
              • <strong>Escape:</strong> Cancel editing formation name.
            </Typography>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

